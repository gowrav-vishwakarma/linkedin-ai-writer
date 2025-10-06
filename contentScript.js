const SHARE_BOX_CLASS = '.share-box';
const PARENT_WRAPPER_CLASS = '.feed-shared-update-v2';
const COMMENTARY_CLASS = '.update-components-update-v2__commentary';
const COMMENT_ITEM_CLASS = '.comments-comment-item';
const COMMENT_ITEM_CONTENT_CLASS =
    '.comments-highlighted-comment-item-content-body, .comments-comment-item-content-body';

let prompts = [];

chrome.storage.local.get('chrome_openai_prompts', (data) => {
    if (data.chrome_openai_prompts) {
        prompts = data.chrome_openai_prompts;
    }
});

// Media capture functionality
async function captureMediaFromPost(postElement) {
    const mediaElements = [];
    const processedUrls = new Set(); // Track processed URLs to avoid duplicates
    
    // Look for images in various LinkedIn post structures
    const imageSelectors = [
        '.feed-shared-image img',
        '.feed-shared-image__image img',
        '.carousel-image img',
        '.feed-shared-carousel img',
        '.feed-shared-video img',
        '.feed-shared-document img',
        '.attachments img',
        '.update-components-image img',
        '.update-components-image__image img',
        '.feed-shared-update-v2__content img',
        '.ivm-view-attr__img--centered',
        '.update-components-image__container img'
    ];
    
    // Look for video elements
    const videoSelectors = [
        '.update-components-linkedin-video video',
        '.feed-shared-video video',
        '.media-player video',
        'video'
    ];
    
    // Look for document carousel elements
    const documentSelectors = [
        '.update-components-document__container',
        '.document-s-container',
        '.feed-shared-document'
    ];
    
    console.log('🔍 Searching for media in post element:', postElement);
    
    for (const selector of imageSelectors) {
        const images = postElement.querySelectorAll(selector);
        console.log(`🔍 Selector "${selector}" found ${images.length} images`);
        
        for (const img of images) {
            // Skip if already processed
            if (processedUrls.has(img.src)) {
                console.log('⏭️ Skipping duplicate image:', img.src);
                continue;
            }
            
            // Skip profile pictures and small icons
            if (img.width < 100 || img.height < 100) {
                console.log('⏭️ Skipping small image:', img.src, `(${img.width}x${img.height})`);
                continue;
            }
            
            // Skip if it's a profile picture or icon
            if (img.src.includes('profile-displayphoto') || img.src.includes('EntityPhoto')) {
                console.log('⏭️ Skipping profile picture:', img.src);
                continue;
            }
            
            try {
                console.log('📷 Processing image:', img.src, `(${img.width}x${img.height})`);
                const dataUrl = await imageToDataUrl(img.src);
                if (dataUrl) {
                    mediaElements.push({
                        type: 'image/jpeg',
                        dataUrl: dataUrl,
                        src: img.src
                    });
                    processedUrls.add(img.src); // Mark as processed
                    console.log('✅ Successfully captured image:', img.src);
                }
            } catch (error) {
                console.warn('❌ Failed to capture image:', img.src, error);
            }
        }
    }
    
    // Process video elements
    console.log('🎥 Processing video elements...');
    const processedVideos = new Set(); // Track processed video elements to avoid duplicates
    
    for (const selector of videoSelectors) {
        const videos = postElement.querySelectorAll(selector);
        console.log(`🎥 Selector "${selector}" found ${videos.length} videos`);
        
        for (const video of videos) {
            // Skip if already processed (same video element)
            if (processedVideos.has(video)) {
                console.log('⏭️ Skipping duplicate video element');
                continue;
            }
            
            try {
                console.log('🎥 Processing video:', video.src || video.currentSrc);
                const videoFrames = await extractVideoFrames(video);
                if (videoFrames && videoFrames.length > 0) {
                    mediaElements.push(...videoFrames);
                    processedVideos.add(video); // Mark as processed
                    console.log(`✅ Successfully captured ${videoFrames.length} frames from video`);
                } else {
                    // Fallback: try to get video poster/thumbnail
                    console.log('🎥 No frames extracted, trying video poster...');
                    const posterUrl = video.poster;
                    if (posterUrl && posterUrl !== '') {
                        try {
                            const posterDataUrl = await imageToDataUrl(posterUrl);
                            if (posterDataUrl) {
                                mediaElements.push({
                                    type: 'image/jpeg',
                                    dataUrl: posterDataUrl,
                                    src: posterUrl,
                                    isVideoPoster: true
                                });
                                processedVideos.add(video);
                                console.log('✅ Successfully captured video poster');
                            }
                        } catch (posterError) {
                            console.warn('❌ Failed to capture video poster:', posterError);
                        }
                    }
                }
            } catch (error) {
                console.warn('❌ Failed to capture video frames:', error);
            }
        }
    }
    
    // Process document carousel elements
    console.log('📄 Processing document carousel elements...');
    for (const selector of documentSelectors) {
        const documents = postElement.querySelectorAll(selector);
        console.log(`📄 Selector "${selector}" found ${documents.length} documents`);
        
        for (const document of documents) {
            try {
                console.log('📄 Processing document carousel:', document);
                const documentInfo = await extractDocumentInfo(document);
                if (documentInfo) {
                    mediaElements.push(documentInfo);
                    console.log('✅ Successfully captured document info');
                }
            } catch (error) {
                console.warn('❌ Failed to capture document info:', error);
            }
        }
    }
    
    console.log(`📷 Total media elements captured: ${mediaElements.length}`);
    return mediaElements;
}

