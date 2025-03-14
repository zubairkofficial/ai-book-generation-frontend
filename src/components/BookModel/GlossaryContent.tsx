import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { convertMDtoHTML, convertHTMLtoMD } from '@/lib/utils';

interface GlossaryContentProps {
  bookData: {
    id: number;
    glossary?: string;
  };
  editMode: boolean;
  refetchBook: any;
  setEditMode: (value: boolean) => void;
}

export const GlossaryContent: React.FC<GlossaryContentProps> = ({
  bookData,
  editMode,
  refetchBook,
  setEditMode,
}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  const glossaryContent = bookData?.glossary;
  const [localContent, setLocalContent] = useState(glossaryContent);
  const [originalContent, setOriginalContent] = useState(glossaryContent);
  
  // Format the glossary content for display
  const [formattedContent, setFormattedContent] = useState('');
  
  // Reset local content when source changes
  useEffect(() => {
    const newGlossaryContent = bookData?.glossary;
    setLocalContent(newGlossaryContent);
    setOriginalContent(newGlossaryContent);
    setHasLocalChanges(false);
  }, [bookData]);
  
  // Process content for display
  useEffect(() => {
    if (glossaryContent) {
      // let processed = glossaryContent;
      
      // // Format chapter headers
      // processed = processed.replace(/##\s+([^\n]+)/g, 
      //   '<h2 class="chapter-glossary-header">$1</h2>');
      
      // // Format term definitions
      // processed = processed.replace(/(\*\*[^*]+\*\*):\s*(.*?)(?=\*\*|$|##)/gs, 
      //   '<div class="glossary-entry"><h3 class="glossary-term">$1</h3><p class="glossary-definition">$2</p></div>');
      
      // // Clean up bold formatting for terms
      // processed = processed.replace(/\*\*([^*]+)\*\*/g, '$1');
      
      // // Add styles
      // const style = `
      //   <style>
      //     .glossary-entry {
      //       margin-bottom: 20px;
      //     }
      //     .glossary-term {
      //       font-weight: 600;
      //       margin-bottom: 8px;
      //       color: #2d3748;
      //     }
      //     .glossary-definition {
      //       margin-top: 4px;
      //       color: #4a5568;
      //       line-height: 1.5;
      //     }
      //     .chapter-glossary-header {
      //       margin-top: 32px;
      //       margin-bottom: 20px;
      //       color: #1a202c;
      //       font-size: 1.5rem;
      //       border-bottom: 1px solid #e2e8f0;
      //       padding-bottom: 8px;
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
      //   const file = await unified()
      //   .use(remarkParse)
      //   .use(remarkRehype, {allowDangerousHtml: true})
      //   .use(rehypeRaw)
      //   .use(rehypeStringify)
      //   .process(glossaryContent);
      //   let processed = file.toString();
      //   // Format term definitions
      // processed = processed.replace(/(\*\*[^*]+\*\*):\s*(.*?)(?=\*\*|$|##)/gs, 
      //   '<div class="glossary-entry"><h3 class="glossary-term">$1</h3><p class="glossary-definition">$2</p></div>');
      
      // // Clean up bold formatting for terms
      // processed = processed.replace(/\*\*([^*]+)\*\*/g, '$1');
      const html = await convertMDtoHTML(glossaryContent);
      console.log("HTML content", html)
      setFormattedContent(html);
      })();
    }
  }, [glossaryContent]);
  
  // Handle content changes from the editor
  const handleContentUpdate = (content: string) => {
    const markdownContent = convertHTMLtoMD(content);
    console.log("Editor content", markdownContent);
    setLocalContent(markdownContent);
    setHasLocalChanges(true);
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
      
      
      if (setEditMode) setEditMode(false);
      if (refetchBook) await refetchBook();
      setHasLocalChanges(false);
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
                  <span className="hidden sm:inline">Save Glossary</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {editMode ? (
        <div className="quill-container editing">
          <QuillEditor
            title="Glossary"
            content={formattedContent??""}
            editMode={true}
            onUpdate={handleContentUpdate}
            className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12"
            titleClassName="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900"
            contentClassName="prose max-w-none glossary-content"
            placeholder="Add glossary terms and definitions here..."
          />
        </div>
      ) : (
        <div className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-6 sm:p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900">Glossary</h1>
            
            <div className="quill-content-view">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 