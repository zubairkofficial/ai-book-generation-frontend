import React from "react";
import { Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BookPreviewButtonProps {
  bookId: number;
  isLoading: boolean;
  className?: string;
}

const BookPreviewButton: React.FC<BookPreviewButtonProps> = ({
  bookId,
  isLoading,
  className,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/book-modal?id=${bookId}`);
  };

  return (
    <Button
      onClick={handleClick}
      className={`bg-amber-500 hover:bg-amber-600 text-white ${className}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Eye className="w-4 h-4 mr-2" />
      )}
      Preview
    </Button>
  );
};

export default BookPreviewButton; 