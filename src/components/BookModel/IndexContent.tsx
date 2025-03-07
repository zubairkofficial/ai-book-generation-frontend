import React, { useEffect, useState } from 'react';
import { QuillEditor } from './QuillEditor';
import DOMPurify from 'dompurify';

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
  setHasChanges = () => {}
}) => {
  const indexContent = bookData?.additionalData?.index || '';
  const [formattedContent, setFormattedContent] = useState(indexContent);
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (indexContent) {
      // Format the content to properly display index entries
      let processed = indexContent;
      
      // Format the Index header first
      processed = processed.replace(/\*\*Index\*\*/g, '<h1 class="index-title">Index</h1>');
      
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

  const handleUpdate = (content: string) => {
    onUpdate(content);
    if (setHasChanges) setHasChanges(true);
  };

  return (
    <QuillEditor
      title="Index"
      content={formattedContent}
      editMode={editMode}
      onUpdate={handleUpdate}
      className="min-h-[800px] px-8 py-12"
      titleClassName="text-4xl text-center mb-8 text-gray-900"
      contentClassName="prose max-w-none index-content"
      placeholder="Add index entries here..."
    />
  );
}; 