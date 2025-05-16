
import { AdSuggestion, AdCategory, ChatMessage, ChatHistoryItem } from '../types/ad-types';

const N8N_WEBHOOK_ENDPOINT = 'https://analyzelens.app.n8n.cloud/webhook/1483ba42-2449-4934-b2c9-4b8dc1ec4a34';
const N8N_CHAT_WEBHOOK_ENDPOINT = 'https://analyzelens.app.n8n.cloud/webhook/acd81780-1f22-46ed-a9f3-e035443ad805';

const fileToBase64 = async (file: File): Promise<string | null> => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Check if the result is excessively large (>10MB)
        if (result && result.length > 10 * 1024 * 1024) {
          console.warn('Image is too large for base64 encoding (>10MB). Using URL only.');
          resolve(null); // Return null to indicate we should skip base64 encoding
        } else {
          resolve(result);
        }
      };
      reader.onerror = error => {
        console.error('Error reading file for base64 conversion:', error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Exception during base64 conversion:', error);
    return null; // Return null on error to allow fallback
  }
};

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
    
    // Create the base payload without image data
    const basePayload = {
      input: {
        context,
        brand_guidelines: brandGuidelines,
        landing_page_url: landingPageUrl,
        target_audience: targetAudience,
        topic_area: topicArea,
        timestamp: new Date().toISOString(),
        has_image: !!image
      },
      generated_suggestions: suggestions,
    };
    
    // Try to convert image to base64 if it exists, with fallback mechanism
    let enhancedPayload = { ...basePayload };
    if (image) {
      try {
        console.log('Processing image for n8n webhook, size:', Math.round(image.size/1024), 'KB');
        
        // First attempt: Try to send with base64 image data if not too large
        if (image.size < 5 * 1024 * 1024) { // Less than 5MB
          const base64Image = await fileToBase64(image);
          if (base64Image) {
            console.log('Image successfully converted to base64');
            enhancedPayload = { 
              ...basePayload, 
              uploadedImage: base64Image,
              metadata: {
                imageType: image.type,
                imageSize: image.size,
                imageFilename: image.name
              }
            };
          }
        } else {
          console.log('Image too large for base64 upload, skipping base64 conversion');
        }
      } catch (imgError) {
        console.error('Error processing image for webhook:', imgError);
        // Continue without image data
      }
    }
    
    // Send payload to webhook with timeout and retries
    try {
      console.log('Sending payload to n8n webhook:', N8N_WEBHOOK_ENDPOINT);
      
      // Set up a timeout of 15 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(enhancedPayload),
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`n8n webhook returned error status: ${response.status}`);
        console.log('Attempting to resend without image data as fallback...');
        
        // Fallback: If the first attempt fails, try again without the image data
        if (image && enhancedPayload.uploadedImage) {
          const fallbackPayload = { ...basePayload };
          
          await fetch(N8N_WEBHOOK_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(fallbackPayload),
          });
          
          console.log('Fallback webhook call completed (without image data)');
        }
      } else {
        const data = await response.json();
        console.log('Received response from n8n:', data);
        
        // Update the suggestions with generated images if available
        if (data.images && Array.isArray(data.images)) {
          console.log(`Received ${data.images.length} generated images`);
          
          // Assign image URLs to suggestions based on platform
          const linkedInSuggestions = suggestions.filter(s => s.platform === 'linkedin');
          const googleSuggestions = suggestions.filter(s => s.platform === 'google');
          
          data.images.forEach((img, index) => {
            if (index < linkedInSuggestions.length && img.url) {
              console.log(`Assigning image ${index} to LinkedIn suggestion`);
              linkedInSuggestions[index].generatedImageUrl = img.url;
              linkedInSuggestions[index].revisedPrompt = img.revised_prompt;
            } else if (img.url) {
              // Assign to Google ads if there are more images than LinkedIn suggestions
              const googleIndex = index - linkedInSuggestions.length;
              if (googleIndex < googleSuggestions.length) {
                console.log(`Assigning image ${index} to Google suggestion`);
                googleSuggestions[googleIndex].generatedImageUrl = img.url;
                googleSuggestions[googleIndex].revisedPrompt = img.revised_prompt;
              }
            }
          });
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.warn('n8n webhook request timed out after 15 seconds');
      } else {
        console.warn('Non-fatal error sending to n8n:', err);
      }
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

// Function to handle chat messages and image generation
export const sendChatMessage = async (
  chatHistory: ChatHistoryItem[],
  currentInstruction: string,
  currentImageUrl: string
): Promise<{
  dallePrompt?: string;
  imageUrl?: string;
  error?: string;
}> => {
  try {
    const payload = {
      chatHistory,
      currentInstruction,
      currentImageUrl
    };

    console.log('Sending chat payload to n8n:', payload);

    // Setup timeout for the webhook call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(N8N_CHAT_WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      console.log('Received chat response from n8n:', data);
      
      // Handle both response formats - direct and images array format
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        console.log('Response contains images array:', data.images);
        return {
          dallePrompt: data.images[0].revised_prompt,
          imageUrl: data.images[0].url,
        };
      } else {
        return {
          dallePrompt: data.dallePrompt || data.revised_prompt,
          imageUrl: data.imageUrl || data.url,
        };
      }
    } else {
      console.error('Error response from n8n chat webhook:', await response.text());
      return { error: 'Failed to generate new image' };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Chat webhook request timed out after 15 seconds');
      return { error: 'Request timed out. Please try again.' };
    }
    
    console.error('Error sending chat message:', error);
    return { error: 'An error occurred while processing your request' };
  }
};

