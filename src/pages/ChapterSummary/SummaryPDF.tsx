import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#FFFFFF",
    fontFamily: "Times-Roman",
  },
  coverPage: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "auto",
    maxWidth: 450,
    marginBottom: 40,
    objectFit: "contain",
  },
  title: {
    fontSize: 32,
    fontFamily: "Times-Roman",
    marginBottom: 10,
    textAlign: "center",
  },
  author: {
    fontSize: 18,
    fontFamily: "Helvetica",
    marginBottom: 5,
    color: "#4A5568",
  },
  publisher: {
    fontSize: 20,
    fontFamily: "Times-Roman",
    marginBottom: 40,
    textAlign: "center",
    color: "#4A5568",
  },
  tocPage: {
    padding: "40pt",
    position: "relative",
  },
  tocTitle: {
    fontSize: 24,
    fontFamily: "Times-Bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#1A202C",
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tocText: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#2D3748",
    flex: 1,
  },
  tocDots: {
    borderBottom: "1pt dotted #CBD5E0",
    flex: 1,
    marginHorizontal: 8,
  },
  tocPageNumber: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#718096",
  },
  chapterPage: {
    padding: "72pt 60pt", // Professional margins
    position: "relative",
  },
  chapterHeader: {
    marginBottom: 40,
    textAlign: "center",
  },
  chapterNumber: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 8,
    fontFamily: "Times-Roman",
  },
  chapterTitle: {
    fontSize: 24,
    fontFamily: "Times-Bold",
    marginBottom: 30,
  },
  chapterContent: {
    marginTop: 20,
  },
  paragraph: {
    textIndent: "18pt", // Professional paragraph indentation
    marginBottom: "12pt",
  },
  bodyText: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.6,
    marginBottom: 12,
    textAlign: "justify",
  },
  runningHeader: {
    position: "absolute",
    top: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#718096",
    fontFamily: "Times-Italic",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#666666",
  },
  endOfPage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4A5568", // Grey color for the separator
  },
  backCoverPage: {
    padding: "40pt",
    position: "relative",
    height: "100%",
  },
  backCoverImage: {
    width: "100%",
    height: 400,
    marginBottom: 30,
    objectFit: "cover",
  },
  backCoverContent: {
    padding: 20,
    marginTop: 20,
  },
  synopsis: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.6,
    textAlign: "justify",
    marginBottom: 24,
    color: "#2D3748",
  },
  authorBio: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    lineHeight: 1.4,
    textAlign: "justify",
    marginTop: 24,
    color: "#4A5568",
    paddingTop: 16,
  },
  divider: {
    borderBottom: "1pt solid #E2E8F0",
    marginVertical: 20,
    width: "30%",
    alignSelf: "center",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTop: "1pt solid #E2E8F0",
    paddingTop: 16,
  },
  chapterImage: {
    width: "80%",
    marginHorizontal: "auto",
    marginVertical: 20,
  },
  imageCaption: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    color: "#666",
    textAlign: "center",
    marginTop: "8pt",
  },
  imageContainer: {
    margin: "24pt 0",
    breakInside: "avoid",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  diagramContainer: {
    margin: "20pt 0",
    padding: "16pt",
    backgroundColor: "#f8f9fa",
    borderRadius: "4pt",
    breakInside: "avoid",
    width: "100%",
  },
  diagramImage: {
    width: "100%",
    maxHeight: "500pt",
    objectFit: "contain",
    marginVertical: "12pt",
  },
  diagramCaption: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    color: "#4a5568",
    textAlign: "center",
    marginTop: "8pt",
    paddingTop: "4pt",
    borderTop: "1pt solid #e2e8f0",
  },
  figureNumber: {
    fontSize: 10,
    fontFamily: "Times-Bold",
    color: "#2d3748",
    marginBottom: "4pt",
  },
  figureHeader: {
    marginBottom: 8,
    borderBottom: "1pt solid #e2e8f0",
    paddingBottom: 4,
  },
  imageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: "12pt",
    position: "relative",
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },
  textJustify: {
    textAlign: "justify",
  },
  singleColumn: {},
  doubleColumn: {
    columnGap: "24pt",
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: "Times-Roman",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    padding: 40,
    fontFamily: "Times-Roman",
  },
  glossaryItem: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  reference: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    marginBottom: 8,
    lineHeight: 1.4,
  },
  backCover: {
    padding: "40pt",
    position: "relative",
    height: "100%",
  },
  headingText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "left",
    textIndent: 0, // Remove indentation for headings
    color: "#000000",
  },
  heading: {
    marginVertical: 12,
  },
  referenceSection: {
    marginBottom: 24,
  },
  referenceHeader: {
    fontSize: 14,
    fontFamily: "Times-Bold",
    marginBottom: 12,
    color: "#000000",
  },
  referenceSubHeader: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#1A202C",
  },
  referenceItem: {
    marginLeft: 20,
    marginBottom: 8,
    flexDirection: "row",
  },
  referenceBullet: {
    width: 12,
    fontSize: 12,
    fontFamily: "Times-Roman",
  },
  referenceText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Times-Roman",
    lineHeight: 1.4,
  },
  referenceItalic: {
    fontFamily: "Times-Italic",
  },
});

interface ChapterData {
  id: number;
  chapterNo: number;
  chapterName: string;
  content: string;
}

const SummaryPDF = ({
  summary,
  title,
  isCombined,
  chaptersSummary,
  chapters,
}: {
  summary: string;
  title: string;
  chaptersSummary?: string[];
  chapters?: ChapterData[];
  isCombined: boolean;
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 30 }]}>
            {title}
          </Text>
          {isCombined ? (
            <Text style={styles.bodyText}>{summary}</Text>
          ) : (
            chaptersSummary?.map((chapter, index) => (
              <View key={index}>
                <Text style={styles.headingText}>
                  Chapter {`: ${index + 1} ${chapters?.[index].chapterName}`}
                </Text>
                <Text style={styles.bodyText}>{chapter}</Text>
              </View>
            ))
          )}
        </View>
      </Page>
    </Document>
  );
};

export default SummaryPDF;