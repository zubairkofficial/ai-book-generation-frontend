import { BookOpen, Paintbrush, SparklesIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ContentProps } from '../types/chat.types';

const BookCoverContent = ({ responseData, generatedContent }: ContentProps) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100">
      <div className="flex items-center gap-3 mb-8">
        <Paintbrush className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-900">Book Cover Design</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Information Section */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-50/30 p-6 rounded-xl">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Cover Requirements
          </h3>
          <div className="space-y-4">
            {Object.entries(responseData?.bookCoverInfo || {}).map(([key, value]) => (
              <div key={key} className="bg-white/80 p-4 rounded-lg shadow-sm">
                <p className="flex flex-col">
                  <span className="text-sm font-medium text-amber-700 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className="text-gray-700">{value as string}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Design Suggestions Section */}
        <div className="bg-gradient-to-br from-amber-50/50 to-white p-6 rounded-xl">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5" />
            Design Suggestions
          </h3>
          <div className="prose prose-amber max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {generatedContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCoverContent; 