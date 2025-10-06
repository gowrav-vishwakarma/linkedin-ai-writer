// Default prompts configuration
const DEFAULT_PROMPTS = [
    {
        label: '$ _',
        position: 'new_post',
        text: 'Complete this LinkedIn post text in a professional and engaging way. Just give me the completed text to copy-paste, no explanations.\n\nText: $text',
        replaceText: true,
    }, {
        label: '$ _',
        position: 'comment',
        text: 'Complete this LinkedIn comment text in a professional and engaging way. Just give me the completed text to copy-paste, no explanations.\n\nText: $text',
        replaceText: true,
    },
    {
        label: 'Professionalize',
        position: 'new_post',
        text: 'Convert this text to professional LinkedIn post language. Just give me the professional version to copy-paste, no explanations.\n\nText: $text',
        replaceText: true,
    },
    {
        label: 'Professionalize',
        position: 'comment',
        text: 'Convert this text to professional LinkedIn comment language. Just give me the professional version to copy-paste, no explanations.\n\nOriginal Post: $post\n\nMy text: $text',
        replaceText: true,
    },
    {
        label: 'Post++',
        position: 'comment',
        text: 'Write a supportive comment agreeing with this LinkedIn post. Be professional, add value with facts or insights, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Comment++',
        position: 'comment',
        text: 'Write a supportive comment agreeing with this comment on a LinkedIn post. Be professional, add value, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nOriginal Post: $post\n\nComment I\'m replying to: $comment',
        replaceText: true,
    }, {
        label: 'Post--',
        position: 'comment',
        text: 'Write a respectful disagreement comment for this LinkedIn post. Be constructive, provide counter-arguments or facts, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Comment--',
        position: 'comment',
        text: 'Write a respectful disagreement comment for this comment on a LinkedIn post. Be constructive, provide counter-arguments, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nOriginal Post: $post\n\nComment I\'m replying to: $comment',
        replaceText: true,
    },{
        label: 'Post++ ;)',
        position: 'comment',
        text: 'Write a funny but supportive comment for this LinkedIn post. Be humorous while agreeing, add wit or light humor, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Comment++ ;)',
        position: 'comment',
        text: 'Write a funny but supportive comment agreeing with this comment on a LinkedIn post. Be humorous while agreeing, add wit, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nOriginal Post: $post\n\nComment I\'m replying to: $comment',
        replaceText: true,
    }, {
        label: 'Post-- ;)',
        position: 'comment',
        text: 'Write a funny but respectful disagreement comment for this LinkedIn post. Be humorous while disagreeing, add wit or sarcasm, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Comment-- ;)',
        position: 'comment',
        text: 'Write a funny but respectful disagreement comment for this comment on a LinkedIn post. Be humorous while disagreeing, add wit or sarcasm, keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nOriginal Post: $post\n\nComment I\'m replying to: $comment',
        replaceText: true,
    },
    {
        label: 'ToHindi',
        position: 'comment',
        text: 'Translate this content to Hindi. Just give me the Hindi translation to copy-paste, no explanations.\n\nContent: $post',
        replaceText: false,
    },
    {
        label: 'Analyze Image',
        position: 'comment',
        text: 'Analyze the image(s) in this LinkedIn post and write a professional comment that adds value based on what you see. Be insightful and relevant to the visual content. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Image Insights',
        position: 'comment',
        text: 'Look at the image(s) in this post and provide a thoughtful comment that offers insights, asks relevant questions, or adds professional value based on the visual content. Keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Video Analysis',
        position: 'comment',
        text: 'Analyze the video content in this LinkedIn post and write a professional comment that adds value based on what you see in the video frames. Be insightful and relevant to the visual content. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Video Insights',
        position: 'comment',
        text: 'Look at the video frames in this post and provide a thoughtful comment that offers insights, asks relevant questions, or adds professional value based on the video content. Keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Document Analysis',
        position: 'comment',
        text: 'Analyze the document content in this LinkedIn post and write a professional comment that adds value based on the document information. Be insightful and relevant to the document content. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
    {
        label: 'Document Insights',
        position: 'comment',
        text: 'Look at the document in this post and provide a thoughtful comment that offers insights, asks relevant questions, or adds professional value based on the document content. Keep it 2-3 lines. Just give me the comment text to copy-paste, no explanations.\n\nPost: $post',
        replaceText: true,
    },
];

// DOM elements
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key');
const modelSelect = document.getElementById('model-select');
const customEndpointInput = document.getElementById('custom-endpoint');
const maxTokensInput = document.getElementById('max-tokens');
const temperatureInput = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperature-value');
const providerForm = document.getElementById('provider-form');
const testConnectionBtn = document.getElementById('test-connection');
const connectionStatus = document.getElementById('connection-status');
const statusText = document.getElementById('status-text');
const apiKeyHelp = document.getElementById('api-key-help');
const supportsMediaCheckbox = document.getElementById('supports-media');
const videoFrameOptions = document.getElementById('video-frame-options');
const videoFrameStrategy = document.getElementById('video-frame-strategy');
const customFrameCount = document.getElementById('custom-frame-count');
const frameCountInput = document.getElementById('frame-count');

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
    await initializeProviderConfig();
    await initializePrompts();
    setupEventListeners();
});

