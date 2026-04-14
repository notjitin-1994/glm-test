#!/usr/bin/env node

/**
 * Verbose API Test Script
 * Shows full response details for debugging
 */

import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const API_KEY = process.env.ZAI_API_KEY;
const MODEL = process.env.ZAI_MODEL || 'glm-5.1';
const BASE_URL = 'https://api.z.ai/api/coding/paas/v4';

console.log('🧪 Verbose API Test\n');
console.log(`Model: ${MODEL}`);
console.log(`Endpoint: ${BASE_URL}\n`);

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

async function verboseTest() {
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Hello! Please introduce yourself briefly.'
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
      stream: false,
    });

    console.log('✅ Success!\n');
    console.log('Full Response Object:');
    console.log(JSON.stringify(response, null, 2));

  } catch (error) {
    console.error('\n❌ Error:');
    console.error('Message:', error.message);

    if (error.response) {
      console.error('\nFull Error Response:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
}

verboseTest();
