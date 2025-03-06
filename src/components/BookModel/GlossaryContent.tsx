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
}) => {
  const glossaryContent = bookData.additionalData.glossary || '';

;

  return (
    <EditorContent
      title="Glossary"
      content={glossaryContent}
      editMode={editMode}
      onUpdate={onUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none"
    />
  );
}; 