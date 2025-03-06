import React from 'react';
import { EditorContent } from './EditorContent';

interface GlossaryContentProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string) => void;
  setHasChanges?: (value: boolean) => void;
}

export const GlossaryContent: React.FC<GlossaryContentProps> = ({
  bookData,
  editMode,
  onUpdate,
  setHasChanges,
}) => {
  const glossaryContent = bookData.additionalData.glossary || '';

  const handleUpdate = (content: string) => {
    // Pass the content to parent component for storage
    onUpdate(content);
    
    // If setHasChanges is provided, indicate changes were made
    if (setHasChanges) {
      setHasChanges(true);
    }
  };

  return (
    <EditorContent
      title="Glossary"
      content={glossaryContent}
      editMode={editMode}
      onUpdate={onUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none"
    //   setHasChanges={setHasChanges}
    />
  );
}; 