import React, { useState } from 'react';
import { ChevronRight, Edit2, Check, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Chapter {
  id: number;
  chapterNo: number;
  chapterInfo: string;
  chapterName: string;
  chapterSummary: string;
}

interface TableOfContentsProps {
  bookData: {
    bookChapter: Chapter[];
  };
  editMode: boolean;
  onUpdate: (content: string, type: string) => void;
  onChapterSelect: (chapterNo: number) => void;
  setHasChanges?: (value: boolean) => void;
}

export const TableOfContentsContent: React.FC<TableOfContentsProps> = ({
  bookData,
  editMode,
  onUpdate,
  onChapterSelect,
  setHasChanges = () => {}
}) => {
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  
  const handleEditStart = (chapter: Chapter) => {
    setEditingChapter(chapter.chapterNo);
    setEditedTitle(chapter.chapterName || '');
  };
  
  const handleEditCancel = () => {
    setEditingChapter(null);
    setEditedTitle('');
  };
  
  const handleEditSave = (chapter: Chapter) => {
    if (!editedTitle.trim()) return;
    
    const updatedChapter = {
      ...chapter,
      chapterName: editedTitle.trim()
    };
    
    onUpdate(JSON.stringify(updatedChapter), 'chapter');
    setHasChanges(true);
    setEditingChapter(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center justify-center bg-gradient-to-r from-amber-50 to-amber-100 p-2 rounded-lg mb-2">
          <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-amber-800 bg-clip-text text-transparent">
          Table of Contents
        </h1>
        <p className="text-gray-500 text-sm mt-1">Navigate through your book chapters</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {bookData?.bookChapter?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {bookData.bookChapter.map((chapter, index) => (
              <motion.div 
                key={chapter.id} 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent transition-all duration-200"
              >
                {editMode && editingChapter === chapter.chapterNo ? (
                  <div className="w-full p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className="font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                      Chapter {chapter.chapterNo}
                    </span>
                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full p-3 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        autoFocus
                        placeholder="Enter chapter title..."
                      />
                    </div>
                    <div className="flex items-center mt-2 sm:mt-0 self-end sm:self-center">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEditSave(chapter)} 
                        className="text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all"
                        disabled={!editedTitle.trim()}
                      >
                        <Check className="w-5 h-5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={handleEditCancel} 
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto text-left rounded-none border-l-4 border-transparent group-hover:border-amber-400 transition-all duration-200"
                      onClick={() => onChapterSelect(chapter.chapterNo)}
                    >
                      <div className="flex flex-col items-start sm:flex-row sm:items-center">
                        <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium mb-2 sm:mb-0 sm:mr-3">
                          Chapter {chapter.chapterNo}
                        </span>
                        <span className="text-gray-800 font-medium line-clamp-2 group-hover:text-amber-800 transition-colors">
                          {chapter.chapterName}
                        </span>
                      </div>
                      <div className="flex items-center ml-2 shrink-0">
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStart(chapter);
                            }}
                            className="mr-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-full mb-4">
              <BookOpen className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No chapters yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              This book doesn't have any chapters available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 