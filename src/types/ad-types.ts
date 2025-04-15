
export interface AdInput {
  image: File | null;
  context: string;
  brandGuidelines: string;
  landingPageUrl: string;
}

export interface AdSuggestion {
  id: string;
  platform: 'linkedin' | 'google';
  headline: string;
  description: string;
  imageRecommendation: string;
  dimensions: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AdCategory {
  category: string;
  description: string;
  trending_topics: string[];
  timestamp: string;
  metadata: {
    background_style: string;
  };
}
