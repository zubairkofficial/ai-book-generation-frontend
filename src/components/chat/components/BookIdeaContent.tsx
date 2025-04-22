import { BookIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { ContentProps } from '../types/chat.types';
import { AiAssistantType } from '@/types/enum';

const BookIdeaContent = ({ responseData, generatedContent }: ContentProps) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-amber-100">
      <div className="flex items-center gap-3 mb-8">
        <BookIcon className="w-6 h-6 text-amber-600" />
        <h2 className="text-2xl font-bold text-gray-900">{responseData.type==AiAssistantType.BOOK_IDEA? "Book Idea Generation":"Book Writing Tips"}</h2>
      </div>

      {/* Preferences Section */}
      <div className="mb-8 bg-gradient-to-br from-amber-50 to-amber-50/30 p-6 rounded-xl">
        <h3 className="font-semibold text-amber-800 mb-4">Your Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(responseData?.information || {}).map(([key, value]) => (
            <div key={key} className="bg-white/80 p-4 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-amber-700 block mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
              <span className="text-gray-700">{value as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Content Section */}
      <div className="prose prose-amber max-w-none bg-white p-6 rounded-xl">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          className="text-gray-700 leading-relaxed"
        >
          {generatedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default BookIdeaContent; 