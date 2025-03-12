import React, { useState, useEffect } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface GlossaryContentProps {
  bookData: {
    id: number;
    additionalData: {
      glossary?: string;
    };
  };
  editMode: boolean;
  setHasChanges: (value: boolean) => void;
  refetchBook: any;
  setEditMode: (value: boolean) => void;
}

export const GlossaryContent: React.FC<GlossaryContentProps> = ({
  bookData,
  editMode,
  setHasChanges,
  refetchBook,
  setEditMode,

}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  // Get content safely with fallback to empty string
  const glossaryContent = bookData?.additionalData?.glossary || '';
  const [localContent, setLocalContent] = useState(glossaryContent);
  const [originalContent, setOriginalContent] = useState(glossaryContent);
  
  // Reset local content when source changes
  useEffect(() => {
    setLocalContent(glossaryContent);
    setOriginalContent(glossaryContent);
    setHasLocalChanges(false);
  }, [glossaryContent]);

  // Handle content changes from the editor
  const handleUpdate = (content: string) => {
    setLocalContent(content);
    
    // Only mark as changed if the content is different from original
    const hasChanged = content !== originalContent;
    setHasLocalChanges(hasChanged);
    setHasChanges(hasChanged);
  };
  
  // Save changes
  const saveChanges = async () => {
    if (!hasLocalChanges || !bookData?.id) return;
    
    try {
      setIsSaving(true);
      
      await updateBookGenerated({
        bookGenerationId: bookData.id,
        glossary: localContent
      }).unwrap();
      
      setEditMode(false);
      await refetchBook();
      setHasChanges(false);
      setHasLocalChanges(false);
      setOriginalContent(localContent);
      addToast("Glossary saved successfully", "success");
    } catch (error) {
      console.error('Failed to save glossary:', error);
      addToast("Failed to save glossary", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleCancelChanges = () => {
    setLocalContent(originalContent);
    setHasLocalChanges(false);
    setHasChanges(false);
  };

  return (
    <div className="min-h-[800px] relative">
      {/* Save/Cancel buttons when in edit mode */}
      {editMode && (
        <div className="sticky top-4 z-10 flex justify-end mb-4 px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-2 flex gap-2">
            {hasLocalChanges && (
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
              onClick={saveChanges}
              className={`flex items-center gap-1 ${
                !hasLocalChanges 
                  ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" 
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              disabled={!hasLocalChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span className="hidden sm:inline">Save Glossary</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <QuillEditor
        title="Glossary"
        content={localContent}
        editMode={editMode}
        onUpdate={handleUpdate}
        className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12"
        titleClassName="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900"
        contentClassName="prose max-w-none"
        placeholder="Add glossary terms and definitions here..."
      />
    </div>
  );
}; 