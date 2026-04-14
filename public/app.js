// Configuration
const API_KEY = 'be923920d99340cbbda05e5cee5ab29c.2TvFcEuEG8hGoktA';
const BASE_URL = 'https://api.z.ai/api/coding/paas/v4';
const MODEL = 'glm-5.1';

// DOM elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorDisplay = document.getElementById('errorDisplay');

// Message history
let messageHistory = [
    {
        role: 'system',
        content: 'You are a helpful AI assistant powered by GLM-5. You provide clear, accurate, and thoughtful responses.'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    messageInput.addEventListener('keypress', handleKeyPress);
    sendButton.addEventListener('click', sendMessage);
    messageInput.focus();
});

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    const userMessage = messageInput.value.trim();

    if (!userMessage) return;

    // Clear input
    messageInput.value = '';

    // Add user message to chat
    addMessageToChat('user', userMessage);

    // Add to history
    messageHistory.push({
        role: 'user',
        content: userMessage
    });

    // Show loading
    showLoading(true);
    hideError();

    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: messageHistory,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';
        let firstChunk = true;

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;

                        if (content) {
                            if (firstChunk) {
                                showLoading(false);
                                removeWelcomeMessage();
                                addMessageToChat('assistant', '', true);
                                firstChunk = false;
                            }
                            assistantMessage += content;
                            updateLastMessage(content);
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }

        // Add assistant response to history
        if (assistantMessage) {
            messageHistory.push({
                role: 'assistant',
                content: assistantMessage
            });
        }

        showLoading(false);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
        showLoading(false);
        // Remove user message from history on error
        messageHistory.pop();
    }
}

function addMessageToChat(role, content, isNew = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    scrollToBottom();

    return contentDiv;
}

function updateLastMessage(content) {
    const messages = chatContainer.querySelectorAll('.message.assistant');
    const lastMessage = messages[messages.length - 1];

    if (lastMessage) {
        const contentDiv = lastMessage.querySelector('.message-content');
        contentDiv.textContent += content;
        scrollToBottom();
    }
}

function removeWelcomeMessage() {
    const welcome = chatContainer.querySelector('.welcome-message');
    if (welcome) {
        welcome.remove();
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoading(show) {
    if (show) {
        loadingIndicator.classList.add('active');
        sendButton.disabled = true;
        messageInput.disabled = true;
    } else {
        loadingIndicator.classList.remove('active');
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    }
}

function showError(message) {
    errorDisplay.textContent = `❌ ${message}`;
    errorDisplay.classList.add('show');

    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorDisplay.classList.remove('show');
}
