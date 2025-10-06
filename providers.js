// Provider configurations for different AI services
const PROVIDERS = {
    openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        authType: 'bearer',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4-vision-preview'],
        defaultModel: 'gpt-3.5-turbo',
        maxTokens: 4000,
        temperature: 0.7,
        headers: {
            'Content-Type': 'application/json'
        },
        requestBody: (prompt, config, mediaContent = null) => {
            const messages = [{ role: 'user', content: [] }];
            
            // Add text content
            if (prompt) {
                messages[0].content.push({ type: 'text', text: prompt });
            }
            
            // Add media content if provided
            if (mediaContent && mediaContent.length > 0) {
                mediaContent.forEach(media => {
                    messages[0].content.push({
                        type: 'image_url',
                        image_url: {
                            url: media.dataUrl,
                            detail: 'auto'
                        }
                    });
                });
            }
            
            // If no content was added, add the prompt as text
            if (messages[0].content.length === 0) {
                messages[0].content = prompt;
            }
            
            return {
                model: config.model || 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: config.maxTokens || 1000,
                temperature: config.temperature || 0.7
            };
        },
        responseParser: (response) => {
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content.trim();
            }
            throw new Error('No response from OpenAI API');
        }
    },
    
    anthropic: {
        name: 'Anthropic Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        authType: 'x-api-key',
        models: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-5-sonnet-20241022'],
        defaultModel: 'claude-3-haiku-20240307',
        maxTokens: 4000,
        temperature: 0.7,
        headers: {
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        },
        requestBody: (prompt, config, mediaContent = null) => {
            const content = [];
            
            // Add text content
            if (prompt) {
                content.push({ type: 'text', text: prompt });
            }
            
            // Add media content if provided
            if (mediaContent && mediaContent.length > 0) {
                mediaContent.forEach(media => {
                    content.push({
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: media.type,
                            data: media.dataUrl.split(',')[1] // Remove data:image/jpeg;base64, prefix
                        }
                    });
                });
            }
            
            return {
                model: config.model || 'claude-3-haiku-20240307',
                max_tokens: config.maxTokens || 1000,
                temperature: config.temperature || 0.7,
                messages: [{ role: 'user', content: content }]
            };
        },
        responseParser: (response) => {
            if (response.content && response.content.length > 0) {
                return response.content[0].text.trim();
            }
            throw new Error('No response from Anthropic API');
        }
    },
    
    ollama: {
        name: 'Ollama (Local)',
        endpoint: 'http://localhost:11434/api/generate',
        authType: 'none',
        models: ['llama2', 'codellama', 'mistral', 'neural-chat', 'starling-lm', 'llava:7b', 'llava:13b', 'llava:34b', 'llama3.2-vision:11b', 'llama3.2-vision:3b', 'qwen2.5-vl:7b', 'qwen2.5-vl:3b'],
        defaultModel: 'llama2',
        maxTokens: 4000,
        temperature: 0.7,
        headers: {
            'Content-Type': 'application/json'
        },
        requestBody: (prompt, config, mediaContent = null) => {
            const requestBody = {
                model: config.model || 'llama2',
                stream: false,
                options: {
                    temperature: config.temperature || 0.7,
                    num_predict: config.maxTokens || 1000
                }
            };

            // Check if this is a vision model
            const isVisionModel = config.model && (
                config.model.includes('llava') || 
                config.model.includes('vision') || 
                config.model.includes('vl')
            );

            if (isVisionModel && mediaContent && mediaContent.length > 0) {
                // For vision models, use the chat format with images
                requestBody.messages = [
                    {
                        role: 'user',
                        content: prompt,
                        images: mediaContent.map(media => media.dataUrl.split(',')[1]) // Remove data:image/jpeg;base64, prefix
                    }
                ];
                // Remove the old prompt field for vision models
                delete requestBody.prompt;
            } else {
                // For text-only models, use the original format
                requestBody.prompt = prompt;
            }

            return requestBody;
        },
        responseParser: (response) => {
            // Handle both old format (response.response) and new chat format (message.content)
            if (response.response) {
                return response.response.trim();
            } else if (response.message && response.message.content) {
                return response.message.content.trim();
            }
            throw new Error('No response from Ollama');
        }
    },
    
    lmstudio: {
        name: 'LM Studio (Local)',
        endpoint: 'http://localhost:1234/v1/chat/completions',
        authType: 'none',
        models: ['local-model', 'qwen2.5-vl-7b', 'qwen2.5-vl-3b', 'llava-7b', 'llava-13b', 'llava-34b'], // LM Studio uses whatever model is loaded
        defaultModel: 'local-model',
        maxTokens: 4000,
        temperature: 0.7,
        headers: {
            'Content-Type': 'application/json'
        },
        requestBody: (prompt, config, mediaContent = null) => {
            const messages = [{ role: 'user', content: [] }];
            
            // Add text content
            if (prompt) {
                messages[0].content.push({ type: 'text', text: prompt });
            }
            
            // Add media content if provided
            if (mediaContent && mediaContent.length > 0) {
                mediaContent.forEach(media => {
                    messages[0].content.push({
                        type: 'image_url',
                        image_url: {
                            url: media.dataUrl,
                            detail: 'auto'
                        }
                    });
                });
            }
            
            // If no content was added, add the prompt as text
            if (messages[0].content.length === 0) {
                messages[0].content = prompt;
            }
            
            return {
                model: config.model || 'local-model',
                messages: messages,
                max_tokens: config.maxTokens || 1000,
                temperature: config.temperature || 0.7,
                stream: false
            };
        },
        responseParser: (response) => {
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content.trim();
            }
            throw new Error('No response from LM Studio');
        }
    },
    
    groq: {
        name: 'Groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        authType: 'bearer',
        models: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'],
        defaultModel: 'llama2-70b-4096',
        maxTokens: 4000,
        temperature: 0.7,
        headers: {
            'Content-Type': 'application/json'
        },
        requestBody: (prompt, config) => ({
            model: config.model || 'llama2-70b-4096',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: config.maxTokens || 1000,
            temperature: config.temperature || 0.7
        }),
        responseParser: (response) => {
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content.trim();
            }
            throw new Error('No response from Groq API');
        }
    },
    
    together: {
        name: 'Together AI',
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        authType: 'bearer',
        models: ['meta-llama/Llama-2-7b-chat-hf', 'mistralai/Mistral-7B-Instruct-v0.1', 'togethercomputer/RedPajama-INCITE-7B-Chat'],
        defaultModel: 'meta-llama/Llama-2-7b-chat-hf',
        maxTokens: 4000,
        temperature: 0.7,
        headers: {
            'Content-Type': 'application/json'
        },
        requestBody: (prompt, config) => ({
            model: config.model || 'meta-llama/Llama-2-7b-chat-hf',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: config.maxTokens || 1000,
            temperature: config.temperature || 0.7
        }),
        responseParser: (response) => {
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content.trim();
            }
            throw new Error('No response from Together AI');
        }
    }
};

