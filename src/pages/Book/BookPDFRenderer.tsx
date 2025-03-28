import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFDownloadLink,
  Image,
  Font,
  Link
} from '@react-pdf/renderer';
import { BookData } from './BookModal';
import { BASE_URl } from '@/constant';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

// Use Times-Roman as the main font (equivalent to Times New Roman in PDF)
Font.register({
  family: 'Times-Roman',
  // Built-in font
});

Font.register({
  family: 'Times-Bold',
  // Built-in font
});

Font.register({
  family: 'Times-Italic',
  // Built-in font
});

Font.register({
  family: 'Times-BoldItalic',
  // Built-in font
});

Font.register({
  family: 'Helvetica',
  // Built-in font
});

Font.register({
  family: 'Helvetica-Bold',
  // Built-in font
});

// Create professional styles matching BookModal styling exactly
const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: 'white',
    fontFamily: 'Times-Roman',
  },
  nightModePage: {
    padding: 50,
    backgroundColor: '#1a1a1a',
    fontFamily: 'Times-Roman',
    color: '#f5f5f5',
  },
  coverPage: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    textAlign: 'center',
    padding: 50,
    backgroundColor: '#FFFBF5',
  },
  nightModeCoverPage: {
    backgroundColor: '#1a1a1a',
    color: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    textAlign: 'center',
    padding: 50,
  },
  coverImage: {
    width: 'auto',
    maxWidth: 300,
    maxHeight: 400,
    marginBottom: 40,
    objectFit: 'contain',
    borderRadius: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1C2833',
  },
  nightModeTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#f5f5f5',
  },
  authorName: {
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'Helvetica',
    color: '#566573',
  },
  nightModeAuthorName: {
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'Helvetica',
    color: '#b3b3b3',
  },
  // Match BookModal amber styling
  chapterTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#5D4037',
    borderBottom: '1 solid #D7CCC8',
    paddingBottom: 8,
  },
  nightModeChapterTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#E8AC4B', // Amber color for night mode
    borderBottom: '1 solid #424242',
    paddingBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#5D4037',
  },
  nightModeSectionHeader: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#E8AC4B', // Amber color for night mode
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 20,
    borderBottom: '1 solid #EFEBE9',
  },
  nightModePageHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 20,
    borderBottom: '1 solid #333333',
  },
  pageHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#5D4037',
  },
  nightModePageHeaderText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#E8AC4B', // Amber color for night mode
  },
  pageNumber: {
    fontSize: 10,
    color: '#5D4037',
    padding: '2 8',
    backgroundColor: '#EFEBE9',
    borderRadius: 12,
  },
  nightModePageNumber: {
    fontSize: 10,
    color: '#E8AC4B', // Amber color for night mode
    padding: '2 8',
    backgroundColor: '#333333',
    borderRadius: 12,
  },
  content: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 1.8,
    fontFamily: 'Times-Roman',
  },
  paragraph: {
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 1.8,
    fontFamily: 'Times-Roman',
    textAlign: 'justify',
  },
  nightModeParagraph: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 1.8,
    color: '#f5f5f5',
    textAlign: 'justify',
    fontFamily: 'Times-Roman',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    fontSize: 10,
    borderTop: '1 solid #EFEBE9',
    color: '#777777',
  },
  nightModeFooter: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    fontSize: 10,
    borderTop: '1 solid #333333',
    color: '#888888',
  },
  // Match BookModal watermark styling
  pageNumberWatermark: {
    position: 'absolute',
    right: 30,
    bottom: 100,
    fontSize: 40,
    color: '#f5f5f5',
    opacity: 0.2,
  },
  nightModePageNumberWatermark: {
    position: 'absolute',
    right: 30,
    bottom: 100,
    fontSize: 40,
    color: '#333333',
    opacity: 0.2,
  },
  // Improved image styles
  image: {
    maxWidth: '90%',
    marginHorizontal: 'auto',
    marginVertical: 12,
    objectFit: 'contain',
    borderRadius: 4,
  },
  imageCaption: {
    fontSize: 10,
    fontStyle: 'italic',
    fontFamily: 'Times-Italic',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    color: '#666666',
  },
  nightModeImageCaption: {
    fontSize: 10,
    fontStyle: 'italic',
    fontFamily: 'Times-Italic',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    color: '#b0b0b0',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    width: 12,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Times-Roman',
  },
  bulletList: {
    marginVertical: 10,
  },
  orderedListItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderedListNumber: {
    width: 20,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  },
  orderedListText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 1.5,
    fontFamily: 'Times-Roman',
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tocText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Times-Roman',
  },
  tocDots: {
    flex: 3,
    fontSize: 8,
    textAlign: 'center',
    marginHorizontal: 5,
    color: '#ADB1B5',
    fontFamily: 'Times-Roman',
  },
  tocPage: {
    width: 25,
    fontSize: 12,
    textAlign: 'right',
    fontFamily: 'Times-Roman',
  },
  // General utility classes
  placeholderCover: {
    width: 300,
    height: 400,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderRadius: 4,
  },
  placeholderText: {
    color: '#888888',
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  nightModePlaceholderText: {
    color: '#777777',
    fontSize: 16,
    fontFamily: 'Helvetica',
  },
  copyrightContent: {
    marginTop: 150,
    marginBottom: 20,
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Times-Roman',
  },
});

