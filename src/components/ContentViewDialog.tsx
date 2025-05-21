
import React from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface ContentViewDialogProps {
  content: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContentViewDialog = ({ content, isOpen, onOpenChange }: ContentViewDialogProps) => {
  if (!content) return null;

  const handleCopyContent = () => {
    if (content.content) {
      navigator.clipboard.writeText(content.content)
        .then(() => {
          toast({
            title: "Content copied to clipboard",
            description: "You can now paste it in your ad creation form.",
            duration: 3000,
          });
        })
        .catch(err => {
          console.error("Failed to copy content: ", err);
          toast({
            title: "Failed to copy content",
            description: "Please try selecting the content manually.",
            variant: "destructive",
            duration: 3000,
          });
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-ad-purple-dark">
            {content.title || "Content Details"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium text-ad-gray mb-1">Content Type:</h3>
            <Badge className="bg-ad-purple-light/30 text-ad-purple-dark">
              {content.content_type ? 
                content.content_type === "pillar" ? "Pillar Content" :
                content.content_type === "support" ? "Support Page" :
                content.content_type === "meta" ? "Meta Tags" :
                content.content_type === "social" ? "Social Posts" : 
                "Content" : "Not specified"}
            </Badge>
          </div>
          
          {content.topic_area && (
            <div>
              <h3 className="text-sm font-medium text-ad-gray mb-1">Topic:</h3>
              <p>{content.topic_area}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-ad-gray mb-1">Content:</h3>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="whitespace-pre-wrap">{content.content}</p>
            </div>
          </div>
          
          {content.keywords && content.keywords.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-ad-gray mb-1">Keywords:</h3>
              <div className="flex flex-wrap gap-1">
                {content.keywords.map((keyword: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="bg-purple-50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-2 flex justify-between">
            <Button 
              onClick={handleCopyContent}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentViewDialog;
