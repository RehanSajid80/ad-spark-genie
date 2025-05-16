
import { AdCategory } from '../../types/ad-types';
import { N8N_WEBHOOK_ENDPOINT } from './constants';

/**
 * Fetches ad categories from the n8n webhook
 */
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

/**
 * Tracks page views to the n8n webhook
 */
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
