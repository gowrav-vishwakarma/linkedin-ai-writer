# LinkedIn AI Writer

A Chrome extension that enhances your LinkedIn content creation with AI assistance. Write better posts and comments using various AI providers, with support for images, videos, and documents.

## Features

**Multi-Provider AI Support**

- Choose from 6 different AI providers including OpenAI, Anthropic Claude, Ollama, LM Studio, Groq, and Together AI
- Support for both cloud-based and local AI models
- Vision capabilities for analyzing images, videos, and documents

**Smart Content Enhancement**

- Context-aware prompts that understand whether you're writing a post or comment
- Automatic detection of original post content when commenting
- Professional templates for various LinkedIn scenarios

**Media Processing**

- Extract and analyze images from LinkedIn posts
- Video frame extraction with configurable strategies
- Document carousel support for PDFs and presentations
- Configurable media processing based on your model's capabilities

**Customizable Prompts**

- Create and manage your own prompt templates
- Use placeholders for dynamic content insertion
- Position-specific prompts for posts vs comments

## Supported AI Providers

### OpenAI

- **Models**: GPT-3.5-turbo, GPT-4, GPT-4-turbo, GPT-4o, GPT-4-vision-preview
- **API Key Required**: Yes
- **Vision Support**: Yes (GPT-4o, GPT-4-vision-preview)
- **Endpoint**: https://api.openai.com/v1/chat/completions

### Anthropic Claude

- **Models**: Claude-3 Haiku, Claude-3 Sonnet, Claude-3 Opus, Claude-3.5 Sonnet
- **API Key Required**: Yes
- **Vision Support**: Yes (all Claude-3 models)
- **Endpoint**: https://api.anthropic.com/v1/messages

### Ollama (Local)

- **Models**: Llama2, CodeLlama, Mistral, Neural Chat, Starling LM, LLaVA (7b/13b/34b), Llama3.2 Vision (3b/11b), Qwen2.5-VL (3b/7b)
- **API Key Required**: No
- **Vision Support**: Yes (LLaVA, Llama3.2 Vision, Qwen2.5-VL models)
- **Endpoint**: http://localhost:11434/api/generate
- **Setup**: Install Ollama and run `ollama serve`

### LM Studio (Local)

- **Models**: Any model loaded in LM Studio
- **API Key Required**: No
- **Vision Support**: Yes (Qwen2.5-VL, LLaVA models)
- **Endpoint**: http://localhost:1234/v1/chat/completions
- **Setup**: Install LM Studio and start the local server

### Groq

- **Models**: Llama2-70B, Mixtral-8x7B, Gemma-7B
- **API Key Required**: Yes
- **Vision Support**: No
- **Endpoint**: https://api.groq.com/openai/v1/chat/completions

### Together AI

- **Models**: Llama-2-7B, Mistral-7B, RedPajama-7B
- **API Key Required**: Yes
- **Vision Support**: No
- **Endpoint**: https://api.together.xyz/v1/chat/completions

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your browser toolbar

## Configuration

### Basic Setup

1. Click the extension icon to open the configuration popup
2. Select your preferred AI provider from the dropdown
3. Enter your API key (if required for the provider)
4. Choose a specific model (optional - uses provider default if not specified)
5. Adjust temperature (0-2) and max tokens as needed
6. Click "Save Configuration"
7. Test the connection using the "Test Connection" button

### Media Support Configuration

**Enable/Disable Media Processing**

- Check "Supports media" if your model can process images and videos
- Uncheck for text-only models to avoid API errors
- When disabled, media-related prompts are hidden from the UI

**Video Frame Extraction Strategy**
When media support is enabled, choose how many frames to extract from videos:

- **Minimal**: 5 frames (start, 25%, 50%, 75%, end) - Best for small context windows
- **Moderate**: 11 frames (every 10% of video) - Good balance of detail and efficiency
- **Dense**: Every 0.5 seconds - More comprehensive coverage
- **Very Dense**: Every 0.25 seconds - Maximum detail (use with caution)
- **Custom**: Specify exact number of frames (1-100)

Choose based on your model's context window limitations and processing capabilities.

## Usage

### Writing New Posts

1. Start writing a new post on LinkedIn
2. AI prompt buttons will appear below the text area
3. Click any button to enhance your content
4. The AI will consider your text and any media in the post

### Commenting on Posts

1. Start writing a comment on any LinkedIn post
2. AI prompt buttons will appear with context-aware options
3. The AI will consider both the original post content and your comment
4. Media from the original post (images, videos, documents) will be analyzed if supported

### Media Analysis

When commenting on posts with media:

- Images are automatically captured and analyzed
- Videos are processed using your chosen frame extraction strategy
- Document carousels provide metadata and title information
- The AI generates responses based on both text and visual content

## Available Prompts

### Default Prompts

**Text Completion**

- **$ \_** - Complete your text in a professional and engaging way

**Professional Enhancement**

- **Professionalize** - Convert casual text to professional LinkedIn language

**Supportive Comments**

- **Post++** - Generate supportive comments agreeing with the post
- **Comment++** - Reply to comments with agreement and additional insights

