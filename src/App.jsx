import { useState, useRef, useEffect } from 'react';
import MessageContent from './components/MessageContent';
import GenerativeUI from './components/GenerativeUI';
import { openuiChatLibrary, openuiChatPromptOptions } from '@openuidev/react-ui/genui-lib';
import { containsOpenUILang } from './utils/text-formatter';
import './App.css';

// Configuration
const API_BASE = '/api/chat'; // Server-side proxy (avoids CORS issues)
const MODEL = 'glm-4.7';

// Generate the system prompt from the actual library definition + examples
const OPENUI_SYSTEM_PROMPT = openuiChatLibrary.prompt({
  examples: openuiChatPromptOptions.examples,
  additionalRules: openuiChatPromptOptions.additionalRules,
  preamble: 'You are a helpful AI assistant. When showing structured data, tables, charts, forms, or interactive content, use OpenUI Lang. For simple text answers, use plain text without markdown.',
});

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  const messageHistoryRef = useRef([
    { role: 'system', content: OPENUI_SYSTEM_PROMPT }
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    messageHistoryRef.current = [
      ...messageHistoryRef.current,
      { role: 'user', content: userMessage }
    ];

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      const assistantMessage = { role: 'assistant', content: '', isStreaming: true };
      setMessages([...newMessages, assistantMessage]);

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
              // Skip invalid JSON chunks
            }
          }
        }
      }

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
      messageHistoryRef.current = messageHistoryRef.current.slice(0, -1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (actionId, actionData) => {
    console.log('Action received:', actionId, actionData);
  };

  return (
    <div style={{ height: '100vh' }} className="chat-container">
      <div className="chat-header">
        <h1>🤖 GLM Chatbot</h1>
        <p>Powered by GLM-4.7 • Generative UI with OpenUI</p>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'rgb(156, 163, 175)', padding: '3rem 0' }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>👋 Welcome!</p>
            <p>Ask me anything — I'll respond with clean text or interactive UI components</p>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'rgb(107, 114, 128)' }}>
              <strong>Try:</strong> "Show me a table of programming languages"
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgb(107, 114, 128)' }}>
              "Create a contact form" • "Show a bar chart of quarterly sales"
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}
          >
            <div
              className={`message-bubble ${msg.role === 'user' ? 'message-bubble-user' : 'message-bubble-assistant'}`}
            >
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : msg.isStreaming ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: 'rgb(124, 58, 237)', borderRadius: '50%', animation: 'bounce 0ms' }}></div>
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: 'rgb(124, 58, 237)', borderRadius: '50%', animation: 'bounce 150ms' }}></div>
                    <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: 'rgb(124, 58, 237)', borderRadius: '50%', animation: 'bounce 300ms' }}></div>
                  </div>
                  <span style={{ color: 'rgb(124, 58, 237)', fontSize: '0.875rem' }}>Generating...</span>
                </div>
              ) : (
                <GenerativeUI content={msg.content} />
              )}
            </div>
          </div>
        ))}

        <div ref={chatEndRef} />
      </div>

      {error && (
        <div className="error-display">
          <p>❌ {error}</p>
        </div>
      )}

      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (text or generate UI)"
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-button"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
