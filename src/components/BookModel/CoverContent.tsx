import { useState, useEffect } from 'react';
import { useUpdateBookCoverMutation } from '@/api/bookApi';

interface CoverContentProps {
  bookData: any;
  editMode: boolean;
}

interface CoverData {
  bookTitle: string;
  authorName: string;
  publisher: string;
  language: string;
  genre: string;
  numberOfChapters: string;
  ideaCore: string;
  authorBio: string;
}

export const CoverContent = ({ bookData, editMode }: CoverContentProps) => {
  const [localContent, setLocalContent] = useState<CoverData>({
    bookTitle: '',
    authorName: '',
    publisher: '',
    language: '',
    genre: '',
    numberOfChapters: '',
    ideaCore: '',
    authorBio: ''
  });

  const [updateBookCover] = useUpdateBookCoverMutation();

  useEffect(() => {
    if (bookData) {
      setLocalContent({
        bookTitle: bookData.bookTitle || '',
        authorName: bookData.authorName || '',
        publisher: bookData.authorName || "AiBookPublisher",
        language: bookData.language || "English",
        genre: bookData.genre || '',
        numberOfChapters: bookData.numberOfChapters || '',
        ideaCore: bookData.ideaCore || '',
        authorBio: bookData.authorBio || ''
      });
    }
  }, [bookData]);

  const handleContentChange = async (element: HTMLElement) => {
    console.log("element.querySelector('h1')?.textContent ",element.querySelector('h1')?.textContent )
    const newContent = {
      bookTitle: element.querySelector('h1')?.textContent || localContent.bookTitle,
      authorName: element.querySelector('.text-3xl')?.textContent || localContent.authorName,
      publisher: element.querySelector('.grid-cols-2 > div:nth-child(1) > p:last-child')?.textContent || localContent.publisher,
      language: element.querySelector('.grid-cols-2 > div:nth-child(2) > p:last-child')?.textContent || localContent.language,
      genre: element.querySelector('.grid-cols-2 > div:nth-child(3) > p:last-child')?.textContent || localContent.genre,
      numberOfChapters: element.querySelector('.grid-cols-2 > div:nth-child(4) > p:last-child')?.textContent || localContent.numberOfChapters,
      ideaCore: element.querySelector('.mt-8 .leading-relaxed')?.textContent || localContent.ideaCore,
      authorBio: element.querySelector('.mt-8:last-child p:last-child')?.textContent || localContent.authorBio
    };

    setLocalContent(newContent);

    try {
      await updateBookCover({
        bookGenerationId: bookData.id,
        ...newContent
      }).unwrap();
      
    } catch (error) {
      console.error('Failed to update cover content:', error);
    }
  };

  return (
    <div 
      className="space-y-6 max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg"
      contentEditable={editMode}
      onBlur={(e) => handleContentChange(e.currentTarget)}
      suppressContentEditableWarning={true}
    >
      <h1 className="text-4xl font-bold text-gray-900 leading-tight">
        {localContent.bookTitle}
      </h1>
      
      <div className="space-y-2">
        <p className="text-2xl text-gray-700">by</p>
        <p className="text-3xl font-semibold text-gray-800">
          {localContent.authorName}
        </p>
      </div>

      {/* Additional Book Information */}
      <div className="grid grid-cols-2 gap-4 text-left mt-8 text-gray-600">
        <div>
          <p className="font-semibold">Publisher</p>
          <p>{localContent.publisher}</p>
        </div>
        <div>
          <p className="font-semibold">Language</p>
          <p>{localContent.language}</p>
        </div>
        <div>
          <p className="font-semibold">Genre</p>
          <p>{localContent.genre}</p>
        </div>
        <div>
          <p className="font-semibold">Chapters</p>
          <p>{localContent.numberOfChapters}</p>
        </div>
      </div>

      {/* Core Idea / Book Description */}
      <div className="mt-8 text-left">
        <p className="font-semibold text-gray-700">About this book:</p>
        <p className="text-gray-600 mt-2 leading-relaxed">
          {localContent.ideaCore}
        </p>
      </div>

      {/* Author Bio if available */}
      {(localContent.authorBio || editMode) && (
        <div className="mt-8 text-left">
          <p className="font-semibold text-gray-700">About the Author:</p>
          <p className="text-gray-600 mt-2">
            {localContent.authorBio}
          </p>
        </div>
      )}
    </div>
  );
}; 