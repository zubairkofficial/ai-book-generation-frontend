import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

export const renderMarkdown = (text: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-5 text-gray-900" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mb-4 text-gray-800" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mb-3 text-gray-800" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-gray-700 leading-relaxed" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-800" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 mb-2" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-gray-300" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };