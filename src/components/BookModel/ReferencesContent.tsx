import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '@/context/ToastContext';

interface ReferencesContentProps {
  bookData: any;
  editMode: boolean;
  setHasChanges?: (value: boolean) => void;
  refetchBook?: any;
  setEditMode?: any;
}

export const ReferencesContent: React.FC<ReferencesContentProps> = ({
  bookData,
  editMode,
  setHasChanges = () => {},
  refetchBook,
  setEditMode
}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const referencesContent = bookData?.additionalData?.references || '';
  const [formattedContent, setFormattedContent] = useState(referencesContent);
  const [localContent, setLocalContent] = useState(referencesContent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset local content when source changes
  useEffect(() => {
    setLocalContent(referencesContent);
    setHasLocalChanges(false);
  }, [referencesContent]);
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (referencesContent) {
      // Format the content to properly display references
      let processed = referencesContent;
      
      // Format section headers (like **Books:**)
      processed = processed.replace(/\*\*([^*]+):\*\*/g, '<h2 class="reference-section-header">$1</h2>');
      
      // Format book/article titles in italics
      processed = processed.replace(/\*(.*?)\*/g, '<em class="reference-title">$1</em>');
      
      // Format numbered references
      processed = processed.replace(/(\d+)\.\s+(.*?)(?=(\d+)\.|$)/gs, 
        '<p class="reference-entry"><span class="reference-number">$1.</span> $2</p>');
      
      // Format reference entries starting with a dash
      processed = processed.replace(/- (.*?)(?=\n- |\n\n|$)/gs,
        '<p class="reference-entry">$1</p>');
      
      // Sanitize the HTML
      processed = DOMPurify.sanitize(processed);
      
      setFormattedContent(processed);
    }
  }, [referencesContent]);

  const handleContentUpdate = (content: string) => {
    setLocalContent(content);
    setHasLocalChanges(true);
    setHasChanges(true);
  };

  // Save changes
  const saveChanges = async () => {
    if (!hasLocalChanges || !bookData?.id) return;
    
    try {
      setIsSaving(true);
      
      await updateBookGenerated({
        bookGenerationId: bookData.id,
        references: localContent
      }).unwrap();
      
      if (setEditMode) setEditMode(false);
      if (refetchBook) await refetchBook();
      setHasChanges(false);
      setHasLocalChanges(false);
      addToast("References saved successfully", "success");
    } catch (error) {
      console.error('Failed to save references:', error);
      addToast("Failed to save references", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleCancelChanges = () => {
    setLocalContent(referencesContent);
    setHasLocalChanges(false);
    setHasChanges(false);
  };

  return (
    <div className="min-h-[800px] relative">
      {/* Save/Cancel buttons when in edit mode and changes exist */}
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
                  <span className="hidden sm:inline">Save References</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {editMode ? (
        <div className="quill-container editing">
          <QuillEditor
            title="References"
            content={localContent}
            editMode={true}
            onUpdate={handleContentUpdate}
            className="min-h-[800px] px-8 py-12"
            titleClassName="text-4xl text-center mb-8 text-gray-900"
            contentClassName="prose max-w-none reference-entry"
            placeholder="Add references and citations here..."
          />
        </div>
      ) : (
        <div className="min-h-[800px] px-8 py-12">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
            <h1 className="text-4xl text-center mb-8 text-gray-900">References</h1>
            
            <div className="quill-content-view">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 