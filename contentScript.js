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
        '.update-components-image__container'
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


function createIcon(editingBox) {
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'my-extension-icon-wrapper';

        // console.log('Prompts:', prompts);


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
            
            // Capture media from the post if we're commenting on a post with media
            let capturedMedia = null;
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
            
            let promptText = prompt.text;
            console.log('Prompt text before:', promptText);
            promptText = promptText.replace(/\$text/g, editingBoxText);
            promptText = promptText.replace(/\$post/g, postContent);
            promptText = promptText.replace(/\$comment/g, commentContent);
            
            // If we captured images, prepend guidance to consider images as context
            if (capturedMedia && capturedMedia.length > 0) {
                const visionPrefix = 'You are a vision-capable assistant. Consider the attached image(s) as context when composing the response. Refer to elements visible in the image(s) when helpful.\n\n';
                promptText = visionPrefix + promptText;
            }
            
            console.log('Prompt text:', promptText);
            
            // Show media indicator if media was captured
            const mediaIndicator = capturedMedia && capturedMedia.length > 0 ? 
                `\n📷 Processing ${capturedMedia.length} image(s)...\n` : '';
            editingBox.innerText = "Working..." + mediaIndicator + promptText;
            
            try {
                console.log('🚀 Sending to AI with media:', {
                    promptText,
                    mediaCount: capturedMedia ? capturedMedia.length : 0,
                    mediaContent: capturedMedia
                });
                
                const response = await sendMessageToAI(promptText, capturedMedia);
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
                    createIcon(node.querySelector('.ql-editor'));
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