async function imageToDataUrl(imageSrc) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas dimensions
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                // Draw image to canvas
                ctx.drawImage(img, 0, 0);
                
                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = function() {
            reject(new Error('Failed to load image'));
        };
        
        img.src = imageSrc;
    });
}

async function extractVideoFrames(videoElement) {
    return new Promise((resolve, reject) => {
        try {
            // Check if video is ready
            if (videoElement.readyState < 2) {
                console.log('🎥 Video not ready, waiting for metadata...');
                
                // Set a timeout to avoid infinite waiting
                const timeout = setTimeout(() => {
                    console.warn('🎥 Video metadata loading timeout, trying to extract from current state');
                    extractFramesFromReadyVideo(videoElement).then(resolve).catch(() => {
                        console.warn('🎥 Failed to extract frames after timeout, returning empty array');
                        resolve([]);
                    });
                }, 3000); // 3 second timeout
                
                videoElement.addEventListener('loadedmetadata', () => {
                    clearTimeout(timeout);
                    extractFramesFromReadyVideo(videoElement).then(resolve).catch(() => {
                        console.warn('🎥 Failed to extract frames after metadata loaded, returning empty array');
                        resolve([]);
                    });
                }, { once: true });
                return;
            }
            
            extractFramesFromReadyVideo(videoElement).then(resolve).catch(() => {
                console.warn('🎥 Failed to extract frames, returning empty array');
                resolve([]);
            });
        } catch (error) {
            console.warn('🎥 Error in extractVideoFrames, returning empty array:', error);
            resolve([]);
        }
    });
}

