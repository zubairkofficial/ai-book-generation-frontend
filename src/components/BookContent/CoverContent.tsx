import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit2, Save } from 'lucide-react';
import { BASE_URl } from '@/constant';
import './CoverContent.css';

interface CoverContentProps {
  bookData: any;
  editMode: boolean;
  refetchBook: () => void;
  setEditMode: (mode: boolean) => void;
}

const CoverContent: React.FC<CoverContentProps> = ({
  bookData,
  editMode,
  refetchBook,
  setEditMode
}) => {
  return (    <div className="cover-content">
      <div className="cover-image-container">
        <img
          src={`${BASE_URl}/uploads/${bookData?.additionalData?.coverImageUrl || ''}`}
          alt={bookData?.bookTitle || 'Book Cover'}
          className="cover-image"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover";
          }}
        />
      </div>

      <div className="book-info">
        <h1 className="book-title">
          {bookData?.bookTitle}
        </h1>
        <p className="book-author">
          By {bookData?.authorName || 'Unknown Author'}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setEditMode(!editMode)}
        className="edit-button"
      >
        {editMode ? (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save
          </>
        ) : (
          <>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </>
        )}
      </Button>
    </div>
  );
};

export default CoverContent;
