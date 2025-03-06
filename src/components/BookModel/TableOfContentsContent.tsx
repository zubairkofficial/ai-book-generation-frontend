import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="max-w-4xl mx-auto">
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
                {chapter.chapterInfo.split('\n')[0].replace('# ', '')}
              </span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Button>
        ))}
      </div>
    </div>
  );
}; 