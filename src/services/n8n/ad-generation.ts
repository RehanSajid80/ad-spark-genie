
import { AdSuggestion } from '../../types/ad-types';
import { N8N_WEBHOOK_ENDPOINT } from './constants';
import { fileToBase64 } from './utils';
import { BaseWebhookPayload, EnhancedWebhookPayload, WebhookPayloadInput } from './types';

/**
 * Generates ad suggestions based on provided inputs
 */
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
    const basePayload: BaseWebhookPayload = {
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
    let enhancedPayload: EnhancedWebhookPayload = { ...basePayload };
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
          const fallbackPayload: BaseWebhookPayload = { ...basePayload };
          
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
