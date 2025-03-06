import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface IndexContentProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string) => void;
}

export const IndexContent: React.FC<IndexContentProps> = ({
  bookData,
  editMode,
  onUpdate,
}) => {
  const indexContent = bookData.additionalData.index || '';

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
    <div className="min-h-[800px] px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl text-center mb-8 text-gray-900">Index</h1>
        
        <div 
          className={`prose max-w-none ${editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''}`}
          contentEditable={editMode}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
        >
          {!editMode ? renderMarkdown(indexContent) : (
            <div dangerouslySetInnerHTML={{ __html: indexContent.replace(/\n/g, '<br>') }} />
          )}
        </div>
      </div>
    </div>
  );
}; 