// Default provider configuration
const DEFAULT_PROVIDER_CONFIG = {
    provider: 'openai',
    apiKey: '',
    model: '',
    maxTokens: 1000,
    temperature: 0.7,
    customEndpoint: ''
};

// Storage keys
const STORAGE_KEYS = {
    PROVIDER_CONFIG: 'linkedin_ai_provider_config',
    API_KEYS: 'linkedin_ai_api_keys'
};

// Provider management functions
class ProviderManager {
    static async getProviderConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.get(STORAGE_KEYS.PROVIDER_CONFIG, (data) => {
                const config = data[STORAGE_KEYS.PROVIDER_CONFIG] || { ...DEFAULT_PROVIDER_CONFIG };
                resolve(config);
            });
        });
    }
    
    static async saveProviderConfig(config) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEYS.PROVIDER_CONFIG]: config }, resolve);
        });
    }
    
    static async getAPIKey(provider) {
        return new Promise((resolve) => {
            chrome.storage.local.get(STORAGE_KEYS.API_KEYS, (data) => {
                const apiKeys = data[STORAGE_KEYS.API_KEYS] || {};
                resolve(apiKeys[provider] || '');
            });
        });
    }
    
    static async saveAPIKey(provider, apiKey) {
        return new Promise((resolve) => {
            chrome.storage.local.get(STORAGE_KEYS.API_KEYS, (data) => {
                const apiKeys = data[STORAGE_KEYS.API_KEYS] || {};
                apiKeys[provider] = apiKey;
                chrome.storage.local.set({ [STORAGE_KEYS.API_KEYS]: apiKeys }, resolve);
            });
        });
    }
    
    static getProvider(providerName) {
        return PROVIDERS[providerName];
    }
    
    static getAllProviders() {
        return Object.keys(PROVIDERS).map(key => ({
            id: key,
            ...PROVIDERS[key]
        }));
    }
    
    static async sendRequest(prompt, providerName, config = {}, mediaContent = null) {
        const provider = this.getProvider(providerName);
        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }
        
        const apiKey = await this.getAPIKey(providerName);
        if (provider.authType !== 'none' && !apiKey) {
            throw new Error(`API key required for ${provider.name}`);
        }
        
        const requestConfig = {
            model: config.model || provider.defaultModel,
            maxTokens: config.maxTokens || provider.maxTokens,
            temperature: config.temperature || provider.temperature
        };
        
        const requestBody = provider.requestBody(prompt, requestConfig, mediaContent);
        const endpoint = config.customEndpoint || provider.endpoint;
        
        const headers = { ...provider.headers };
        if (provider.authType === 'bearer') {
            headers.Authorization = `Bearer ${apiKey}`;
        } else if (provider.authType === 'x-api-key') {
            headers['x-api-key'] = apiKey;
        }
        
        try {
            // Debug: Log the request body for vision models
            if (mediaContent && mediaContent.length > 0) {
                console.log('🔍 Sending request to', provider.name, 'with media content:');
                console.log('📷 Media count:', mediaContent.length);
                console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));
            }
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API Error (${response.status}):`, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const json = await response.json();
            return provider.responseParser(json);
        } catch (error) {
            console.error(`Error with ${provider.name}:`, error);
            throw error;
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PROVIDERS, ProviderManager, DEFAULT_PROVIDER_CONFIG };
}