async function extractFramesFromReadyVideo(videoElement) {
    const frames = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to video dimensions
    canvas.width = videoElement.videoWidth || videoElement.clientWidth || 640;
    canvas.height = videoElement.videoHeight || videoElement.clientHeight || 480;
    
    if (canvas.width === 0 || canvas.height === 0) {
        console.warn('🎥 Video has no dimensions, using default dimensions');
        canvas.width = 640;
        canvas.height = 480;
    }
    
    console.log(`🎥 Video dimensions: ${canvas.width}x${canvas.height}`);
    
    try {
        // Store current time
        const originalTime = videoElement.currentTime;
        const duration = videoElement.duration || 10; // Default to 10 seconds if duration unknown
        
        // Extract frames based on configured strategy
        const timePoints = await getVideoTimePoints(videoElement, duration);
        
        console.log(`🎥 Extracting frames at time points: ${timePoints.join(', ')}s`);
        
        for (const timePoint of timePoints) {
            try {
                // Seek to time point
                videoElement.currentTime = timePoint;
                
                // Wait for seek to complete
                await new Promise((resolve) => {
                    const onSeeked = () => {
                        videoElement.removeEventListener('seeked', onSeeked);
                        resolve();
                    };
                    videoElement.addEventListener('seeked', onSeeked);
                    
                    // Fallback timeout
                    setTimeout(resolve, 100);
                });
                
                // Draw current frame to canvas
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                
                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                
                frames.push({
                    type: 'image/jpeg',
                    dataUrl: dataUrl,
                    src: `video_frame_at_${timePoint.toFixed(2)}s`,
                    timestamp: timePoint
                });
                
                console.log(`🎥 Extracted frame at ${timePoint.toFixed(2)}s`);
                
            } catch (frameError) {
                console.warn(`❌ Failed to extract frame at ${timePoint}s:`, frameError);
            }
        }
        
        // Restore original time
        videoElement.currentTime = originalTime;
        
        // If no frames were extracted, try to extract from current state
        if (frames.length === 0) {
            console.log('🎥 No frames extracted via seeking, trying current state...');
            try {
                ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                frames.push({
                    type: 'image/jpeg',
                    dataUrl: dataUrl,
                    src: 'video_frame_current_state',
                    timestamp: videoElement.currentTime
                });
                console.log('✅ Extracted frame from current video state');
            } catch (fallbackError) {
                console.warn('❌ Failed to extract frame from current state:', fallbackError);
            }
        }
        
    } catch (error) {
        console.warn('❌ Error during frame extraction:', error);
    }
    
    return frames;
}

async function getVideoTimePoints(videoElement, duration) {
    const timePoints = [];
    
    // Get provider config to determine frame extraction strategy
    const providerConfig = await ProviderManager.getProviderConfig();
    const strategy = providerConfig.videoFrameStrategy || 'minimal';
    const customCount = providerConfig.customFrameCount || 5;
    
    if (duration > 0 && !isNaN(duration)) {
        switch (strategy) {
            case 'minimal':
                // 5 frames: start, 25%, 50%, 75%, end
                timePoints.push(0, duration * 0.25, duration * 0.5, duration * 0.75, duration);
                break;
                
            case 'moderate':
                // 10 frames: every 10% of video
                for (let i = 0; i <= 10; i++) {
                    timePoints.push(duration * (i / 10));
                }
                break;
                
            case 'dense':
                // Every 0.5 seconds
                timePoints.push(0);
                for (let time = 0.5; time < duration; time += 0.5) {
                    timePoints.push(time);
                }
                if (!timePoints.includes(duration)) {
                    timePoints.push(duration);
                }
                break;
                
            case 'very-dense':
                // Every 0.25 seconds
                timePoints.push(0);
                for (let time = 0.25; time < duration; time += 0.25) {
                    timePoints.push(time);
                }
                if (!timePoints.includes(duration)) {
                    timePoints.push(duration);
                }
                break;
                
            case 'custom':
                // Custom number of evenly spaced frames
                for (let i = 0; i < customCount; i++) {
                    timePoints.push(duration * (i / (customCount - 1)));
                }
                break;
                
            default:
                // Fallback to minimal
                timePoints.push(0, duration * 0.25, duration * 0.5, duration * 0.75, duration);
        }
    } else {
        // If duration is unknown, try to extract from current position
        timePoints.push(videoElement.currentTime || 0);
    }
    
    console.log(`🎥 Using ${strategy} strategy, extracting ${timePoints.length} frames`);
    console.log(`🎥 Configuration: strategy=${strategy}, customCount=${customCount}, timePoints=[${timePoints.map(t => t.toFixed(2)).join(', ')}]`);
    return timePoints;
}

