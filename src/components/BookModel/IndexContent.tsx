import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { htmlToMarkdown, markdownToHtml } from '@/utils/quillConversion';
import { useToast } from '@/context/ToastContext';

interface IndexContentProps {
  bookData: any;
  editMode: boolean;
  setHasChanges: (value: boolean) => void;
  refetchBook: any;
  setEditMode: any;
}

export const IndexContent: React.FC<IndexContentProps> = ({
  bookData,
  editMode,
  setHasChanges,
  refetchBook,
  setEditMode
}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const indexContent = bookData?.additionalData?.index || '';
  const [formattedContent, setFormattedContent] = useState('');
  const [localContent, setLocalContent] = useState(indexContent);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset local content when source changes
  useEffect(() => {
    setLocalContent(indexContent);
    setHasLocalChanges(false);
  }, [indexContent]);
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (indexContent) {
      // Format the content to properly display index entries
      let processed = indexContent;
      
      // Format the Index header first (like **Index for "The Book"**)
      processed = processed.replace(/\*\*([^*]+?)\*\*/g, (match: any, title: string) => {
        if (title.toLowerCase().includes('index')) {
          return `<h1 class="index-title">${title}</h1>`;
        }
        return match;
      });
      
      // Format section headers (like **A**) to proper HTML
      processed = processed.replace(/\*\*([A-Z])\*\*/g, '<h2 class="index-section-header">$1</h2>');
      
      // Format entry items with proper indentation
      processed = processed.replace(/- (.*?), ([0-9, -]+)/g, 
        '<p class="index-entry"><span class="index-term">$1</span>, <span class="index-pages">$2</span></p>');
      
      // Format subentries with more indentation
      processed = processed.replace(/  - (.*?), ([0-9, -]+)/g, 
        '<p class="index-subentry"><span class="index-term">$1</span>, <span class="index-pages">$2</span></p>');
      
      // Sanitize the HTML
      processed = DOMPurify.sanitize(processed);
    
      setFormattedContent(processed);
    }
  }, [indexContent]);

  // Add custom styles for index display
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .index-title {
        font-size: 1.75rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2rem;
      }
      
      .index-section-header {
        font-size: 1.5rem;
        font-weight: 700;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: #2d3748;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.5rem;
      }
      
      .index-entry {
        margin-bottom: 0.5rem;
        padding-left: 1rem;
        line-height: 1.6;
      }
      
      .index-subentry {
        margin-bottom: 0.5rem;
        padding-left: 2rem;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      
      .index-term {
        font-weight: 500;
        color: #2d3748;
      }
      
      .index-pages {
        color: #4a5568;
        margin-left: 0.25rem;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Prepare content for editing to preserve markdown structure but make it user-friendly
  const prepareContentForEditing = () => {
    if (editMode) {
      // For editing, we want to convert the markdown to HTML that Quill can display nicely
      // First convert the title to a nice H1 element
      let editorContent = localContent
        .replace(/\*\*([^*]+?for "[^*]+?")\*\*/g, '<h1>$1</h1>')
        .replace(/\*\*([^*]+?Index[^*]*?)\*\*/g, '<h1>$1</h1>')
        // Convert section headers (like **A**) to H2
        .replace(/\*\*([A-Z])\*\*/g, '<h2>$1</h2>');
      
      return editorContent;
    }
    return formattedContent;
  };

  const handleContentUpdate = (content: string) => {
    // If the content comes from Quill editor (HTML), convert it back to markdown
    let updatedContent = content;
    
    if (content.includes('<')) {
      // Convert formatted HTML back to markdown
      updatedContent = htmlToMarkdown(content)
        // Fix any potential issues with section headers
        .replace(/<h1[^>]*>([^<]+)<\/h1>/g, '**$1**')
        .replace(/<h2[^>]*>([A-Z])<\/h2>/g, '**$1**')
        // Ensure proper dash formatting for entries
        .replace(/<p class="index-entry">(.+?)<\/p>/g, '- $1')
        .replace(/<p class="index-subentry">(.+?)<\/p>/g, '  - $1');
    }
    
    setLocalContent(updatedContent);
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
        index: localContent
      }).unwrap();
      
     setEditMode(false);
      await refetchBook();
      setHasChanges(false);
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
    setLocalContent(indexContent);
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
            content={prepareContentForEditing()}
            editMode={true}
            onUpdate={handleContentUpdate}
            className="min-h-[800px] px-8 py-12"
            titleClassName="text-4xl text-center mb-8 text-gray-900"
            contentClassName="prose max-w-none index-content"
            placeholder="Add index entries here..."
          />
        </div>
      ) : (
        <div className="min-h-[800px] px-8 py-12">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
            <h1 className="text-4xl text-center mb-8 text-gray-900">Index</h1>
            
            <div className="quill-content-view">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 