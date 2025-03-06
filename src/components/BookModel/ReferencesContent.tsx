import React from 'react';
import { EditorContent } from './EditorContent';

interface ReferencesContentProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string) => void;
  setHasChanges?: (value: boolean) => void;
}

export const ReferencesContent: React.FC<ReferencesContentProps> = ({
  bookData,
  editMode,
  onUpdate,
  setHasChanges,
}) => {
  const referencesContent = bookData.additionalData.references || '';

  return (
    <EditorContent
      title="References"
      content={referencesContent}
      editMode={editMode}
      onUpdate={onUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none"
      setHasChanges={setHasChanges}
    />
  );
}; 