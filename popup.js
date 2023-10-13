const DEFAULT_PROMPTS = [
    {
        label: '$ _',
        position: 'new_post',
        text: '$text',
        replaceText: true,
    }, {
        label: '$ _',
        position: 'comment',
        text: '$text',
        replaceText: true,
    },
    {
        label: 'Professionalize',
        position: 'new_post',
        text: 'Please convert this text to professional language for my linkedin post: $text',
        replaceText: true,
    },
    {
        label: 'Professionalize',
        position: 'comment',
        text: 'Please convert this text to professional language for my linkedin comment for a post where this is post content \n\n\n\n \'\'\'$post\'\'\' \n\n\n And this is what I want to say \n\n\n $text\n\n\n=====\nOnly give me what I can copy and paste, not being third party but behaving like me.',
        replaceText: true,
    },
    {
        label: 'Post++',
        position: 'comment',
        text: 'I read this post on linkedin and now I want to comment on this as agreement, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines. the post is like this: \n\n\n\n$post',
        replaceText: true,
    },
    {
        label: 'Comment++',
        position: 'comment',
        text: 'I read this post on linkedin and comment on the post and now I want to comment on this comment as agreement that it is good agreement with actual post, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines. the post is like this: \n\n\n\n$post\n\n\n\n===\n\n\nand the comment I am commenting on is like this:\n\n\n\n $comment',
        replaceText: true,
    }, {
        label: 'Post--',
        position: 'comment',
        text: 'I read this post on linkedin and now I want to comment on this as dis-agreement, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines. the post is like this: \n\n\n\n$post',
        replaceText: true,
    },
    {
        label: 'Comment--',
        position: 'comment',
        text: 'I read this post on linkedin and comment on the post and now I want to comment on this comment as dis-agreement that it is not a good or correct comment with actual post, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines. the post is like this: \n\n\n\n$post\n\n\n\n===\n\n\nand the comment I am commenting on is like this:\n\n\n\n $comment',
        replaceText: true,
    },{
        label: 'Post++ ;)',
        position: 'comment',
        text: 'I read this post on linkedin and now I want to comment on this as agreement but in funny way, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines, please give me content as such that people gets smile or laugh with my content. the post is like this: \n\n\n\n$post',
        replaceText: true,
    },
    {
        label: 'Comment++ ;)',
        position: 'comment',
        text: 'I read this post on linkedin and comment on the post and now I want to comment on this comment as agreement that it is good agreement with actual post but in funny way, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines, please give me content as such that people gets smile or laugh with my content. the post is like this: \n\n\n\n$post\n\n\n\n===\n\n\nand the comment I am commenting on is like this:\n\n\n\n $comment',
        replaceText: true,
    }, {
        label: 'Post-- ;)',
        position: 'comment',
        text: 'I read this post on linkedin and now I want to comment on this as dis-agreement but in funny way, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines, please give me content as such that people gets smile or laugh with my content. the post is like this: \n\n\n\n$post',
        replaceText: true,
    },
    {
        label: 'Comment-- ;)',
        position: 'comment',
        text: 'I read this post on linkedin and comment on the post and now I want to comment on this comment as dis-agreement that it is not a good or correct comment with actual post but in funny way, please give me text to copy paste there with reasoning or fact/data if possible in 2~3 lines, please give me content as such that people gets smile or laugh with my content. the post is like this: \n\n\n\n$post\n\n\n\n===\n\n\nand the comment I am commenting on is like this:\n\n\n\n $comment',
        replaceText: true,
    },
    {
        label: 'ToHindi',
        position: 'comment',
        text: 'can you translate the following content to Hindi:\n\n $post',
        replaceText: false,
    },
];

chrome.storage.local.get('chrome_openai_prompts', (data) => {
    console.log('got data from local', data);
    if (!data.chrome_openai_prompts || data.chrome_openai_prompts.length === 0) {
        chrome.storage.local.set({chrome_openai_prompts: DEFAULT_PROMPTS}, () => {
            // After setting the default prompts, load them into the UI
            DEFAULT_PROMPTS.forEach(createPromptUI);
        });
    } else {
        // If prompts already exist, load them into the UI
        data.chrome_openai_prompts.forEach(createPromptUI);
    }
});

const promptsContainer = document.getElementById('prompts-container');

const promptsTbody = document.getElementById('prompts-tbody');

function createPromptUI(prompt) {
    if (!prompt) return;
    const tr = document.createElement('tr');

    const tdPosition = document.createElement('td');
    const positionSelect = document.createElement('select');
    positionSelect.className = 'form-control';
    ['new_post', 'comment'].forEach(pos => {
        const option = document.createElement('option');
        option.value = pos;
        option.textContent = pos;
        if (pos === prompt.position) option.selected = true;
        positionSelect.appendChild(option);
    });
    tdPosition.appendChild(positionSelect);
    tr.appendChild(tdPosition);

    const tdLabel = document.createElement('td');
    const labelInput = document.createElement('input');
    labelInput.className = 'form-control';
    labelInput.placeholder = 'Label';
    labelInput.value = prompt.label;
    tdLabel.appendChild(labelInput);
    tr.appendChild(tdLabel);

    const tdText = document.createElement('td');
    const textInput = document.createElement('textarea');
    textInput.className = 'form-control';
    textInput.placeholder = 'Prompt Text';
    textInput.value = prompt.text;
    tdText.appendChild(textInput);
    tr.appendChild(tdText);

    const tdReplaceText = document.createElement('td');
    const replaceCheckbox = document.createElement('input');
    replaceCheckbox.type = 'checkbox';
    replaceCheckbox.checked = prompt.replaceText || false;
    tdReplaceText.appendChild(replaceCheckbox);
    tr.appendChild(tdReplaceText);

    const tdActions = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-danger btn-sm';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        tr.remove();
    });
    tdActions.appendChild(deleteButton);
    tr.appendChild(tdActions);

    promptsTbody.appendChild(tr);
}


document.getElementById('add-prompt').addEventListener('click', () => {
    createPromptUI({label: '', position: 'new_post', text: '', replaceText: false});
});


document.getElementById('save-prompts').addEventListener('click', () => {
    const prompts = Array.from(promptsTbody.children).map(tr => {
        return {
            label: tr.querySelector('input').value,
            position: tr.querySelector('select').value,
            text: tr.querySelector('textarea').value,
            replaceText: tr.querySelector('input[type=\'checkbox\']').checked,
        };
    });


    if (prompts.length === 0) {
        chrome.storage.local.set({chrome_openai_prompts: DEFAULT_PROMPTS});
    } else {
        chrome.storage.local.set({chrome_openai_prompts: prompts});

    }

});


const apiKeyInput = document.getElementById('api-key');
console.log('apiKeyInput', apiKeyInput); // log the apiKeyInput to verify it exists

// Load the stored API key and fill the input field
chrome.storage.local.get('chrome_openai_apiKey', (data) => {
    console.log(data); // log the data to see if the key is being properly loaded
    if (data.chrome_openai_apiKey) {
        apiKeyInput.value = data.chrome_openai_apiKey;
    }
});

// Handle form submission
const form = document.querySelector('form');
const submitBtn = document.querySelector('button[type=\'submit\']');
submitBtn.addEventListener('click', (event) => {
    event.preventDefault();

    // Save the API key to storage
    const apiKey = apiKeyInput.value.trim();
    console.log('here saving', apiKey, 'to storage');
    chrome.storage.local.set({chrome_openai_apiKey: apiKey}, () => {
        console.log('API key saved:', apiKey);
    });
});