async function extractDocumentInfo(documentElement) {
    try {
        // Look for iframe with document content
        const iframe = documentElement.querySelector('iframe');
        if (!iframe) {
            console.log('📄 No iframe found in document element');
            return null;
        }
        
        // Get document title from iframe title attribute
        const title = iframe.getAttribute('title') || 'LinkedIn Document';
        console.log('📄 Document title:', title);
        
        // Try to get a screenshot of the iframe (this might not work due to CORS)
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.width = iframe.clientWidth || 400;
            canvas.height = iframe.clientHeight || 300;
            
            // Try to draw iframe content (may fail due to CORS)
            ctx.drawImage(iframe, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            return {
                type: 'image/jpeg',
                dataUrl: dataUrl,
                src: iframe.src,
                title: title,
                isDocument: true
            };
        } catch (screenshotError) {
            console.log('📄 Cannot capture iframe screenshot due to CORS, creating document info only');
            
            // Return document metadata without screenshot
            return {
                type: 'text/plain',
                dataUrl: `data:text/plain;base64,${btoa(`Document: ${title}\nURL: ${iframe.src}`)}`,
                src: iframe.src,
                title: title,
                isDocument: true,
                isMetadataOnly: true
            };
        }
        
    } catch (error) {
        console.warn('❌ Error extracting document info:', error);
        return null;
    }
}

function hasMediaInPost(postElement) {
    const mediaSelectors = [
        '.feed-shared-image',
        '.feed-shared-image__image',
        '.carousel-image',
        '.feed-shared-carousel',
        '.feed-shared-video',
        '.feed-shared-document',
        '.attachments',
        '.update-components-image',
        '.update-components-image__image',
        '.feed-shared-update-v2__content',
        '.ivm-view-attr__img--centered',
        '.update-components-image__container',
        '.update-components-linkedin-video',
        '.media-player',
        'video',
        '.update-components-document__container',
        '.document-s-container',
        '.feed-shared-document'
    ];
    
    console.log('🔍 Checking for media in post element:', postElement);
    
    for (const selector of mediaSelectors) {
        const element = postElement.querySelector(selector);
        if (element) {
            console.log(`✅ Found media container with selector: ${selector}`, element);
            return true;
        }
    }
    
    console.log('❌ No media containers found in post');
    return false;
}


