import React from 'react';
import { EditorContent } from './EditorContent';

interface IndexContentProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string) => void;
  setHasChanges?: (value: boolean) => void;
}

export const IndexContent: React.FC<IndexContentProps> = ({
  bookData,
  editMode,
  onUpdate,
}) => {
  const indexContent = bookData.additionalData.index || '';

  return (
    <EditorContent
      title="Index"
      content={indexContent}
      editMode={editMode}
      onUpdate={onUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none"
    />
  );
}; 