// Initialize provider configuration
async function initializeProviderConfig() {
    try {
        const config = await ProviderManager.getProviderConfig();
        
        // Set provider
        providerSelect.value = config.provider || 'openai';
        
        // Update UI based on provider FIRST (this rebuilds model options)
        updateProviderUI(config.provider || 'openai');
        
        // Load API key for current provider
        const apiKey = await ProviderManager.getAPIKey(config.provider || 'openai');
        apiKeyInput.value = apiKey;
        
        // Set other config values AFTER UI is updated
        modelSelect.value = config.model || '';
        customEndpointInput.value = config.customEndpoint || '';
        maxTokensInput.value = config.maxTokens || 1000;
        temperatureInput.value = config.temperature || 0.7;
        temperatureValue.textContent = config.temperature || 0.7;
        supportsMediaCheckbox.checked = (config.supportsMedia !== false);
        videoFrameStrategy.value = config.videoFrameStrategy || 'minimal';
        frameCountInput.value = config.customFrameCount || 5;
        
        // Show/hide video frame options based on media support
        updateVideoFrameOptionsVisibility();
        
    } catch (error) {
        console.error('Error initializing provider config:', error);
    }
}

// Initialize prompts
async function initializePrompts() {
    try {
        const data = await new Promise((resolve) => {
            chrome.storage.local.get('chrome_openai_prompts', resolve);
        });
        
        if (!data.chrome_openai_prompts || data.chrome_openai_prompts.length === 0) {
            await new Promise((resolve) => {
                chrome.storage.local.set({chrome_openai_prompts: DEFAULT_PROMPTS}, resolve);
            });
            DEFAULT_PROMPTS.forEach(createPromptUI);
        } else {
            data.chrome_openai_prompts.forEach(createPromptUI);
        }
    } catch (error) {
        console.error('Error initializing prompts:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Provider selection change
    providerSelect.addEventListener('change', async (e) => {
        const provider = e.target.value;
        await updateProviderUI(provider);
        
        // Load API key for new provider
        const apiKey = await ProviderManager.getAPIKey(provider);
        apiKeyInput.value = apiKey;
        
        // Reset model selection when provider changes
        modelSelect.value = '';
    });
    
    // Temperature slider
    temperatureInput.addEventListener('input', (e) => {
        temperatureValue.textContent = e.target.value;
    });
    
    // Media support checkbox
    supportsMediaCheckbox.addEventListener('change', () => {
        updateVideoFrameOptionsVisibility();
    });
    
    // Video frame strategy change
    videoFrameStrategy.addEventListener('change', () => {
        updateCustomFrameCountVisibility();
    });
    
    // Form submission
    providerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProviderConfig();
    });
    
    // Test connection
    testConnectionBtn.addEventListener('click', async () => {
        await testConnection();
    });
    
    // Add prompt button
    document.getElementById('add-prompt').addEventListener('click', () => {
        createPromptUI({label: '', position: 'new_post', text: '', replaceText: false});
    });
    
    // Save prompts button
    document.getElementById('save-prompts').addEventListener('click', () => {
        savePrompts();
    });
}

