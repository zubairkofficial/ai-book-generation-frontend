import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Book, Globe, User, BookOpen, Bookmark, PenTool, Save, X } from 'lucide-react';
import { useUpdateBookCoverMutation } from '@/api/bookApi';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { Button } from '@/components/ui/button';

interface CoverContentProps {
  bookData: any;
  editMode: boolean;
   setEditMode: Dispatch<SetStateAction<boolean>>;
  refetchBook: any
}

export const CoverContent: React.FC<CoverContentProps> = ({ bookData, editMode, refetchBook ,setEditMode}) => {
  const [updateBookCover, { isLoading: isUpdating }] = useUpdateBookCoverMutation();
  const { addToast } = useToast();
  
  const [editValues, setEditValues] = useState({
    bookTitle: bookData.bookTitle || '',
    authorName: bookData.authorName || '',
    publisher: bookData.publisher || 'AiBookPublisher',
    language: bookData.language || 'English',
    genre: bookData.genre || 'Fiction',
    numberOfChapters: bookData.numberOfChapters || 'TBD',
    ideaCore: bookData.ideaCore || 'A compelling narrative that explores themes of human connection and growth.',
    authorBio: bookData.authorBio || `${bookData.authorName || 'The author'} is a talented writer with a unique perspective on storytelling.`
  });

  useEffect(() => {
    setEditValues({
      bookTitle: bookData.bookTitle || '',
      authorName: bookData.authorName || '',
      publisher: bookData.publisher || 'AiBookPublisher',
      language: bookData.language || 'English',
      genre: bookData.genre || 'Fiction',
      numberOfChapters: bookData.numberOfChapters || 'TBD',
      ideaCore: bookData.ideaCore || 'A compelling narrative that explores themes of human connection and growth.',
      authorBio: bookData.authorBio || `${bookData.authorName || 'The author'} is a talented writer with a unique perspective on storytelling.`
    });
  }, [bookData]);

  const handleChange = (field: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveField = async (field: string, value: string) => {
    try {
      const newContent = {
        [field]: value
      };
      
      await updateBookCover({
        bookGenerationId: bookData.id,
        ...newContent
      }).unwrap();
      
      addToast(`Updated ${field} successfully`, "success");
      setEditMode(false)
      if (refetchBook) {
        refetchBook();
      }
    } catch (error) {
      if (error instanceof Error) {
        addToast(error.message, ToastType.ERROR);
      } else {
        addToast("error on update book chapter", ToastType.ERROR);
      }
    }
  };

  const handleCancel = () => {
    setEditValues({
      bookTitle: bookData.bookTitle || '',
      authorName: bookData.authorName || '',
      publisher: bookData.publisher || 'AiBookPublisher',
      language: bookData.language || 'English',
      genre: bookData.genre || 'Fiction',
      numberOfChapters: bookData.numberOfChapters || 'TBD',
      ideaCore: bookData.ideaCore || 'A compelling narrative that explores themes of human connection and growth.',
      authorBio: bookData.authorBio || `${bookData.authorName || 'The author'} is a talented writer with a unique perspective on storytelling.`
    });
    setEditMode(false);
  };

  const EditableField = ({ 
    fieldName, 
    value, 
    isMultiline = false,
    placeholder = 'Enter value...'
  }: { 
    fieldName: string, 
    value: string, 
    isMultiline?: boolean,
    placeholder?: string
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    
    useEffect(() => {
      setLocalValue(value);
    }, [value]);
    
    const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLocalValue(e.target.value);
    };
    
    const handleSave = async () => {
      if (localValue !== value) {
        handleChange(fieldName, localValue);
        await saveField(fieldName, localValue);
      }
      setIsEditing(false);
    };
    
    const handleCancel = () => {
      setLocalValue(value);
      setIsEditing(false);
    };
    
    if (editMode && isEditing) {
      return (
        <div className="relative">
          {isMultiline ? (
            <textarea
              value={localValue}
              onChange={handleLocalChange}
              className="w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder={placeholder}
              disabled={isUpdating}
            />
          ) : (
            <input
              type="text"
              value={localValue}
              onChange={handleLocalChange}
              className="w-full p-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder}
              disabled={isUpdating}
            />
          )}
          <div className="absolute right-2 top-2 flex space-x-2">
            <button 
              onClick={handleSave}
              className={`${isUpdating ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} text-white p-1 rounded-md transition-colors`}
              title="Save"
              disabled={isUpdating}
            >
              <Save className="w-4 h-4" />
            </button>
            <button 
              onClick={handleCancel}
              className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600 transition-colors"
              title="Cancel"
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div 
        onClick={() => editMode && !isUpdating && setIsEditing(true)} 
        className={editMode && !isUpdating ? "cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors group" : ""}
      >
        {value || placeholder}
        {editMode && !isUpdating && (
          <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
            (Click to edit)
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[800px] px-4 sm:px-8 py-6 sm:py-12 rounded-lg shadow-lg">
      <div className="mx-auto p-6 sm:p-12">
        {/* Edit Mode Controls */}
        {editMode && (
          <div className="flex justify-end gap-3 mb-6">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => {
                // Save all changes
                Object.entries(editValues).forEach(([field, value]) => {
                  if (value !== bookData[field]) {
                    saveField(field, value);
                  }
                });
              }}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4 sm:mb-6 text-center break-words">
          <EditableField fieldName="bookTitle" value={editValues.bookTitle} placeholder="Enter book title..." />
        </h1>
        
        <div className="flex items-center justify-center mb-6 sm:mb-8">
          <div className="h-px w-12 sm:w-16 bg-gray-300"></div>
          <p className="text-xl sm:text-2xl font-semibold text-gray-800 px-4 sm:px-6">
            <EditableField fieldName="authorName" value={editValues.authorName} placeholder="Enter author name..." />
          </p>
          <div className="h-px w-12 sm:w-16 bg-gray-300"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8 text-left">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Book className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Publisher</p>
              <p className="text-base text-gray-800">
                <EditableField fieldName="publisher" value={editValues.publisher} placeholder="Enter publisher..." />
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Language</p>
              <p className="text-base text-gray-800">
                <EditableField fieldName="language" value={editValues.language} placeholder="Enter language..." />
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Bookmark className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Genre</p>
              <p className="text-base text-gray-800">
                <EditableField fieldName="genre" value={editValues.genre} placeholder="Enter genre..." />
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Chapters</p>
              <p className="text-base text-gray-800">
                <EditableField fieldName="numberOfChapters" value={editValues.numberOfChapters} placeholder="Enter number of chapters..." />
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full">
          <div className="flex items-center mb-3">
            <PenTool className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Core Concept</h3>
          </div>
          <p className="text-base text-gray-700 leading-relaxed text-left">
            <EditableField 
              fieldName="ideaCore" 
              value={editValues.ideaCore} 
              isMultiline={true} 
              placeholder="Enter the core concept of your book..."
            />
          </p>
        </div>

        <div className="mt-8 w-full">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">About the Author</h3>
          </div>
          <p className="text-base text-gray-700 leading-relaxed text-left">
            <EditableField 
              fieldName="authorBio" 
              value={editValues.authorBio} 
              isMultiline={true}
              placeholder="Enter information about the author..."
            />
          </p>
        </div>
      </div>
    </div>
  );
}; 