import { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { Loader2, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { BASE_URl } from '@/constant';

interface BookStyles {
  titleSize: number;
  chapterSize: number;
  bodySize: number;
  lineHeight: number;
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Default styles that can be overridden from backend
const defaultBookStyles: BookStyles = {
  titleSize: 24,
  chapterSize: 18,
  bodySize: 12,
  lineHeight: 1.8,
  margins: {
    top: 72, // 2.5cm in points
    bottom: 72,
    left: 72,
    right: 72
  }
};

// Define the section types
type SectionType = 'title' | 'section' | 'chapter' | 'content';

// Interface for the base section
interface BaseSection {
  type: SectionType;
  content: string;
}

// Interface for chapter sections that may include a number
interface ChapterSection extends BaseSection {
  type: 'chapter';
  number?: string;
  content: string;
}

// Interface for other section types
interface OtherSection extends BaseSection {
  type: Exclude<SectionType, 'chapter'>;
  content: string;
}

// Union type for all section types
type Section = ChapterSection | OtherSection;

const cleanContent = (htmlContent: string): Section[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const sections: Section[] = [];
  let currentSection = '';
  
  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      currentSection += node.textContent;
      return;
    }

    switch (node.nodeName.toUpperCase()) {
      case 'TITLE-PAGE':
        if (currentSection) {
          sections.push({ type: 'content', content: currentSection.trim() } as Section);
          currentSection = '';
        }
        sections.push({ type: 'title', content: node.textContent?.trim() || '' } as Section);
        break;

      case 'SECTION-HEADING':
        if (currentSection) {
          sections.push({ type: 'content', content: currentSection.trim() } as Section);
          currentSection = '';
        }
        sections.push({ type: 'section', content: node.textContent?.trim() || '' } as Section);
        break;

      case 'CHAPTER-HEADING':
        if (currentSection) {
          sections.push({ type: 'content', content: currentSection.trim() } as Section);
          currentSection = '';
        }
        const chapterText = node.textContent?.trim() || '';
        const chapterMatch = chapterText.match(/Chapter\s+(\d+):\s*(.*)/i);
        if (chapterMatch) {
          sections.push({ 
            type: 'chapter', 
            number: chapterMatch[1],
            content: chapterMatch[2] || chapterText 
          } as ChapterSection);
        } else {
          sections.push({ 
            type: 'chapter', 
            content: chapterText 
          } as ChapterSection);
        }
        break;

      case 'CONTENT':
        currentSection += node.textContent;
        break;

      default:
        node.childNodes.forEach(child => processNode(child));
    }
  };

  doc.body.childNodes.forEach(node => processNode(node));
  
  if (currentSection) {
    sections.push({ type: 'content', content: currentSection.trim() } as Section);
  }
  
  return sections;
};

const BookPDF = ({ 
  content, 
  title, 
  coverImageUrl,
  bookStyles = defaultBookStyles 
}: { 
  content: string; 
  title: string;
  coverImageUrl?: string | null;
  bookStyles?: BookStyles;
}) => {
  const styles = StyleSheet.create({
    page: {
      padding: `${bookStyles.margins.top}pt ${bookStyles.margins.right}pt ${bookStyles.margins.bottom}pt ${bookStyles.margins.left}pt`,
      fontFamily: 'Times-Roman'
    },
    coverImage: {
      width: 300,  // Fixed width in points
      height: 400, // Fixed height in points
      marginHorizontal: 'auto',
      marginVertical: 20,
    },
    titleText: {
      fontSize: bookStyles.titleSize * 1.2,
      textAlign: 'center',
      marginBottom: 20,
      fontFamily: 'Times-Bold',
      textTransform: 'uppercase'
    },
    chapterWrapper: {
      marginTop: 40,
      marginBottom: 20,
    },
    chapterNumber: {
      fontSize: bookStyles.chapterSize * 0.8,
      textAlign: 'center',
      color: '#666',
      marginBottom: 8,
      fontFamily: 'Times-Bold',
    },
    chapterTitle: {
      fontSize: bookStyles.chapterSize,
      textAlign: 'center',
      fontFamily: 'Times-Bold',
      marginBottom: 30,
    },
    content: {
      fontSize: bookStyles.bodySize,
      lineHeight: bookStyles.lineHeight,
      textAlign: 'justify',
    },
    paragraph: {
      marginBottom: 12,
      textIndent: 36,
    },
    pageNumber: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      fontSize: 10,
      color: '#666666'
    }
  });

  // Split content into paragraphs
  const splitIntoParagraphs = (text: string) => {
    return text.split(/\n\n+/).filter(p => p.trim());
  };

  // Process sections to group content after chapters
  const processedSections = cleanContent(content).reduce((acc: any[], section, index) => {
    if (section.type === 'chapter') {
      // Start a new chapter group
      acc.push({
        type: 'chapter-group',
        chapter: section,
        content: []
      });
    } else if (section.type === 'content' && acc.length > 0 && acc[acc.length - 1].type === 'chapter-group') {
      // Add content to the last chapter group
      acc[acc.length - 1].content.push(section);
    } else {
      // Add other sections as is
      acc.push(section);
    }
    return acc;
  }, []);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flex: 1 }}>
          {/* Title and Cover Image */}
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <Text style={styles.titleText}>{title}</Text>
            {coverImageUrl && (
              <Image 
                src={coverImageUrl}
                style={styles.coverImage}
              />
            )}
          </View>

          {/* Content */}
          {processedSections.map((section, index) => {
            if (section.type === 'chapter-group') {
              return (
                <View key={index} style={styles.chapterWrapper}>
                  {/* Chapter Header */}
                  {section.chapter.number && (
                    <Text style={styles.chapterNumber}>
                      Chapter {section.chapter.number}
                    </Text>
                  )}
                  <Text style={styles.chapterTitle}>
                    {section.chapter.content}
                  </Text>

                  {/* Chapter Content */}
                  {section.content.map((contentSection: any, contentIndex: number) => (
                    <View key={`content-${contentIndex}`}>
                      {splitIntoParagraphs(contentSection.content).map((paragraph, pIndex) => (
                        <Text 
                          key={`p-${pIndex}`} 
                          style={[styles.content, styles.paragraph]}
                        >
                          {paragraph}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              );
            }

            // Handle non-chapter content
            if (section.type === 'content') {
              return splitIntoParagraphs(section.content).map((paragraph, pIndex) => (
                <Text 
                  key={`other-${index}-${pIndex}`} 
                  style={[styles.content, styles.paragraph]}
                >
                  {paragraph}
                </Text>
              ));
            }

            return null;
          })}
        </View>

        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} 
        />
      </Page>
    </Document>
  );
};

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent?: string;
  coverImageUrl?: string;
  title?: string;
}

const formatHTMLContent = (content: string) => {
  return `
    <div class="book-preview">
      <style>
        .book-preview {
          font-family: 'Open Sans', sans-serif;
          line-height: 1.8;
          color: #2D3748;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .chapter {
          margin-top: 3rem;
          page-break-before: always;
        }
        
        .chapter-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1A202C;
          margin-bottom: 2rem;
        }
        
        .section {
          margin-top: 2rem;
        }
        
        p {
          margin-bottom: 1.5rem;
          text-align: justify;
          font-size: 1rem;
        }
      </style>
      ${content.split('\n\n').map((section, index) => {
        const chapterMatch = section.match(/^Chapter \d+:\s*(.+)$/);
        
        if (chapterMatch) {
          const chapterTitle = chapterMatch[1].replace(/Chapter \d+/i, '').trim();
          return `
            <div class="chapter">
              <h2 class="chapter-title">${chapterTitle}</h2>
            </div>
          `;
        }
        
        if (section.startsWith('Introduction')) {
          return `
            <div class="section">
              <h2 class="chapter-title">Introduction</h2>
              <div>${section.replace('Introduction', '').trim()}</div>
            </div>
          `;
        }
        
        if (section.startsWith('Conclusion')) {
          return `
            <div class="section">
              <h2 class="chapter-title">Conclusion</h2>
              <div>${section.replace('Conclusion', '').trim()}</div>
            </div>
          `;
        }
        
        return `<p>${section}</p>`;
      }).join('\n')}
    </div>
  `;
};

export default function BookModal({ 
  isOpen, 
  onClose, 
  htmlContent, 
  coverImageUrl,
  title = 'Untitled Book' 
}: BookModalProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'pdf'>('preview');

  // Process the image URL for preview
  const fullImageUrl = coverImageUrl ?  `${BASE_URl}/uploads/${coverImageUrl.replace(/\\/g, '/')}`:
    null;
console.log("fullImageUrl",fullImageUrl)
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
          title={title} 
          coverImageUrl={fullImageUrl} // Pass the same URL used in preview
          bookStyles={defaultBookStyles}
        />
      ).toBlob();
      
      saveAs(pdfBlob, `${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
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
                {fullImageUrl && (
                  <img 
                    src={fullImageUrl}
                    alt="Book Cover"
                    className="mx-auto max-h-[300px] object-contain rounded-lg shadow-md mb-8"
                  />
                )}
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatHTMLContent(htmlContent)
                  }}
                />
              </div>
            )}
            {htmlContent && activeTab === 'pdf' && (
              <iframe
                src={URL.createObjectURL(
                  new Blob([formatHTMLContent(htmlContent)], { type: 'text/html' })
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