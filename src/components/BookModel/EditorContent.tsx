import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { applyTextStyle, TextStyle, TextStyleToolbar } from './TextStyleToolbar';

interface EditorContentProps {
  title: string;
  content: string;
  editMode: boolean;
  onUpdate: (content: string) => void;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  setHasChanges?: (value: boolean) => void;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  title,
  content,
  editMode,
  onUpdate,
  className = "min-h-[800px] px-8 py-12",
  titleClassName = "text-4xl text-center mb-8 text-gray-900", 
  contentClassName = "prose max-w-none"
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    align: 'left',
    fontSize: '16px',
    fontFamily: 'Times New Roman',
    color: '#000000',
    lineHeight: '1.6',
    letterSpacing: 'normal'
  });
  
  // Convert markdown to HTML for editing
  const [htmlContent, setHtmlContent] = useState<string>('');
  
  // Process markdown to HTML when content changes or edit mode toggles
  useEffect(() => {
    if (editMode && content) {
      // Convert markdown headings to styled HTML
      let processedContent = content
        // Replace markdown headings with styled HTML headings
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-3 text-gray-800">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4 text-gray-800">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-5 text-gray-900">$1</h1>')
        // Replace bold
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        // Replace italic
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
        // Replace lists
        .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-2">$1</li>')
        // Replace horizontal rules
        .replace(/^---$/gm, '<hr class="my-6 border-t-2 border-gray-300" />')
        // Replace paragraphs (must be last)
        .replace(/^(?!<[^>]+>)(.+)$/gm, '<p class="mb-4 text-gray-700 leading-relaxed">$1</p>');
        
      setHtmlContent(processedContent);
    }
  }, [content, editMode]);

  const renderMarkdown = (text: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-5 text-gray-900" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mb-4 text-gray-800" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mb-3 text-gray-800" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 mb-2" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-gray-300" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const htmlContent = e.currentTarget.innerHTML;
    
    // Convert the edited HTML back to markdown format for storage
    let markdownContent = htmlContent
      // Clean up the HTML
      .replace(/<div>/g, '\n')
      .replace(/<\/div>/g, '')
      .replace(/<br>/g, '\n');
      
    // Here we could add more conversions for special formatting if needed
    
    onUpdate(markdownContent);
  };

  const handleApplyStyle = (command: string, value?: string) => {
    if (!contentRef.current) return;
    
    // Use the new styling function
    applyTextStyle(command, value);
    
    // Update the content state if needed
    const newContent = contentRef.current.innerHTML;
    setHtmlContent(newContent);
  };

  return (
    <div className={className}>
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className={titleClassName}>{title}</h1>
        
        {editMode && (
          <TextStyleToolbar 
            textStyle={textStyle} 
            onStyleChange={setTextStyle} 
            onApplyStyle={handleApplyStyle} 
          />
        )}
        
        <div 
          ref={contentRef}
          className={`${contentClassName} ${
            editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg' : ''
          }`}
          contentEditable={editMode}
          onBlur={handleBlur}
          suppressContentEditableWarning={true}
          style={{
            textAlign: textStyle.align,
            fontFamily: textStyle.fontFamily,
            lineHeight: textStyle.lineHeight,
            letterSpacing: textStyle.letterSpacing === 'normal' ? 'normal' : 
              textStyle.letterSpacing === 'wider' ? '0.05em' :
              textStyle.letterSpacing === 'widest' ? '0.1em' :
              textStyle.letterSpacing === 'tight' ? '-0.05em' : '-0.1em'
          }}
        >
          {!editMode ? (
            renderMarkdown(content)
          ) : (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: htmlContent || content 
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}; 