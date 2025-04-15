
import { AdSuggestion, AdCategory } from '../types/ad-types';

const N8N_WEBHOOK_ENDPOINT = 'https://officespacesoftware.app.n8n.cloud/webhook-test/dc5cfcdb-048c-4145-a9a3-ca1a0441332b';

export const generateAdSuggestions = async (
  image: File | null,
  context: string,
  brandGuidelines: string,
  landingPageUrl: string,
  targetAudience: string,
  topicArea: string
): Promise<AdSuggestion[]> => {
  try {
    // In a real implementation, we would send the image to n8n
    // For now, we'll simulate a response with mock data
    console.log('Sending to n8n:', { context, brandGuidelines, landingPageUrl, targetAudience, topicArea });
    
    // Simulating a network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random suggestions
    return generateMockSuggestions();
  } catch (error) {
    console.error('Error generating ad suggestions:', error);
    throw new Error('Failed to generate ad suggestions');
  }
};

export const fetchAdCategories = async (): Promise<AdCategory[]> => {
  try {
    const response = await fetch(N8N_WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: "Tenant Experience",
        description: "Enhancing the experience of tenants through digital platforms and services",
        trending_topics: [
          "Tenant Communication Apps",
          "Rent Payment Solutions",
          "Building Community Platforms"
        ],
        timestamp: new Date().toISOString(),
        metadata: {
          background_style: "bg-gradient-to-r from-violet-50 to-purple-50"
        }
      }),
    });
    
    // Since we're likely getting a CORS issue or no direct response from the n8n webhook,
    // let's simulate a response
    return [
      {
        category: "Tenant Experience",
        description: "Enhancing the experience of tenants through digital platforms and services",
        trending_topics: [
          "Tenant Communication Apps", 
          "Rent Payment Solutions", 
          "Building Community Platforms"
        ],
        timestamp: new Date().toISOString(),
        metadata: {
          background_style: "bg-gradient-to-r from-violet-50 to-purple-50"
        }
      },
      {
        category: "Real Estate Technology",
        description: "Modern solutions for property management and real estate services",
        trending_topics: [
          "Property Management Software", 
          "Virtual Tours", 
          "Smart Building Technology"
        ],
        timestamp: new Date().toISOString(),
        metadata: {
          background_style: "bg-gradient-to-r from-blue-50 to-indigo-50"
        }
      },
      {
        category: "Office Space Solutions",
        description: "Innovative approaches to workspace management and optimization",
        trending_topics: [
          "Flexible Workspaces", 
          "Office Space Planning", 
          "Desk Booking Systems"
        ],
        timestamp: new Date().toISOString(),
        metadata: {
          background_style: "bg-gradient-to-r from-green-50 to-emerald-50"
        }
      }
    ];
  } catch (error) {
    console.error('Error fetching ad categories:', error);
    return [];
  }
};

export const trackPageView = async (categorySlug: string): Promise<void> => {
  try {
    await fetch(N8N_WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: "Tenant Experience",
        page_view: true,
        request_type: "ai_analysis",
        timestamp: new Date().toISOString(),
        category_slug: categorySlug
      }),
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Helper function to generate mock ad suggestions
const generateMockSuggestions = (): AdSuggestion[] => {
  const linkedInSuggestions: AdSuggestion[] = [
    {
      id: 'li-1',
      platform: 'linkedin',
      headline: 'Transform Your Tenant Experience Today',
      description: 'Discover how our integrated platform enhances communication, streamlines payments, and builds community in your properties.',
      imageRecommendation: 'Professional image showing tenants using a mobile app in a modern apartment setting',
      dimensions: '1200 x 627 pixels'
    },
    {
      id: 'li-2',
      platform: 'linkedin',
      headline: 'Empower Your Residents with Digital Solutions',
      description: 'Our tenant experience platform increases satisfaction rates by 35% and reduces management overhead by 20%.',
      imageRecommendation: 'Split-screen showing before/after of property management with digital transformation',
      dimensions: '1200 x 627 pixels'
    },
    {
      id: 'li-3',
      platform: 'linkedin',
      headline: 'The Future of Property Management is Here',
      description: 'Join 500+ property managers who have revolutionized their tenant experience with our all-in-one platform.',
      imageRecommendation: 'Futuristic visualization of smart building with connected tenants',
      dimensions: '1200 x 627 pixels'
    }
  ];

  const googleSuggestions: AdSuggestion[] = [
    {
      id: 'g-1',
      platform: 'google',
      headline: 'Tenant Experience Platform | Boost Satisfaction',
      description: 'Streamline communications, payments & community management. Try free for 30 days!',
      imageRecommendation: 'Clean, minimal interface of the platform with key features highlighted',
      dimensions: '1200 x 628 pixels'
    },
    {
      id: 'g-2',
      platform: 'google',
      headline: 'Property Management Software | 35% More Efficient',
      description: 'All-in-one solution for modern buildings. Join 10,000+ happy tenants today!',
      imageRecommendation: 'Person smiling while using the platform on mobile and desktop',
      dimensions: '1200 x 628 pixels'
    },
    {
      id: 'g-3',
      platform: 'google',
      headline: 'Digital Tenant Portal | Easy Implementation',
      description: 'Ready in 24 hours. Seamless integration with existing systems. Free demo.',
      imageRecommendation: 'Screenshot of the platform dashboard with analysis metrics',
      dimensions: '1200 x 628 pixels'
    }
  ];

  return [...linkedInSuggestions, ...googleSuggestions];
};
