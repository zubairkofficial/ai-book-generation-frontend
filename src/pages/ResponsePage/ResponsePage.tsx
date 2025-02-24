import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import Layout from '@/components/layout/Layout';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useGetAiAssistantChatMutation } from '@/api/aiAssistantApi';

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
         <div>
          <div className="p-4 md:p-6 border-b bg-amber-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-semibold text-amber-800">AI Writing Assistant</h2>
              <div className="flex gap-2 md:gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChat(!showChat)}
                  className="md:hidden"
                >
                  {showChat ? <ChevronRight /> : <ChevronLeft />}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="hidden md:flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
                <Button
                  onClick={() => {/* Implement save logic */}}
                  className="bg-amber-500 hover:bg-amber-600 text-white hidden md:flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Response
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row h-[calc(100vh-280px)]">
            {/* Requirements Panel */}
            <div className={`w-full md:w-1/4 border-r ${showChat ? 'hidden' : 'block'} md:block`}>
              <div className="p-4 md:p-6 overflow-y-auto h-full">
                <h3 className="font-semibold text-amber-800 mb-4">Your Requirements</h3>
                <div className="space-y-4">
                  {Object.entries(responses).map(([key, value]) => (
                    <div key={key} className="bg-amber-50/50 p-4 rounded-lg">
                      <span className="text-sm font-medium text-amber-700 block mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span className="text-gray-700">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat History */}
            <div className={`flex-1 ${!showChat ? 'hidden' : 'block'} md:block`}>
              <div className="h-full flex flex-col">
                <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 ${msg.isUser ? 'ml-auto' : 'mr-auto'} max-w-[80%]`}
                    >
                      <div className={`p-3 rounded-lg ${
                        msg.isUser 
                          ? 'bg-amber-500 text-white ml-auto' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          className="prose prose-sm max-w-none"
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask a follow-up question..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
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