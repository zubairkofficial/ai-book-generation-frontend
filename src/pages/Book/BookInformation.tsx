import ReactMarkdown from "react-markdown";


export const ChapterContent: React.FC<{ chapter: ChapterContent }> = ({ chapter }) => {
  const { text, images } = chapter;
  const paragraphs = text.split('\n').filter(line => line.trim());
  
  const renderers = {
    img: ({ alt, src }:ImageType) => (
      <img
        src={src}
        alt={alt}
        className="w-full rounded-lg shadow-lg"
      />
    ),
  };

  return (
    <div className="prose prose-lg max-w-none">
      {paragraphs.map((paragraph, idx) => (
        <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
          <ReactMarkdown components={renderers}>{paragraph}</ReactMarkdown>  
        </p>
      ))}
      {images.map((img, idx) => (
        <figure key={idx} className="my-8">
          <img
            src={img.url}
            alt={img.title}
            className="w-full rounded-lg shadow-lg"
          />
          <figcaption className="text-center mt-2 text-gray-600">
            {img.title}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

const BookInformation: React.FC<{ 
  bookData: BookData; 
  generatedChapters: { [key: number]: ChapterContent };
  streamingContent?: string;
  currentChapterNo?: number;
  isGenerating?: boolean;
}> = ({ 
  generatedChapters, 
  streamingContent, 
  currentChapterNo, 
  isGenerating 
}) => {
  

  
  return (
    <div className="w-full">
      {/* Generated Chapters */}
      <div className="space-y-8">
        {Object.entries(generatedChapters).map(([chapterNumber, chapter]) => (
          <div key={chapterNumber} className="p-6 bg-amber-50 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-amber-800 mb-4">
              Chapter {chapterNumber}
            </h3>
            <ChapterContent chapter={chapter} />
          </div>
        ))}

        {/* Streaming Content */}
        {isGenerating && streamingContent && (
          <div className="p-6 bg-amber-50/50 rounded-lg shadow-sm border-2 border-amber-200">
            <h3 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
              <span className="mr-2">Chapter {currentChapterNo}</span>
              <span className="text-sm text-amber-600">(Generating...)</span>
            </h3>
            <div className="prose prose-amber max-w-none">
            {streamingContent.split('\n').map((line, index, array) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null; // Skip empty lines

        // Regular expression to detect image URLs ending with common image file extensions
        const imageUrlPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))/i;
        const match = trimmedLine.match(imageUrlPattern);

        if (match) {
          return (
            <div key={index} className="mb-2">
              <img
                src={match[0]}
                alt="Content"
                className="max-w-full h-auto"
              />
            </div>
          );
        }

        return (
          <p
            key={index}
            className={`mb-2 text-gray-700 ${
              index === array.length - 1 ? 'typing-animation' : ''
            }`}
          >
            {trimmedLine}
            {index === array.length - 1 && (
              <span className="typing-cursor">▋</span>
            )}
          </p>
        );
      })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BookInformation