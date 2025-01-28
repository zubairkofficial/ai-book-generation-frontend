import { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer';
import { Loader2, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { BASE_URl } from '@/constant';

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
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  titleSize: number;
  chapterSize: number;
  bodySize: number;
  lineHeight: number;
  page: any;
  coverPage: any;
  coverImage: any;
  title: any;
  author: any;
  publisher: any;
  copyrightPage: any;
  copyrightText: any;
  section: any;
  chapterTitle: any;
  tocContent: any;
  dedicationPage: any;
  dedicationText: any;
  content: any;
  chapterNumber: any;
  backCoverPage: any;
  backCoverImage: any;
  backCoverContent: any;
  backCoverText: any;
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
  margins: {
    top: 72,
    right: 72,
    bottom: 72,
    left: 72
  },
  titleSize: 28,
  chapterSize: 20,
  bodySize: 12,
  lineHeight: 1.6,
  page: {
    padding: '72pt',
    fontFamily: 'Merriweather',
    backgroundColor: '#FFFFFF'
  },
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  coverImage: {
    width: 400,
    height: 500,
    marginBottom: 40,
    objectFit: 'contain'
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Merriweather',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#1A202C'
  },
  author: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Lato',
    color: '#2D3748'
  },
  publisher: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Lato',
    color: '#4A5568'
  },
  copyrightPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    padding: '0 72pt'
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Lato',
    color: '#4A5568'
  },
  section: {
    marginBottom: 40
  },
  chapterTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Merriweather',
    color: '#1A202C'
  },
  tocContent: {
    fontSize: 12,
    lineHeight: 2,
    fontFamily: 'Lato',
    color: '#2D3748'
  },
  dedicationPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
  },
  dedicationText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Merriweather',
    color: '#4A5568'
  },
  content: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'justify',
    fontFamily: 'Merriweather',
    color: '#2D3748'
  },
  chapterNumber: {
    fontSize: 14,
    textAlign: 'center',
    color: '#718096',
    marginBottom: 12,
    fontFamily: 'Lato',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  backCoverPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    padding: '72pt'
  },
  backCoverImage: {
    width: '100%',
    height: 300,
    marginBottom: 40,
    objectFit: 'cover'
  },
  backCoverContent: {
    flex: 1
  },
  backCoverText: {
    fontSize: 12,
    lineHeight: 1.6,
    textAlign: 'justify',
    fontFamily: 'Merriweather',
    color: '#2D3748'
  }
};


