import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css'; // Create this file for custom styling

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
  const [editorContent, setEditorContent] = useState(content);
  const quillRef = useRef<ReactQuill>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update editor content when prop changes
  useEffect(() => {
    if (content !== editorContent) {
      setEditorContent(content);
    }
  }, [content]);

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
    'align', 'color', 'background'
  ];

  // Define toolbar modules
  const modules = {
    toolbar: editMode ? {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
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

  return (
    <div className={className}>
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        {title && <h1 className={titleClassName}>{title}</h1>}
        
        {editMode ? (
          <div className={`quill-container ${editMode ? 'editing' : 'viewing'}`}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={editorContent}
              onChange={handleChange}
              modules={modules}
              formats={activeFormats}
              placeholder={placeholder}
              readOnly={!editMode}
            />
          </div>
        ) : (
          <div className={`${contentClassName} quill-content-view`}>
            <div dangerouslySetInnerHTML={{ __html: editorContent }} />
          </div>
        )}
      </div>
    </div>
  );
}; 