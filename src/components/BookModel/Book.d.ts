type BookPDFProps ={
    selectedBook: any;
    content: string;
    coverImageUrl?: string;
    backCoverImageUrl?: string;
    bookStyles?: BookStyles;
  }

  type BookInfo= {
    title: string;
    author: string;
    publisher: string;
    coverDesign: string;
    dedication: string;
    preface: {
      coverage: string;
      curriculum: string;
      prerequisites: string;
      goals: string;
      acknowledgements: string;
    };
    tableOfContents: any[];
    introduction: string;
    chapters: Array<{
      number: number;
      title: string;
      content: string;
    }>;
    glossary: Array<{
      term: string;
      definition: string;
    }>;
    index: Array<{
      title: string;
      page: string;
    }>;
    references: {
      main: string[];
      inspirations: string[];
    };
    authorProfile: string;
    backCover: {
      synopsis: string;
      authorBio: string;
    };
  }

  type BookModalProps= {
    isOpen: boolean;
    onClose: () => void;
    htmlContent?: string;
    coverImageUrl?: string;
    backCoverImageUrl?: string;
    selectedBook: any;
  }

  type TextStyle = {
    bold: boolean;
    italic: boolean;
    align: 'left' | 'center' | 'right';
    fontSize: string;
    fontFamily: string;
    color: string;
    lineHeight: string;
    letterSpacing: string;
  }
  
  type PageContent = {
    id: string;
    icon: ReactNode;
    label: string;
  }
  
  type Book = {
    id: number;
    bookTitle: string;
    authorName: string;
    genre: string;
    numberOfChapters: number;
    additionalData: {
      fullContent: string;
      coverImageUrl: string;
      backCoverImageUrl: string;
      tableOfContents: string;
    };
    bookChapter: Array<{
      id: number;
      chapterNo: number;
      chapterInfo: string;
    }>;
  }
  
  type BookModelProps = {
    book: Book;
  }
  
  type ImageUploadProps = {
    currentImage: string;
    onImageUpdate: (file: File) => void;
    label: string;
    isEditing: boolean;
  }
  
  type ContentEditorProps = {
    content: string;
    onChange: (content: string) => void;
    isEditing: boolean;
  }