async function createIcon(editingBox) {
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'my-extension-icon-wrapper';

        // console.log('Prompts:', prompts);

    // Get provider config to check media support
    const providerConfig = await ProviderManager.getProviderConfig();

    // Dynamically create buttons based on prompts
    prompts.forEach(prompt => {

        if (!prompt) return;
        // // If the prompt is for a comment and there's no commentary, skip this iteration
        // if (prompt.position === 'comment' && commentary === false) {
        //     return;
        // }
        //
        // // If the prompt is for a new post and there's commentary, skip this iteration
        // if (prompt.position === 'new_post' && commentary !== false) {
        //     return;
        // }

        // Skip media-related prompts if provider doesn't support media
        if (providerConfig.supportsMedia === false) {
            const mediaRelatedPrompts = ['Analyze Image', 'Image Insights', 'Video Analysis', 'Video Insights', 'Document Analysis', 'Document Insights'];
            if (mediaRelatedPrompts.includes(prompt.label)) {
                console.log('🛑 Skipping media-related prompt:', prompt.label, 'because provider does not support media');
                return;
            }
        }

        const {isNewPost} = getTextFromCommentary(editingBox);

        if (prompt.position === 'new_post' && !isNewPost) {
            return;
        }

        if (prompt.position === 'comment' && isNewPost) {
            return;
        }


        const btn = document.createElement('button');
        btn.innerHTML = prompt.label;
        btn.className = 'my-extension-btn';
        btn.addEventListener('click', async (event) => {
            event.preventDefault();
            const {editingBoxText, commentContent, postContent, mediaContent} = getTextFromCommentary(editingBox);
            console.log('editingBoxText:', editingBoxText, 'postContent:', postContent, 'commentContent:', commentContent);
            console.log('Full context object:', {editingBoxText, commentContent, postContent, mediaContent});
            
            // Capture media from the post only if provider supports media
            const providerConfig = await ProviderManager.getProviderConfig();
            let capturedMedia = null;
            if (providerConfig.supportsMedia !== false) {
                if (!editingBox.closest(SHARE_BOX_CLASS)) { // Not a new post
                    const parentWrapper = editingBox.parentElement.closest(PARENT_WRAPPER_CLASS);
                    if (parentWrapper && hasMediaInPost(parentWrapper)) {
                        console.log('Capturing media from post...');
                        try {
                            capturedMedia = await captureMediaFromPost(parentWrapper);
                            console.log('Captured media:', capturedMedia);
                        } catch (error) {
                            console.warn('Failed to capture media:', error);
                        }
                    }
                }
            } else {
                console.log('🛑 Provider does not support media. Skipping media capture.');
            }
            
            let promptText = prompt.text;
            console.log('Prompt text before:', promptText);
            promptText = promptText.replace(/\$text/g, editingBoxText);
            promptText = promptText.replace(/\$post/g, postContent);
            promptText = promptText.replace(/\$comment/g, commentContent);
            
            // If we captured media, prepend guidance to consider media as context
            if (providerConfig.supportsMedia !== false && capturedMedia && capturedMedia.length > 0) {
                const hasVideoFrames = capturedMedia.some(media => media.timestamp !== undefined);
                const hasImages = capturedMedia.some(media => media.timestamp === undefined && !media.isDocument);
                const hasDocuments = capturedMedia.some(media => media.isDocument);
                
                let visionPrefix = 'You are a vision-capable assistant. Consider the attached media as context when composing the response. ';
                
                if (hasVideoFrames && hasImages && hasDocuments) {
                    visionPrefix += 'The media includes images, video frames, and document content. Refer to elements visible in the media when helpful.\n\n';
                } else if (hasVideoFrames && hasImages) {
                    visionPrefix += 'The media includes both images and video frames. Refer to elements visible in the media when helpful.\n\n';
                } else if (hasVideoFrames && hasDocuments) {
                    visionPrefix += 'The media includes video frames and document content. Analyze the visual content and document information when composing your response.\n\n';
                } else if (hasImages && hasDocuments) {
                    visionPrefix += 'The media includes images and document content. Consider both visual elements and document information when composing your response.\n\n';
                } else if (hasVideoFrames) {
                    visionPrefix += 'The media includes video frames extracted from a video. Analyze the visual content in these frames when composing your response.\n\n';
                } else if (hasDocuments) {
                    visionPrefix += 'The media includes document content. Consider the document information and any visual elements when composing your response.\n\n';
                } else {
                    visionPrefix += 'Consider the attached image(s) as context when composing the response. Refer to elements visible in the image(s) when helpful.\n\n';
                }

                // If there are document metadata items, append them as text context (do not send as images)
                if (hasDocuments) {
                    const docs = capturedMedia
                        .filter(m => m.isDocument)
                        .map((m, idx) => `Document ${idx + 1}: ${m.title || 'Untitled'}\nURL: ${m.src}`)
                        .join('\n\n');
                    visionPrefix += `Document context below for reference:\n\n${docs}\n\n`;
                }
                
                promptText = visionPrefix + promptText;
            }
            
            console.log('Prompt text:', promptText);
            
            // Show media indicator if media was captured
            let mediaIndicator = '';
            let imageCount = 0;
            let videoFrameCount = 0;
            let documentCount = 0;
            
            if (providerConfig.supportsMedia !== false && capturedMedia && capturedMedia.length > 0) {
                imageCount = capturedMedia.filter(media => media.timestamp === undefined && !media.isDocument).length;
                videoFrameCount = capturedMedia.filter(media => media.timestamp !== undefined).length;
                documentCount = capturedMedia.filter(media => media.isDocument).length;
                
                const parts = [];
                if (imageCount > 0) parts.push(`📷 ${imageCount} image(s)`);
                if (videoFrameCount > 0) parts.push(`🎥 ${videoFrameCount} video frame(s)`);
                if (documentCount > 0) parts.push(`📄 ${documentCount} document(s)`);
                
                if (parts.length > 0) {
                    mediaIndicator = `\nProcessing ${parts.join(', ')}...\n`;
                }
            }
            editingBox.innerText = "Working..." + mediaIndicator + promptText;
            
            try {
                console.log('🚀 Sending to AI with media:', {
                    promptText,
                    mediaCount: capturedMedia ? capturedMedia.length : 0,
                    mediaContent: capturedMedia
                });
                
                // Only send actual images to the provider (filter out document metadata and non-image types)
                const imageOnlyMedia = (providerConfig.supportsMedia !== false) ? (capturedMedia || []).filter(m => m.type && m.type.startsWith('image/')) : null;
                console.log(`📤 Sending to AI: ${imageOnlyMedia ? imageOnlyMedia.length : 0} media items (${imageCount} images + ${videoFrameCount} video frames + ${documentCount} documents)`);
                const response = await sendMessageToAI(promptText, imageOnlyMedia);
                if (prompt.replaceText) {
                    editingBox.innerText = response;
                } else {
                    alert(response);
                }
            } catch (error) {
                console.error('Error generating AI response:', error);
                editingBox.innerText = "Error: " + error.message + "\n\nOriginal text:\n" + editingBoxText;
                
                // Show error alert
                alert(`AI Error: ${error.message}\n\nPlease check your provider configuration in the extension popup.`);
            }
        });
        iconWrapper.appendChild(btn);
    });

    editingBox.parentElement.appendChild(iconWrapper);
}


