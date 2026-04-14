#!/usr/bin/env node

/**
 * GLM Chatbot Test
 * Simple wrapper for Z.AI GLM-5 using Coding Plan API
 */

import readline from 'readline';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

// Configuration
const API_KEY = process.env.ZAI_API_KEY;
const MODEL = process.env.ZAI_MODEL || 'glm-5.1';
const BASE_URL = 'https://api.z.ai/api/coding/paas/v4';

// Validate configuration
if (!API_KEY) {
  console.error('❌ Error: ZAI_API_KEY not found in .env file');
  console.error('Create a .env file with your Z.AI API key');
  process.exit(1);
}

// Initialize OpenAI client with Z.AI endpoint
const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

// Message history for context
const messageHistory = [
  {
    role: 'system',
    content: 'You are a helpful AI assistant powered by GLM-5. You provide clear, accurate, and thoughtful responses.'
  }
];

// Create readline interface for CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Display welcome banner
 */
function showWelcome() {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 GLM Chatbot Test');
  console.log('='.repeat(60));
  console.log(`Model: ${MODEL}`);
  console.log(`Endpoint: ${BASE_URL}`);
  console.log('Type your message and press Enter to chat.');
  console.log('Type "quit" or "exit" to end the session.');
  console.log('Type "clear" to clear message history.');
  console.log('Type "history" to view conversation history.');
  console.log('='.repeat(60) + '\n');
}

/**
 * Format assistant response
 */
function formatResponse(content) {
  // Simple formatting - can be enhanced with markdown parsing if needed
  return content;
}

/**
 * Handle user commands
 */
function handleCommand(input) {
  const cmd = input.trim().toLowerCase();

  if (cmd === 'quit' || cmd === 'exit') {
    return 'QUIT';
  }

  if (cmd === 'clear') {
    messageHistory.length = 1; // Keep system prompt
    console.log('✅ Message history cleared.\n');
    return 'CLEARED';
  }

  if (cmd === 'history') {
    console.log('\n📜 Conversation History:');
    console.log('-'.repeat(60));
    messageHistory.forEach((msg, index) => {
      if (msg.role !== 'system') {
        const role = msg.role === 'user' ? '👤 You' : '🤖 Assistant';
        console.log(`\n${role}:`);
        console.log(msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : ''));
      }
    });
    console.log('\n' + '-'.repeat(60) + '\n');
    return 'HISTORY';
  }

  return null;
}

/**
 * Send message to GLM-5 API
 */
async function sendMessage(userMessage) {
  try {
    // Add user message to history
    messageHistory.push({
      role: 'user',
      content: userMessage
    });

    // Show loading indicator
    process.stdout.write('🤔 Thinking...');

    // Call API with streaming enabled for better UX
    const stream = await client.chat.completions.create({
      model: MODEL,
      messages: messageHistory,
      stream: true,
      temperature: 0.7,
    });

    // Clear loading indicator
    process.stdout.write('\r' + ' '.repeat(20) + '\r');

    // Display streaming response
    console.log('🤖 Assistant:');
    let fullResponse = '';
    let reasoningContent = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      const reasoning = chunk.choices[0]?.delta?.reasoning_content || '';
      if (content) {
        process.stdout.write(content);
        fullResponse += content;
      }
      if (reasoning) {
        reasoningContent += reasoning;
      }
    }

    console.log('\n');

    // Add assistant response to history
    messageHistory.push({
      role: 'assistant',
      content: fullResponse
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    // Remove user message from history on error
    messageHistory.pop();
  }
}

/**
 * Main chat loop
 */
async function startChat() {
  showWelcome();

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question('👤 You: ', resolve);
    });

    // Handle empty input
    if (!userInput.trim()) {
      continue;
    }

    // Check for commands
    const commandResult = handleCommand(userInput);

    if (commandResult === 'QUIT') {
      console.log('\n👋 Goodbye!\n');
      break;
    }

    if (commandResult === 'CLEARED' || commandResult === 'HISTORY') {
      continue;
    }

    // Send message to API
    await sendMessage(userInput);
  }

  rl.close();
}

// Start the chatbot
startChat().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
