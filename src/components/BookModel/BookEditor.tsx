import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface BookEditorProps {
  content: string;
  onUpdate: (content: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  editorId?: string;
}

export const BookEditor: React.FC<BookEditorProps> = ({
  content,
  onUpdate,
  readOnly = false,
  placeholder = "Start writing here...",
  className = "",
  editorId = "quill-editor"
}) => {
  // Quill editor toolbar configuration
  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['clean']
    ]
  };

  // Quill formats to support
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align',
    'color', 'background',
    'font', 'size'
  ];

  return (
    <div className={`book-editor-container ${className}`}>
      <ReactQuill
        id={editorId}
        theme="snow"
        value={content}
        onChange={onUpdate}
        modules={modules}
        formats={formats}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    </div>
  );
}; 