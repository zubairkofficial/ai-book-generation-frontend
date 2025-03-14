import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { convertMDtoHTML, convertHTMLtoMD } from '@/lib/utils';

export enum BookSection {
  GLOSSARY = 'glossary',
  DEDICATION = 'dedication',
  PREFACE = 'preface',
  REFERENCES = 'references',
  TABLE_OF_CONTENTS = 'tableOfContents',
  INTRODUCTION = 'introduction',
  INDEX = 'index',
  COVER = 'cover'
}

interface ContentProps {
  bookData: {
    id: number;
    [key: string]: any;
  };
  section: BookSection;
  editMode: boolean;
  refetchBook: any;
  setEditMode: (value: boolean) => void;
}

export const Content: React.FC<ContentProps> = ({
  bookData,
  editMode,
  refetchBook,
  setEditMode,
  section,
}) => {
  const { addToast } = useToast();
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  const content = bookData?.[section] || bookData?.additionalData?.[section];
  console.log(content, "content")
  console.log(bookData, "bookData")
  console.log(section, "section");
  const [localContent, setLocalContent] = useState(content);
  const [originalContent, setOriginalContent] = useState(content);
  
  // Format the content for display
  const [formattedContent, setFormattedContent] = useState('');
  
  // Reset local content when source changes
  useEffect(() => {
    const newContent = bookData?.data;
    setLocalContent(newContent);
    setOriginalContent(newContent);
    setHasLocalChanges(false);
  }, [bookData]);
  
  // Process content for display
  useEffect(() => {
    if (content) {
      (async () => {
      const html = await convertMDtoHTML(content);
      console.log("HTML content", html)
      setFormattedContent(html);
      })();
    }
  }, [content]);
  
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
          [section]: localContent
        }).unwrap();
      
      
      if (setEditMode) setEditMode(false);
      if (refetchBook) await refetchBook();
      setHasLocalChanges(false);
      addToast("Saved successfully", "success");
    } catch (error) {
      console.error('Failed to save:', error);
      addToast("Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Discard changes
  const handleCancelChanges = () => {
    setLocalContent(originalContent);
    setHasLocalChanges(false);
    setEditMode(false);
  };

  return (
    <div className="min-h-[800px] relative">
      {/* Save/Cancel buttons when in edit mode */}
      {editMode && (
        <div className="sticky w-fit ml-auto top-12 z-50 flex justify-end mb-4 px-4">
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
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {editMode ? (
        <div className="quill-container editing bg-gradient-to-b from-blue-50/80 to-white/80 rounded-lg">
          <QuillEditor
            title={section.charAt(0).toUpperCase() + section.slice(1)}
            content={formattedContent??""}
            editMode={true}
            onUpdate={handleContentUpdate}
            className="w-full min-h-[800px] px-4 sm:px-8 py-6 sm:py-12"
            titleClassName="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900"
            contentClassName="prose max-w-none glossary-content"
            placeholder={`Add ${section} here...`}
          />
        </div>
      ) : (
        <div className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12  bg-gradient-to-b from-blue-50/80 to-white/80 rounded-lg shadow-lg">
          <div className=" mx-auto bg-white/90 backdrop-blur-sm p-6 sm:p-12 rounded-lg shadow-lg">
            <h1 className="text-3xl sm:text-4xl text-center mb-6 sm:mb-8 text-gray-900">{section.charAt(0).toUpperCase() + section.slice(1)}</h1>
            
            <div className="quill-content-view">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 