async function replaceUrlsWithContent(prompt) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = prompt.match(urlRegex);

    if (urls) {
        for (const url of urls) {
            try {
                const response = await fetch(url);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const body = doc.querySelector('body');
                const text = body.textContent.replace(/\s+/g, ' ').trim();
                prompt = prompt.replace(url, text);
            } catch (error) {
                console.error(`Error fetching URL ${url}: ${error}`);
            }
        }
    }

    return prompt;
}

// Function to remove the icon
function removeIcon(editingBox) {
    const icon = editingBox.parentElement.querySelector('.my-extension-icon');
    if (icon) {
        icon.remove();
    }
}

function getTextFromCommentary(editingBox) {
    console.log('getTextFromCommentary called with editingBox:', editingBox);
    
    const shareBox = editingBox.parentElement.closest(SHARE_BOX_CLASS);
    if (shareBox) {
        console.log('Detected as new post');
        return {
            isNewPost: true,
            editingBoxText: editingBox.innerText.trim(),
            postContent: '',
            commentContent: '',
            mediaContent: null
        };
    }

    const parentWrapper = editingBox.parentElement.closest(PARENT_WRAPPER_CLASS);
    if (!parentWrapper) {
        console.log('No parent wrapper found');
        return {
            isNewPost: false,
            editingBoxText: editingBox.innerText.trim(),
            postContent: '',
            commentContent: '',
            mediaContent: null
        };
    }

    const commentary = parentWrapper.querySelector(COMMENTARY_CLASS);
    const commentaryText = commentary ? (commentary.textContent || commentary.innerText || '').trim() : '';
    console.log('Post content found:', commentaryText);

    // Check if we're in a comment reply box
    const isReplyBox = editingBox.closest('.comments-comment-box--reply');
    console.log('Is reply box:', !!isReplyBox);
    
    if (isReplyBox) {
        console.log('Processing reply box...');
        
        // Find the parent comment entity that contains the comment we're replying to
        // The reply box is inside a comments-thread-entity, we need to find the parent comment
        let parentComment = null;
        
        // Method 1: Look for the closest comment entity that's not the reply box itself
        const allCommentEntities = parentWrapper.querySelectorAll('.comments-comment-entity');
        console.log('Found comment entities:', allCommentEntities.length);
        
        for (let i = 0; i < allCommentEntities.length; i++) {
            const commentEntity = allCommentEntities[i];
            // Skip if this is the reply box itself
            if (commentEntity.contains(editingBox)) {
                continue;
            }
            
            // Look for comment content in this entity
            const commentContent = commentEntity.querySelector('.comments-comment-item__main-content, .comments-comment-item-content-body, .comments-highlighted-comment-item-content-body');
            if (commentContent && commentContent.textContent.trim()) {
                parentComment = commentEntity;
                console.log('Found parent comment via method 1');
                break;
            }
        }
        
        // Method 2: If still not found, look for the immediate previous sibling
        if (!parentComment) {
            console.log('Trying method 2 - looking for previous sibling...');
            const replyThreadEntity = editingBox.closest('.comments-thread-entity');
            if (replyThreadEntity) {
                let currentElement = replyThreadEntity;
                while (currentElement && !parentComment) {
                    const prevSibling = currentElement.previousElementSibling;
                    if (prevSibling) {
                        const commentContent = prevSibling.querySelector('.comments-comment-item__main-content, .comments-comment-item-content-body, .comments-highlighted-comment-item-content-body');
                        if (commentContent && commentContent.textContent.trim()) {
                            parentComment = prevSibling;
                            console.log('Found parent comment via method 2');
                            break;
                        }
                    }
                    currentElement = currentElement.parentElement;
                }
            }
        }
        
        if (parentComment) {
            const parentCommentContent = parentComment.querySelector('.comments-comment-item__main-content, .comments-comment-item-content-body, .comments-highlighted-comment-item-content-body');
            const commentContent = parentCommentContent ? parentCommentContent.textContent.trim() : '';
            console.log('Found comment content:', commentContent);
            
            return {
                isNewPost: false,
                editingBoxText: editingBox.innerText.trim(),
                postContent: commentaryText,
                commentContent: commentContent,
                mediaContent: null
            };
        } else {
            console.log('No parent comment found');
        }
    }

    // Check if we're directly in a comment item (for new comments)
    const commentItemContentBody = editingBox.parentElement.closest('.comments-comment-item');
    if (!commentItemContentBody) {
        console.log('No comment item found, returning with empty comment content');
        return {
            isNewPost: false,
            editingBoxText: editingBox.innerText.trim(),
            postContent: commentaryText,
            commentContent: '',
            mediaContent: null
        };
    }

    const interestedComment = commentItemContentBody.querySelector('.comments-comment-item__main-content, .comments-comment-item-content-body, .comments-highlighted-comment-item-content-body');
    const commentContent = interestedComment ? interestedComment.textContent.trim() : '';
    console.log('Found comment content in comment item:', commentContent);

    return {
        isNewPost: false,
        editingBoxText: editingBox.innerText.trim(),
        postContent: commentaryText,
        commentContent: commentContent,
        mediaContent: null
    };
}

