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