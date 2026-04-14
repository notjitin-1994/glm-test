import { useState, useRef, useEffect } from 'react';
import { Renderer } from '@openuidev/react-lang';
import { openuiChatLibrary } from '@openuidev/react-ui/genui-lib';

// Configuration
const API_KEY = 'be923920d99340cbbda05e5cee5ab29c.2TvFcEuEG8hGoktA';
const BASE_URL = 'https://api.z.ai/api/coding/paas/v4';
const MODEL = 'glm-5.1';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const messageHistoryRef = useRef([
    {
      role: 'system',
      content: 'You are a helpful AI assistant powered by GLM-5.1. When displaying data, use cards, tables, or charts. Use OpenUI Lang syntax to generate interactive UI components.'
    }
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to display
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    // Update history
    messageHistoryRef.current = [
      ...messageHistoryRef.current,
      { role: 'user', content: userMessage }
    ];

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: messageHistoryRef.current,
          stream: true,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // Create assistant message entry
      const assistantMessage = { role: 'assistant', content: '', isStreaming: true };
      setMessages([...newMessages, assistantMessage]);

      // Stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                accumulatedContent += content;

                // Update message content
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = accumulatedContent;
                  }
                  return updated;
                });
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Update history with assistant response
      messageHistoryRef.current = [
        ...messageHistoryRef.current,
        { role: 'assistant', content: accumulatedContent }
      ];

      setMessages(prev => {
        const updated = [...prev];
        const lastMsg = updated[updated.length - 1];
        if (lastMsg) {
          lastMsg.isStreaming = false;
        }
        return updated;
      });

    } catch (err) {
      setError(err.message);
      // Remove user message from history on error
      messageHistoryRef.current = messageHistoryRef.current.slice(0, -1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (actionId, actionData) => {
    console.log('Action received:', actionId, actionData);
    // Handle button clicks, form submissions, etc.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-600 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">🤖 GLM Chatbot with Generative UI</h1>
          <p className="text-sm opacity-90">Powered by GLM-5.1 + OpenUI</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: 0 }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <p className="text-xl mb-2">👋 Welcome!</p>
              <p>Ask me anything - I can generate interactive UI components!</p>
              <p className="text-sm mt-2">Try: "Show me a weather card", "Create a todo list", or "Display a chart"</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-200'
                }`}
              >
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : msg.isStreaming ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-purple-600 text-sm">Generating UI...</span>
                  </div>
                ) : (
                  <Renderer
                    response={msg.content}
                    library={openuiChatLibrary}
                    isStreaming={msg.isStreaming}
                    onAction={handleAction}
                  />
                )}
              </div>
            </div>
          ))}

          <div ref={chatEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">❌ Error: {error}</p>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything... (try: 'Create a card', 'Show a table')"
              disabled={isLoading}
              className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-purple-500 disabled:opacity-50 text-lg"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
