import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface TableOfContentsProps {
  bookData: any;
  editMode: boolean;
  onUpdate: (content: string, type: string) => void;
  onChapterSelect: (chapterNo: number) => void;
}

export const TableOfContentsContent = ({
  bookData,
  editMode,
  onUpdate,
  onChapterSelect
}: TableOfContentsProps) => {
  // Extract chapter title from markdown content
  const getChapterTitle = (markdownContent: string) => {
    // Get the first line of the markdown content
    const firstLine = markdownContent.split('\n')[0];
    
    // Remove markdown heading syntax (# or ## or ###) if present
    return firstLine.replace(/^#+\s+/, '').trim();
  };

  return (
    <div className={"min-h-[800px]  px-8 py-12"}>
      <div className="max-w-4xl  mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Table of Contents</h1>
        
        <div className="space-y-4">
          {bookData.bookChapter.map((chapter: any) => (
            <Button
              key={chapter.chapterNo}
              variant="ghost"
              className="w-full justify-between hover:bg-amber-50 hover:text-amber-900"
              onClick={() => onChapterSelect(chapter.chapterNo)}
            >
              <div className="flex items-center gap-4">
                <span className="text-gray-600">
                  {getChapterTitle(chapter.chapterInfo)}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}; 