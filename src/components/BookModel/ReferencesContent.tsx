import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useToast } from '@/context/ToastContext';

interface ReferencesContentProps {
  bookData: {
    id: number;
    reference?: string; 
   
  };
  editMode: boolean;
  refetchBook: any;
  setEditMode: (value: boolean) => void;
}

export const ReferencesContent: React.FC<ReferencesContentProps> = ({
  bookData,
  editMode,
  refetchBook,
  setEditMode
}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  
  // Get all references content from all chapters or from the book data directly
  const getAllReferencesContent = () => {
    // Check if we have the reference directly on the book data first
    if (bookData?.reference) {
      return bookData.reference;
    }
  };
  
  const referencesContent = getAllReferencesContent();
  const [formattedContent, setFormattedContent] = useState('');
  const [localContent, setLocalContent] = useState(referencesContent);
  const [originalContent, setOriginalContent] = useState(referencesContent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset local content when source changes
  useEffect(() => {
    const newReferencesContent = getAllReferencesContent();
    setLocalContent(newReferencesContent);
    setOriginalContent(newReferencesContent);
    setHasLocalChanges(false);
  }, [bookData]);
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (referencesContent) {
      // Format the content to properly display references
      let processed = referencesContent;
      
      // Format chapter headers
      processed = processed.replace(/##\s+([^\n]+)/g, 
        '<h2 class="chapter-reference-header">$1</h2>');
      
      // Format section headers (like **Books:**)
      processed = processed.replace(/\*\*([^*]+):\*\*/g, '<h3 class="reference-section-header">$1</h3>');
      
      // Format book/article titles in italics
      processed = processed.replace(/\*(.*?)\*/g, '<em class="reference-title">$1</em>');
      
      // Format numbered references
      processed = processed.replace(/(\d+)\.\s+(.*?)(?=(\d+)\.|$|##)/gs, 
        '<p class="reference-entry"><span class="reference-number">$1.</span> $2</p>');
      
      // Format reference entries starting with a dash
      processed = processed.replace(/- (.*?)(?=\n- |\n\n|$|##)/gs,
        '<p class="reference-entry"><span class="reference-bullet">•</span> $1</p>');
      
      // Add styles
      const style = `
        <style>
          .chapter-reference-header {
            margin-top: 32px;
            margin-bottom: 24px;
            color: #1a202c;
            font-size: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .reference-section-header {
            margin-top: 24px;
            margin-bottom: 16px;
            color: #2d3748;
            font-size: 1.25rem;
          }
          .reference-entry {
            margin-bottom: 12px;
            line-height: 1.5;
            display: flex;
          }
          .reference-number {
            min-width: 20px;
            margin-right: 8px;
            font-weight: 600;
          }
          .reference-bullet {
            min-width: 16px;
            margin-right: 8px;
          }
          .reference-title {
            font-style: italic;
          }
        </style>
      `;
      
      processed = style + processed;
      
      // Sanitize and set content
      const sanitizedContent = DOMPurify.sanitize(processed, {
        ADD_TAGS: ['style'],
        ADD_ATTR: ['class'],
      });
      
      setFormattedContent(sanitizedContent);
    }
  }, [referencesContent]);

  const handleContentUpdate = (content: string) => {
    setLocalContent(content);
    setHasLocalChanges(true);
  };

  // Save changes
  const saveChanges = async () => {
    if (!hasLocalChanges || !bookData?.id) return;
    
    try {
      setIsSaving(true);
      
      // For now, we're saving the full references to the first chapter
      // In a more sophisticated implementation, you might parse and save separately
     
        await updateBookGenerated({
          bookGenerationId: bookData.id,
          references: localContent  // Note: API param is 'references' but field is 'refrence'
        }).unwrap();
      
      
      if (setEditMode) setEditMode(false);
      if (refetchBook) await refetchBook();
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
    setLocalContent(originalContent);
    setHasLocalChanges(false);
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
            content={localContent??""}
            editMode={true}
            onUpdate={handleContentUpdate}
            className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12"
            titleClassName="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900"
            contentClassName="prose max-w-none reference-entry"
            placeholder="Add references and citations here..."
          />
        </div>
      ) : (
        <div className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-6 sm:p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900">References</h1>
            
            <div className="quill-content-view">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 