// Callback function for the MutationObserver
function handleMutation(mutationsList, observer) {
    let iconCreated = false; // flag variable to track if icon is created
    mutationsList.some((mutation) => {
        // use some instead of forEach
        if (mutation.type === 'childList') {
            return Array.from(mutation.addedNodes).some((node) => {
                // use some instead of forEach
                if (node.querySelector && node.querySelector('.ql-editor')) {
                    createIcon(node.querySelector('.ql-editor')).catch(error => {
                        console.warn('Error creating icon:', error);
                    });
                    iconCreated = true; // set flag to true when icon is created
                    return true; // break inner some loop
                }
                return false;
            });
        }
        return false;
    });
    // if (iconCreated) {
    //   // if icon is created, break outer some loop
    //   observer.disconnect();
    // }
}

async function sendMessageToAI(prompt, mediaContent = null) {
    try {
        // Get current provider configuration
        const config = await ProviderManager.getProviderConfig();
        
        console.log('🔧 Provider config:', config);
        console.log('📷 Media content being sent:', mediaContent);
        
        // Send request using the configured provider
        const response = await ProviderManager.sendRequest(prompt, config.provider, {
            model: config.model,
            maxTokens: config.maxTokens,
            temperature: config.temperature,
            customEndpoint: config.customEndpoint
        }, mediaContent);
        
        return response;
    } catch (error) {
        console.error('Error sending message to AI:', error);
        throw error;
    }
}


// Attach the MutationObserver to the document body
const observer = new MutationObserver(handleMutation);
observer.observe(document.body, {childList: true, subtree: true});
