# Usage Examples

## Basic Chat

```bash
cd ~/Desktop/GLM-chatbot-test
npm start
```

Then interact with the chatbot:

```
👤 You: Hello! Can you help me write some Python code?

🤖 Assistant: Of course! I'd be happy to help you with Python code. What would you like to build or what problem are you trying to solve?

👤 You: Write a function that calculates Fibonacci numbers

🤖 Assistant: Here's a Python function that calculates Fibonacci numbers with multiple approaches:

```python
def fibonacci_iterative(n):
    \"\"\"Calculate nth Fibonacci number using iteration (O(n))\"\"\"
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def fibonacci_recursive(n, memo={}):
    \"\"\"Calculate nth Fibonacci number using recursion with memoization\"\"\"
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci_recursive(n-1, memo) + fibonacci_recursive(n-2, memo)
    return memo[n]

# Example usage
print(fibonacci_iterative(10))  # Output: 55
print(fibonacci_recursive(10))  # Output: 55
```

The iterative approach is more efficient for large numbers, while the recursive version with memoization is more readable but uses more memory.
```

## Commands

- `quit` or `exit` - Exit the chatbot
- `clear` - Clear conversation history
- `history` - View conversation history

## API Testing

Test the API connection without starting the full chatbot:

```bash
node test-api.js
```

For verbose debugging:

```bash
node test-api-verbose.js
```

## Model Selection

Edit `.env` to change the model:

```env
ZAI_MODEL=glm-5.1      # Flagship, complex tasks
ZAI_MODEL=glm-5-turbo  # Faster, good balance
ZAI_MODEL=glm-4.7      # Standard
ZAI_MODEL=glm-4.5-air  # Lightest, fastest
```

## Programmatic Usage

You can also use the chatbot as a module in your own code:

```javascript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.ZAI_API_KEY,
  baseURL: 'https://api.z.ai/api/coding/paas/v4',
});

async function askGLM(prompt) {
  const response = await client.chat.completions.create({
    model: process.env.ZAI_MODEL || 'glm-5.1',
    messages: [
      { role: 'user', content: prompt }
    ],
    stream: false,
  });

  return response.choices[0].message.content;
}

// Use it
const answer = await askGLM('What is the capital of France?');
console.log(answer);
```

## Streaming Responses

The chatbot uses streaming by default. Here's how to use streaming in your own code:

```javascript
const stream = await client.chat.completions.create({
  model: 'glm-5.1',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) {
    process.stdout.write(content);
  }
}
```

## Error Handling

The chatbot handles errors gracefully:

- Network errors will display the error message
- Invalid API keys will show an authentication error
- Rate limiting will display the rate limit error
- The conversation history is preserved on errors

## Customization

You can customize the system prompt in `index.js`:

```javascript
const messageHistory = [
  {
    role: 'system',
    content: 'You are a coding expert. Focus on providing clean, well-documented code examples.' // Customize this
  }
];
```

## Next Steps

- Add Markdown rendering for code blocks
- Save conversation history to a file
- Add support for multi-turn conversations with context window management
- Implement rate limiting and retry logic
- Add web search integration via context7 MCP