// Update UI based on selected provider
async function updateProviderUI(provider) {
    const providerInfo = ProviderManager.getProvider(provider);
    if (!providerInfo) return;
    
    // Update API key help text
    if (providerInfo.authType === 'none') {
        apiKeyHelp.textContent = 'No API key required for local providers';
        apiKeyInput.placeholder = 'No API key needed';
        apiKeyInput.disabled = true;
    } else {
        apiKeyHelp.textContent = `Required for ${providerInfo.name}`;
        apiKeyInput.placeholder = 'Enter your API key';
        apiKeyInput.disabled = false;
    }
    
    // Update model options
    modelSelect.innerHTML = '<option value="">Use default model</option>';
    providerInfo.models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
    });
    
    // Update custom endpoint placeholder
    customEndpointInput.placeholder = providerInfo.endpoint;
}

// Save provider configuration
async function saveProviderConfig() {
    try {
        const config = {
            provider: providerSelect.value,
            apiKey: apiKeyInput.value.trim(),
            model: modelSelect.value,
            customEndpoint: customEndpointInput.value.trim(),
            maxTokens: parseInt(maxTokensInput.value),
            temperature: parseFloat(temperatureInput.value),
            supportsMedia: supportsMediaCheckbox.checked,
            videoFrameStrategy: videoFrameStrategy.value,
            customFrameCount: parseInt(frameCountInput.value)
        };
        
        // Save provider config
        await ProviderManager.saveProviderConfig(config);
        
        // Save API key separately
        await ProviderManager.saveAPIKey(config.provider, config.apiKey);
        
        showStatus('Configuration saved successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving provider config:', error);
        showStatus('Error saving configuration: ' + error.message, 'danger');
    }
}

// Test connection to provider
async function testConnection() {
    try {
        testConnectionBtn.disabled = true;
        testConnectionBtn.textContent = 'Testing...';
        showStatus('Testing connection...', 'info');
        
        const config = {
            provider: providerSelect.value,
            apiKey: apiKeyInput.value.trim(),
            model: modelSelect.value,
            customEndpoint: customEndpointInput.value.trim(),
            maxTokens: parseInt(maxTokensInput.value),
            temperature: parseFloat(temperatureInput.value)
        };
        
        // Test with a simple prompt
        const testPrompt = "Hello, this is a test message. Please respond with 'Connection successful!'";
        const response = await ProviderManager.sendRequest(testPrompt, config.provider, config);
        
        showStatus(`Connection successful! Response: ${response}`, 'success');
        
    } catch (error) {
        console.error('Connection test failed:', error);
        showStatus(`Connection failed: ${error.message}`, 'danger');
    } finally {
        testConnectionBtn.disabled = false;
        testConnectionBtn.textContent = 'Test Connection';
    }
}

// Show status message
function showStatus(message, type) {
    statusText.textContent = message;
    connectionStatus.className = `mt-3 alert alert-${type}`;
    connectionStatus.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        connectionStatus.style.display = 'none';
    }, 5000);
}

// Create prompt UI (existing function)
function createPromptUI(prompt) {
    if (!prompt) return;
    const promptsTbody = document.getElementById('prompts-tbody');
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

// Save prompts (existing function)
function savePrompts() {
    const promptsTbody = document.getElementById('prompts-tbody');
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
    
    showStatus('Prompts saved successfully!', 'success');
}

// Update video frame options visibility
function updateVideoFrameOptionsVisibility() {
    if (supportsMediaCheckbox.checked) {
        videoFrameOptions.style.display = 'block';
        updateCustomFrameCountVisibility();
    } else {
        videoFrameOptions.style.display = 'none';
    }
}

// Update custom frame count visibility
function updateCustomFrameCountVisibility() {
    if (videoFrameStrategy.value === 'custom') {
        customFrameCount.style.display = 'block';
    } else {
        customFrameCount.style.display = 'none';
    }
}