import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { TextStyle, TextStyleToolbar } from './TextStyleToolbar';
import { markdownToHtml, markdownComponents, htmlToMarkdown } from '@/utils/markdownUtils';

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
  contentClassName = "prose max-w-none",
  setHasChanges
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
  
  // Process markdown to HTML when content changes
  useEffect(() => {
    if (content) {
      setHtmlContent(markdownToHtml(content));
    }
  }, [content]);

  const renderMarkdown = (text: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={markdownComponents}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const markdownContent = htmlToMarkdown(e.currentTarget);
    onUpdate(markdownContent);
    if (setHasChanges) {
      setHasChanges(true);
    }
  };

  // Existing style application methods
  const applyStyle = (style: Partial<TextStyle>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Apply bold
    if (style.bold !== undefined) {
      document.execCommand('bold', false);
    }
    
    // Apply italic
    if (style.italic !== undefined) {
      document.execCommand('italic', false);
    }
    
    // Apply text alignment
    if (style.align) {
      document.execCommand('justifyLeft', false);
      if (style.align === 'center') document.execCommand('justifyCenter', false);
      if (style.align === 'right') document.execCommand('justifyRight', false);
    }
    
    // Apply font family
    if (style.fontFamily) {
      document.execCommand('fontName', false, style.fontFamily);
    }
    
    // Apply font size
    if (style.fontSize) {
      document.execCommand('fontSize', false, style.fontSize);
    }
    
    // Apply text color
    if (style.color) {
      document.execCommand('foreColor', false, style.color);
    }
  };

  // Add heading at current selection
  const addHeading = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let container = range.commonAncestorContainer;
      
      // Navigate up to find a block element
      while (container.nodeType !== 1 || 
            !['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes((container as Element).tagName)) {
        if (!container.parentElement) break;
        container = container.parentElement;
      }
      
      if (container.nodeType === 1) {
        const content = (container as HTMLElement).textContent;
        const newHeading = document.createElement(`h${level}`);
        newHeading.textContent = content || '';
        newHeading.className = level === 1 ? 'text-3xl font-bold mb-5 text-gray-900' : 
                             level === 2 ? 'text-2xl font-bold mb-4 text-gray-800' :
                             level === 3 ? 'text-xl font-bold mb-3 text-gray-800' :
                             'text-lg font-bold mb-2 text-gray-700';
        
        container.parentNode?.replaceChild(newHeading, container);
      }
    }
  };

  // Replace your current adapter function with this one
  const handleApplyStyle = (command: string, value?: string) => {
    // Map the command/value to appropriate style object properties
    const styleUpdate: Partial<TextStyle> = {};
    
    switch (command) {
      case 'bold':
        styleUpdate.bold = !textStyle.bold;
        break;
      case 'italic':
        styleUpdate.italic = !textStyle.italic;
        break;
      case 'justify':
        styleUpdate.align = value as 'left' | 'center' | 'right';
        break;
      case 'fontSize':
        styleUpdate.fontSize = value || '16px';
        break;
      case 'fontName':
        styleUpdate.fontFamily = value || 'Times New Roman';
        break;
      case 'foreColor':
        styleUpdate.color = value || '#000000';
        break;
    }
    
    applyStyle(styleUpdate);
  };

  return (
    <div className={className}>
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className={titleClassName}>{title}</h1>
        
        {editMode && (
          <div className="mb-6">
            <TextStyleToolbar 
              textStyle={textStyle} 
              onStyleChange={setTextStyle} 
              onApplyStyle={handleApplyStyle} 
            />
            
            {/* Formatting toolbar */}
            <div className="flex flex-wrap gap-2 p-2 mt-2 border border-gray-200 rounded-lg bg-gray-50">
              <button 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => addHeading(1)}
              >
                Heading 1
              </button>
              <button 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => addHeading(2)}
              >
                Heading 2
              </button>
              <button 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => addHeading(3)}
              >
                Heading 3
              </button>
              <button 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => addHeading(4)}
              >
                Heading 4
              </button>
              <button 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => document.execCommand('insertUnorderedList')}
              >
                Bullet List
              </button>
              <button 
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => document.execCommand('insertOrderedList')}
              >
                Numbered List
              </button>
            </div>
          </div>
        )}
        
        <div 
          ref={contentRef}
          className={`${contentClassName} ${
            editMode ? 'focus:outline-none focus:ring-2 focus:ring-amber-500 p-4 rounded-lg min-h-[400px]' : ''
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
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          )}
        </div>
      </div>
    </div>
  );
}; 