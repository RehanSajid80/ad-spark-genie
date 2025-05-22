
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/types/ad-types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessageItem from './ChatMessage';

interface ChatMessageListProps {
  messages: ChatMessage[];
  imageUrl?: string | null;
  isDialogMode?: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({ 
  messages, 
  imageUrl,
  isDialogMode = false
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <ScrollArea className={`${isDialogMode ? 'h-[400px]' : 'h-[400px]'} p-4`} ref={scrollAreaRef as any}>
      {/* Image preview at the top if we have a generated image */}
      {imageUrl && (
        <div className="flex justify-center my-4">
          <img 
            src={imageUrl} 
            alt="Generated ad image" 
            className="max-w-full max-h-[200px] rounded-lg shadow-md"
          />
        </div>
      )}
      
      <div className="space-y-4">
        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} />
        ))}
        
        {/* If no messages, show a welcome message */}
        {messages.length === 0 && (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground text-center">
              {isDialogMode 
                ? "Describe how you'd like to refine this image. I'll help create the perfect visual for your ad."
                : "Ask me how I can help improve your ad. I can suggest changes to copy, layout, and imagery."
              }
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessageList;
