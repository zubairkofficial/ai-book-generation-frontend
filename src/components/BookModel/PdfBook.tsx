import React from 'react'
import { Document, Page, Text, View, StyleSheet,  Image, Font } from '@react-pdf/renderer';
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

// Enhanced markdown cleaning function
const cleanMarkdown = (text: string) => {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s/g, '') // Remove heading markers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Clean links but keep text
    .replace(/^\s*[-*+]\s+/gm, '• ') // Convert list markers to bullets
    .replace(/^\s*\d+\.\s+/gm, '• ') // Convert numbered lists to bullets
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .trim();
};



const PdfBook: React.FC<BookPDFProps> = ({ 
  selectedBook,
  content, 
  coverImageUrl,
  backCoverImageUrl,
   
}) => {
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
      padding: 20,
      marginTop: 20,
    },
    synopsis: {
      fontSize: 12,
      fontFamily: 'Times-Roman',
      lineHeight: 1.6,
      textAlign: 'justify',
      marginBottom: 24,
      color: '#2D3748'
    },
    authorBio: {
      fontSize: 11,
      fontFamily: 'Times-Roman',
      lineHeight: 1.4,
      textAlign: 'justify',
      marginTop: 24,
      color: '#4A5568',
      paddingTop: 16
    },
    divider: {
      borderBottom: '1pt solid #E2E8F0',
      marginVertical: 20,
      width: '30%',
      alignSelf: 'center'
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 40,
      right: 40,
      textAlign: 'center',
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
    headingText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 12,
      textAlign: 'left',
      textIndent: 0, // Remove indentation for headings
      color: '#000000'
    },
    heading: {
      marginVertical: 12,
    },
    referenceSection: {
      marginBottom: 24,
    },
    referenceHeader: {
      fontSize: 14,
      fontFamily: 'Times-Bold',
      marginBottom: 12,
      color: '#000000',
    },
    referenceSubHeader: {
      fontSize: 12,
      fontFamily: 'Times-Bold',
      marginTop: 16,
      marginBottom: 8,
      color: '#1A202C',
    },
    referenceItem: {
      marginLeft: 20,
      marginBottom: 8,
      flexDirection: 'row',
    },
    referenceBullet: {
      width: 12,
      fontSize: 12,
      fontFamily: 'Times-Roman',
    },
    referenceText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'Times-Roman',
      lineHeight: 1.4,
    },
    referenceItalic: {
      fontFamily: 'Times-Italic',
    },
  });

  // Enhanced renderChapterContent function
  const renderChapterContent = (content: string) => {
    const sections = content.split(/\n\n/);
    let figureCount = 0;

    return sections.map((section, index) => {
      // Handle images
      const imageMatch = section.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        figureCount++;
        const [_, altText, imageUrl] = imageMatch;
        const fixedImageUrl = imageUrl.replace(/^.*?\/uploads\//, `${BASE_URl}/uploads/`);

        return (
          <View key={`figure-${figureCount}`} style={styles.imageContainer}>
            <View style={styles.figureHeader}>
              <Text style={styles.figureNumber}>Figure {figureCount}</Text>
            </View>
            <Image src={fixedImageUrl} style={styles.chapterImage} />
            {altText && <Text style={styles.imageCaption}>{altText}</Text>}
          </View>
        );
      }

      // Handle headings
      if (section.match(/^#{1,6}\s/)) {
        const level = (section.match(/^#{1,6}/) || [''])[0].length;
        const text = section.replace(/^#{1,6}\s/, '');
        
        return (
          <View key={`heading-${index}`} style={styles.heading}>
            <Text style={[
              styles.headingText,
              { fontSize: 24 - (level * 2) }
            ]}>
              {text}
            </Text>
          </View>
        );
      }

      // Handle regular paragraphs
      if (section.trim()) {
        return (
          <View key={`p-${index}`} style={styles.paragraph}>
            <Text style={styles.bodyText}>{cleanMarkdown(section)}</Text>
          </View>
        );
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

  // Add this helper function to process reference content
  const processReferenceContent = (content: string) => {
    const sections: { [key: string]: string[] } = {};
    let currentSection = '';
    
    content.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      
      // Check for section headers (e.g., "1. Books:")
      const sectionMatch = trimmedLine.match(/^\d+\.\s+\*\*(.*?):\s*\*\*/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        sections[currentSection] = [];
      } 
      // Check for items starting with dash
      else if (trimmedLine.startsWith('-') && currentSection) {
        // Process the reference item
        const itemText = trimmedLine.substring(1).trim()
          // Handle italic text
          .replace(/\*(.*?)\*/g, '§$1§');
        sections[currentSection].push(itemText);
      }
    });
    
    return sections;
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
            preface.split('\n\n').map((para, pIndex) => {
              // Split the paragraph into parts, preserving bold text
              const parts = para.split(/(\*\*.*?\*\*)/g);
              
              return (
                <View key={pIndex} style={[styles.paragraph, { marginBottom: 12 }]}>
                  <Text style={[styles.bodyText, { 
                    lineHeight: 1.6,
                    textAlign: 'justify',
                    fontSize: 12,
                    fontFamily: 'Times-Roman'
                  }]}>
                    {parts.map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        // Bold text
                        return (
                          <Text key={partIndex} style={{ fontFamily: 'Times-Bold' }}>
                            {part.slice(2, -2)}
                          </Text>
                        );
                      }
                      // Regular text
                      return part;
                    })}
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
      {selectedBook.bookChapter?.map((chapter: any, index: number) => {
        const chapterTitle = cleanMarkdown(
          chapter.chapterInfo.split('\n')[0]
        );
        
        const chapterContent = chapter.chapterInfo
          .split('\n')
          .slice(1)
          .join('\n');

        return (
          <Page key={index} size="A4" style={styles.page}>
            <View style={styles.chapterPage}>
              <View style={styles.chapterHeader}>
                <Text style={styles.chapterNumber}>
                  Chapter {chapter.chapterNo}
                </Text>
                <Text style={styles.chapterTitle}>
                  {chapterTitle}
                </Text>
              </View>
              
              <View style={styles.chapterContent}>
                {renderChapterContent(chapterContent)}
              </View>
            </View>
            
            <Text 
              style={styles.pageNumber} 
              render={({ pageNumber }) => `${pageNumber}`} 
              fixed 
            />
          </Page>
        );
      })}

      
     

      {/* References */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>References</Text>
          {references ? (
            <View>
              <Text style={styles.referenceHeader}>
                Bibliography for "{bookInfo.bookTitle}"
              </Text>
              
              {Object.entries(processReferenceContent(references)).map(([section, items], sectionIndex) => (
                <View key={sectionIndex} style={styles.referenceSection}>
                  <Text style={styles.referenceSubHeader}>
                    {`${sectionIndex + 1}. ${section}`}
                  </Text>
                  
                  {items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.referenceItem}>
                      <Text style={styles.referenceBullet}>•</Text>
                      <Text style={styles.referenceText}>
                        {item.split('§').map((part, partIndex) => {
                          // Toggle between regular and italic text
                          return partIndex % 2 === 0 ? (
                            part
                          ) : (
                            <Text key={partIndex} style={styles.referenceItalic}>
                              {part}
                            </Text>
                          );
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.bodyText}>No references available.</Text>
          )}
        </View>
      </Page>

      {/* Copyright Page */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.section, { justifyContent: 'center', minHeight: '80vh' }]}>
          <View style={{ marginBottom: 40 }}>
            <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 20 }]}>
              {bookInfo.bookTitle}
            </Text>
            <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 40 }]}>
              By {bookInfo.authorName}
            </Text>
          </View>

          <View style={{ marginBottom: 40 }}>
            <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 10 }]}>
              Copyright © {new Date().getFullYear()} {bookInfo.authorName}
            </Text>
            <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 10, marginBottom: 20 }]}>
              All rights reserved.
            </Text>
            <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 10, marginBottom: 10 }]}>
              No part of this publication may be reproduced, distributed, or transmitted in any form or by any means,
              including photocopying, recording, or other electronic or mechanical methods, without the prior written
              permission of the author, except in the case of brief quotations embodied in critical reviews and certain
              other noncommercial uses permitted by copyright law.
            </Text>
          </View>

          <View style={{ marginTop: 'auto' }}>
            <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 10 }]}>
              Published by Cyberify Publications
            </Text>
            <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 10 }]}>
              First Edition: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 10, marginTop: 20 }]}>
              Printed in Us
            </Text>
          </View>
        </View>
      </Page>

      {/* Back Cover with improved layout */}
      <Page size="A4" style={styles.page}>
        <View style={styles.backCover}>
          {backCoverImageUrl && (
            <Image
              src={getFixedImageUrl(backCoverImageUrl)}
              style={styles.backCoverImage}
            />
          )}
          <View style={styles.backCoverContent}>
            <Text style={[styles.bodyText, { 
              fontSize: 14, 
              fontWeight: 'bold',
              marginBottom: 20,
              textAlign: 'center'
            }]}>
              About the Book
            </Text>
            <Text style={styles.synopsis}>
              {bookInfo.bookTitle}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.authorBio}>
              About the Author:{'\n'}{<h6 className='m-2'>bookInfo.authorBio </h6>}
            </Text>
          </View>
          <View style={styles.footer}>
            <Text style={{ fontSize: 10, color: '#666' }}>
              Cyberify Publications
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PdfBook


