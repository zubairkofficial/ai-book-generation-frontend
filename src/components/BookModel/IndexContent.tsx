import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { convertMDtoHTML, convertHTMLtoMD } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

interface IndexContentProps {
  bookData: {
    id: number;
    index?: string;
  };
  editMode: boolean;
  refetchBook: any;
  setEditMode: (value: boolean) => void;
}

export const IndexContent: React.FC<IndexContentProps> = ({
  bookData,
  editMode,
  refetchBook,
  setEditMode
}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();

  const indexContent = bookData?.index;
  const [formattedContent, setFormattedContent] = useState('');
  const [localContent, setLocalContent] = useState(indexContent);
  const [originalContent, setOriginalContent] = useState(indexContent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset local content when source changes
  useEffect(() => {
    const newIndexContent = bookData?.index;
    setLocalContent(newIndexContent);
    setOriginalContent(newIndexContent);
    setHasLocalChanges(false);
  }, [bookData]);
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (indexContent) {
      // // Special handling for index content: remove ** markdown and format properly
      // let processed = indexContent;
      
      // // Replace plain markdown index format with proper HTML
      // processed = processed.replace(/\*\*([^*]+)\*\*\s*-\s*(\d+)/g, 
      //   '<div class="index-entry"><span class="index-term">$1</span> <span class="index-page">$2</span></div>');
      
      // // Format chapter headers
      // processed = processed.replace(/##\s+([^\n]+)/g, 
      //   '<h2 class="chapter-index-header">$1</h2>');
        
      // // Format index headers
      // processed = processed.replace(/\*\*([^:*]+):\*\*/g, 
      //   '<h3 class="index-section-header">$1:</h3>');
      
      // // Format the remaining terms with dash-number pattern (Term - PageNumber)
      // processed = processed.replace(/([^>])\s*-\s*(\d+)/g, 
      //   '$1 <span class="index-page">$2</span>');
      
      // // Add styling for the index entries
      // const style = `
      //   <style>
      //     .index-entry {
      //       margin-bottom: 8px;
      //       display: flex;
      //       align-items: baseline;
      //       justify-content: space-between;
      //     }
      //     .index-term {
      //       font-weight: normal;
      //       color: #1a202c;
      //     }
      //     .index-page {
      //       color: #4a5568;
      //       font-weight: 500;
      //       margin-left: 8px;
      //     }
      //     .chapter-index-header {
      //       margin-top: 24px;
      //       margin-bottom: 16px;
      //       color: #2d3748;
      //       font-size: 1.5rem;
      //       border-bottom: 1px solid #e2e8f0;
      //       padding-bottom: 8px;
      //     }
      //     .index-section-header {
      //       font-weight: 600;
      //       margin-top: 16px;
      //       margin-bottom: 12px;
      //       color: #4a5568;
      //     }
      //   </style>
      // `;
      
      // processed = style + processed;
      
      // // Sanitize and set content
      // const sanitizedContent = DOMPurify.sanitize(processed, {
      //   ADD_TAGS: ['style'],
      //   ADD_ATTR: ['class'],
      // });
      (async () => {
        const html = await convertMDtoHTML(indexContent);
      console.log("HTML content", html)
      setFormattedContent(html);
      })()
      
    }
  }, [indexContent]);
  
  // Handle content changes from the editor
  const handleContentUpdate = (content: string) => {
    const md = convertHTMLtoMD(content);
    setLocalContent(md);
    setHasLocalChanges(true);
  };
  
  // Save changes
  const saveChanges = async () => {
    if (!hasLocalChanges || !bookData?.id) return;
    
    try {
      setIsSaving(true);
      
      await updateBookGenerated({
            bookGenerationId: bookData.id,
            index: localContent
          }).unwrap();
        
      if (setEditMode) setEditMode(false);
      if (refetchBook) await refetchBook();
      setHasLocalChanges(false);
      addToast("Index saved successfully", "success");
    } catch (error) {
      console.error('Failed to save index:', error);
      addToast("Failed to save index", "error");
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
      {/* Save/Cancel buttons when in edit mode */}
      {editMode && (
        <div className="sticky w-fit ml-auto top-4 z-10 flex justify-end mb-4 px-4">
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
                  <span className="hidden sm:inline">Save Index</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {editMode ? (
        <div className="quill-container editing">
          <QuillEditor
            title="Index"
            content={formattedContent}
            editMode={true}
            onUpdate={handleContentUpdate}
            className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12"
            titleClassName="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900"
            contentClassName="prose max-w-none index-content"
            placeholder="Add index entries here..."
          />
        </div>
      ) : (
        <div className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-6 sm:p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900">Index</h1>
            
            <div className="quill-content-view">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};