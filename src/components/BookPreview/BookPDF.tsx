import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { BASE_URl } from '@/constant';
import TurnDownService from 'turndown';

// Register fonts
Font.register({
  family: 'Times New Roman',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400, fontStyle: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOkCnqEu92Fr1MmUI-vBBc9.ttf', fontWeight: 400, fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700, fontStyle: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOjCnqEu92Fr1Mu51TzBic6CsI.ttf', fontWeight: 700, fontStyle: 'italic' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOkCnqEu92Fr1MmYUtfBBc9.ttf', fontWeight: 900, fontStyle: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmSU5fBBc9.ttf', fontWeight: 300, fontStyle: 'normal' },
 ],
});



// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 42,
    backgroundColor: '#fdf9e6',
    fontFamily: 'Times New Roman',
  },
  
  coverPage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  coverImage: {
    width: '70%',
    marginBottom: 30,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
  },
  authorName: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginVertical: 15,
    textAlign:'start'
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 10,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 15,
    textAlign: 'center',
  },
  chapterNumber: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    marginVertical: 15,
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    right: 20,
    color: 'grey',
  },
  tocItem: {
    fontSize: 12,
    marginBottom: 8,
  },
  header: {
    fontSize: 10,
    marginBottom: 20,
    textAlign: 'center',
    color: 'grey',
  },
  copyright: {
    fontSize: 10,
    marginTop: 20,
    textAlign: 'center',
    color: 'grey',
  },
  tocItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tocPageNum: {
    width: '20%',
    textAlign: 'right',
  },
});

interface BookPDFProps {
  book: any;
}

// Improve markdown processing to handle HTML content as well
const processMarkdown = (content: string,) => {
  if (!content) return [];
  
  // Handle HTML content conversion if needed
  if (content.startsWith('<')) {
    const turndown = new TurnDownService();
    content = turndown.turndown(content).replace(/ \#/gm, '\n\n#').replace("\\#", '\n\n#');
  }
  
  // Split content by paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map((paragraph, index) => {
    // Check if paragraph contains image markdown
    const imageMatch = paragraph.match(/!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      const imageUrl = imageMatch[2];
      const imageAlt = imageMatch[1];
      
      const formattedUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${BASE_URl}/uploads/${imageUrl}`;
      
      return (
        <View key={index} style={{ marginVertical: 15, alignItems: 'center' }}>
          <Image src={formattedUrl} style={styles.image} />
          <Text style={{ fontSize: 10, marginTop: 5, textAlign: 'center' }}>{imageAlt}</Text>
        </View>
      );
    }
    
    // Process headings
    if (paragraph.startsWith('# ')) {
      return (
        <Text key={index} style={[styles.sectionTitle]}>
          {paragraph.replace(/^# /, '')}
        </Text>
      );
    }
    
    if (paragraph.startsWith('## ')) {
      return (
        <Text key={index} style={[{ ...styles.sectionTitle, fontSize: 16 }]}>
          {paragraph.replace(/^## /, '')}
        </Text>
      );
    }
    if (paragraph.startsWith('### ')) {
      return (
        <Text key={index} style={[{ ...styles.sectionTitle, fontSize: 14 }]}>
          {paragraph.replace(/^### /, '')}
        </Text>
      );
    }
    
    // Regular paragraph
    return (
      <Text key={index} style={[styles.paragraph]}>
        {paragraph.trim()}
      </Text>
    );
  });
};

const BookPDF: React.FC<BookPDFProps> = ({ book }) => {
  console.log("book-",book)
  // Check if the book content is primarily in Arabic/Urdu

  // Get cover image URL
  const coverImageUrl = book.additionalData?.coverImageUrl
    ? (book.additionalData.coverImageUrl.startsWith('http')
        ? book.additionalData.coverImageUrl
        : `${BASE_URl}/uploads/${book.additionalData.coverImageUrl}`)
    : null;
console.log("coverImageUrl",coverImageUrl)
  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {coverImageUrl && (
            <Image src={coverImageUrl} style={styles.coverImage} />
          )}
          <Text style={[styles.bookTitle]}>
            {book.bookTitle}
          </Text>
          <Text style={[styles.authorName]}>
            By {book.authorName || 'Unknown Author'}
          </Text>
          
          {/* Copyright Notice */}
          <Text style={[styles.copyright]}>
            © {new Date().getFullYear()} {book.authorName}. All rights reserved.
          </Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Dedication Page */}
      {book.additionalData?.dedication && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{book.bookTitle}</Text>
          <Text style={[styles.sectionTitle]}>Dedication</Text>
          {processMarkdown(book.additionalData.dedication)}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Preface Page */}
      {book.additionalData?.preface && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{book.bookTitle}</Text>
          <Text style={[styles.sectionTitle]}>Preface</Text>
          {processMarkdown(book.additionalData.preface)}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Introduction Page */}
      {book.additionalData?.introduction && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{book.bookTitle}</Text>
          <Text style={[styles.sectionTitle]}>Introduction</Text>
          {processMarkdown(book.additionalData.introduction)}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Table of Contents */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{book.bookTitle}</Text>
        <Text style={[styles.sectionTitle]}>Table of Contents</Text>
        
        {book.bookChapter?.map((chapter: any, index: number) => (
          <View key={index} style={styles.tocItemContainer}>
            <Text style={[styles.tocItem]}>
              {chapter.chapterNo}. {chapter.chapterName}
            </Text>
            <Text style={styles.tocPageNum}></Text>
          </View>
        ))}
        
        <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Chapters */}
      {book.bookChapter?.map((chapter: any, index: number) => {
        // Convert HTML to markdown if needed
        let chapterContent = chapter.chapterInfo;
        if (chapterContent && chapterContent.startsWith('<')) {
          const turndown = new TurnDownService();
          chapterContent = turndown.turndown(chapterContent)
            .replace(/ \#/gm, '\n\n#')
            .replace("\\#", '\n\n#');
        }
        
        return (
          <Page key={index} size="A4" style={styles.page}>
            <Text style={styles.header}>{book.bookTitle}</Text>
            
            
            
           
            
            {processMarkdown(chapterContent)}
            
            <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
          </Page>
        );
      })}

      {/* Glossary */}
      {book.glossary && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{book.bookTitle}</Text>
          <Text style={[styles.sectionTitle]}>Glossary</Text>
          {processMarkdown(book.glossary)}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* Index */}
      {book.index && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{book.bookTitle}</Text>
          <Text style={[styles.sectionTitle]}>Index</Text>
          {processMarkdown(book.index)}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}

      {/* References */}
      {book.references && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.header}>{book.bookTitle}</Text>
          <Text style={[styles.sectionTitle]}>References</Text>
          {processMarkdown(book.references)}
          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      )}
    </Document>
  );
};

export default BookPDF; 