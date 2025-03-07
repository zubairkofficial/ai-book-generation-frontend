import React from 'react';
import { QuillEditor } from './QuillEditor';

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
  setHasChanges = () => {}
}) => {
  // Get content safely with fallback to empty string
  const glossaryContent = bookData?.additionalData?.glossary || '';

  const handleUpdate = (content: string) => {
    onUpdate(content);
    if (setHasChanges) setHasChanges(true);
  };

  return (
    <QuillEditor
      title="Glossary"
      content={glossaryContent}
      editMode={editMode}
      onUpdate={handleUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none"
      placeholder="Add glossary terms and definitions here..."
    />
  );
}; 