// components/BookPDF.tsx

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

interface BookPDFProps {
  selectedBook: any;
  content: string;
  coverImageUrl?: string;
  backCoverImageUrl?: string;
  bookStyles: any;
}

const BookPDF: React.FC<BookPDFProps> = ({ selectedBook, content, coverImageUrl, backCoverImageUrl, bookStyles }) => {
  // Add the styles for the PDF rendering
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: '60pt 72pt',
      fontFamily: 'Times-Roman'
    },
    coverPage: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    coverImage: {
      width: '100%',
      maxWidth: 450,
      marginBottom: 40,
    },
    title: {
      fontSize: 42,
      fontFamily: 'Times-Bold',
      marginBottom: 24,
      textAlign: 'center',
    },
    author: {
      fontSize: 28,
      fontFamily: 'Times-Roman',
      marginBottom: 16,
      textAlign: 'center',
    },
    publisher: {
      fontSize: 20,
      fontFamily: 'Times-Roman',
      marginBottom: 40,
      textAlign: 'center',
    },
    chapterPage: {
      padding: '0',
      position: 'relative',
      width: '100%',
    },
    chapterNumber: {
      fontSize: 20,
      fontFamily: 'Times-Roman',
      color: '#718096',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    chapterTitle: {
      fontSize: 36,
      fontFamily: 'Times-Bold',
      color: '#1A202C',
      marginBottom: 36,
    },
    chapterContent: {
      fontSize: 11,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 12,
    },
    pageNumber: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      textAlign: 'center',
      fontSize: 11,
      color: '#4A5568',
    },
  });

  // You can use the 'content' prop to render the chapters
  const renderChapterContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => (
      <View key={index} style={styles.chapterContent}>
        <Text>{paragraph.trim()}</Text>
      </View>
    ));
  };

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          {coverImageUrl && <Image src={coverImageUrl} style={styles.coverImage} />}
          <Text style={styles.title}>{selectedBook.bookTitle}</Text>
          <Text style={styles.author}>By {selectedBook.author}</Text>
          <Text style={styles.publisher}>{selectedBook.publisher}</Text>
        </View>
      </Page>

      {/* Chapters */}
      {selectedBook.chapters.map((chapter: any, index: number) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.chapterPage}>
            <Text style={styles.chapterNumber}>Chapter {chapter.number}</Text>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
            {renderChapterContent(chapter.content)}
          </View>

          <Text style={styles.pageNumber} render={({ pageNumber }) => `${pageNumber}`} fixed />
        </Page>
      ))}

      {/* Back Cover */}
      {backCoverImageUrl && (
        <Page size="A4" style={styles.page}>
          <View style={styles.coverPage}>
            <Image src={backCoverImageUrl} style={styles.coverImage} />
          </View>
        </Page>
      )}
    </Document>
  );
};

export default BookPDF;
