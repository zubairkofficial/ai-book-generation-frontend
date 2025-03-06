import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from '@/utils/markdownUtils';
import { EditorContent } from './EditorContent';
import { BookOpen, AlignLeft, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChapterContentProps {
  chapter: {
    chapterNo: number;
    chapterInfo: string;
    chapterSummary: string;
  };
  totalChapters: number;
  editMode: boolean;
  onUpdate: (content: string, chapterNo: string) => void;
  setHasChanges: (value: boolean) => void;
  onNavigate: (chapterNo: number) => void;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  chapter,
  totalChapters,
  editMode,
  onUpdate,
  setHasChanges,
  onNavigate
}) => {
  const hasPrevious = chapter.chapterNo > 1;
  const hasNext = chapter.chapterNo < totalChapters;

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Chapter Header */}
      <div className="border-b pb-6">
        <div className="flex items-center gap-3 text-amber-700 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-sm font-medium">Chapter {chapter.chapterNo}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {chapter.chapterInfo.split('\n')[0].replace('# ', '')}
        </h1>
      </div>

      {/* Main Content */}
      {editMode ? (
        <EditorContent
          title={`Chapter ${chapter.chapterNo}`}
          content={chapter.chapterInfo}
          editMode={true}
          onUpdate={(content) => {
            onUpdate(content, chapter.chapterNo.toString());
            setHasChanges(true);
          }}
          className="prose max-w-none"
          titleClassName="sr-only"
          contentClassName="prose max-w-none text-gray-700"
          setHasChanges={setHasChanges}
        />
      ) : (
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={markdownComponents}
          >
            {chapter.chapterInfo}
          </ReactMarkdown>
        </div>
      )}

      {/* Chapter Summary Card */}
      <div className="mt-12 relative">
        <div className="absolute -top-3 left-6 bg-white px-3 py-1 rounded-full border shadow-sm">
          <div className="flex items-center gap-2 text-amber-700">
            <BookMarked className="w-4 h-4" />
            <span className="text-sm font-semibold">Chapter Summary</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-100 shadow-inner">
          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <AlignLeft className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-4">
              {/* Key Points */}
              <div className="prose prose-amber">
                <p className="text-gray-700 leading-relaxed">
                  {chapter.chapterSummary}
                </p>
              </div>
              
              {/* Quick Navigation */}
              <div className="pt-4 border-t border-amber-200/50">
                <div className="flex items-center justify-between text-sm">
                  {/* Previous Chapter Button */}
                  {hasPrevious && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePrevious}
                      className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                    >
                      ← Previous Chapter
                    </Button>
                  )}
                  
                  {/* Chapter Indicator */}
                  <span className="text-amber-700 font-medium">
                    Chapter {chapter.chapterNo} of {totalChapters}
                  </span>
                  
                  {/* Next Chapter Button */}
                  {hasNext && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                    >
                      Next Chapter →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 