
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const TestOpenAI = () => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateImage = async () => {
    if (!apiKey || !prompt) {
      toast.error('Please provide both an API key and a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1024",
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to generate image');
      }

      if (data.data && data.data[0]?.url) {
        setGeneratedImageUrl(data.data[0].url);
        toast.success('Image generated successfully!');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6">
      <div className="space-y-4 bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h2 className="text-sm font-medium text-yellow-800">⚠️ Temporary Testing Setup</h2>
        <p className="text-sm text-yellow-700">
          This is a temporary solution for testing. For production, use the Supabase integration 
          to securely handle API keys.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Image Prompt</label>
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate"
          />
        </div>

        <Button 
          onClick={generateImage} 
          disabled={isGenerating || !apiKey || !prompt}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </Button>

        {generatedImageUrl && (
          <div className="mt-6">
            <img
              src={generatedImageUrl}
              alt="Generated"
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestOpenAI;