// Helper function to generate mock suggestions based on target audience and topic area
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
      dimensions: '1200 x 627 pixels',
      generatedImageUrl: null,
      revisedPrompt: null
    },
    // {
    //   id: 'li-2',
    //   platform: 'linkedin',
    //   headline: `Empower ${targetAudience} with Digital ${topicArea} Solutions`,
    //   description: 'Our experience platform increases satisfaction rates by 35% and reduces management overhead by 20%.',
    //   imageRecommendation: `Split-screen showing before/after of ${topicArea} management with digital transformation`,
    //   dimensions: '1200 x 627 pixels',
    //   generatedImageUrl: null,
    //   revisedPrompt: null
    // },
    // {
    //   id: 'li-3',
    //   platform: 'linkedin',
    //   headline: `The Future of ${topicArea} is Here`,
    //   description: `Join 500+ ${targetAudience} who have revolutionized their experience with our all-in-one platform.`,
    //   imageRecommendation: `Futuristic visualization of ${topicArea} with connected users`,
    //   dimensions: '1200 x 627 pixels',
    //   generatedImageUrl: null,
    //   revisedPrompt: null
    // }
  ];

  const googleSuggestions: AdSuggestion[] = [
    {
      id: 'g-1',
      platform: 'google',
      headline: `${topicArea} Platform | Boost Satisfaction`,
      description: `Streamline ${targetAudience} experiences. Try free for 30 days!`,
      imageRecommendation: 'Clean, minimal interface of the platform with key features highlighted',
      dimensions: '1200 x 628 pixels',
      generatedImageUrl: null,
      revisedPrompt: null
    },
    // {
    //   id: 'g-2',
    //   platform: 'google',
    //   headline: `${topicArea} Software | 35% More Efficient`,
    //   description: `All-in-one solution for ${targetAudience}. Join 10,000+ happy users today!`,
    //   imageRecommendation: 'Person smiling while using the platform on mobile and desktop',
    //   dimensions: '1200 x 628 pixels',
    //   generatedImageUrl: null,
    //   revisedPrompt: null
    // },
    // {
    //   id: 'g-3',
    //   platform: 'google',
    //   headline: `Digital ${topicArea} Portal | Easy Implementation`,
    //   description: `Ready in 24 hours for ${targetAudience}. Seamless integration. Free demo.`,
    //   imageRecommendation: 'Screenshot of the platform dashboard with analysis metrics',
    //   dimensions: '1200 x 628 pixels',
    //   generatedImageUrl: null,
    //   revisedPrompt: null
    // }
  ];

  return [...linkedInSuggestions, ...googleSuggestions];
};
