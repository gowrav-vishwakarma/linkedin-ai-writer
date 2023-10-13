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
            const {editingBoxText, commentContent, postContent} = getTextFromCommentary(editingBox);
            console.log('editingBoxText:', editingBoxText, 'postContent:', postContent, 'commentContent:', commentContent);
            let promptText = prompt.text;
            console.log('Prompt text before:', promptText);
            promptText = promptText.replace(/\$text/g, editingBoxText);
            promptText = promptText.replace(/\$post/g, postContent);
            promptText = promptText.replace(/\$comment/g, commentContent);
            console.log('Prompt text:', promptText);
            editingBox.innerText = "Working...\n "+promptText;
            const response = await sendMessageToOpenAI(promptText);
            if (prompt.replaceText) {
                editingBox.innerText = response;
            } else {
                alert(response);
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
    const shareBox = editingBox.parentElement.closest(SHARE_BOX_CLASS);
    if (shareBox) {
        return {
            isNewPost: true,
            editingBoxText: editingBox.innerText.trim(),
            postContent: '',
            commentContent: ''
        };
    }

    const parentWrapper = editingBox.parentElement.closest(PARENT_WRAPPER_CLASS);
    if (!parentWrapper) {
        return {
            isNewPost: false,
            editingBoxText: editingBox.innerText.trim(),
            postContent: '',
            commentContent: ''
        };
    }

    const commentary = parentWrapper.querySelector(COMMENTARY_CLASS);
    const commentaryText = commentary ? (commentary.textContent || commentary.innerText || '').trim() : '';

    const commentItemContentBody = editingBox.parentElement.closest('.comments-comment-item');
    if (!commentItemContentBody) {
        return {
            isNewPost: false,
            editingBoxText: editingBox.innerText.trim(),
            postContent: commentaryText,
            commentContent: ''
        };
    }

    const interestedComment = commentItemContentBody.querySelector('.comments-comment-item-content-body');
    const commentContent = interestedComment ? interestedComment.textContent.trim() : '';

    return {
        isNewPost: false,
        editingBoxText: editingBox.innerText.trim(),
        postContent: commentaryText,
        commentContent: commentContent
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

async function sendMessageToOpenAI(prompt) {
    const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    const API_KEY = await getAPIKey();

    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{'role': 'user', 'content': prompt}],
        max_tokens: 1000,
        temperature: 0.7,
    };
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(data),
    });
    const json = await response.json();
    if (json.choices && json.choices.length > 0) {
        const message = json.choices[0].message.content;
        return message.trim();
    } else {
        throw new Error('No response from OpenAI API');
    }
}

async function getAPIKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('chrome_openai_apiKey', function (data) {
            console.log('Retrieved data from storage:', data);
            const apiKey = data.chrome_openai_apiKey;
            if (apiKey) {
                resolve(apiKey);
            } else {
                reject(new Error('API key not found'));
            }
        });
    });
}

// Attach the MutationObserver to the document body
const observer = new MutationObserver(handleMutation);
observer.observe(document.body, {childList: true, subtree: true});
