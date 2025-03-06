import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { EditorContent } from './EditorContent.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface PrefaceContentProps {
  bookData: any;
  editMode: boolean;
  setHasChanges: (value: boolean) => void;
}

interface PrefaceSections {
  introduction: string;
  coreIdea: string;
  whyItMatters: string;
  whatToExpect: string;
  acknowledgments: string;
}

export const PrefaceContent = ({
  bookData,
  editMode,
  setHasChanges,
}: PrefaceContentProps) => {
  const prefaceContent = bookData.additionalData.preface || '';
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const [activeTab, setActiveTab] = useState('all');
  
  // Parsed sections from the preface
  const [sections, setSections] = useState<PrefaceSections>({
    introduction: '',
    coreIdea: '',
    whyItMatters: '',
    whatToExpect: '',
    acknowledgments: ''
  });
  
  // Parse the preface content into sections when it changes
  useEffect(() => {
    if (prefaceContent) {
      setSections({
        introduction: extractSection(prefaceContent, "Introduction", "Core Idea"),
        coreIdea: extractSection(prefaceContent, "Core Idea", "Why This Book Matters"),
        whyItMatters: extractSection(prefaceContent, "Why This Book Matters", "What to Expect"),
        whatToExpect: extractSection(prefaceContent, "What to Expect", "Acknowledgments"),
        acknowledgments: extractSection(prefaceContent, "Acknowledgments")
      });
    }
  }, [prefaceContent]);

  const extractSection = (content: string, sectionName: string, nextSectionName?: string) => {
    if (!content) return '';
    
    // Handle both bold and non-bold section headers
    const sectionPattern = new RegExp(`\\*\\*${sectionName}\\*\\*|## ${sectionName}|${sectionName}`);
    const nextSectionPattern = nextSectionName ? 
      new RegExp(`\\*\\*${nextSectionName}\\*\\*|## ${nextSectionName}|${nextSectionName}`) : 
      null;
    
    // Split by the current section name
    const parts = content.split(sectionPattern);
    if (parts.length < 2) return '';
    
    let sectionContent = parts[1].trim();
    
    // If there's a next section, split by it
    if (nextSectionPattern && sectionContent.match(nextSectionPattern)) {
      const endParts = sectionContent.split(nextSectionPattern);
      sectionContent = endParts[0].trim();
    }
    
    // Remove any remaining bold markers
    sectionContent = sectionContent
      .replace(/\*\*/g, '')
      .replace(/\[Author's Name\]/g, bookData.authorName || '')
      .trim();
    
    return sectionContent;
  };

  // Handle updates to individual sections
  const updateSection = (sectionKey: keyof PrefaceSections, content: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: content.trim()
    }));
  };

  // Combine all sections back into a formatted preface
  const combineAllSections = () => {
    return `**Preface**

**Introduction**
${sections.introduction}

**Core Idea**
${sections.coreIdea}

**Why This Book Matters**
${sections.whyItMatters}

**What to Expect**
${sections.whatToExpect}

**Acknowledgments**
${sections.acknowledgments}

`;
  };

  // Save the updated preface
  const savePreface = async () => {
    const combinedContent = combineAllSections();
    
    try {
      await updateBookGenerated({
        bookGenerationId: bookData.id,
        preface: combinedContent,
      }).unwrap();
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to update preface:", error);
    }
  };

  // Add this improved markdown processing function
  const prepareMarkdown = (content: string) => {
    if (!content) return '';
    
    // Fix common bold/italic formatting issues
    return content
      // Fix pattern like '**text **' (space before closing asterisks)
      .replace(/\*\*(.*?)\s\*\*/g, '**$1** ')
      
      // Fix pattern like '** text**' (space after opening asterisks)
      .replace(/\*\*\s(.*?)\*\*/g, ' **$1**')
      
      // Fix pattern like '*text *' (for italics)
      .replace(/\*(.*?)\s\*/g, '*$1* ')
      
      // Fix pattern like '* text*' (for italics)
      .replace(/\*\s(.*?)\*/g, ' *$1*')
      
      // Handle cases where there might be consecutive asterisks without proper spacing
      .replace(/\*\*\*\*/g, '** **');
  };

  // Render individual section with section name
  const renderSection = (title: string, content: string, sectionKey: keyof PrefaceSections) => {
    if (!editMode) {
      return (
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
          <div className="prose max-w-none text-gray-700">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </section>
      );
    }
    
    return (
      <EditorContent
        title={title}
        content={content}
        editMode={true}
        onUpdate={(updatedContent) => {
          updateSection(sectionKey, updatedContent);
          setHasChanges(true);
        }}
        className="mb-8"
        titleClassName="text-2xl font-bold mb-4 text-gray-800"
        contentClassName="prose max-w-none text-gray-700"
        setHasChanges={setHasChanges}
      />
    );
  };

  return (
    <div className="min-h-[800px] px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl text-center mb-8 text-gray-900 font-bold">Preface</h1>
        
        {editMode && (
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="introduction">Introduction</TabsTrigger>
                <TabsTrigger value="coreIdea">Core Idea</TabsTrigger>
                <TabsTrigger value="whyItMatters">Why It Matters</TabsTrigger>
                <TabsTrigger value="whatToExpect">What to Expect</TabsTrigger>
                <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
              </TabsList>
              
              <div className="text-right mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={savePreface}
                  className="flex items-center gap-2"
                >
                  <Save size={16} />
                  Save All Sections
                </Button>
              </div>
              
              {/* Individual tab content */}
              <TabsContent value="introduction">
                {renderSection("Introduction", sections.introduction, "introduction")}
              </TabsContent>
              
              <TabsContent value="coreIdea">
                {renderSection("Core Idea", sections.coreIdea, "coreIdea")}
              </TabsContent>
              
              <TabsContent value="whyItMatters">
                {renderSection("Why This Book Matters", sections.whyItMatters, "whyItMatters")}
              </TabsContent>
              
              <TabsContent value="whatToExpect">
                {renderSection("What to Expect", sections.whatToExpect, "whatToExpect")}
              </TabsContent>
              
              <TabsContent value="acknowledgments">
                {renderSection("Acknowledgments", sections.acknowledgments, "acknowledgments")}
              </TabsContent>
              
              <TabsContent value="all">
                <div className="space-y-6">
                  {renderSection("Introduction", sections.introduction, "introduction")}
                  {renderSection("Core Idea", sections.coreIdea, "coreIdea")}
                  {renderSection("Why This Book Matters", sections.whyItMatters, "whyItMatters")}
                  {renderSection("What to Expect", sections.whatToExpect, "whatToExpect")}
                  {renderSection("Acknowledgments", sections.acknowledgments, "acknowledgments")}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {!editMode && (
          <div className="space-y-8">
            {renderSection("Introduction", sections.introduction, "introduction")}
            {renderSection("Core Idea", sections.coreIdea, "coreIdea")}
            {renderSection("Why This Book Matters", sections.whyItMatters, "whyItMatters")}
            {renderSection("What to Expect", sections.whatToExpect, "whatToExpect")}
            {renderSection("Acknowledgments", sections.acknowledgments, "acknowledgments")}

            {/* Author Signature */}
            <div className="mt-12 text-right italic text-gray-700">
              <p className="mb-2">With gratitude and anticipation,</p>
              <p className="font-semibold">{bookData.authorName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 