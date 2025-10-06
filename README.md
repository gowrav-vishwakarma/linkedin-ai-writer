# LinkedIn AI Writer - Multi-Provider Support

A Chrome extension that helps you write better LinkedIn content using various AI providers including OpenAI, Anthropic Claude, Ollama, LM Studio, Groq, and Together AI.

## Features

- **Multi-Provider Support**: Choose from 6 different AI providers
- **Local AI Support**: Use Ollama or LM Studio for privacy-focused local AI
- **Customizable Prompts**: Create and manage your own prompt templates
- **Smart Context**: Automatically detects post vs comment context
- **Professional Templates**: Pre-built prompts for various LinkedIn scenarios

## Supported AI Providers

### 1. OpenAI

- **Models**: GPT-3.5-turbo, GPT-4, GPT-4-turbo
- **API Key Required**: Yes
- **Endpoint**: https://api.openai.com/v1/chat/completions

### 2. Anthropic Claude

- **Models**: Claude-3 Haiku, Claude-3 Sonnet, Claude-3 Opus
- **API Key Required**: Yes
- **Endpoint**: https://api.anthropic.com/v1/messages

### 3. Ollama (Local)

- **Models**: Llama2, CodeLlama, Mistral, Neural Chat, Starling LM
- **API Key Required**: No
- **Endpoint**: http://localhost:11434/api/generate
- **Setup**: Install Ollama and run `ollama serve`

### 4. LM Studio (Local)

- **Models**: Any model loaded in LM Studio
- **API Key Required**: No
- **Endpoint**: http://localhost:1234/v1/chat/completions
- **Setup**: Install LM Studio and start the local server

### 5. Groq

- **Models**: Llama2-70B, Mixtral-8x7B, Gemma-7B
- **API Key Required**: Yes
- **Endpoint**: https://api.groq.com/openai/v1/chat/completions

### 6. Together AI

- **Models**: Llama-2-7B, Mistral-7B, RedPajama-7B
- **API Key Required**: Yes
- **Endpoint**: https://api.together.xyz/v1/chat/completions

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your browser toolbar

## Configuration

1. Click the extension icon to open the configuration popup
2. Select your preferred AI provider
3. Enter your API key (if required)
4. Choose a model (optional - uses default if not specified)
5. Adjust temperature and max tokens as needed
6. Click "Save Configuration"
7. Test the connection using the "Test Connection" button

## Usage

### On LinkedIn Posts

1. Start writing a new post on LinkedIn
2. You'll see AI prompt buttons appear below the text area
3. Click any button to enhance your content

### On LinkedIn Comments

1. Start writing a comment on any LinkedIn post
2. AI prompt buttons will appear with context-aware options
3. The AI will consider both the original post and your comment

## Available Prompts

### Default Prompts

- **$ \_** - Basic text completion
- **Professionalize** - Convert casual text to professional language
- **Post++** - Generate supportive comments with reasoning
- **Comment++** - Reply to comments with agreement and facts
- **Post--** - Generate constructive disagreement comments
- **Comment--** - Disagree with comments professionally
- **Post++ ;)** - Funny supportive comments
- **Comment++ ;)** - Humorous agreement replies
- **Post-- ;)** - Funny disagreement comments
- **Comment-- ;)** - Humorous disagreement replies
- **ToHindi** - Translate content to Hindi

### Custom Prompts

You can create your own prompts using these placeholders:

- `$text` - Your current text
- `$post` - The original post content
- `$comment` - The comment you're replying to

## Local AI Setup

### Ollama Setup

1. Install Ollama from https://ollama.ai/
2. Run `ollama serve` in terminal
3. Pull a model: `ollama pull llama2`
4. Configure the extension to use Ollama provider

### LM Studio Setup

1. Install LM Studio from https://lmstudio.ai/
2. Download and load a model
3. Start the local server in LM Studio
4. Configure the extension to use LM Studio provider

## Privacy & Security

- **Local Providers**: Ollama and LM Studio run entirely on your machine
- **API Keys**: Stored locally in Chrome's storage, never transmitted except to the chosen provider
- **No Data Collection**: The extension doesn't collect or store your content

## Troubleshooting

### Connection Issues

- Verify your API key is correct
- Check if the provider's service is operational
- For local providers, ensure the service is running
- Test the connection using the "Test Connection" button

### No Buttons Appearing

- Refresh the LinkedIn page
- Ensure the extension is enabled
- Check browser console for errors

### Poor AI Responses

- Try adjusting the temperature setting
- Switch to a different model
- Modify your prompt templates
- Check if the provider has usage limits

## Development

### File Structure

```
├── manifest.json          # Extension manifest
├── popup.html            # Configuration UI
├── popup.js              # Configuration logic
├── contentScript.js      # LinkedIn integration
├── contentScript.css     # Button styling
├── providers.js          # Multi-provider system
└── icon.png             # Extension icon
```

### Adding New Providers

1. Add provider configuration to `providers.js`
2. Define the provider's API format
3. Add the provider to the UI dropdown
4. Test the integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple providers
5. Submit a pull request

## License

This project is open source. Feel free to fork and modify as needed.

## Support

For issues or questions:

- Check the troubleshooting section
- Open an issue on GitHub
- Contact the maintainer

---

Made with ❤️ by [Gowrav Vishwakarma](https://www.linkedin.com/in/gowravvishwakarma/)

Fork and improve this tool: [GitHub Repository](https://github.com/gowrav-vishwakarma/linkedin-ai-writer.git)
