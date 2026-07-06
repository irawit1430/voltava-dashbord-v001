import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import './AIAssistant.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi there! I am your Voltava AI Assistant. Ask me anything about the current status of your devices.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isHistoryFetched, setIsHistoryFetched] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem('voltava_token');
      if (!token || isHistoryFetched) return;

      try {
        const res = await fetch('/api/ai/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.history && data.history.length > 0) {
            setMessages([
              { id: '1', role: 'assistant', content: 'Hi there! I am your Voltava AI Assistant. Ask me anything about the current status of your devices.' },
              ...data.history.map((m: any, i: number) => ({
                id: `history-${i}`,
                role: m.role,
                content: m.content
              }))
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      } finally {
        setIsHistoryFetched(true);
      }
    };

    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, isHistoryFetched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In development, might need full URL if not proxied
      const token = localStorage.getItem('voltava_token');
      
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          prompt: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I'm sorry, I couldn't get an answer."
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error trying to process your request."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      {isOpen ? (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <h3>Voltava AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>
          
          <div className="ai-chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-wrapper ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper assistant">
                <div className="message-content loading">
                  <Loader2 size={16} className="spinner" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="ai-chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your devices..."
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="send-btn" aria-label="Send message">
              {isLoading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      ) : (
        <button 
          className="ai-fab-button" 
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};
