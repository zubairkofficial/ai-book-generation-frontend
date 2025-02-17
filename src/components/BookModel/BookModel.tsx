import { useState, useEffect } from 'react';
import {  pdf, Font } from '@react-pdf/renderer';
import { Loader2, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { BASE_URl, ToastType } from '@/constant';
import { useToast } from '@/context/ToastContext';
import ToastContainer from '@/components/Toast/ToastContainer'; // Import custom ToastContainer
import PdfBook from './PdfBook';
import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { createRoot } from 'react-dom/client';

// Register custom fonts
Font.register({
  family: 'Merriweather',
  src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52_wFZWMf6.ttf',
});

Font.register({
  family: 'Lato',
  src: 'https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwiPHA.ttf',
});



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
    // Add any missing book bookChapter
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

const ChapterContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className={cn(
      "prose prose-amber max-w-none",
      "prose-headings:font-serif prose-headings:text-gray-900",
      "prose-h1:text-3xl prose-h1:mb-4 prose-h1:font-bold",
      "prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4",
      "prose-h3:text-xl prose-h3:text-amber-700 prose-h3:mt-6 prose-h3:mb-4",
      "prose-p:text-gray-700 prose-p:leading-relaxed",
      "prose-strong:text-gray-900",
      "prose-ul:list-disc prose-ul:pl-6",
      "prose-li:text-gray-700 prose-li:my-1",
      "prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:pl-4 prose-blockquote:italic"
    )}>
      <ReactMarkdown
        components={{
          img: ({ node, ...props }) => (
            <figure className="my-8">
              <img
                {...props}
                className="w-full rounded-lg shadow-lg"
                loading="lazy"
              />
              {props.alt && (
                <figcaption className="text-center mt-2 text-gray-600 italic">
                  {props.alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const formatHTMLContent = (content: string, coverImageUrl?: string, backCoverImageUrl?: string, selectedBook?: any) => {
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

      ${selectedBook.bookChapter.length > 0 ? `
        <div class="table-of-contents">
          <h2 class="toc-header">Table of Contents</h2>
          ${selectedBook.bookChapter.map((chapter: { chapterInfo: string; page: any; }, index: number) => {
            const chapterRegex = /Chapter \d+: (.+?)(?=\n)/g;
            const matches = [...chapter.chapterInfo.matchAll(chapterRegex)];
            
            let chapterTitle = 'Untitled Chapter';
            if (matches.length >= 2) {
              chapterTitle = matches[1][0];
            } else if (matches.length === 1) {
              chapterTitle = matches[0][0];
            }
            
            const isChapter = chapterTitle.toLowerCase().includes('chapter');
            
            return `
              <div class="toc-line ${isChapter ? 'toc-chapter' : 'toc-section'}">
                <span class="toc-title">${chapterTitle}</span>
                <span class="toc-dots"></span>
                ${chapter.page ? `<span class="toc-page">${chapter.page}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}

      ${selectedBook.bookChapter.map((chapter: { chapterNo: any; chapterInfo: string; }) => {
        const chapterTitle = [...chapter.chapterInfo?.matchAll(/Chapter \d+: (.+?)(?=\n)/g) || []][0]?.[0] || 'Chapter Not Found';
        
        return `
          <div class="chapter">
            <div class="chapter-number">
              ${chapterTitle}
            </div>
            <div class="chapter-content">
              <div id="chapter-${chapter.chapterNo}"></div>
            </div>
          </div>
        `;
      }).join('\n')}

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

export default function BookModal({ 
  isOpen, 
  onClose, 
  htmlContent, 
  coverImageUrl,
  backCoverImageUrl,
  selectedBook
}: BookModalProps) {
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
        <PdfBook 
          selectedBook={selectedBook}
          content={htmlContent} 
          coverImageUrl={fullCoverImageUrl}
          backCoverImageUrl={fullBackCoverImageUrl}
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

  // Add useEffect to render markdown content after HTML is mounted
  useEffect(() => {
    if (selectedBook?.bookChapter) {
      selectedBook.bookChapter.forEach((chapter: { chapterNo: any; chapterInfo: string; }) => {
        const container = document.getElementById(`chapter-${chapter.chapterNo}`);
        if (container) {
          const root = createRoot(container);
          root.render(<ChapterContent content={chapter.chapterInfo} />);
        }
      });
    }
  }, [selectedBook, htmlContent]);

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
            {/* {htmlContent && activeTab === 'pdf' && (
              <iframe
                src={URL.createObjectURL(
                  new Blob([formatHTMLContent(htmlContent, fullCoverImageUrl, fullBackCoverImageUrl)], { type: 'text/html' })
                )}
                className="w-full h-[600px] border-0"
                title="PDF Preview"
              />
            )} */}
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