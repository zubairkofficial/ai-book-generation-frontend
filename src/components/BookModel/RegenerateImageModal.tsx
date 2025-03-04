import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegenerateImageMutation } from '@/api/bookApi';
import { Loader2 } from 'lucide-react';

interface RegenerateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: number;
  imageType: 'cover' | 'backCover';
}

export const RegenerateImageModal = ({ isOpen, onClose, bookId, imageType }: RegenerateImageModalProps) => {
  const [additionalContent, setAdditionalContent] = useState('');
  const [regenerateImage, { isLoading }] = useRegenerateImageMutation();

  // Add validation and debug logging
  console.log("RegenerateImageModal props:", { isOpen, bookId, imageType });

  // Early return if bookId is invalid
  if (!bookId || isNaN(bookId)) {
    console.error("Invalid bookId:", bookId);
    return null;
  }

  const handleSubmit = async () => {
    if (!bookId) {
      console.error("Missing bookId");
      return;
    }

    try {
      await regenerateImage({
        bookId,
        imageType,
        additionalContent
      }).unwrap();

      setAdditionalContent('');
      onClose();
    } catch (error) {
      console.error('Failed to regenerate image:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Regenerate {imageType === 'cover' ? 'Cover' : 'Back Cover'} Image</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="additionalContent" className="text-sm font-medium leading-none">
              Additional Content
            </label>
            <Input
              id="additionalContent"
              placeholder="Enter details to guide image generation..."
              value={additionalContent}
              onChange={(e) => setAdditionalContent(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !additionalContent.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              'Regenerate Image'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 