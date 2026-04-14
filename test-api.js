#!/usr/bin/env node

/**
 * Quick API Test Script
 * Verifies connection to Z.AI GLM Coding Plan API
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const API_KEY = process.env.ZAI_API_KEY;
const MODEL = process.env.ZAI_MODEL || 'glm-5.1';
const BASE_URL = 'https://api.z.ai/api/coding/paas/v4';

console.log('🧪 Testing Z.AI GLM Coding Plan API connection...\n');
console.log(`Model: ${MODEL}`);
console.log(`Endpoint: ${BASE_URL}`);
console.log(`API Key: ${API_KEY ? '✅ Configured' : '❌ Missing'}\n`);

if (!API_KEY) {
  console.error('❌ Error: ZAI_API_KEY not found in .env file');
  process.exit(1);
}

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

async function testConnection() {
  try {
    console.log('📡 Sending test request...\n');

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: 'Say "API connection successful!" in exactly those words.'
        }
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    console.log('✅ API Connection Successful!\n');
    console.log('Response:');
    console.log('-'.repeat(60));
    console.log(response.choices[0].message.content);
    console.log('-'.repeat(60) + '\n');

    console.log(`Tokens used: ${response.usage.total_tokens}`);
    console.log(`Prompt tokens: ${response.usage.prompt_tokens}`);
    console.log(`Completion tokens: ${response.usage.completion_tokens}`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ API Connection Failed!');
    console.error('Error:', error.message);

    if (error.response) {
      console.error('\nAPI Response Details:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }

    process.exit(1);
  }
}

testConnection();
