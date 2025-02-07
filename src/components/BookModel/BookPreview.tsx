// components/BookPreview.tsx

import React from 'react';
import './BookStyle.css'
interface BookPreviewProps {
  htmlContent: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
}

const BookPreview: React.FC<BookPreviewProps> = ({ htmlContent, coverImageUrl, backCoverImageUrl }) => {
  return (
    <div className="book-preview">
      {/* Cover Page */}
      <div className="cover-page">
        {coverImageUrl && <img src={coverImageUrl} alt="Book Cover" className="cover-image" />}
        <h1 className="book-title">Book Title</h1>
        <div className="author-name">By Author Name</div>
        <div className="publisher-name">Publisher Name</div>
      </div>

      {/* Book Content */}
      <div className="book-section">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      {/* Back Cover */}
      {backCoverImageUrl && (
        <div className="back-cover">
          <img src={backCoverImageUrl} alt="Back Cover" className="back-cover-image" />
        </div>
      )}
    </div>
  );
};

export default BookPreview;
