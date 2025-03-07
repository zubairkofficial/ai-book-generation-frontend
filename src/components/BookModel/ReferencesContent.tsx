import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import DOMPurify from 'dompurify';

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
  setHasChanges = () => {}
}) => {
  const referencesContent = bookData?.additionalData?.references || '';
  const [formattedContent, setFormattedContent] = useState(referencesContent);
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (referencesContent) {
      // Format the content to properly display references
      let processed = referencesContent;
      
      // Format section headers (like **Books:**)
      processed = processed.replace(/\*\*([^*]+):\*\*/g, '<h2 class="reference-section-header">$1</h2>');
      
      // Format book/article titles in italics
      processed = processed.replace(/\*(.*?)\*/g, '<em class="reference-title">$1</em>');
      
      // Format numbered references
      processed = processed.replace(/(\d+)\.\s+(.*?)(?=(\d+)\.|$)/gs, 
        '<p class="reference-entry"><span class="reference-number">$1.</span> $2</p>');
      
      // Format reference entries starting with a dash
      processed = processed.replace(/- (.*?)(?=\n- |\n\n|$)/gs,
        '<p class="reference-entry">$1</p>');
      
      // Sanitize the HTML
      processed = DOMPurify.sanitize(processed);
      
      setFormattedContent(processed);
    }
  }, [referencesContent]);

  const handleUpdate = (content: string) => {
    onUpdate(content);
    if (setHasChanges) setHasChanges(true);
  };

  return (
    <QuillEditor
      title="References"
      content={formattedContent}
      editMode={editMode}
      onUpdate={handleUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none reference-entry"
      placeholder="Add references and citations here..."
      />
  );
}; 