import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';

interface PrefaceContentProps {
  bookData: any;
  editMode: boolean;
  setHasChanges: (value: boolean) => void;
}

export const PrefaceContent = ({
  bookData,
  editMode,
  setHasChanges,
}: PrefaceContentProps) => {
  const prefaceContent = bookData.additionalData.preface || '';
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  
  console.log("prefaceContent", prefaceContent);

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const extractSection = (content: string, sectionName: string, nextSectionName?: string) => {
    // Check if the content contains the section name
    if (!content.includes(sectionName)) {
      console.log(`Section "${sectionName}" not found in content`);
      return '';
    }
    
    // Split by the section name
    const parts = content.split(sectionName);
    if (parts.length < 2) return '';
    
    let sectionContent = parts[1].trim();
    
    // If we have a next section, extract content up to that section
    if (nextSectionName && content.includes(nextSectionName)) {
      const endParts = sectionContent.split(nextSectionName);
      sectionContent = endParts[0].trim();
    }
    
    return sectionContent;
  };

  const handleContentChange = async(content: string) => {
    setHasChanges(true);
    
    // Update the preface content in the API
    await updateBookGenerated({
      bookGenerationId: bookData.id,
      preface: content,
    }).unwrap(); 
  };

  return (
    <div className="min-h-[800px] px-8 py-12">
      <div 
        className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg"
        contentEditable={editMode}
        onBlur={(e) => handleContentChange(e.currentTarget.textContent || '')}
      >
        <h1 className="text-4xl text-center mb-12 text-gray-900">Preface</h1>
        
        <div className="space-y-8">
          {/* Introduction Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Introduction</h2>
            <div className="prose max-w-none text-gray-700">
              {renderMarkdown(extractSection(prefaceContent, "Introduction", "Core Idea"))}
            </div>
          </section>

          {/* Core Idea Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Core Idea</h2>
            <div className="prose max-w-none text-gray-700">
              {renderMarkdown(extractSection(prefaceContent, "Core Idea", "Why This Book Matters"))}
            </div>
          </section>

          {/* Why This Book Matters Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Why This Book Matters</h2>
            <div className="prose max-w-none text-gray-700">
              {renderMarkdown(extractSection(prefaceContent, "Why This Book Matters", "What to Expect"))}
            </div>
          </section>

          {/* What to Expect Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">What to Expect</h2>
            <div className="prose max-w-none text-gray-700">
              {renderMarkdown(extractSection(prefaceContent, "What to Expect", "Acknowledgments"))}
            </div>
          </section>

          {/* Acknowledgments Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Acknowledgments</h2>
            <div className="prose max-w-none text-gray-700">
              {renderMarkdown(extractSection(prefaceContent, "Acknowledgments", "With gratitude"))}
            </div>
          </section>

        

          {/* Author Signature */}
          <div className="mt-12 text-right italic text-gray-700">
            <p className="mb-2">With anticipation and excitement,</p>
            <p className="font-semibold">{bookData.authorName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 