import React from 'react'
import { Document, Page, Text, View, StyleSheet, pdf, Image, Font } from '@react-pdf/renderer';
import { BASE_URl } from '@/constant';

// Define interfaces for better type safety
interface Chapter {
  id: number;
  chapterNo: number;
  chapterInfo: string;
  minWords: number;
  maxWords: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface BookData {
  id: number;
  bookTitle: string;
  authorName: string;
  authorBio: string;
  genre: string;
  language: string;
  targetAudience: string;
  characters: string;
  numberOfChapters: number;
  bookChapter?: Chapter[];
  additionalData?: {
    coverImageUrl?: string;
    backCoverImageUrl?: string;
    fullContent?: string;
  };
}

interface BookPDFProps {
  selectedBook: BookData;
  content: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
}

// Register default PDF fonts
Font.register({
  family: 'Times-Roman',
  fonts: [
    { src: 'Times-Roman' }
  ]
});

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' }
  ]
});

const PdfBook: React.FC<BookPDFProps> = ({ 
  selectedBook,
  content, 
  coverImageUrl,
  backCoverImageUrl,
   
}) => {
console.log("selectedBook============",selectedBook,content)
  const bookInfo = selectedBook;
  const chapters = selectedBook.bookChapter || [];
  const fullContent = selectedBook.additionalData?.fullContent || '';

  // Update the parseSection function to properly separate sections
  const parseSection = (content: string, sectionName: string) => {
    if (!content) return '';
    
    // Create a more specific regex pattern that stops at the next section
    const sectionHeaders = ['Dedication', 'Preface', 'Chapter', 'Glossary', 'References'];
    const nextSectionPattern = sectionHeaders
      .filter(header => header !== sectionName)
      .join('|');
      
    const regex = new RegExp(
      `${sectionName}[\\s\\n]*([\\s\\S]*?)(?=(?:${nextSectionPattern})|$)`,
      'i'
    );
    
    const match = content.match(regex);
    console.log(`Parsing ${sectionName}:`, match ? match[1].trim() : 'No match');
    
    return match ? match[1].trim() : '';
  };

  // Parse different sections
  const dedication = parseSection(fullContent, 'Dedication');
  const preface = parseSection(fullContent, 'Preface');
  const glossary = parseSection(fullContent, 'Glossary');
  const references = parseSection(fullContent, 'References');

  // Helper function to fix image URLs
  const getFixedImageUrl = (url: string) => {
    if (!url) return '';
    const cleanUrl = url.replace(/^.*?\/uploads\//, '');
    return `${BASE_URl}/uploads/${cleanUrl}`;
  };

  const styles = StyleSheet.create({
    page: {
      padding: 40,
      backgroundColor: '#FFFFFF',
      fontFamily: 'Times-Roman',
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
      fontSize: 32,
      fontFamily: 'Times-Roman',
      marginBottom: 10,
      textAlign: 'center',
    },
    author: {
      fontSize: 18,
      fontFamily: 'Helvetica',
      marginBottom: 5,
      color: '#4A5568',
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
      padding: '72pt 60pt',  // Professional margins
      position: 'relative'
    },
    chapterHeader: {
      marginBottom: 40,
      textAlign: 'center'
    },
    chapterNumber: {
      fontSize: 14,
      color: '#666666',
      marginBottom: 8,
      fontFamily: 'Times-Roman'
    },
    chapterTitle: {
      fontSize: 24,
      fontFamily: 'Times-Bold',
      marginBottom: 30
    },
    chapterContent: {
      marginTop: 20,
    },
    paragraph: {
      textIndent: '18pt', // Professional paragraph indentation
      marginBottom: '12pt',
    },
    bodyText: {
      fontSize: 12,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
      marginBottom: 12,
      textAlign: 'justify'
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
      fontSize: 10,
      bottom: 30,
      left: 0,
      right: 0,
      textAlign: 'center',
      color: '#666666'
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
      width: '80%',
      marginHorizontal: 'auto',
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
    sectionTitle: {
      fontSize: 24,
      fontFamily: 'Times-Roman',
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      padding: 40,
      fontFamily: 'Times-Roman',
    },
    glossaryItem: {
      fontSize: 12,
      fontFamily: 'Times-Roman',
      marginBottom: 8,
      lineHeight: 1.4,
    },
    reference: {
      fontSize: 12,
      fontFamily: 'Times-Roman',
      marginBottom: 8,
      lineHeight: 1.4,
    },
    backCover: {
      padding: '40pt',
      position: 'relative',
      height: '100%'
    },
  });

  // Update the renderChapterContent function to properly handle images
  const renderChapterContent = (content: string) => {
    let figureCount = 0;
    
    // First, clean up the content by removing asterisks and extra whitespace
    const cleanContent = content
      .replace(/\*/g, '')
      .trim();

    // Split content by image markdown pattern
    const parts = cleanContent.split(/(!\[(?:.*?)\]\((?:.*?)\))/);
    
    return parts.map((part, index) => {
      // Check if this part is an image markdown
      const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
      
      if (imageMatch) {
        figureCount++;
        const [_, altText, imageUrl] = imageMatch;
        
        console.log("Processing image:", imageUrl); // Debug log
        
        // Clean up the image URL
        const cleanImageUrl = imageUrl
          .replace(/[\r\n]/g, '')
          .trim();
        console.log("cleanImageUrl",cleanImageUrl)
        return (
          <View key={`figure-${figureCount}`} style={styles.imageContainer}>
            <View style={styles.figureHeader}>
              <Text style={styles.figureNumber}>Figure {figureCount}</Text>
            </View>
            <Image
                src={cleanImageUrl}
              />
            <View style={styles.imageWrapper}>
             
            </View>
            {altText && (
              <Text style={styles.imageCaption}>{altText}</Text>
            )}
          </View>
        );
      } else if (part.trim()) {
        // Regular text content
        return part.split('\n\n').map((paragraph, pIndex) => (
          <View key={`p-${index}-${pIndex}`} style={styles.paragraph}>
            <Text style={styles.bodyText}>{paragraph.trim()}</Text>
          </View>
        ));
      }
      return null;
    }).filter(Boolean);
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
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {coverImageUrl && (
            <Image 
              src={getFixedImageUrl(coverImageUrl)}
              style={styles.coverImage}
            />
          )}
          <Text style={styles.title}>{bookInfo.bookTitle}</Text>
          <Text style={styles.author}>By {bookInfo.authorName}</Text>
          <Text style={styles.publisher}>Cyberify Publications</Text>
        </View>
      </Page>

      {/* Dedication */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 30 }]}>Dedication</Text>
          {dedication ? (
            <View style={[styles.paragraph, { marginBottom: 20 }]}>
              <Text style={[styles.bodyText, { 
                lineHeight: 1.6,
                textAlign: 'center',
                fontSize: 12,
                fontFamily: 'Times-Roman',
                fontStyle: 'italic'
              }]}>
                {dedication}
              </Text>
            </View>
          ) : (
            <Text style={styles.bodyText}>No dedication available.</Text>
          )}
        </View>
      </Page>

      {/* Preface with improved styling */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 30 }]}>Preface</Text>
          {preface ? (
            preface.split('\n\n').map((para, index) => {
              const trimmedPara = para.trim();
              if (!trimmedPara) return null;
              
              return (
                <View key={index} style={[styles.paragraph, { marginBottom: 20 }]}>
                  <Text style={[styles.bodyText, { 
                    lineHeight: 1.6,
                    textAlign: 'justify',
                    fontSize: 12,
                    fontFamily: 'Times-Roman'
                  }]}>
                    {trimmedPara}
                  </Text>
                </View>
              );
            }).filter(Boolean)
          ) : (
            <Text style={styles.bodyText}>No preface available.</Text>
          )}
        </View>
      </Page>

      {/* Table of Contents */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 30 }]}>Table of Contents</Text>
          {chapters.map((chapter, index) => {
            const chapterTitle = chapter.chapterInfo.match(/Chapter \d+: (.+?)(?=\n)/)?.[0] || `Chapter ${index + 1}`;
            return (
              <View key={index} style={[styles.tocItem, { marginBottom: 10 }]}>
                <Text style={styles.tocText}>{chapterTitle}</Text>
                <View style={styles.tocDots} />
                <Text style={styles.tocPageNumber}>{calculatePageNumber(index)}</Text>
              </View>
            );
          })}
        </View>
      </Page>

      {/* Chapters */}
      {selectedBook.bookChapter?.map((chapter: any, index: number) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.chapterPage}>
            <View style={styles.chapterHeader}>
              <Text style={styles.chapterNumber}>
                Chapter {chapter.chapterNo}
              </Text>
              <Text style={styles.chapterTitle}>
                {chapter.chapterInfo
                  .replace(/\*/g, '')
                  .match(/Chapter \d+: (.+?)(?=\n)/)?.[0] 
                  || `Chapter ${chapter.chapterNo}`}
              </Text>
            </View>
            
            <View style={styles.chapterContent}>
              {renderChapterContent(chapter.chapterInfo)}
            </View>
          </View>
          
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}

      {/* Glossary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Glossary</Text>
          {glossary ? (
            glossary.split('\n').map((item, index) => {
              const [term, ...definitionParts] = item.split(':');
              const definition = definitionParts.join(':').trim();
              
              if (!term || !definition) return null;
              
              return (
                <View key={index} style={[styles.glossaryItem, { marginBottom: 12 }]}>
                  <Text style={{ fontWeight: 'bold', fontFamily: 'Times-Roman' }}>{term.trim()}: </Text>
                  <Text style={{ fontFamily: 'Times-Roman' }}>{definition}</Text>
                </View>
              );
            }).filter(Boolean)
          ) : (
            <Text style={styles.bodyText}>No glossary entries available.</Text>
          )}
        </View>
      </Page>

      {/* References - Exactly matching Glossary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>References</Text>
          {references ? (
            references.split('\n').map((item, index) => {
              // Use the exact same splitting logic as Glossary
              const [term, ...definitionParts] = item.split(':');
              const definition = definitionParts.join(':').trim();
              
              if (!term || !definition) return null;
              
              return (
                <View key={index} style={[styles.glossaryItem, { marginBottom: 12 }]}>
                  <Text style={{ fontWeight: 'bold', fontFamily: 'Times-Roman' }}>{term.trim()}: </Text>
                  <Text style={{ fontFamily: 'Times-Roman' }}>{definition}</Text>
                </View>
              );
            }).filter(Boolean)
          ) : (
            <Text style={styles.bodyText}>No references available.</Text>
          )}
        </View>
      </Page>

      {/* Back Cover */}
      <Page size="A4" style={styles.page}>
        <View style={styles.backCover}>
          {backCoverImageUrl && (
            <Image
              src={getFixedImageUrl(backCoverImageUrl)}
              style={styles.backCoverImage}
            />
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PdfBook


