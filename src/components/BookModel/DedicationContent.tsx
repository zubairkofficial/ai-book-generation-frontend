import React, { useMemo } from 'react';
import { QuillEditor } from './QuillEditor';

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
  const dedicationContent = bookData.additionalData.dedication || '';
  const authorName = bookData.authorName || '';
  
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
    return dedicationContent;
  }, [dedicationContent, authorName, editMode]);

  const handleUpdate = (content: string) => {
    // Remove the auto-added signature before saving if present
    let updatedContent = content;
    const signaturePattern = new RegExp(`[—\\-]\\s*${authorName}\\s*$`, 'g');
    updatedContent = updatedContent.replace(signaturePattern, '').trim();
    onUpdate(updatedContent);
  };

  return (
    <QuillEditor
      title="Dedication"
      content={processedContent}
      editMode={editMode}
      onUpdate={handleUpdate}
      className="min-h-[800px] flex flex-col items-center justify-center px-8 py-12"
      titleClassName="text-3xl font-serif text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none text-gray-700 min-h-[200px] italic"
      placeholder="To whom would you like to dedicate this book?"
        />
  );
};
