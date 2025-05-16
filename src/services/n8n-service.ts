import { AdSuggestion, AdCategory, ChatMessage, ChatHistoryItem } from '../types/ad-types';
import { toast } from 'sonner';

const N8N_WEBHOOK_ENDPOINT = 'https://analyzelens.app.n8n.cloud/webhook/1483ba42-2449-4934-b2c9-4b8dc1ec4a34';
const N8N_CHAT_WEBHOOK_ENDPOINT = 'https://analyzelens.app.n8n.cloud/webhook/acd81780-1f22-46ed-a9f3-e035443ad805';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as string);
        console.log("File successfully converted to base64");
      } else {
        reject(new Error("Failed to convert file to base64 - reader.result is null"));
      }
    };
    reader.onerror = (error) => {
      console.error("Error in fileToBase64:", error);
      reject(error);
    };
  });
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
    
    console.log('Image received in generateAdSuggestions:', image ? `${image.name} (${image.size} bytes)` : 'No image');
    
    // Convert image to base64 if it exists
    let base64Image: string | null = null;
    if (image && image instanceof File) {
      try {
        console.log('Converting image to base64...', image.name, image.size);
        base64Image = await fileToBase64(image);
        console.log('Image converted to base64 successfully, length:', base64Image.length);
      } catch (err) {
        console.error('Error converting image to base64:', err);
        toast.error('Error processing image');
      }
    } else {
      console.log('No image provided or image is not a File object');
    }
    
    // Send both input, generated suggestions and image data to webhook
    try {
      const payload = {
        input: {
          context,
          brand_guidelines: brandGuidelines,
          landing_page_url: landingPageUrl,
          target_audience: targetAudience,
          topic_area: topicArea,
          timestamp: new Date().toISOString()
        },
        generated_suggestions: suggestions,
        uploadedImage: base64Image
      };
      
      console.log('Sending payload to n8n:', {
        ...payload,
        input: payload.input,
        generated_suggestions_count: suggestions.length,
        uploadedImage: base64Image ? `[Base64 image string - ${base64Image.length} chars]` : null
      });
      
      const response = await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      console.log('Data, suggestions and image sent to n8n successfully');
      
      // Process the response if valid
      if (response.ok) {
        const data = await response.json();
        console.log('Received response from n8n:', data);
        
        // Update the suggestions with generated images if available
        if (data.images && Array.isArray(data.images)) {
          console.log(`Received ${data.images.length} generated images`);
          
          // Assign image URLs to suggestions based on platform
          // LinkedIn ads get first image (if available)
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

    const response = await fetch(N8N_CHAT_WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

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
