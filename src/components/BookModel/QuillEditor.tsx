import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import DOMPurify from 'dompurify';
import {cn} from '@/lib/utils';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css'; // Create this file for custom styling
import Quill from 'quill';

interface QuillEditorProps {
  title?: string;
  content: string;
  editMode: boolean;
  onUpdate: (content: string) => void;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  placeholder?: string;
  formats?: string[];
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  title,
  content,
  editMode,
  onUpdate,
  className = "min-h-[800px] px-8 py-12",
  titleClassName = "text-4xl text-center mb-8 text-gray-900",
  contentClassName = "prose max-w-none",
  placeholder = "Start writing...",
  formats
}) => {
  console.log("content=============================", content);
  const [editorContent, setEditorContent] = useState(content);
  const quillRef = useRef<ReactQuill>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determine if content contains Markdown syntax
  const isMarkdownContent = () => {
    // Check for common markdown patterns
    const markdownPatterns = [
      /^#\s+/m,      // Heading level 1
      /^##\s+/m,     // Heading level 2
      /^###\s+/m,    // Heading level 3
      /\*\*(.+?)\*\*/,  // Bold text
      /\*(.+?)\*/,   // Italic text
      /^-\s+/m,      // Unordered list
      /^\d+\.\s+/m   // Ordered list
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  };
  
  // Convert markdown to HTML for the editor
  const markdownToHtml = (markdownContent: string) => {
    // Basic conversion of markdown syntax to HTML
    let htmlContent = markdownContent
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<ul><li>$1</li></ul>')
      .replace(/^(\d+)\. (.*$)/gm, '<ol><li>$2</li></ol>')
      // Line breaks
      .replace(/\n/g, '<br/>');
      
    return DOMPurify.sanitize(htmlContent);
  };
  
  // Process content when it changes or when edit mode changes
  useEffect(() => {
    if (content !== editorContent) {
      if (editMode && isMarkdownContent()) {
        // If we're in edit mode and content has markdown, convert to HTML
        setEditorContent(markdownToHtml(content));
      } else {
        setEditorContent(content);
      }
    }
  }, [content, editMode]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (value: string) => {
    setEditorContent(value);
    
    // Debounce updates to avoid too many API calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onUpdate(value);
    }, 500);
  };

  // Default formats if none provided
  const defaultFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent',
    'link',
    'clean',
    'align', 'color', 'background',
    'font'  // Add font format
  ];

  // Define toolbar modules
  const modules = {
    toolbar: editMode ? {
      container: [
        [{ 'header': [1, 2, 3,4,, false] }],
        // [{ 'font': [] }],
        ['bold', 'italic'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        // [{ 'indent': '-1'}, { 'indent': '+1' }],
        // [{ 'align': [] }],
        // [{ 'color': [] }, { 'background': [] }],
        ['link'],
        ['clean']
      ],
    } : false,
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 1000,
      maxStack: 50,
      userOnly: true
    }
  };

  const activeFormats = formats || defaultFormats;

  // Custom components for ReactMarkdown
  const markdownComponents = {
    h1: (props: any) => (
      <h1 className="text-3xl font-bold mb-5 text-gray-900" {...props} />
    ),
    h2: (props: any) => (
      <h2 className="text-2xl font-bold mb-4 text-gray-800" {...props} />
    ),
    h3: (props: any) => (
      <h3 className="text-xl font-bold mb-3 text-gray-800" {...props} />
    ),
    p: (props: any) => (
      <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
    ),
    strong: (props: any) => (
      <strong className="font-semibold text-gray-900" {...props} />
    ),
    em: (props: any) => (
      <em className="italic text-gray-800" {...props} />
    ),
    li: (props: any) => (
      <li className="ml-4 mb-2" {...props} />
    ),
    hr: (props: any) => (
      <hr className="my-6 border-t-2 border-gray-300" {...props} />
    ),
  };

  return (
    <div className={cn("max-w-4xl ", className)}>
      <div className="mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        {title && <h1 className={titleClassName}>{title}</h1>}
        
        {editMode ? (
          <div className={`quill-container ${editMode ? 'editing' : 'viewing'} font-['Times_New_Roman']`}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={editorContent}
              onChange={handleChange}
              modules={modules}
              formats={activeFormats}
              placeholder={placeholder}
              readOnly={!editMode}
              // style={{ fontFamily: "'Times New Roman', Times, serif" }}
            />
          </div>
        ) : (
          <div className={`${contentClassName} quill-content-view font-['Times_New_Roman']`}>
            {isMarkdownContent() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(editorContent) }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 