const extractBookInfo = (content: string): BookInfo => {
  const sections = content.split('\n\n');
  
  const bookInfo: BookInfo = {
    title: '',
    author: '',
    publisher: '',
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
  console.log("Author", bookInfo,sections);

  let currentChapter: { number: number; title: string; content: string } | null = null;
  let isCollectingChapterContent = false;
  let isPrefaceSection = false;

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
      
      if (cleanSection.includes('Coverage:')) {
        bookInfo.preface.coverage = cleanSection.split('Coverage:')[1].trim();
      } else if (cleanSection.includes('Use in the Curriculum:')) {
        bookInfo.preface.curriculum = cleanSection.split('Use in the Curriculum:')[1].trim();
      } else if (cleanSection.includes('Prerequisites:')) {
        bookInfo.preface.prerequisites = cleanSection.split('Prerequisites:')[1].trim();
      } else if (cleanSection.includes('Goals:')) {
        bookInfo.preface.goals = cleanSection.split('Goals:')[1].trim();
      } else if (cleanSection.includes('Acknowledgements:')) {
        bookInfo.preface.acknowledgements = cleanSection.split('Acknowledgements:')[1].trim();
        isPrefaceSection = false;
      }
    } else if (cleanSection.startsWith('Table of Contents') || cleanSection.startsWith('Contents')) {
      const lines = cleanSection.split('\n').slice(1);
      bookInfo.tableOfContents = lines.map(line => {
        const parts = line.split('.');
        if (parts.length >= 2) {
          const title = parts.slice(0, -1).join('.').trim();
          const page = parts[parts.length - 1].trim();
          return { title, page };
        }
        return { title: line.trim(), page: '' };
      }).filter(item => item.title);
    } else if (cleanSection.startsWith('Introduction')) {
      bookInfo.introduction = cleanSection.replace('Introduction', '').trim();
    } else if (cleanSection.startsWith('Chapter')) {
      // If we were collecting content for a previous chapter, save it
      if (currentChapter) {
        bookInfo.chapters.push(currentChapter);
      }

      // Start a new chapter
      const chapterMatch = cleanSection.match(/Chapter (\d+):\s*(.+)/);
      if (chapterMatch) {
        currentChapter = {
          number: parseInt(chapterMatch[1]),
          title: chapterMatch[2].trim(),
          content: ''
        };
        isCollectingChapterContent = true;
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
  if (currentChapter) {
    bookInfo.chapters.push(currentChapter);
  }

  return bookInfo;
};

const formatChapterContent = (content: string) => {
  if (!content) return '';
  return content.split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('\n');
};

const formatHTMLContent = (content: string, coverImageUrl?: string, backCoverImageUrl?: string) => {
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
          font-size: 1.1rem;
          line-height: 1.8;
          color: #2D3748;
          text-align: justify;
        }

        .chapter-content p {
          margin-bottom: 1.5rem;
          text-indent: 2rem;
        }

        .back-cover {
          margin: 4rem 0;
          padding: 3rem;
          background-color: #2D3748;
          color: #FFFFFF;
          border-radius: 8px;
          font-family: 'Merriweather', serif;
          line-height: 1.8;
          position: relative;
          overflow: hidden;
        }

        .back-cover-image {
          width: 100%;
          height: auto;
          max-height: 500px;
          object-fit: cover;
          margin-bottom: 2rem;
          border-radius: 4px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .back-cover-content {
          position: relative;
          z-index: 2;
          font-size: 1.1rem;
          line-height: 1.8;
        }

        .glossary-item,
        .index-item,
        .reference-item {
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #E2E8F0;
        }

        .glossary-term {
          font-family: 'Lato', sans-serif;
          font-weight: 700;
          color: #2D3748;
          margin-bottom: 0.5rem;
        }

        .glossary-definition {
          color: #4A5568;
          font-size: 1rem;
          line-height: 1.6;
        }

        .index-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .index-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          border-bottom: 1px solid #E2E8F0;
        }

        .index-page {
          color: #718096;
          font-family: 'Lato', sans-serif;
        }

        .references-section {
          margin: 2rem 0;
        }

        .references-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #1A202C;
          margin-bottom: 1rem;
        }

        .reference-item {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .reference-item::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #718096;
        }

        .book-section {
          margin: 4rem 0;
          padding: 3rem;
          background-color: #F7FAFC;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .book-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          color: #1A202C;
          text-align: center;
          margin-bottom: 2rem;
          letter-spacing: 0.5px;
        }

        .book-meta {
          font-family: 'Lato', sans-serif;
          color: #718096;
          font-size: 0.9rem;
          margin-top: 1rem;
          text-align: center;
        }

        .author-bio {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          font-style: italic;
        }

        @media (max-width: 768px) {
          .book-preview {
            padding: 1rem;
          }
          .book-title {
            font-size: 2rem;
          }
          .author-name {
            font-size: 1.2rem;
          }
          .publisher-name {
            font-size: 1rem;
          }
          .chapter-title {
            font-size: 1.6rem;
          }
          .chapter {
            padding: 1.5rem;
          }
          .dedication,
          .preface,
          .back-cover {
            padding: 2rem;
          }
          .cover-design {
            font-size: 0.8rem;
            padding: 1rem;
          }
        }

        @media (max-width: 480px) {
          .book-title {
            font-size: 1.8rem;
          }
          .chapter-content {
            font-size: 1rem;
          }
          .dedication::before,
          .dedication::after {
            font-size: 3rem;
          }
        }

        @media print {
          .book-preview {
            max-width: none;
            padding: 0;
          }
          .chapter {
            page-break-before: always;
          }
          @page {
            margin: 2.5cm;
          }
          .cover-page,
          .dedication,
          .preface,
          .chapter,
          .back-cover {
            background-color: #FFFFFF;
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>

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
        <div class="book-section">
          <h2 class="book-section-title">Table of Contents</h2>
          <div class="table-of-contents">
            ${bookInfo.tableOfContents.map(item => `
              <div class="toc-line">
                <span class="toc-title">${item.title}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">${item.page}</span>
              </div>
            `).join('')}
          </div>
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
            ${chapter.content.split('\n\n')
              .map(paragraph => `<p>${paragraph.trim()}</p>`)
              .join('\n')}
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
  ${backCoverImageUrl ? `<img src="${backCoverImageUrl}" alt="Book Cover" class="cover-image">` : ''}
        
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
  content: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  bookStyles?: BookStyles;
}

const BookPDF: React.FC<BookPDFProps> = ({ 
  content, 
  coverImageUrl,
  backCoverImageUrl,
  bookStyles = defaultBookStyles 
}) => {
  const bookInfo = extractBookInfo(content);
  
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 40,
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
      padding: '40pt',
      position: 'relative'
    },
    chapterHeader: {
      marginBottom: 36,
      textAlign: 'center'
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
      fontSize: 12,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 16,
      paddingHorizontal: 16
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
    }
  });

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
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
              <Text style={styles.tocPageNumber}>{index + 3}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Chapters */}
      {bookInfo.chapters.map((chapter, index) => (
        <Page key={index} size="A4" style={styles.page}>
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

            {chapter.content.split('\n\n').map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.chapterContent}>
                {paragraph.trim()}
              </Text>
            ))}

<Text
  style={styles.pageNumber}
  render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
  fixed
/>

          </View>
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
        <View style={styles.backCoverPage}>
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
                {bookInfo.backCover.authorBio}
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
  title?: string;
}

export default function BookModal({ 
  isOpen, 
  onClose, 
  htmlContent, 
  coverImageUrl,
  backCoverImageUrl,
  title = 'Untitled Book' 
}: BookModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'pdf'>('preview');

  // Process the image URLs for preview
  const fullCoverImageUrl = coverImageUrl ? `${BASE_URl}/uploads/${coverImageUrl.replace(/\\/g, '/')}` : undefined;
  const fullBackCoverImageUrl = backCoverImageUrl ? `${BASE_URl}/uploads/${backCoverImageUrl.replace(/\\/g, '/')}` : undefined;

  const handleDownloadPdf = async () => {
    if (!htmlContent) {
      toast.error('No content available');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const pdfBlob = await pdf(
        <BookPDF 
          content={htmlContent} 
          coverImageUrl={fullCoverImageUrl}
          backCoverImageUrl={fullBackCoverImageUrl}
          bookStyles={defaultBookStyles}
        />
      ).toBlob();
      
      const bookInfo = extractBookInfo(htmlContent);
      const fileName = bookInfo.title ? 
        `${bookInfo.title.toLowerCase().replace(/\s+/g, '-')}.pdf` : 
        `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      
      saveAs(pdfBlob, fileName);
      toast.success('PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
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
                    __html: formatHTMLContent(htmlContent, fullCoverImageUrl, fullBackCoverImageUrl)
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