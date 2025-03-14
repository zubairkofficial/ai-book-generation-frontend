import React, { useMemo, useState, useEffect } from 'react';
import { QuillEditor } from './QuillEditor';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface DedicationContentProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string) => void;
}

export const DedicationContent: React.FC<DedicationContentProps> = ({
  bookData,
  editMode,
  onUpdate,
}) => {
  const { addToast } = useToast();
  const dedicationContent = bookData.additionalData.dedication || '';
  const authorName = bookData.authorName || '';
  
  // Local state to track edited content
  const [localContent, setLocalContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize local content when component mounts or when source content changes
  useEffect(() => {
    setLocalContent(dedicationContent);
  }, []);
  
  // Process content to replace [Your Name] with actual author name
  const processedContent = useMemo(() => {
    if (!editMode) {
      let content = dedicationContent.replace('[Your Name]', authorName);
      
      // Check if content already has an author signature at the end
      if (!content.includes(`— ${authorName}`) && 
          !content.includes(`- ${authorName}`)) {
        // Add signature if not already present
        content += `\n\n— ${authorName}`;
      }
      return content;
    }
    return localContent || dedicationContent;
  }, [dedicationContent, authorName, editMode, localContent]);

  // Handle content changes from the editor
  const handleContentChange = (content: string) => {
    setLocalContent(content);
    setHasChanges(true);
  };

  // Save changes when the save button is clicked
  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Remove the auto-added signature before saving if present
      let updatedContent = localContent;
      const signaturePattern = new RegExp(`[—\\-]\\s*${authorName}\\s*$`, 'g');
      updatedContent = updatedContent.replace(signaturePattern, '').trim();
      
      await onUpdate(updatedContent);
      setHasChanges(false);
      addToast("Dedication saved successfully", "success");
    } catch (error) {
      addToast("Failed to save dedication", "error");
      console.error("Error saving dedication:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleCancelChanges = () => {
    setLocalContent(dedicationContent);
    setHasChanges(false);
  };

  return (
    <div className="min-h-[800px] relative">
      {/* Save/Cancel buttons when in edit mode and changes exist */}
      {editMode && (
        <div className="sticky top-4 z-10 flex justify-end mb-4 px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-2 flex gap-2">
            {hasChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelChanges}
                className="flex items-center gap-1 text-gray-700 hover:text-red-600"
                disabled={isSaving}
              >
                <X size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            )}
            
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveChanges}
              className={`flex items-center gap-1 ${
                !hasChanges 
                  ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" 
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span className="hidden sm:inline">Save Dedication</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <QuillEditor
        title="Dedication"
        content={processedContent}
        editMode={editMode}
        onUpdate={handleContentChange} // Now just updates local state
        className="flex flex-col items-center justify-center px-4 sm:px-8 py-6 sm:py-12 bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg"
        titleClassName="text-2xl sm:text-3xl font-serif text-center mb-6 sm:mb-8 text-gray-900"
        contentClassName="prose max-w-none text-gray-700 min-h-[200px]"
        placeholder="To whom would you like to dedicate this book?"
      />
    </div>
  );
};