// Enhanced markdown renderer that properly handles formatting
const renderMarkdown = (markdown: string | undefined, nightMode = false) => {
  if (!markdown) return <Text></Text>;
  
  // Process the markdown content
  const content = [];
  const lines = markdown.split('\n');
  
  let inList = false;
  let listItems = [];
  let inCodeBlock = false;
  let codeContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        continue;
      } else {
        inCodeBlock = false;
        content.push(
          <View 
            key={`code-${i}`} 
            style={{ 
              backgroundColor: nightMode ? '#2d2d2d' : '#f5f5f5', 
              padding: 10, 
              marginVertical: 10,
              borderRadius: 4,
              fontFamily: 'Courier'
            }}
          >
            {codeContent.map((code, idx) => (
              <Text 
                key={idx} 
                style={{ 
                  fontSize: 10, 
                  fontFamily: 'Courier',
                  color: nightMode ? '#e0e0e0' : '#333333'
                }}
              >
                {code}
              </Text>
            ))}
          </View>
        );
        codeContent = [];
        continue;
      }
    }
    
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    
    // Handle image syntax ![alt](url)
    const imageMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      const altText = imageMatch[1];
      let imageUrl = imageMatch[2];
      
      // Handle relative paths by prepending BASE_URL
      if (imageUrl.startsWith('./') || imageUrl.startsWith('../') || !imageUrl.match(/^(https?:\/\/|\/)/)) {
        imageUrl = `${BASE_URl}/${imageUrl.replace(/^\.\//, '')}`;
      }
      
      // If URL starts with /uploads/, prepend BASE_URL
      if (imageUrl.startsWith('/uploads/')) {
        imageUrl = `${BASE_URl}${imageUrl}`;
      }
      
      content.push(
        <View key={`img-${i}`} style={{ alignItems: 'center', marginVertical: 10 }}>
          <Image src={imageUrl} style={styles.image} />
          {altText && (
            <Text style={nightMode ? styles.nightModeImageCaption : styles.imageCaption}>
              {altText}
            </Text>
          )}
        </View>
      );
      continue;
    }
    
    // Handle headers (# Header)
    if (line.trim().startsWith('#')) {
      const text = line.trim().replace(/^#+\s+/, '');
      
      // Format the header text (handle bold and italic)
      const formattedText = formatText(text, nightMode);
      
      const headerFontSizes = {
        1: 22,
        2: 20,
        3: 18,
        4: 16,
        5: 14,
        6: 12
      };
      
      content.push(
        <Text 
          key={`header-${i}`} 
          style={{
            fontSize:  20,
           
            fontFamily: 'Times-Bold',
            color: nightMode ? '#e0e0e0' : '#5D4037',
          }}
        >
          {formattedText}
        </Text>
      );
      continue;
    }
    
    // Handle unordered lists (* item or - item)
    if (line.trim().match(/^[*-]\s/) || line.trim().match(/^\+\s/)) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      
      const itemText = line.trim().replace(/^[*\-+]\s+/, '');
      listItems.push(formatText(itemText, nightMode));
      
      // If this is the last line or the next line is not a list item
      if (i === lines.length - 1 || !lines[i + 1].trim().match(/^[*\-+]\s/)) {
        inList = false;
        content.push(
          <View key={`list-${i}`} style={{ marginBottom: 10, marginTop: 10 }}>
            {listItems.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 5 }}>
                <Text style={{ width: 15, fontFamily: 'Times-Roman' }}>•</Text>
                <Text style={{ 
                  flex: 1, 
                  fontFamily: 'Times-Roman',
                  color: nightMode ? '#e0e0e0' : '#333333'
                }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        );
        listItems = [];
      }
      continue;
    }
    
    // Handle ordered lists (1. Item)
    if (line.trim().match(/^\d+\.\s/)) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      
      const numMatch = line.trim().match(/^(\d+)\.\s/);
      const num = numMatch ? numMatch[1] : (listItems.length + 1).toString();
      const itemText = line.trim().replace(/^\d+\.\s+/, '');
      
      listItems.push({ num, text: formatText(itemText, nightMode) });
      
      // If this is the last line or the next line is not an ordered list item
      if (i === lines.length - 1 || !lines[i + 1].trim().match(/^\d+\.\s/)) {
        inList = false;
        content.push(
          <View key={`olist-${i}`} style={{ marginBottom: 10, marginTop: 10 }}>
            {listItems.map((item, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 5 }}>
                <Text style={{ 
                  width: 20, 
                  fontFamily: 'Times-Roman',
                  color: nightMode ? '#e0e0e0' : '#333333'
                }}>
                  {item.num}.
                </Text>
                <Text style={{ 
                  flex: 1, 
                  fontFamily: 'Times-Roman',
                  color: nightMode ? '#e0e0e0' : '#333333'
                }}>
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        );
        listItems = [];
      }
      continue;
    }
    
    // Handle horizontal rule (--- or ***)
    if (line.trim().match(/^(\*{3,}|-{3,}|_{3,})$/)) {
      content.push(
        <View 
          key={`hr-${i}`} 
          style={{ 
            borderBottomWidth: 1, 
            borderBottomColor: nightMode ? '#555555' : '#cccccc', 
            marginVertical: 15 
          }} 
        />
      );
      continue;
    }
    
    // Handle blockquotes (> text)
    if (line.trim().startsWith('>')) {
      const quoteText = line.trim().substring(1).trim();
      content.push(
        <View 
          key={`quote-${i}`} 
          style={{ 
            borderLeftWidth: 3, 
            borderLeftColor: nightMode ? '#555555' : '#cccccc', 
            paddingLeft: 10, 
            marginVertical: 10,
            backgroundColor: nightMode ? '#292929' : '#f9f9f9',
            padding: 10,
          }}
        >
          <Text style={{ 
            fontStyle: 'italic',
            color: nightMode ? '#d0d0d0' : '#555555',
            fontFamily: 'Times-Italic',
          }}>
            {formatText(quoteText, nightMode)}
          </Text>
        </View>
      );
      continue;
    }
    
    // Handle regular paragraphs
    if (line.trim() !== '') {
      const processedText = formatText(line.trim(), nightMode);
      
      content.push(
        <Text 
          key={`p-${i}`} 
          style={{
            marginBottom: 10,
            fontSize: 12,
            lineHeight: 1.8,
            fontFamily: 'Times-Roman',
            color: nightMode ? '#e0e0e0' : '#333333',
            textAlign: 'justify'
          }}
        >
          {processedText}
        </Text>
      );
      continue;
    }
    
    // Handle empty lines (add spacing)
    if (line.trim() === '' && i > 0 && lines[i-1].trim() !== '') {
      content.push(
        <View key={`space-${i}`} style={{ height: 10 }} />
      );
    }
  }
  
  return content.length > 0 ? content : <Text></Text>;
};

