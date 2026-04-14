# GLM Chatbot Test

A simple chatbot wrapper for Z.AI's GLM-5 model using the GLM Coding Plan API.

## Quick Start

```bash
cd ~/Desktop/GLM-chatbot-test
npm install
npm start
```

Or use the automated setup script:
```bash
./quick-start.sh
```

## What's Included

- ✅ **Ready-to-run chatbot** with your API key configured
- ✅ **Streaming responses** for real-time interaction
- ✅ **Message history** for conversation context
- ✅ **Command system** (quit, clear, history)
- ✅ **Multiple models** supported (glm-5.1, glm-5-turbo, glm-4.7, glm-4.5-air)
- ✅ **Test scripts** for API verification
- ✅ **Comprehensive documentation**

## Project Structure

```
GLM-chatbot-test/
├── index.js              # Main chatbot application
├── test-api.js           # API connection test
├── test-api-verbose.js   # Verbose API test
├── quick-start.sh        # Automated setup script
├── .env                  # API configuration (with your key)
├── package.json          # Dependencies
├── README.md             # This file
├── API_NOTES.md          # API documentation
├── USAGE_EXAMPLES.md     # Usage examples
└── PROJECT_STRUCTURE.md # Project overview
```

## API Details

- **Endpoint**: `https://api.z.ai/api/coding/paas/v4` (Coding Plan specific)
- **Default Model**: `glm-5.1`
- **Authentication**: Bearer token (configured in .env)
- **Models Available**:
  - `glm-5.1` - Flagship, best for complex tasks
  - `glm-5-turbo` - Faster, good balance
  - `glm-4.7` - Standard
  - `glm-4.5-air` - Lightest, fastest

## Features

- Simple command-line chat interface
- Message history context
- Streaming responses
- Command support: `quit`, `exit`, `clear`, `history`
- Error handling and recovery
- OpenAI-compatible API (uses OpenAI SDK)

## Testing

```bash
# Quick API test
node test-api.js

# Verbose test with full response
node test-api-verbose.js
```

## Documentation

- **USAGE_EXAMPLES.md** - Detailed usage examples and customization
- **API_NOTES.md** - Z.AI API documentation and important notes
- **PROJECT_STRUCTURE.md** - Project structure overview

## Configuration

Edit `.env` to change the model:
```env
ZAI_MODEL=glm-5.1
ZAI_API_KEY=your-api-key-here
```
