import { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer';
import { Loader2, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { BASE_URl, ToastType } from '@/constant';
import { useToast } from '@/context/ToastContext';
import ToastContainer from '@/components/Toast/ToastContainer'; // Import custom ToastContainer

// Register custom fonts
Font.register({
  family: 'Merriweather',
  src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.ttf',
});

Font.register({
  family: 'Lato',
  src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwiPHA.ttf',
});

interface BookStyles {
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

interface BookInfo {
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

const defaultBookStyles: BookStyles = {
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
  lineHeight: {
    body: '1.6',
    title: '1.2',
    headers: '1.6',
    chapterTitle: '1.3'
  },
  margins: {
    top: '72pt',
    right: '72pt',
    bottom: '72pt',
    left: '72pt'
  },
  spacing: {
    chapterSpacing: '4rem',
    sectionSpacing: '40',
    paragraphSpacing: '16'
  },
  textAlignment: {
    body: 'justify',
    title: 'center',
    headers: 'center',
    chapterTitle: 'center'
  },
  pageLayout: {
    columns: 1,
    pageSize: 'A4',
    orientation: 'portrait'
  },
};

const extractBookInfo = (content: string, selectedBook?: any): BookInfo => {
  const sections = content.split('\n\n');
  
  const bookInfo: BookInfo = {
    title: selectedBook?.bookTitle || '',
    author: selectedBook?.author || '',
    publisher: 'Cyberify',
    coverDesign: '',
    dedication: '',
    preface: {
      coverage: '',
      curriculum: '',
      prerequisites: '',
      goals: '',
      acknowledgements: ''
    },
    tableOfContents: [],
    introduction: '',
    chapters: [],
    glossary: [],
    index: [],
    references: {
      main: [],
      inspirations: []
    },
    authorProfile: '',
    backCover: {
      synopsis: '',
      authorBio: ''
    }
  };

  let currentChapter: any = null;
  let isCollectingChapterContent = false;
  let isPrefaceSection = false;
  let processedChapters = new Set(); // Add this to track processed chapters

  sections.forEach(section => {
    const cleanSection = section.trim();
    const authorMatch = cleanSection.match(/\[Author:\s*"([^"]+)"\]/);
    if (authorMatch) {
      bookInfo.author = authorMatch[1];
    }
    
    // Publisher extraction
    const publisherMatch = cleanSection.match(/\[Publisher:\s*([^\]]+)\]/);
    if (publisherMatch) {
      bookInfo.publisher = publisherMatch[1].trim();
    }
    if (cleanSection.includes('[Your Title:')) {
      bookInfo.title = cleanSection.match(/\[Your Title: "(.+?)"\]/)?.[1] || '';
    } else if (cleanSection.includes('Design Elements:')) {
      bookInfo.coverDesign = cleanSection;
    } else if (cleanSection.startsWith('Dedication')) {
      bookInfo.dedication = cleanSection.replace('Dedication', '').trim();
    } else if (cleanSection.startsWith('Preface') || isPrefaceSection) {
      isPrefaceSection = true;
      
      if (cleanSection.includes('Overview:')) {
        bookInfo.preface.coverage = cleanSection.split('Overview:')[1].trim();
      } else if (cleanSection.includes('Use in Curriculum:') || cleanSection.includes('Use in the Curriculum:')) {
        const curriculumContent = cleanSection.split(/Use in (?:the )?Curriculum:/)[1].trim();
        bookInfo.preface.curriculum = curriculumContent;
      } else if (cleanSection.includes('Prerequisites:')) {
        bookInfo.preface.prerequisites = cleanSection.split('Prerequisites:')[1].trim();
      } else if (cleanSection.includes('Goals:')) {
        bookInfo.preface.goals = cleanSection.split('Goals:')[1].trim();
      } else if (cleanSection.includes('Acknowledgments:') || cleanSection.includes('Acknowledgements:')) {
        const ackContent = cleanSection.split(/Acknowledge?ments:/)[1].trim();
        bookInfo.preface.acknowledgements = ackContent;
        isPrefaceSection = false;
      }
    } else if (cleanSection.startsWith('Table of Contents') || cleanSection.startsWith('Contents')) {
      const lines = cleanSection.split('\n').slice(1);
      bookInfo.tableOfContents = lines
        .filter(line => line.trim())
        .map(line => {
          // Handle different formats of chapter titles and page numbers
          const match = line.match(/^(.*?)(?:\.{2,}|\s{2,}|-)?\s*(\d+)?$/);
          if (match) {
            return {
              title: match[1].trim(),
              page: match[2] ? match[2].trim() : ''
            };
          }
          return {
            title: line.trim(),
            page: ''
          };
        })
        .filter(item => item.title && !item.title.toLowerCase().includes('page'));
    } else if (cleanSection.startsWith('Introduction')) {
      bookInfo.introduction = cleanSection.replace('Introduction', '').trim();
    } else if (cleanSection.startsWith('Chapter')) {
      const chapterMatch = cleanSection.match(/Chapter (\d+):\s*(.+)/);
      if (chapterMatch) {
        const chapterNumber = parseInt(chapterMatch[1]);
        const chapterTitle = chapterMatch[2].trim();
        const chapterKey = `${chapterNumber}-${chapterTitle}`;

        // Only process this chapter if we haven't seen it before
        if (!processedChapters.has(chapterKey)) {
          processedChapters.add(chapterKey);
          
          // If we were collecting content for a previous chapter, save it
          if (currentChapter) {
            bookInfo.chapters.push(currentChapter);
          }

          // Start a new chapter
          currentChapter = {
            number: chapterNumber,
            title: chapterTitle,
            content: ''
          };
          isCollectingChapterContent = true;
        }
      }
    } else if (cleanSection.startsWith('Glossary')) {
      const lines = cleanSection.split('\n').slice(1);
      lines.forEach(line => {
        const match = line.match(/(\d+)\.\s*([^-]+)-\s*(.+)/);
        if (match) {
          bookInfo.glossary.push({
            term: match[2].trim(),
            definition: match[3].trim()
          });
        }
      });
    } else if (cleanSection.startsWith('Index')) {
      const lines = cleanSection.split('\n').slice(1);
      lines.forEach(line => {
        const match = line.match(/\d+\.\s*([^-]+)-\s*Page\s*(\d+)/);
        if (match) {
          bookInfo.index.push({
            title: match[1].trim(),
            page: match[2].trim()
          });
        }
      });
    } else if (cleanSection.startsWith('References')) {
      let isInspirations = false;
      const lines = cleanSection.split('\n');
      
      lines.forEach(line => {
        if (line.includes('Inspirations:')) {
          isInspirations = true;
        } else if (line.startsWith('- ')) {
          const reference = line.replace('- ', '').trim();
          if (isInspirations) {
            bookInfo.references.inspirations.push(reference);
          } else {
            bookInfo.references.main.push(reference);
          }
        }
      });
    } else if (cleanSection.startsWith('Back Cover')) {
      const parts = cleanSection.split('\n\n');
      if (parts.length >= 2) {
        bookInfo.backCover.synopsis = parts[1].trim();
        if (parts.length >= 3) {
          bookInfo.backCover.authorBio = parts[2].trim();
        }
      }
    }

    // Append content to current chapter if it's not empty
    if (isCollectingChapterContent && currentChapter) {
      if (cleanSection) {
        currentChapter.content += (currentChapter.content ? '\n\n' : '') + cleanSection;
      }
    }
  });

  // Don't forget to add the last chapter
  if (currentChapter && !processedChapters.has(`${currentChapter.number}-${currentChapter.title}`)) {
    bookInfo.chapters.push(currentChapter);
  }

  // Sort chapters by number
  bookInfo.chapters.sort((a, b) => a.number - b.number);

  // Process additional data from selectedBook if available
  if (selectedBook) {
    // Add any missing book metadata
    if (!bookInfo.title) bookInfo.title = selectedBook.bookTitle;
    if (!bookInfo.author) bookInfo.author = selectedBook.genre; // or another appropriate field
    
    // Add chapter information if not already present
    if (bookInfo.chapters.length === 0 && selectedBook.additionalData?.fullContent) {
      const chapterContent = selectedBook.additionalData.fullContent;
      bookInfo.chapters = [{
        number: 1,
        title: selectedBook.bookTitle,
        content: chapterContent
      }];
    }

    // Add any styling preferences
    if (selectedBook.additionalData?.styling) {
      // This can be used to customize the PDF styling
      // You might want to pass this through to the BookPDF component
    }
  }

  return bookInfo;
};

// Add this helper function near the top of the file, after the imports
const isDiagramOrFlowchart = (text: string): boolean => {
  const diagramKeywords = [
    'diagram',
    'flowchart',
    'chart',
    'graph',
    'architecture',
    'flow',
    'process',
    'sequence',
    'workflow',
    'system',
    'structure'
  ];
  return diagramKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
};

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

const getImageSize = (imageUrl: string, altText: string) => {
  // Check if it's a diagram/flowchart
  if (isDiagramOrFlowchart(altText)) {
    const text = altText.toLowerCase();
    if (text.includes('flowchart')) {
      return IMAGE_SIZES.FLOWCHART;
    } else if (text.includes('architecture')) {
      return IMAGE_SIZES.ARCHITECTURE;
    } else if (text.includes('sequence')) {
      return IMAGE_SIZES.SEQUENCE;
    } else {
      return IMAGE_SIZES.DIAGRAM;
    }
  }

  // For regular images, randomly select a size
  const regularSizes = [
    IMAGE_SIZES.STANDARD,
    IMAGE_SIZES.PORTRAIT,
    IMAGE_SIZES.LANDSCAPE
  ];
  
  const randomIndex = Math.floor(Math.random() * regularSizes.length);
  return regularSizes[randomIndex];
};

export const createImageCache = () => {
  const cache = new Map<string, typeof IMAGE_SIZES[keyof typeof IMAGE_SIZES]>();
  
  return {
    getImageSize: (imageUrl: string, altText: string = '') => {
      if (!cache.has(imageUrl)) {
        cache.set(imageUrl, getImageSize(imageUrl, altText));
      }
      return cache.get(imageUrl)!;
    },
    clearCache: () => cache.clear(),
  };
};

export const imageCache = createImageCache();



const formatChapterContent = (content: string) => {
  if (!content) return '';
  
  // Clean LangChain response data
  content = content.replace(
    /\{"lc":\d+,"type":"constructor","id":\["langchain_core"[^}]+\}/g, 
    ''
  );

  // Split content into paragraphs and images
  const parts = content.split(/!\[(.*?)\]\((.*?)\)/);
  let formattedContent = '';
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      // Text content
      formattedContent += parts[i].split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('\n');
    } else if (i % 3 === 1) {
      // Image
      const altText = parts[i];
      const imageUrl = parts[i + 1];
      
      if (imageUrl && !imageUrl.includes('undefined')) {
        formattedContent += `
          <figure class="image-figure">
            <div class="image-container">
              <img src="${imageUrl}" alt="${altText}" loading="lazy" />
            </div>
            <figcaption>${altText}</figcaption>
          </figure>
        `;
      }
    }
  }
  
  return formattedContent;
};

const bookStyles = `
  .table-of-contents {
    margin: 4rem auto;
    max-width: 800px;
    padding: 3rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    position: relative;
    overflow: hidden;
  }

  .table-of-contents::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    background: linear-gradient(90deg, #c6a477 0%, #deb887 100%);
  }

  .toc-header {
    text-align: center;
    font-size: 2.8rem;
    color: #2c3e50;
    margin-bottom: 3rem;
    font-family: 'Playfair Display', serif;
    position: relative;
    padding-bottom: 1.5rem;
  }

  .toc-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: #deb887;
  }

  .toc-line {
    display: flex;
    align-items: baseline;
    margin: 1rem 0;
    padding: 0.5rem 0;
    transition: all 0.3s ease;
  }

  .toc-line:hover {
    background: rgba(222, 184, 135, 0.1);
    padding-left: 1rem;
    border-radius: 4px;
  }

  .toc-title {
    flex: 1;
    font-family: 'Merriweather', serif;
    font-size: 1.1rem;
    color: #34495e;
    padding-right: 1rem;
  }

  .toc-dots {
    flex: 0 1 auto;
    margin: 0 0.5rem;
    border-bottom: 2px dotted #bdc3c7;
    min-width: 2rem;
  }

  .toc-page {
    flex: 0 0 auto;
    font-family: 'Lato', sans-serif;
    font-size: 1rem;
    color: #7f8c8d;
    padding: 0.2rem 0.5rem;
    background: #f8f9fa;
    border-radius: 3px;
    min-width: 2.5rem;
    text-align: center;
  }

  .toc-chapter {
    font-weight: 700;
    margin-top: 2rem;
    color: #2c3e50;
  }

  .toc-chapter .toc-title {
    font-size: 1.2rem;
    color: #2c3e50;
  }

  .toc-chapter .toc-page {
    background: #eee8d5;
    color: #657b83;
  }

  .toc-section {
    padding-left: 2rem;
    color: #34495e;
  }

  .toc-section .toc-title {
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    .table-of-contents {
      padding: 2rem;
      margin: 2rem 1rem;
    }

    .toc-header {
      font-size: 2.2rem;
      margin-bottom: 2rem;
    }

    .toc-line {
      margin: 0.8rem 0;
    }

    .toc-title {
      font-size: 1rem;
    }

    .toc-chapter .toc-title {
      font-size: 1.1rem;
    }

    .toc-section {
      padding-left: 1rem;
    }
  }

  @media (max-width: 480px) {
    .table-of-contents {
      padding: 1.5rem;
    }

    .toc-header {
      font-size: 1.8rem;
    }

    .toc-title {
      font-size: 0.9rem;
    }

    .toc-chapter .toc-title {
      font-size: 1rem;
    }

    .toc-page {
      font-size: 0.9rem;
    }
  }

  // Professional Book Design Styles
  .book-preview {
    background: linear-gradient(to bottom, #fff 0%, #f8f9fa 100%);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .cover-page {
    position: relative;
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    text-align: center;
  }

  .book-title {
    font-size: 3.5rem;
    color: #2c3e50;
    margin: 2rem 0;
    font-family: 'Playfair Display', serif;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
  }

  .author-name {
    font-size: 1.8rem;
    color: #34495e;
    margin: 1rem 0;
    font-family: 'Merriweather', serif;
  }

  .publisher-name {
    font-size: 1.2rem;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 1rem 0;
    font-family: 'Lato', sans-serif;
  }

  .chapter {
    margin: 4rem 0;
    padding: 3rem;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  .chapter-title {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 2rem;
    font-family: 'Playfair Display', serif;
    text-align: center;
    position: relative;
    padding-bottom: 1rem;
  }

  .chapter-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: #deb887;
  }

  .chapter-content {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #34495e;
    font-family: 'Merriweather', serif;
  }
`;

const formatHTMLContent = (content: string, coverImageUrl?: string, backCoverImageUrl?: string,selectedBook?:any) => {
  const bookInfo = extractBookInfo(content);
  
  return `
    <div class="book-preview">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Lato:wght@400;700&family=Playfair+Display:wght@400;700&display=swap');

        .book-preview {
          font-family: 'Merriweather', serif;
          line-height: 1.6;
          color: #2D3748;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #FFFFFF;
        }

        .cover-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 90vh;
          text-align: center;
          margin-bottom: 4rem;
          padding: 2rem;
          background-color: #F7FAFC;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .cover-page::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%);
          z-index: 1;
          pointer-events: none;
        }

        .cover-image {
          width: 100%;
          max-width: 500px;
          height: auto;
          margin-bottom: 2rem;
          border-radius: 4px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .book-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem;
          font-weight: 700;
          color: #1A202C;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 2rem 0 1rem;
          line-height: 1.2;
          position: relative;
          z-index: 2;
        }

        .author-name {
          font-family: 'Lato', sans-serif;
          font-size: 1.4rem;
          color: #4A5568;
          margin-bottom: 1rem;
          font-weight: 400;
          letter-spacing: 1px;
        }

        .publisher-name {
          font-family: 'Lato', sans-serif;
          font-size: 1.1rem;
          color: #718096;
          margin-bottom: 2rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .cover-design {
          font-family: 'Lato', sans-serif;
          font-size: 0.9rem;
          color: #718096;
          text-align: left;
          margin-top: 2rem;
          padding: 1.5rem;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          max-width: 600px;
        }

        .dedication {
          font-style: italic;
          text-align: center;
          margin: 4rem auto;
          max-width: 600px;
          color: #4A5568;
          font-size: 1.2rem;
          line-height: 1.8;
          padding: 3rem;
          background-color: #F7FAFC;
          border-radius: 8px;
          position: relative;
        }

        .dedication::before,
        .dedication::after {
          content: '"';
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          color: #CBD5E0;
          position: absolute;
        }

        .dedication::before {
          top: 1rem;
          left: 1rem;
        }

        .dedication::after {
          bottom: 1rem;
          right: 1rem;
          transform: rotate(180deg);
        }

        .preface {
          margin: 4rem 0;
          padding: 3rem;
          background-color: #F7FAFC;
          border-radius: 8px;
          font-size: 1.1rem;
        }

        .preface-section {
          margin-bottom: 2.5rem;
        }

        .preface-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: #1A202C;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .preface-subtitle {
          font-family: 'Lato', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: #2D3748;
          margin-bottom: 1rem;
        }

        .chapter {
          margin: 4rem 0;
          padding: 3rem;
          background-color: #FFFFFF;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .chapter-number {
          font-family: 'Times-Roman', serif;
          font-size: 1.4rem;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-align: center;
          margin-bottom: 1rem;
        }

        .chapter-title {
          font-family: 'Times-Roman', serif;
          font-size: 2.5rem;
          font-weight: bold;
          color: #1A202C;
          text-align: center;
          margin-bottom: 3rem;
          letter-spacing: 0.5px;
          line-height: 1.3;
        }

        .chapter-content {
          position: relative;
          overflow: hidden;
        }

        figure {
          break-inside: avoid;
          transition: transform 0.3s ease;
          position: relative;
          margin-bottom: 3rem;
        }

        .image-container {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          transition: transform 0.3s ease;
        }

        .image-container:hover {
          transform: scale(1.02);
        }

        .image-container img {
          width: 100%;
          height: auto;
          display: block;
          transition: filter 0.3s ease;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .image-container:hover .image-overlay {
          opacity: 1;
        }

        .zoom-icon {
          color: white;
          font-size: 2rem;
          transform: scale(0.8);
          transition: transform 0.3s ease;
        }

        .image-container:hover .zoom-icon {
          transform: scale(1);
        }

        figcaption {
          font-family: 'Lato', sans-serif;
          font-size: 0.95rem;
          color: #4A5568;
          margin-top: 1rem;
          text-align: center;
          font-style: italic;
          line-height: 1.4;
          padding: 0.5rem;
          background: #F7FAFC;
          border-radius: 6px;
        }

        .image-start {
          margin-top: 0;
        }

        .image-middle {
          margin: 3rem auto;
        }

        .image-end {
          margin-bottom: 0;
        }

        /* Random decorative elements */
        figure::before {
          content: '';
          position: absolute;
          width: 100px;
          height: 100px;
          background: linear-gradient(45deg, #FED7D7, #FED7E2);
          border-radius: 50%;
          opacity: 0.1;
          z-index: -1;
          transform: translate(-30%, -30%);
        }

        figure:nth-child(even)::before {
          right: 0;
          transform: translate(30%, -30%);
          background: linear-gradient(45deg, #C6F6D5, #B2F5EA);
        }

        /* Responsive styles */
        @media (max-width: 1024px) {
          figure {
            width: 85% !important;
            margin: 2rem auto !important;
            float: none !important;
          }
        }

        @media (max-width: 768px) {
          figure {
            width: 100% !important;
          }

          .image-container {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
        }

        /* Print styles */
        @media print {
          figure {
            break-inside: avoid;
            page-break-inside: avoid;
            width: 85% !important;
            margin: 2rem auto !important;
            float: none !important;
          }

          .image-overlay {
            display: none;
          }

          figure::before {
            display: none;
          }
        }
      </style>

      <!-- Modal for image preview -->
      <div id="imageModal" class="modal">
        <span class="modal-close">&times;</span>
        <img class="modal-content" id="modalImage">
        <div id="modalCaption"></div>
      </div>

      <style>
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          padding-top: 50px;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
        }

        .modal-content {
          margin: auto;
          display: block;
          max-width: 90%;
          max-height: 80vh;
          object-fit: contain;
        }

        .modal-close {
          position: absolute;
          right: 35px;
          top: 15px;
          color: #f1f1f1;
          font-size: 40px;
          font-weight: bold;
          cursor: pointer;
        }

        #modalCaption {
          margin: auto;
          display: block;
          width: 80%;
          text-align: center;
          color: #ccc;
          padding: 10px 0;
          height: 150px;
        }
      </style>

      <script>
        // Add click handlers for images
        document.addEventListener('DOMContentLoaded', function() {
          const modal = document.getElementById('imageModal');
          const modalImg = document.getElementById('modalImage');
          const modalCaption = document.getElementById('modalCaption');
          const closeBtn = document.getElementsByClassName('modal-close')[0];

          document.querySelectorAll('.image-container img').forEach(img => {
            img.onclick = function() {
              modal.style.display = 'block';
              modalImg.src = this.src;
              modalCaption.innerHTML = this.alt;
            }
          });

          closeBtn.onclick = function() {
            modal.style.display = 'none';
          }

          window.onclick = function(event) {
            if (event.target == modal) {
              modal.style.display = 'none';
            }
          }
        });
      </script>

      <div class="book-section">
        <div class="cover-page">
          ${coverImageUrl ? `<img src="${coverImageUrl}" alt="Book Cover" class="cover-image">` : ''}
          <h1 class="book-title">${bookInfo.title}</h1>
          <div class="author-name">By ${bookInfo.author}</div>
          <div class="publisher-name">${bookInfo.publisher}</div>
        </div>

        ${bookInfo.coverDesign ? `
          <div class="cover-design">
            ${bookInfo.coverDesign.split('\n')
              .filter(line => line.trim().length > 0)
              .map(line => line.startsWith('-') ? 
                `<div class="cover-design-item">${line.replace('-', '').trim()}</div>` : 
                `<div class="cover-design-text">${line}</div>`
              ).join('')}
          </div>
        ` : ''}
      </div>

      ${bookInfo.dedication ? `
        <div class="book-section">
          <h2 class="book-section-title">Dedication</h2>
          <div class="dedication">
            ${bookInfo.dedication}
          </div>
        </div>
      ` : ''}

      ${Object.values(bookInfo.preface).some(value => value) ? `
        <div class="book-section">
          <h2 class="book-section-title">Preface</h2>
          <div class="preface">
            ${Object.entries(bookInfo.preface).map(([key, value]) => value ? `
              <div class="preface-section">
                <h3 class="preface-subtitle">${key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                ${formatChapterContent(value)}
              </div>
            ` : '').join('')}
          </div>
        </div>
      ` : ''}

      ${bookInfo.tableOfContents.length > 0 ? `
        <div class="table-of-contents">
          <h2 class="toc-header">Table of Contents</h2>
          ${bookInfo.tableOfContents.map((item, index) => {
            const isChapter = item.title.toLowerCase().includes('chapter');
            return `
              <div class="toc-line ${isChapter ? 'toc-chapter' : 'toc-section'}">
                <span class="toc-title">${item.title}</span>
                <span class="toc-dots"></span>
                ${item.page ? `<span class="toc-page">${item.page}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${bookInfo.introduction ? `
        <div class="book-section">
          <h2 class="book-section-title">Introduction</h2>
          <div class="introduction">
            ${formatChapterContent(bookInfo.introduction)}
          </div>
        </div>
      ` : ''}

      ${bookInfo.chapters.map((chapter) => `
        <div class="chapter">
          <div class="chapter-number">Chapter ${chapter.number}</div>
          <h2 class="chapter-title">${chapter.title}</h2>
          <div class="chapter-content">
            ${formatChapterContent(chapter.content)}
          </div>
        </div>
      `).join('\n')}

      ${bookInfo.glossary.length > 0 ? `
        <div class="book-section">
          <h2 class="book-section-title">Glossary</h2>
          <div class="glossary">
            ${bookInfo.glossary.map(item => `
              <div class="glossary-item">
                <div class="glossary-term">${item.term}</div>
                <div class="glossary-definition">${item.definition}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${bookInfo.index.length > 0 ? `
        <div class="book-section">
          <h2 class="book-section-title">Index</h2>
          <div class="index-grid">
            ${bookInfo.index.map(item => `
              <div class="index-item">
                <span class="index-title">${item.title}</span>
                <span class="index-page">Page ${item.page}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${bookInfo.references.main.length > 0 || bookInfo.references.inspirations.length > 0 ? `
        <div class="book-section">
          <h2 class="book-section-title">References</h2>
          ${bookInfo.references.main.length > 0 ? `
            <div class="references-section">
              ${bookInfo.references.main.map(ref => `
                <div class="reference-item">${ref}</div>
              `).join('')}
            </div>
          ` : ''}
          ${bookInfo.references.inspirations.length > 0 ? `
            <h3 class="references-title">Inspirations</h3>
            <div class="references-section">
              ${bookInfo.references.inspirations.map(ref => `
                <div class="reference-item">${ref}</div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      ` : ''}
      <div class="book-section">
        <div class="book-section back-cover">

  ${backCoverImageUrl ? `<img src="${backCoverImageUrl}" alt="Book Cover" class="cover-image">` : ''}
        </div>
        </div>
      ${bookInfo.backCover.synopsis || bookInfo.backCover.authorBio ? `
        <div class="book-section back-cover">
          ${backCoverImageUrl ? `<img src="${backCoverImageUrl}" alt="Back Cover" class="back-cover-image">` : ''}
          <div class="back-cover-content">
            ${bookInfo.backCover.synopsis ? `
              <div class="synopsis">
                ${formatChapterContent(bookInfo.backCover.synopsis)}
              </div>
            ` : ''}
            ${bookInfo.backCover.authorBio ? `
              <div class="author-bio">
                ${formatChapterContent(bookInfo.backCover.authorBio)}
              </div>
            ` : ''}
          </div>
          <div class="book-meta">
            <p>A ${bookInfo.publisher} Publication</p>
            <p>Cover design by ${bookInfo.publisher} Design Team</p>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

interface BookPDFProps {
  selectedBook: any;
  content: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  bookStyles?: BookStyles;
}

const BookPDF: React.FC<BookPDFProps> = ({ 
  selectedBook,
  content, 
  coverImageUrl,
  backCoverImageUrl,
  bookStyles = defaultBookStyles 
}) => {
  const bookInfo = extractBookInfo(content, selectedBook);

  console.log("bookInfo",selectedBook)
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: '60pt 72pt', // Professional book margins
      fontFamily: 'Times-Roman'
    },
    coverPage: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      position: 'relative'
    },
    coverImage: {
      width: '100%',
      height: 'auto',
      maxWidth: 450,
      marginBottom: 40,
      objectFit: 'contain'
    },
    title: {
      fontSize: 42,
      fontFamily: 'Times-Bold',
      marginBottom: 24,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: '#1A202C'
    },
    author: {
      fontSize: 28,
      fontFamily: 'Times-Roman',
      marginBottom: 16,
      textAlign: 'center',
      color: '#2D3748'
    },
    publisher: {
      fontSize: 20,
      fontFamily: 'Times-Roman',
      marginBottom: 40,
      textAlign: 'center',
      color: '#4A5568'
    },
    tocPage: {
      padding: '40pt',
      position: 'relative'
    },
    tocTitle: {
      fontSize: 24,
      fontFamily: 'Times-Bold',
      marginBottom: 30,
      textAlign: 'center',
      color: '#1A202C'
    },
    tocItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    tocText: {
      fontSize: 12,
      fontFamily: 'Times-Roman',
      color: '#2D3748',
      flex: 1
    },
    tocDots: {
      borderBottom: '1pt dotted #CBD5E0',
      flex: 1,
      marginHorizontal: 8
    },
    tocPageNumber: {
      fontSize: 12,
      fontFamily: 'Times-Roman',
      color: '#718096'
    },
    chapterPage: {
      padding: '0',
      position: 'relative',
      width: '100%',
    },
    chapterHeader: {
      marginBottom: 48,
      textAlign: 'center',
    },
    chapterNumber: {
      fontSize: 20,
      fontFamily: 'Times-Roman',
      color: '#718096',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 2
    },
    chapterTitle: {
      fontSize: 36,
      fontFamily: 'Times-Bold',
      color: '#1A202C',
      marginBottom: 36
    },
    chapterContent: {
      fontSize: 11, // Standard book font size
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 12,
      columnGap: '24pt',
    },
    paragraph: {
      textIndent: '18pt', // Professional paragraph indentation
      marginBottom: '12pt',
    },
    bodyText: {
      fontSize: 11,
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: '12pt',
    },
    runningHeader: {
      position: 'absolute',
      top: 20,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 10,
      color: '#718096',
      fontFamily: 'Times-Italic'
    },
    pageNumber: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 11,
      color: '#4A5568',
      fontFamily: 'Times-Roman'
    },
    endOfPage: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: '#4A5568', // Grey color for the separator
    },
    backCoverPage: {
      padding: '40pt',
      position: 'relative',
      height: '100%'
    },
    backCoverImage: {
      width: '100%',
      height: 400,
      marginBottom: 30,
      objectFit: 'cover'
    },
    backCoverContent: {
      marginTop: 30
    },
    synopsis: {
      fontSize: 14,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 24,
      color: '#2D3748'
    },
    authorBio: {
      fontSize: 12,
      fontFamily: 'Times-Italic',
      lineHeight: 1.4,
      textAlign: 'justify',
      marginTop: 24,
      color: '#4A5568',
      borderTop: '1pt solid #E2E8F0',
      paddingTop: 16
    },
    divider: {
      borderBottom: '2pt solid #E2E8F0',
      marginVertical: 24,
      width: '30%',
      alignSelf: 'center'
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 10,
      color: '#718096',
      borderTop: '1pt solid #E2E8F0',
      paddingTop: 16
    },
    chapterImage: {
      width: '100%',
      marginVertical: 20,
    },
    imageCaption: {
      fontSize: 10,
      fontFamily: 'Times-Italic',
      color: '#666',
      textAlign: 'center',
      marginTop: '8pt',
    },
    imageContainer: {
      margin: '24pt 0',
      breakInside: 'avoid',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    diagramContainer: {
      margin: '20pt 0',
      padding: '16pt',
      backgroundColor: '#f8f9fa',
      borderRadius: '4pt',
      breakInside: 'avoid',
      width: '100%',
    },
    diagramImage: {
      width: '100%',
      maxHeight: '500pt',
      objectFit: 'contain',
      marginVertical: '12pt',
    },
    diagramCaption: {
      fontSize: 10,
      fontFamily: 'Times-Italic',
      color: '#4a5568',
      textAlign: 'center',
      marginTop: '8pt',
      paddingTop: '4pt',
      borderTop: '1pt solid #e2e8f0',
    },
    figureNumber: {
      fontSize: 10,
      fontFamily: 'Times-Bold',
      color: '#2d3748',
      marginBottom: '4pt',
    },
    figureHeader: {
      marginBottom: 8,
      borderBottom: '1pt solid #e2e8f0',
      paddingBottom: 4,
    },
    imageWrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: '12pt',
      position: 'relative',
    },
    textLeft: {
      textAlign: 'left',
    },
    textRight: {
      textAlign: 'right',
    },
    textJustify: {
      textAlign: 'justify',
    },
    singleColumn: {
    },
    doubleColumn: {
      columnGap: '24pt',
    },
  });

  // Update the renderChapterContent function
  const renderChapterContent = (content: string) => {
    let figureCount = 0;
    const parts = content.split(/!\[(.*?)\]\((.*?)\)/);
    
    return parts.map((part, index) => {
      if (index % 3 === 0) {
        // Text content
        return part.split('\n\n').map((paragraph, pIndex) => (
          <View key={pIndex} style={styles.paragraph}>
            <Text style={styles.bodyText}>{paragraph.trim()}</Text>
          </View>
        ));
      } else if (index % 3 === 1) {
        const altText = part;
        const imageUrl = parts[index + 1];
        
        if (!imageUrl || imageUrl.includes('undefined')) {
          return null;
        }

        figureCount++;
        const isDiagram = isDiagramOrFlowchart(altText);
        const dimensions = imageCache.getImageSize(imageUrl, altText);

        // Convert SVG URL to PNG URL for diagrams/flowcharts
        const processedImageUrl = imageUrl.endsWith('.svg') 
          ? imageUrl.replace('.svg', '.png') // Assuming you'll implement SVG to PNG conversion on backend
          : imageUrl;

        return (
          <View key={index} style={isDiagram ? styles.diagramContainer : styles.imageContainer}>
            <View style={styles.figureHeader}>
              <Text style={styles.figureNumber}>Figure {figureCount}</Text>
            </View>
            <View style={styles.imageWrapper}>
              <Image
                src={processedImageUrl}
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                }}
              />
            </View>
            <Text style={styles.imageCaption}>{altText}</Text>
          </View>
        );
      }
      return null;
    });
  };
console.log("bookInfo",bookInfo)

  // Update the Table of Contents page to show correct page numbers
  const calculatePageNumber = (chapterIndex: number) => {
    // Add 4 to account for cover, copyright, and TOC pages
    return chapterIndex + 4;
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page} >
        <View style={styles.coverPage}>
          
          {coverImageUrl && (
            <Image src={coverImageUrl} style={styles.coverImage} />
          )}
          <Text style={styles.title}>{bookInfo.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.author}>By {bookInfo.author}</Text>
          <Text style={styles.publisher}>{bookInfo.publisher}</Text>
        </View>
      </Page>

      {/* Copyright Page */}
      <Page size="A4" style={styles.page}>
        <View style={{ marginTop: 200 }}>
          <Text style={[styles.chapterContent, { textAlign: 'center', marginBottom: 24 }]}>
            Copyright © {new Date().getFullYear()} by {bookInfo.author}
          </Text>
          <Text style={[styles.chapterContent, { textAlign: 'center', marginBottom: 24 }]}>
            All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.
          </Text>
          <Text style={[styles.chapterContent, { textAlign: 'center', marginBottom: 16 }]}>
            Published by {bookInfo.publisher}
          </Text>
          <Text style={[styles.chapterContent, { textAlign: 'center' }]}>
            First Edition: {new Date().getFullYear()}
          </Text>
        </View>
      </Page>

      {/* Table of Contents */}
      <Page size="A4" style={styles.page}>
        <View style={styles.tocPage}>
          <Text style={styles.tocTitle}>Table of Contents</Text>
          {bookInfo.chapters.map((chapter, index) => (
            <View key={index} style={styles.tocItem}>
              <Text style={styles.tocText}>
                Chapter {chapter.number}: {chapter.title}
              </Text>
              <View style={styles.tocDots} />
              <Text style={styles.tocPageNumber}>{calculatePageNumber(index)}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Chapters */}
      {bookInfo.chapters.map((chapter, index) => (
        <Page 
          key={index} 
          size="A4" 
          style={styles.page}
          wrap
        >
          <View style={styles.chapterPage}>
            <Text style={styles.runningHeader}>
              {bookInfo.title} • Chapter {chapter.number}
            </Text>
            
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterNumber}>
                Chapter {chapter.number}
              </Text>
              <Text style={styles.chapterTitle}>
                {chapter.title}
              </Text>
            </View>

            <View>
              {renderChapterContent(chapter.content)}
            </View>
          </View>
          
          <Text
            style={styles.pageNumber}
            render={({ pageNumber }) => `${pageNumber}`}
            fixed
          />
        </Page>
      ))}

      {/* Glossary */}
      {bookInfo.glossary.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.chapterPage}>
            <Text style={styles.tocTitle}>Glossary</Text>
            {bookInfo.glossary.map((item, index) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <Text style={[styles.chapterContent, { fontFamily: 'Times-Bold' }]}>
                  {item.term}
                </Text>
                <Text style={styles.chapterContent}>
                  {item.definition}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}

      {/* Back Cover */}
      <Page size="A4" style={styles.page}>
      <View style={styles.coverPage}>
          {backCoverImageUrl && (
            <Image src={backCoverImageUrl} style={styles.backCoverImage} />
          )}
          
          <View style={styles.backCoverContent}>
            {bookInfo.backCover.synopsis && (
              <Text style={styles.synopsis}>
                {bookInfo.backCover.synopsis}
              </Text>
            )}
            
            {bookInfo.backCover.authorBio && (
              <Text style={styles.authorBio}>
                {selectedBook.authorBio}
              </Text>
            )}
          </View>

          <Text style={styles.footer}>
            {bookInfo.publisher} • {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent?: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  selectedBook: any;
}

export default function BookModal({ 
  isOpen, 
  onClose, 
  htmlContent, 
  coverImageUrl,
  backCoverImageUrl,
  selectedBook
}: BookModalProps) {
  console.log("title",selectedBook)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { addToast } = useToast(); // Use custom toast hook
  <ToastContainer />
  const [activeTab, setActiveTab] = useState<'preview' | 'pdf'>('preview');

  // Process the image URLs for preview
  const fullCoverImageUrl = coverImageUrl ? `${BASE_URl}/uploads/${coverImageUrl.replace(/\\/g, '/')}` : undefined;
  const fullBackCoverImageUrl = backCoverImageUrl ? `${BASE_URl}/uploads/${backCoverImageUrl.replace(/\\/g, '/')}` : undefined;

  const handleDownloadPdf = async () => {
    if (!htmlContent) {
      addToast('No content available',ToastType.ERROR);
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const pdfBlob = await pdf(
        <BookPDF 
          selectedBook={selectedBook}
          content={htmlContent} 
          coverImageUrl={fullCoverImageUrl}
          backCoverImageUrl={fullBackCoverImageUrl}
          bookStyles={defaultBookStyles}
        />
      ).toBlob();
      
      // Use selectedBook.bookTitle for the filename
      const fileName = selectedBook?.bookTitle ? 
        `${selectedBook.bookTitle.toLowerCase().replace(/\s+/g, '-')}.pdf` : 
        'book.pdf';
      
      saveAs(pdfBlob, fileName);
      addToast('PDF generated successfully!',ToastType.SUCCESS);
    } catch (error) {
      console.error('PDF generation failed:', error);
      addToast('Failed to generate PDF',ToastType.ERROR);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      onClick={handleBackdropClick}
    >
      <div className="container mx-auto h-full p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold text-gray-800">Book Preview</h2>
              <div className="flex rounded-lg border border-gray-200">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'preview'
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  } rounded-l-lg`}
                >
                  HTML Preview
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === 'pdf'
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  } rounded-r-lg`}
                >
                  PDF Preview
                </button>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {htmlContent && activeTab === 'preview' && (
              <div className="prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatHTMLContent(htmlContent, fullCoverImageUrl, fullBackCoverImageUrl,selectedBook)
                  }}
                />
              </div>
            )}
            {htmlContent && activeTab === 'pdf' && (
              <iframe
                src={URL.createObjectURL(
                  new Blob([formatHTMLContent(htmlContent, fullCoverImageUrl, fullBackCoverImageUrl)], { type: 'text/html' })
                )}
                className="w-full h-[600px] border-0"
                title="PDF Preview"
              />
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Generating PDF...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}