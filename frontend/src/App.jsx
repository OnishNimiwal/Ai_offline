import React, { useState } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import DocumentsPage from './components/documents/DocumentsPage';
import { sendMessage } from './api/chatApi';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'documents'

  // Chat State
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      time: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const result = await sendMessage(text);

      if (result && result.success && result.response) {
        const botMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: result.response,
          time: formatTime(),
          model: result.model || 'local-ollama',
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg = result?.error || "Unable to get response from local AI server.";
        setError(errorMsg);
      }
    } catch (err) {
      setError(err.message || "Failed to communicate with AI chat endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (prompt) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="main-content">
        {activeTab === 'chat' ? (
          <div className="chat-layout">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSuggestionClick={handleSuggestionClick}
            />
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
            />
          </div>
        ) : (
          <DocumentsPage />
        )}
      </main>
    </div>
  );
}
