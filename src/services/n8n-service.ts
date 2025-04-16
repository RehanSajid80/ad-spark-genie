import { AdSuggestion, AdCategory } from '../types/ad-types';

const N8N_WEBHOOK_ENDPOINT = 'https://officespacesoftware.app.n8n.cloud/webhook-test/08c0cba4-4ad1-46ff-bf31-9bbe83261469';

export const generateAdSuggestions = async (
  image: File | null,
  context: string,
  brandGuidelines: string,
  landingPageUrl: string,
  targetAudience: string,
  topicArea: string
): Promise<AdSuggestion[]> => {
  try {
    // Generate mock suggestions first
    const suggestions = generateMockSuggestions(targetAudience, topicArea);
    
    // Send both input and generated suggestions to webhook
    try {
      await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          input: {
            context,
            brand_guidelines: brandGuidelines,
            landing_page_url: landingPageUrl,
            target_audience: targetAudience,
            topic_area: topicArea,
            timestamp: new Date().toISOString()
          },
          generated_suggestions: suggestions
        }),
      });
      console.log('Data and suggestions sent to n8n successfully');
    } catch (err) {
      console.log('Non-fatal error sending to n8n:', err);
    }
    
    // Simulating a network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return suggestions;
  } catch (error) {
    console.error('Error generating ad suggestions:', error);
    throw new Error('Failed to generate ad suggestions');
  }
};

export const fetchAdCategories = async (): Promise<AdCategory[]> => {
  try {
    // Try to fetch from n8n but use no-cors to avoid CORS issues
    try {
      await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
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
      console.log('Categories request sent to n8n successfully');
    } catch (err) {
      console.log('Non-fatal error fetching from n8n:', err);
    }
    
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
      mode: 'no-cors',
      body: JSON.stringify({
        category: "Tenant Experience",
        page_view: true,
        request_type: "ai_analysis",
        timestamp: new Date().toISOString(),
        category_slug: categorySlug
      }),
    });
    console.log('Page view tracked successfully');
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

// Helper function to generate mock ad suggestions based on target audience and topic area
const generateMockSuggestions = (targetAudience: string, topicArea: string): AdSuggestion[] => {
  console.log(`Generating mock suggestions for audience: ${targetAudience}, topic: ${topicArea}`);
  
  // Generate customized suggestions based on the target audience and topic
  const linkedInSuggestions: AdSuggestion[] = [
    {
      id: 'li-1',
      platform: 'linkedin',
      headline: `Transform Your ${topicArea} Experience Today`,
      description: `Discover how our integrated platform helps ${targetAudience} enhance communication, streamline operations, and build better experiences.`,
      imageRecommendation: `Professional image showing ${targetAudience} using a digital solution in a modern setting`,
      dimensions: '1200 x 627 pixels'
    },
    {
      id: 'li-2',
      platform: 'linkedin',
      headline: `Empower ${targetAudience} with Digital ${topicArea} Solutions`,
      description: 'Our experience platform increases satisfaction rates by 35% and reduces management overhead by 20%.',
      imageRecommendation: `Split-screen showing before/after of ${topicArea} management with digital transformation`,
      dimensions: '1200 x 627 pixels'
    },
    {
      id: 'li-3',
      platform: 'linkedin',
      headline: `The Future of ${topicArea} is Here`,
      description: `Join 500+ ${targetAudience} who have revolutionized their experience with our all-in-one platform.`,
      imageRecommendation: `Futuristic visualization of ${topicArea} with connected users`,
      dimensions: '1200 x 627 pixels'
    }
  ];

  const googleSuggestions: AdSuggestion[] = [
    {
      id: 'g-1',
      platform: 'google',
      headline: `${topicArea} Platform | Boost Satisfaction`,
      description: `Streamline ${targetAudience} experiences. Try free for 30 days!`,
      imageRecommendation: 'Clean, minimal interface of the platform with key features highlighted',
      dimensions: '1200 x 628 pixels'
    },
    {
      id: 'g-2',
      platform: 'google',
      headline: `${topicArea} Software | 35% More Efficient`,
      description: `All-in-one solution for ${targetAudience}. Join 10,000+ happy users today!`,
      imageRecommendation: 'Person smiling while using the platform on mobile and desktop',
      dimensions: '1200 x 628 pixels'
    },
    {
      id: 'g-3',
      platform: 'google',
      headline: `Digital ${topicArea} Portal | Easy Implementation`,
      description: `Ready in 24 hours for ${targetAudience}. Seamless integration. Free demo.`,
      imageRecommendation: 'Screenshot of the platform dashboard with analysis metrics',
      dimensions: '1200 x 628 pixels'
    }
  ];

  return [...linkedInSuggestions, ...googleSuggestions];
};
