import Layout from '@/components/layout/Layout';
import { useState } from 'react';
import { MessageSquare, BookOpen, Paintbrush, ArrowRight } from 'lucide-react';
import ChatDialog from '@/components/chat/ChatDialog';

const AIAssistantPage = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const aiAssistantData = [
    {
      id: 1,
      title: 'Generate Book Ideas',
      description: 'Get AI-powered creative book concepts tailored to your genre and target audience. Explore unique plot ideas, character dynamics, and story arcs.',
      icon: <BookOpen className="w-7 h-7" />,
      color: 'bg-gradient-to-br from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600',
      shadowColor: 'hover:shadow-blue-100'
    },
    {
      id: 2,
      title: 'Book Cover Design',
      description: 'Create stunning book covers with AI assistance. Get design suggestions, color palettes, and typography recommendations that capture your books essence.',
      icon: <Paintbrush className="w-7 h-7" />,
      color: 'bg-gradient-to-br from-amber-500/5 to-red-500/5 hover:from-amber-500/10 hover:to-red-500/10',
      borderColor: 'border-amber-100',
      iconColor: 'text-amber-600',
      shadowColor: 'hover:shadow-amber-100'
    },
    {
      id: 3,
      title: 'Writing Assistant',
      description: 'Your AI writing companion for crafting engaging content. Get help with plot development, character arcs, and maintaining consistent narrative flow.',
      icon: <MessageSquare className="w-7 h-7" />,
      color: 'bg-gradient-to-br from-green-500/5 to-emerald-500/5 hover:from-green-500/10 hover:to-emerald-500/10',
      borderColor: 'border-green-100',
      iconColor: 'text-green-600',
      shadowColor: 'hover:shadow-green-100'
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          AI Writing Assistant
        </h1>
        <div className=" grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {aiAssistantData.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedTool(item.title)}
              className={`
                group cursor-pointer rounded-2xl border-2 ${item.borderColor} ${item.color} 
                p-8 transition-all duration-300 hover:scale-[1.02]
                ${item.shadowColor} hover:shadow-2xl backdrop-blur-sm
                relative overflow-hidden
              `}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className={`rounded-xl p-3 ${item.color} ${item.iconColor} ring-1 ring-gray-100/20`}>
                    {item.icon}
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">{item.title}</h2>
                <p className="text-gray-600 text-base leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ChatDialog 
        isOpen={!!selectedTool}
        title={selectedTool}
        onClose={() => setSelectedTool(null)}
      />
    
    </Layout>
  );
};

export default AIAssistantPage;
