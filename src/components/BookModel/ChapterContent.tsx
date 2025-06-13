import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm';
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from '@/utils/markdownUtils';
import { AlignLeft, BookMarked, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuillEditor } from './QuillEditor';
import { useUpdateChapterMutation } from '@/api/bookApi';
import DOMPurify from 'dompurify';
import { useToast } from '@/context/ToastContext';
import {unified} from 'unified'
import TurnDownService from 'turndown'
const turndown = new TurnDownService();
interface ChapterContentProps {
  chapter: {
    chapterNo: number;
    chapterInfo: string;
    chapterSummary: string;
  };
  bookId?: number;
  bookGenerationId: number;
  additionalData?: {
    fullContent: string;
    coverImageUrl: string;
    backCoverImageUrl: string;
    tableOfContents: string;
  };
  totalChapters: number;
  editMode: boolean;
  onUpdate: (content: string, chapterNo: string) => void;
  onNavigate: (chapterNo: number) => void;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  chapter,
  bookGenerationId,
  totalChapters,
  editMode,
  onUpdate,
  onNavigate
}) => {
  const { addToast } = useToast();
  const [updateChapter, { isLoading: isSaving }] = useUpdateChapterMutation();
  const [saveError, setSaveError] = useState('');
  const [formattedContent, setFormattedContent] = useState(chapter.chapterInfo);
  const [localContent, setLocalContent] = useState(chapter.chapterInfo);
  const [originalContent, setOriginalContent] = useState(chapter.chapterInfo);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [quillEditorContent, setQuillEditorContent] = useState('');

  useEffect(() => {
    (async () => {
      const file = await unified()
        .use(remarkParse)
        .use(remarkRehype, {allowDangerousHtml: true})
        .use(rehypeRaw)
        .use(rehypeStringify)
        .process(chapter.chapterInfo);
      console.log("HTML content", file.toString())
      setQuillEditorContent(file.toString());
    })();
  }, []);

  console.log("chapter Info", chapter.chapterInfo);
  
  const hasPrevious = chapter.chapterNo > 1;
  const hasNext = chapter.chapterNo < totalChapters;

  // Reset states when chapter changes
  useEffect(() => {
    setLocalContent(chapter.chapterInfo);
    setOriginalContent(chapter.chapterInfo);
    setHasLocalChanges(false);
    setSaveError('');
    processContent(chapter.chapterInfo);
  }, [chapter.chapterInfo, chapter.chapterNo]);

  // Process HTML content for display
  const processContent = (content: string) => {
    if (content && content.trim().startsWith('<')) {
      // Create temporary element to work with the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = DOMPurify.sanitize(content);
      
      // Find all headings to properly structure them
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        // Add appropriate classes to headings
        heading.classList.add('chapter-heading');
        
        // Make main chapter title stand out
        if (heading.textContent?.includes(`Chapter ${chapter.chapterNo}`)) {
          heading.classList.add('chapter-title');
        }
        
        // Add spacing after headings
        const nextElement = heading.nextElementSibling;
        if (nextElement) {
          nextElement.classList.add('mt-4');
        }
      });
      
      // Find paragraphs that need formatting
      const paragraphs = tempDiv.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.classList.add('chapter-paragraph');
      });
      
      setFormattedContent(tempDiv.innerHTML);
    } else {
      setFormattedContent(content);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(chapter.chapterNo - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(chapter.chapterNo + 1);
    }
  };

  // Track content changes locally
  const handleContentUpdate = async (content: string) => {
    const markdownContent = turndown.turndown(content);
    console.log("Editor content", markdownContent);
    setLocalContent(markdownContent);
    const hasChanged = content !== originalContent;
    setHasLocalChanges(hasChanged);
  };
  
  // Save changes to the server
  const saveChanges = async () => {
    if (!hasLocalChanges) return;
    
    try {
      setSaveError('');
      
      // Update chapter content
      await updateChapter({
        bookGenerationId,
        chapterNo: chapter.chapterNo,
        updateContent: localContent
      }).unwrap();
      const file = await unified()
        .use(remarkParse)
        .use(remarkRehype, {allowDangerousHtml: true})
        .use(rehypeRaw)
        .use(rehypeStringify)
        .process(localContent);
      console.log("HTML content", file.toString())
      setQuillEditorContent(file.toString());
      
      // Update parent state
      onUpdate(localContent, chapter.chapterNo.toString());
      
      // Reset state
      setOriginalContent(localContent);
      setHasLocalChanges(false);
      processContent(localContent);
      
      addToast("Chapter saved successfully", "success");
    } catch (error) {
      setSaveError('Failed to save chapter. Please try again.');
      addToast("Failed to save chapter", "error");
    }
  };
  
  // Discard changes
  const handleCancelChanges = () => {
    setLocalContent(originalContent);
    setHasLocalChanges(false);
  };

  return (
    <div className="min-h-[800px] relative">
      {/* Save/Cancel buttons when in edit mode */}
      {editMode && (
        <div className="sticky w-fit ml-auto top-4 z-10 flex justify-end mb-4 px-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-2 flex gap-2">
            {hasLocalChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelChanges}
                className="flex items-center gap-1 text-gray-700 hover:text-red-600"
                disabled={isSaving}
              >
                <X size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            )}
            
            <Button
              variant="default"
              size="sm"
              onClick={saveChanges}
              className={`flex items-center gap-1 ${
                !hasLocalChanges 
                  ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" 
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
              disabled={!hasLocalChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                  <span className="hidden sm:inline">Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span className="hidden sm:inline">Save Chapter</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Chapter Content */}
      {editMode ? (
        <QuillEditor
          content={quillEditorContent}
          editMode={true}
          onUpdate={handleContentUpdate}
          className="prose max-w-none"
          placeholder="Edit chapter content here..."
        />
      ) : (
        <div className="prose max-w-none">
            {/* {chapter.chapterInfo.trim().startsWith('<') ? (            // 
          // ) : ( */}
{/* <div 
                className="chapter-content" 
                dangerouslySetInnerHTML={{ __html: quillEditorContent }}
              /> */}
               <div className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12  rounded-lg shadow-lg">
               <div className=" mx-auto p-6 sm:p-12 ">
            <ReactMarkdown
              remarkPlugins={[remarkRehype, remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              remarkRehypeOptions={{ allowDangerousHtml: true }}
              components={markdownComponents}
            >
              {chapter.chapterInfo}
            </ReactMarkdown>
            </div>
            </div>
          {/* )} */}
        </div>
      )}

     
    </div>
  );
}; 