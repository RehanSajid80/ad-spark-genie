
import { useState } from 'react';
import { ChatMessage, ChatHistoryItem } from '../types/ad-types';

export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  const addUserMessage = (content: string): ChatMessage => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    return userMessage;
  };

  const addAIMessage = (content: string): ChatMessage => {
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, aiMessage]);
    return aiMessage;
  };

  const updateChatHistory = (item: ChatHistoryItem) => {
    setChatHistory(prev => [...prev, item]);
  };

  const clearChat = () => {
    setChatMessages([]);
    setChatHistory([]);
  };

  return {
    chatMessages,
    chatHistory,
    isProcessingChat,
    setIsProcessingChat,
    addUserMessage,
    addAIMessage,
    updateChatHistory,
    clearChat,
    setChatMessages
  };
}