**Constructive Disagreement**

- **Post--** - Generate respectful disagreement comments
- **Comment--** - Disagree with comments professionally

**Humorous Responses**

- **Post++ ;)** - Funny but supportive comments
- **Comment++ ;)** - Humorous agreement replies
- **Post-- ;)** - Funny but respectful disagreement comments
- **Comment-- ;)** - Humorous disagreement replies

**Translation**

- **ToHindi** - Translate content to Hindi

**Media Analysis** (only shown when media support is enabled)

- **Analyze Image** - Analyze images and write professional comments
- **Image Insights** - Provide thoughtful insights based on visual content
- **Video Analysis** - Analyze video content and write professional comments
- **Video Insights** - Provide insights based on video frames
- **Document Analysis** - Analyze document content and write professional comments
- **Document Insights** - Provide insights based on document information

### Custom Prompts

Create your own prompts using these placeholders:

- `$text` - Your current text
- `$post` - The original post content
- `$comment` - The comment you're replying to

## Local AI Setup

### Ollama Setup

1. Install Ollama from https://ollama.ai/
2. Run `ollama serve` in terminal
3. Pull a vision model: `ollama pull llava:7b` or `ollama pull qwen2.5-vl:7b`
4. Configure the extension to use Ollama provider
5. Select the appropriate model in the extension settings

### LM Studio Setup

1. Install LM Studio from https://lmstudio.ai/
2. Download and load a vision model (Qwen2.5-VL or LLaVA)
3. Start the local server in LM Studio
4. Configure the extension to use LM Studio provider
5. Select the loaded model in the extension settings

## Privacy and Security

**Local Providers**

- Ollama and LM Studio run entirely on your machine
- No data is sent to external servers
- Complete privacy for your content

**API Providers**

- API keys are stored locally in Chrome's storage
- Keys are only transmitted to the chosen provider
- No data collection or storage by the extension

**Content Handling**

- Your LinkedIn content is only sent to your chosen AI provider
- No intermediate storage or logging
- Media processing happens locally when possible

## Troubleshooting

### Connection Issues

**API Key Problems**

- Verify your API key is correct and has sufficient credits
- Check if the provider's service is operational
- Ensure you have the necessary permissions for the model

**Local Provider Issues**

- For Ollama: Ensure `ollama serve` is running
- For LM Studio: Verify the local server is started
- Check that the model is properly loaded

**Network Issues**

- Test the connection using the "Test Connection" button
- Check your internet connection for cloud providers
- Verify firewall settings for local providers

### UI Issues

**No Buttons Appearing**

- Refresh the LinkedIn page
- Ensure the extension is enabled in Chrome
- Check browser console for JavaScript errors
- Try disabling and re-enabling the extension

**Media Processing Errors**

- Uncheck "Supports media" if your model doesn't support vision
- Try a different video frame extraction strategy
- Check if the media content is accessible

### Performance Issues

**Slow Responses**

- Try a different model or provider
- Reduce the video frame extraction density
- Check your internet connection
- Consider using a local provider for better performance

**Context Window Errors**

- Reduce max tokens setting
- Use "Minimal" video frame extraction
- Switch to a model with larger context window
- Break long content into smaller pieces

## Advanced Configuration

### Custom Endpoints

You can override the default endpoint for any provider:

1. Enter a custom endpoint URL in the configuration
2. Useful for proxy servers or custom API deployments
3. Ensure the endpoint follows the provider's API format

### Prompt Management

**Creating Custom Prompts**

1. Click "Add New Prompt" in the configuration
2. Set the position (new_post or comment)
3. Enter a label and prompt text
4. Use placeholders for dynamic content
5. Choose whether to replace existing text or show in alert

**Prompt Placeholders**

- `$text` - Current text being written
- `$post` - Original post content (for comments)
- `$comment` - Comment being replied to (for replies)

## Development

### File Structure

```
├── manifest.json          # Extension manifest and permissions
├── popup.html            # Configuration UI
├── popup.js              # Configuration logic and prompt management
├── contentScript.js      # LinkedIn integration and media processing
├── contentScript.css     # Button styling and animations
├── providers.js          # Multi-provider system and API handling
├── icon.png             # Extension icon
└── README.md            # This documentation
```

### Adding New Providers

1. Add provider configuration to `providers.js`
2. Define the provider's API format and authentication
3. Add the provider to the UI dropdown in `popup.html`
4. Test the integration with various content types

### Media Processing

The extension supports three types of media:

- **Images**: Direct capture and analysis
- **Videos**: Frame extraction with configurable strategies
- **Documents**: Metadata extraction from LinkedIn document carousels

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple providers and content types
5. Submit a pull request

## License

This project is open source. Feel free to fork and modify as needed.

## Support

For issues or questions:

- Check the troubleshooting section above
- Open an issue on GitHub with detailed information
- Include browser console logs for technical issues

---

Made by [Gowrav Vishwakarma](https://www.linkedin.com/in/gowravvishwakarma/)

Fork and improve this tool: [GitHub Repository](https://github.com/gowrav-vishwakarma/linkedin-ai-writer.git)
