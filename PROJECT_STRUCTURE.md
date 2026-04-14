# GLM Chatbot Test - Project Structure

```
GLM-chatbot-test/
├── .env                      # API configuration (with your API key)
├── .env.example              # Template for .env file
├── .gitignore                # Git ignore rules
├── README.md                 # Project overview
├── API_NOTES.md              # Z.AI API documentation notes
├── USAGE_EXAMPLES.md         # Usage examples and customization guide
├── PROJECT_STRUCTURE.md      # This file
├── package.json              # Node.js project configuration
├── index.js                  # Main chatbot application
├── test-api.js               # Basic API connection test
├── test-api-verbose.js        # Verbose API test with full response
├── quick-start.sh            # Quick start script
└── node_modules/             # Installed dependencies (after npm install)
```

## File Descriptions

### Core Files

- **index.js** - Main chatbot application with:
  - Command-line interface (CLI)
  - Message history management
  - Streaming responses
  - Command support (quit, clear, history)
  - Error handling

### Configuration Files

- **.env** - Environment variables (contains your API key)
- **.env.example** - Template for .env
- **package.json** - Dependencies and scripts

### Documentation

- **README.md** - Quick start guide and setup instructions
- **API_NOTES.md** - Z.AI API reference and important notes
- **USAGE_EXAMPLES.md** - Detailed usage examples and customization
- **PROJECT_STRUCTURE.md** - This file

### Testing Files

- **test-api.js** - Basic API connection test
- **test-api-verbose.js** - Verbose test showing full API response
- **quick-start.sh** - Automated setup and testing script

## Technology Stack

- **Runtime**: Node.js (ES modules)
- **API Client**: OpenAI SDK (v4.73.0)
- **Environment**: dotenv (v16.4.7)
- **Input/Output**: Node.js readline module

## Key Features

1. **Streaming Responses** - Real-time text generation
2. **Message History** - Conversation context maintained
3. **Command System** - Built-in commands for session management
4. **Error Handling** - Graceful error recovery
5. **Model Selection** - Easy model switching via .env

## API Endpoints

- **Coding Plan API**: `https://api.z.ai/api/coding/paas/v4`
- **Supported Models**: glm-5.1, glm-5-turbo, glm-4.7, glm-4.5-air

## Quick Start

```bash
cd ~/Desktop/GLM-chatbot-test
./quick-start.sh  # Or: npm install && npm start
```

## Next Steps

1. Test the API: `node test-api.js`
2. Start chatting: `npm start`
3. Explore examples: Check USAGE_EXAMPLES.md
4. Customize: Edit .env to change models, or modify index.js for custom behavior
