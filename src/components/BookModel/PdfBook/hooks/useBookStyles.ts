export interface BookStyles {
  fontFamily: {
    body: string;
    title: string;
    headers: string;
    chapterTitle: string;
  };
  fontSize: {
    body: string;
    title: string;
    headers: string;
    chapterTitle: string;
  };
  lineHeight: {
    body: string;
    title: string;
    headers: string;
    chapterTitle: string;
  };
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  spacing: {
    chapterSpacing: string;
    sectionSpacing: string;
    paragraphSpacing: string;
  };
  textAlignment: {
    body: string;
    title: string;
    headers: string;
    chapterTitle: string;
  };
  pageLayout: {
    columns: number;
    pageSize: string;
    orientation: string;
  };
}

export interface BookInfo {
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

export interface BookPDFProps {
  selectedBook: any;
  content: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  bookStyles?: BookStyles;
}

export const IMAGE_SIZES = {
  STANDARD: {
    width: 300,
    height: 225,
  },
  PORTRAIT: {
    width: 225,
    height: 300,
  },
  LANDSCAPE: {
    width: 400,
    height: 225,
  },
  DIAGRAM: {
    width: 500,
    height: 350,
  },
  FLOWCHART: {
    width: 550,
    height: 400,
  },
  ARCHITECTURE: {
    width: 600,
    height: 450,
  },
  SEQUENCE: {
    width: 500,
    height: 400,
  },
} as const;

export const defaultBookStyles = {
  fontFamily: {
    body: 'Georgia, serif',
    title: 'Georgia, serif',
    headers: 'Georgia, serif',
    chapterTitle: 'Georgia, serif'
  },
  fontSize: {
    body: '16px',
    title: '32px',
    headers: '20px',
    chapterTitle: '24px'
  },
  // ... rest of the default styles
}; 