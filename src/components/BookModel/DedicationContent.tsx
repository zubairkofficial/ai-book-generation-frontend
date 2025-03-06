import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

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
  
  // Process content to replace [Your Name] with actual author name
  const processedContent = React.useMemo(() => {
    if (!editMode) {
      return dedicationContent.replace('[Your Name]', bookData.authorName);
    }
    return dedicationContent;
  }, [dedicationContent, bookData.authorName, editMode]);

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || '';
    onUpdate(content);
  };

  return (
    <div className="min-h-[800px] flex flex-col items-center justify-center px-8 py-12">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className="text-3xl font-serif text-center mb-8 text-gray-900">Dedication</h1>
        
        <div 
          className={`prose max-w-none text-gray-700 min-h-[200px] ${
            editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''
          }`}
          contentEditable={editMode}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
        >
          {!editMode ? (
            renderMarkdown(processedContent)
          ) : (
            <div dangerouslySetInnerHTML={{ __html: dedicationContent.replace(/\n/g, '<br>') }} />
          )}
        </div>
        
       
      </div>
    </div>
  );
};
