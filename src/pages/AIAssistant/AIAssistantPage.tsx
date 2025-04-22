import Layout from '@/components/layout/Layout';
import { useState } from 'react';
import { MessageSquare, BookOpen, Paintbrush, ArrowRight, FileText, Presentation, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const AIAssistantPage = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  const aiAssistantData = [
    {
      id: 1,
      title: 'Generate Book Ideas',
      description: 'Get AI-powered creative book concepts tailored to your genre and target audience. Explore unique plot ideas, character dynamics, and story arcs.',
      icon: <BookOpen className="w-7 h-7" />,
      color: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100/80',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      onClick: () => navigate('/ai-assistant/book-ideas')
    },
    {
      id: 2,
      title: 'Book Cover Design',
      description: 'Create stunning book covers with AI assistance. Get design suggestions, color palettes, and typography recommendations that capture your books essence.',
      icon: <Paintbrush className="w-7 h-7" />,
      color: 'bg-amber-50',
      hoverColor: 'hover:bg-amber-100/80',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      onClick: () => navigate('/ai-assistant/cover-design')
    },
    {
      id: 3,
      title: 'Writing Assistant',
      description: 'Your AI writing companion for crafting engaging content. Get help with plot development, character arcs, and maintaining consistent narrative flow.',
      icon: <MessageSquare className="w-7 h-7" />,
      color: 'bg-green-50',
      hoverColor: 'hover:bg-green-100/80',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      onClick: () => navigate('/ai-assistant/writing')
    },
    {
      id: 4,
      title: 'Chapter Summary',
      description: 'Generate comprehensive summaries of your book chapters. Perfect for book proposals, back cover content, or quick reference while editing.',
      icon: <FileText className="w-7 h-7" />,
      color: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100/80',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      onClick: () => navigate('/chapter-summary')
    },
    {
      id: 5,
      title: 'Presentation Slides',
      description: 'Transform your chapters into professional presentation slides. Ideal for book talks, readings, educational contexts, or promotional events.',
      icon: <Presentation className="w-7 h-7" />,
      color: 'bg-rose-50',
      hoverColor: 'hover:bg-rose-100/80',
      borderColor: 'border-rose-200',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      onClick: () => navigate('/presentation-slides')
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 mb-8 rounded-xl shadow-sm border border-amber-100"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Sparkles className="w-8 h-8 mr-3 text-amber-500" />
                  AI Writing Assistant
                </h1>
                <p className="text-sm text-gray-600">
                  Your personal writing companion to help craft and refine your books
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Subtle decoration elements */}
          <div className="relative">
            <div className="absolute -top-20 left-20 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
            
            {/* Card Grid */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative ">
              {aiAssistantData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.03,
                    transition: { type: "spring", stiffness: 400, damping: 10 } 
                  }}
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card 
                    onClick={item.onClick}
                    className={`
                      cursor-pointer h-full ${item.color} 
                      border ${item.borderColor} p-6 transition-all duration-300
                      ${hoveredCard === item.id ? 'shadow-xl' : 'shadow-md'}
                      hover:shadow-xl hover:border-opacity-70
                      relative overflow-hidden group
                    `}
                  >
                    {/* Decorative background elements */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 blur-xl bg-gradient-to-tr from-amber-200 to-transparent"></div>
                    <div className={`absolute -left-5 -bottom-5 w-28 h-28 rounded-full opacity-10 blur-lg ${item.color.replace('bg-', 'bg-')}`}></div>
                    
                    {/* Card shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      {/* Card header with icon and indicator */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`${item.iconBg} ${item.iconColor} p-3.5 rounded-xl shadow-md ring-1 ring-white/40`}>
                          {item.icon}
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-full px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-1">
                            <span className="text-xs font-medium text-gray-600">
                              Explore
                            </span>
                          </div>
                          <motion.div
                            animate={hoveredCard === item.id ? { x: 5 } : { x: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            className={`p-1.5 rounded-full ${hoveredCard === item.id ? item.iconBg : 'bg-white/50'}`}
                          >
                            <ArrowRight className={`w-4 h-4 ${item.iconColor}`} />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Card content */}
                      <h2 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-gray-900">{item.title}</h2>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{item.description}</p>
                      
                      {/* Card footer */}
                      <div className="mt-6 pt-4 border-t border-gray-100/60 flex items-center justify-between">
                        <div className={`text-xs font-medium flex items-center gap-1 ${item.iconColor} opacity-70`}>
                          <Sparkles className="w-3 h-3" />
                          AI Powered
                        </div>
                        <motion.div 
                          className={`px-2 py-1 rounded-full text-xs ${hoveredCard === item.id ? item.iconBg : 'bg-transparent'} ${item.iconColor} transition-all duration-300`}
                          animate={hoveredCard === item.id ? { opacity: 1 } : { opacity: 0 }}
                        >
                          Get Started
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistantPage;
