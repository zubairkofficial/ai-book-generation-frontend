import React from 'react';
import { EditorContent } from './EditorContent.tsx';

interface TableOfContentsContentProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string) => void;
}

export const TableOfContentsContent: React.FC<TableOfContentsContentProps> = ({
  bookData,
  editMode,
  onUpdate,
}) => {
  const tocContent = bookData.additionalData.tableOfContents || '';

  return (
    <EditorContent
      title="Table of Contents"
      content={tocContent}
      editMode={editMode}
      onUpdate={onUpdate}
      className="min-h-[800px] px-8 py-12" 
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none"
    />
  );
}; 