// Helper function to format text (bold, italic, links, etc.)
const formatText = (text: string, nightMode = false) => {
  if (!text) return null;
  
  // Split the text by formatting markers
  const parts = [];
  let remainingText = text;
  let boldMatch, italicMatch, linkMatch, codeMatch;
  
  // Process the text to find formatting
  while (remainingText.length > 0) {
    // Bold: **text**
    boldMatch = remainingText.match(/^\*\*(.*?)\*\*/);
    if (boldMatch) {
      parts.push({ 
        type: 'bold', 
        content: boldMatch[1], 
        raw: boldMatch[0] 
      });
      remainingText = remainingText.substring(boldMatch[0].length);
      continue;
    }
    
    // Italic: _text_ or *text*
    italicMatch = remainingText.match(/^_(.*?)_/) || remainingText.match(/^\*(.*?)\*/);
    if (italicMatch) {
      parts.push({ 
        type: 'italic', 
        content: italicMatch[1],
        raw: italicMatch[0]
      });
      remainingText = remainingText.substring(italicMatch[0].length);
      continue;
    }
    
    // Link: [text](url)
    linkMatch = remainingText.match(/^\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      parts.push({ 
        type: 'link', 
        content: linkMatch[1], 
        url: linkMatch[2],
        raw: linkMatch[0]
      });
      remainingText = remainingText.substring(linkMatch[0].length);
      continue;
    }
    
    // Inline code: `code`
    codeMatch = remainingText.match(/^`(.*?)`/);
    if (codeMatch) {
      parts.push({ 
        type: 'code', 
        content: codeMatch[1],
        raw: codeMatch[0]
      });
      remainingText = remainingText.substring(codeMatch[0].length);
      continue;
    }
    
    // Regular text (until next formatting)
    const nextFormat = remainingText.search(/(\*\*|_|\*|\[|`)/);
    if (nextFormat === -1) {
      parts.push({ 
        type: 'text', 
        content: remainingText,
        raw: remainingText
      });
      remainingText = '';
    } else {
      parts.push({ 
        type: 'text', 
        content: remainingText.substring(0, nextFormat),
        raw: remainingText.substring(0, nextFormat)
      });
      remainingText = remainingText.substring(nextFormat);
    }
  }
  
  // Render the formatted parts
  return parts.map((part, index) => {
    switch (part.type) {
      case 'bold':
        return (
          <Text key={index} style={{ fontFamily: 'Times-Bold' }}>
            {formatText(part.content, nightMode)}
          </Text>
        );
      case 'italic':
        return (
          <Text key={index} style={{ fontFamily: 'Times-Italic' }}>
            {formatText(part.content, nightMode)}
          </Text>
        );
      case 'link':
        return (
          <Link key={index} src={part.url} style={{ color: nightMode ? '#6bb9ff' : '#0066cc', textDecoration: 'underline' }}>
            {formatText(part.content, nightMode)}
          </Link>
        );
      case 'code':
        return (
          <Text key={index} style={{ 
            fontFamily: 'Courier', 
            backgroundColor: nightMode ? '#333333' : '#f0f0f0',
            color: nightMode ? '#f5f5f5' : '#333333',
            padding: 2
          }}>
            {part.content}
          </Text>
        );
      case 'text':
      default:
        return part.content;
    }
  });
};

// Generate table of contents
const renderTableOfContents = (book: BookData, nightMode: boolean = false) => {
  if (!book.bookChapter || book.bookChapter.length === 0) return null;
  
  return book.bookChapter.map((chapter, index) => (
    <View key={`toc-${index}`} style={styles.tocItem}>
      <Text style={nightMode ? { ...styles.tocPage, color: '#f5f5f5' } : styles.tocPage}>
        {5 + index + 
          (book.additionalData?.introduction ? 1 : 0) + 
          (book.additionalData?.preface ? 1 : 0) +
          (book.additionalData?.tableOfContents ? 1 : 0)}
      </Text>
    </View>
  ));
};

// Document component with night mode option
const BookPDF = ({ book, nightMode = false }: { book: BookData; nightMode?: boolean }) => {
  // Add safety checks
  if (!book) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>No book data available</Text>
        </Page>
      </Document>
    );
  }

  const authorName = book.authorName || 'Unknown Author';
  const bookTitle = book.bookTitle || 'Untitled Book';
  const additionalData = book.additionalData || {};
  const chapters = book.bookChapter || [];
  
  // Calculate total pages for page numbering
  const totalPages = 2 + (chapters?.length || 0) + 
    (additionalData.dedication ? 1 : 0) +
    (additionalData.introduction ? 1 : 0) + 
    (additionalData.preface ? 1 : 0) +
    (additionalData.tableOfContents ? 1 : 0) +
    (book?.glossary ? 1 : 0) +
    (book?.index ? 1 : 0) +
    (book?.references ? 1 : 0) +
    (additionalData?.backCoverImageUrl ? 1 : 0);

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={nightMode ? styles.nightModeCoverPage : styles.coverPage}>
        <View style={nightMode ? styles.nightModeCoverPage : styles.coverPage}>
          {additionalData?.coverImageUrl ? (
            <Image
              src={`${BASE_URl}/uploads/${additionalData.coverImageUrl}`}
              style={styles.coverImage}
              cache={false}
            />
          ) : (
            <View style={styles.placeholderCover}>
              <Text style={nightMode ? styles.nightModePlaceholderText : styles.placeholderText}>
                No Cover Available
              </Text>
            </View>
          )}
          <Text style={nightMode ? styles.nightModeTitle : styles.title}>
            {bookTitle}
          </Text>
          <Text style={nightMode ? styles.nightModeAuthorName : styles.authorName}>
            by {authorName}
          </Text>
        </View>
      </Page>

  

      {/* Dedication */}
      {additionalData.dedication && (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>Dedication</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>3</Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>Dedication</Text>
          <View style={styles.content}>
            {renderMarkdown(additionalData.dedication, nightMode)}
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>3</Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page 3 of {totalPages}</Text>
          </View>
        </Page>
      )}

      {/* Introduction */}
      {additionalData.introduction && (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>Introduction</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>
              {3 + (additionalData.dedication ? 1 : 0)}
            </Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>Introduction</Text>
          <View style={styles.content}>
            {renderMarkdown(additionalData.introduction, nightMode)}
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>
            {3 + (additionalData.dedication ? 1 : 0)}
          </Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page {3 + (additionalData.dedication ? 1 : 0)} of {totalPages}</Text>
          </View>
        </Page>
      )}

      {/* Preface */}
      {additionalData.preface && (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>Preface</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>
              {3 + (additionalData.dedication ? 1 : 0) + (additionalData.introduction ? 1 : 0)}
            </Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>Preface</Text>
          <View style={styles.content}>
            {renderMarkdown(additionalData.preface, nightMode)}
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>
            {3 + (additionalData.dedication ? 1 : 0) + (additionalData.introduction ? 1 : 0)}
          </Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page {3 + (additionalData.dedication ? 1 : 0) + (additionalData.introduction ? 1 : 0)} of {totalPages}</Text>
          </View>
        </Page>
      )}

      {/* Table of Contents */}
      {additionalData.tableOfContents || (chapters && chapters.length > 0) ? (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>Table of Contents</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>
              {4 + 
                (additionalData.dedication ? 1 : 0) + 
                (additionalData.introduction ? 1 : 0) + 
                (additionalData.preface ? 1 : 0)}
            </Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>Contents</Text>
          <View style={styles.content}>
            {additionalData.tableOfContents ? 
              renderMarkdown(additionalData.tableOfContents, nightMode) : 
              renderTableOfContents(book, nightMode)
            }
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>
            {4 + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0)}
          </Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page {4 + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0)} of {totalPages}</Text>
          </View>
        </Page>
      ) : null}

      {/* Chapters */}
      {chapters.map((chapter, index) => {
        const pageNumber = 5 + index + 
          (additionalData.dedication ? 1 : 0) + 
          (additionalData.introduction ? 1 : 0) + 
          (additionalData.preface ? 1 : 0) +
          (additionalData.tableOfContents ? 1 : 0);

        return (
          <Page key={index} size="A4" style={nightMode ? styles.nightModePage : styles.page}>
            <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
              <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>{pageNumber}</Text>
            </View>
            
            <View style={styles.content}>
              {renderMarkdown(chapter.chapterInfo, nightMode)}
            </View>
            <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>{pageNumber}</Text>
            <View style={nightMode ? styles.nightModeFooter : styles.footer}>
              <Text>{authorName}</Text>
              <Text>Page {pageNumber} of {totalPages}</Text>
            </View>
          </Page>
        );
      })}

      {/* Glossary */}
      {book?.glossary && (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>Glossary</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>
              {5 + (chapters?.length || 0) + 
                (additionalData.dedication ? 1 : 0) + 
                (additionalData.introduction ? 1 : 0) + 
                (additionalData.preface ? 1 : 0) +
                (additionalData.tableOfContents ? 1 : 0)}
            </Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>Glossary</Text>
          <View style={styles.content}>
            {renderMarkdown(book.glossary, nightMode)}
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>
            {5 + (chapters?.length || 0) + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0) +
              (additionalData.tableOfContents ? 1 : 0)}
          </Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page {5 + (chapters?.length || 0) + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0) +
              (additionalData.tableOfContents ? 1 : 0)} of {totalPages}</Text>
          </View>
        </Page>
      )}

      {/* Index */}
      {book?.index && (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>Index</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>
              {5 + (chapters?.length || 0) + 
                (additionalData.dedication ? 1 : 0) + 
                (additionalData.introduction ? 1 : 0) + 
                (additionalData.preface ? 1 : 0) +
                (additionalData.tableOfContents ? 1 : 0) +
                (book?.glossary ? 1 : 0)}
            </Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>Index</Text>
          <View style={styles.content}>
            {renderMarkdown(book.index, nightMode)}
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>
            {5 + (chapters?.length || 0) + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0) +
              (additionalData.tableOfContents ? 1 : 0) +
              (book?.glossary ? 1 : 0)}
          </Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page {5 + (chapters?.length || 0) + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0) +
              (additionalData.tableOfContents ? 1 : 0) +
              (book?.glossary ? 1 : 0)} of {totalPages}</Text>
          </View>
        </Page>
      )}

      {/* References */}
      {book?.references && (
        <Page size="A4" style={nightMode ? styles.nightModePage : styles.page}>
          <View style={nightMode ? styles.nightModePageHeader : styles.pageHeader}>
            <Text style={nightMode ? styles.nightModePageHeaderText : styles.pageHeaderText}>References</Text>
            <Text style={nightMode ? styles.nightModePageNumber : styles.pageNumber}>
              {5 + (chapters?.length || 0) + 
                (additionalData.dedication ? 1 : 0) + 
                (additionalData.introduction ? 1 : 0) + 
                (additionalData.preface ? 1 : 0) +
                (additionalData.tableOfContents ? 1 : 0) +
                (book?.glossary ? 1 : 0) +
                (book?.index ? 1 : 0)}
            </Text>
          </View>
          <Text style={nightMode ? styles.nightModeChapterTitle : styles.chapterTitle}>References</Text>
          <View style={styles.content}>
            {renderMarkdown(book.references, nightMode)}
          </View>
          <Text style={nightMode ? styles.nightModePageNumberWatermark : styles.pageNumberWatermark}>
            {5 + (chapters?.length || 0) + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0) +
              (additionalData.tableOfContents ? 1 : 0) +
              (book?.glossary ? 1 : 0) +
              (book?.index ? 1 : 0)}
          </Text>
          <View style={nightMode ? styles.nightModeFooter : styles.footer}>
            <Text>{authorName}</Text>
            <Text>Page {5 + (chapters?.length || 0) + 
              (additionalData.dedication ? 1 : 0) + 
              (additionalData.introduction ? 1 : 0) + 
              (additionalData.preface ? 1 : 0) +
              (additionalData.tableOfContents ? 1 : 0) +
              (book?.glossary ? 1 : 0) +
              (book?.index ? 1 : 0)} of {totalPages}</Text>
          </View>
        </Page>
      )}

      {/* Back Cover */}
      {additionalData?.backCoverImageUrl && (
        <Page size="A4" style={nightMode ? styles.nightModeCoverPage : styles.coverPage}>
          <View style={nightMode ? styles.nightModeCoverPage : styles.coverPage}>
            <Image
              src={`${BASE_URl}/uploads/${additionalData.backCoverImageUrl}`}
              style={styles.coverImage}
              cache={false}
            />
            <Text style={nightMode ? styles.nightModeAuthorName : styles.authorName}>
              © {new Date().getFullYear()} {authorName}
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

// Export the download link component with night mode support
export const BookPDFDownloadLink = ({ 
  book,
  children,
  className,
  nightMode = false
}: { 
  book: BookData;
  children?: React.ReactNode;
  className?: string;
  nightMode?: boolean;
}) => {
  // Add safety check to prevent rendering if book is undefined
  if (!book) {
    return (
      <Button variant="outline" size="sm" className={className || ""} disabled>
        <Download className="h-4 w-4 mr-1" />
        <span>PDF Unavailable</span>
      </Button>
    );
  }

  return (
    <PDFDownloadLink 
      document={<BookPDF book={book} nightMode={nightMode} />}
      fileName={`${book?.bookTitle?.replace(/\s+/g, '_') || 'book'}_by_${(book?.authorName || 'Unknown').replace(/\s+/g, '_')}.pdf`}
      className={className || ""}
    >
      {({ blob, url, loading, error }) => {
        if (loading) return (
          <Button variant="outline" size="sm" className={className || ""}>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            <span>Generating PDF...</span>
          </Button>
        );
        
        if (error) {
          console.error("PDF generation error:", error);
          return (
            <Button variant="outline" size="sm" className={className || ""} disabled>
              <span>Error generating PDF</span>
            </Button>
          );
        }
        
        return (
          <Button variant="outline" size="sm" className={className || ""}>
            <Download className="h-4 w-4 mr-1" />
            <span>Download PDF</span>
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
}; 