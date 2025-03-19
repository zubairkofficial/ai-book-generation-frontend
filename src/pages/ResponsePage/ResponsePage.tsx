import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Save, X, ChevronLeft, ChevronRight, ClipboardList, BrainIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Layout from '@/components/layout/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useGetAiAssistantChatMutation } from '@/api/aiAssistantApi';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ResponsePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { responses, generatedContent,aiAssistantId } = location.state;
  console.log("responsesgeneratedContent",aiAssistantId,)
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [getAiAssistantChat] = useGetAiAssistantChatMutation();

  useEffect(() => {
    // Initialize with AI's first response
    setChatMessages([
      {
        id: '1',
        content: generatedContent,
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, [generatedContent]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        isUser: true,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      try {
        const response = await getAiAssistantChat({
          message: message,
          aiAssistantId: location.state.aiAssistantId
        }).unwrap();

        const aiResponse: ChatMessage = {
          id: response.id.toString(),
          content: response.response.generatedText,
          isUser: false,
          timestamp: new Date(response.response.timestamp),
        };
        setChatMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error('Chat error:', error);
        // Handle error appropriately
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50">
        <div className="max-w-[1400px] mx-auto">
          {/* Enhanced Header */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-amber-100">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <BrainIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-900">AI Writing Assistant</h2>
                    <p className="text-sm text-gray-500 hidden md:block">Interactive AI-powered writing support</p>
                  </div>
                </div>

                <div className="flex gap-2 md:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChat(!showChat)}
                    className="md:hidden border-amber-200 hover:bg-amber-50"
                  >
                    {showChat ? <ChevronRight /> : <ChevronLeft />}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="hidden md:flex items-center gap-2 border-amber-200 hover:bg-amber-50"
                  >
                    <X className="w-4 h-4" />
                    Close
                  </Button>
                  <Button
                    onClick={() => {/* Implement save logic */}}
                    className="hidden md:flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Save className="w-4 h-4" />
                    Save Response
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col md:flex-row h-[calc(100vh-140px)]">
            {/* Requirements Panel */}
            <div className={`w-full md:w-1/4 border-r border-amber-100 bg-white/50 ${showChat ? 'hidden' : 'block'} md:block`}>
              <div className="p-4 md:p-6 overflow-y-auto h-full">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-amber-500" />
                  Your Requirements
                </h3>
                <div className="space-y-4">
                  {Object.entries(responses).map(([key, value]) => (
                    <div key={key} className="bg-gradient-to-br from-amber-50 to-amber-50/30 p-4 rounded-lg border border-amber-100/50">
                      <span className="text-sm font-medium text-amber-700 block mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="text-gray-600 text-sm">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className={`flex-1 ${!showChat ? 'hidden' : 'block'} md:block bg-gradient-to-br from-white to-amber-50/20`}>
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-4 ${msg.isUser ? 'ml-auto' : 'mr-auto'} max-w-[85%]`}
                    >
                      <div className={`p-4 rounded-lg shadow-sm ${
                        msg.isUser 
                          ? 'bg-amber-500 text-white ml-auto' 
                          : 'bg-white border border-amber-100'
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          className="prose prose-sm max-w-none marker:text-amber-500 prose-headings:text-gray-900 prose-p:text-gray-600"
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <div className={`text-xs mt-1 ${msg.isUser ? 'text-right' : 'text-left'} text-gray-400`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Enhanced Input Area */}
                <div className="border-t border-amber-100 bg-white p-4 md:p-6">
                  <div className="flex gap-3 max-w-3xl mx-auto">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 border-amber-200 focus:ring-amber-500/20 focus:border-amber-500 bg-white/80"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-amber-500 hover:bg-amber-600 text-white px-6"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResponsePage; 