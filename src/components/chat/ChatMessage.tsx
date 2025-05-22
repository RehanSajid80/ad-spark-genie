
import React from 'react';
import { ChatMessage } from '@/types/ad-types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageItem: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`flex ${
        message.sender === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex items-start max-w-[80%] ${
          message.sender === 'user'
            ? 'bg-ad-purple text-white'
            : 'bg-muted'
        } p-3 rounded-lg`}
      >
        <div className="mr-2 mt-0.5">
          {message.sender === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div>
          <p className="text-sm">{message.content}</p>
          {message.imageUrl && (
            <div className="mt-2">
              <img 
                src={message.imageUrl} 
                alt="Generated image" 
                className="max-w-full rounded-md shadow-sm"
              />
            </div>
          )}
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;
