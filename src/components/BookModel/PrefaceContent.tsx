import React, { useState, useEffect } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save, X } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface PrefaceContentProps {
  bookData: any;
  editMode: boolean;
  refetchBook: any;
  setEditMode: any
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
  refetchBook,
  setEditMode
}: PrefaceContentProps) => {
  const { addToast } = useToast();
  const prefaceContent = bookData.additionalData.preface || '';
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const [activeTab, setActiveTab] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  
  // Parsed sections from the preface
  const [sections, setSections] = useState<PrefaceSections>({
    introduction: '',
    coreIdea: '',
    whyItMatters: '',
    whatToExpect: '',
    acknowledgments: ''
  });
  
  // Store original content for cancellation
  const [originalSections, setOriginalSections] = useState<PrefaceSections>({
    introduction: '',
    coreIdea: '',
    whyItMatters: '',
    whatToExpect: '',
    acknowledgments: ''
  });
  
  // Parse the preface content into sections when it changes
  useEffect(() => {
    if (prefaceContent) {
      const parsedSections = {
        introduction: '',
        coreIdea: extractSection(prefaceContent, "Core Idea", "Why It Matters"),
        whyItMatters: extractSection(prefaceContent, "Why It Matters", "What to Expect"),
        whatToExpect: extractSection(prefaceContent, "What to Expect", "Acknowledgments"),
        acknowledgments: extractSection(prefaceContent, "Acknowledgments")
      };
      
      setSections(parsedSections);
      setOriginalSections(parsedSections);
    }
  }, [prefaceContent]);

  const extractSection = (content: string, sectionName: string, nextSectionName?: string) => {
    if (!content) return '';
    
    // Handle multiple heading formats: Markdown, HTML, and bold text
    const sectionPattern = new RegExp(`## ${sectionName}|<h\\d[^>]*>${sectionName}|\\*\\*${sectionName}\\*\\*|${sectionName}`, 'i');
    const nextSectionPattern = nextSectionName ? 
      new RegExp(`## ${nextSectionName}|<h\\d[^>]*>${nextSectionName}|\\*\\*${nextSectionName}\\*\\*|${nextSectionName}`, 'i') : 
      null;
    
    // Split by the current section name
    const parts = content.split(sectionPattern);
    if (parts.length < 2) return '';
    
    let sectionContent = parts[1].trim();
    
    // If there's a next section, split by it
    if (nextSectionPattern) {
      const nextSectionMatch = sectionContent.match(nextSectionPattern);
      if (nextSectionMatch) {
        sectionContent = sectionContent.substring(0, nextSectionMatch.index).trim();
      }
    }
    
    // Clean up formatting markers but preserve HTML formatting
    sectionContent = sectionContent
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown but keep the text
      .replace(/\[Author's Name\]/g, bookData.authorName || '')
      .trim();
    
    return sectionContent;
  };

  const updateSection = (sectionName: string, sectionContent: string) => {
    setSections(prev => ({
      ...prev,
      [sectionName]: sectionContent
    }));
    setHasLocalChanges(true);
  };

  const savePreface = async () => {
    try {
      setIsSaving(true);
      
      // Use markdown formatting to match what the API is sending back
      const combinedContent = `
## Core Idea
${sections.coreIdea}

## Why It Matters
${sections.whyItMatters}

## What to Expect
${sections.whatToExpect}

## Acknowledgments
${sections.acknowledgments}
      `.trim();
      
      // Update the book data
      await updateBookGenerated({
        bookGenerationId: bookData.id,
        preface: combinedContent
      }).unwrap();
      
      await refetchBook();
      setEditMode(false);
      setHasLocalChanges(false);
      setOriginalSections({...sections});
      addToast("Preface saved successfully", "success");
    } catch (error) {
      console.error('Error saving preface:', error);
      addToast("Failed to save preface", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleCancelChanges = () => {
    setSections({...originalSections});
    setHasLocalChanges(false);
  };

  const renderSection = (title: string, content: string, sectionKey: string) => {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
        {editMode ? (
          <div className="bg-white rounded-lg border border-gray-200">
            <QuillEditor
              content={content}
              editMode={true}
              onUpdate={(newContent) => updateSection(sectionKey, newContent)}
              className="min-h-0 p-0"
              contentClassName="prose max-w-none min-h-[150px]"
              placeholder={`Write the ${title.toLowerCase()} section here...`}
            />
          </div>
        ) : (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[800px] px-8 py-12">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm p-12 rounded-lg shadow-lg">
        <h1 className="text-4xl text-center mb-8 text-gray-900 font-bold">Preface</h1>
        
        {/* Save/Cancel buttons when in edit mode and changes exist */}
        {editMode && (
          <div className="sticky w-fit ml-auto top-4 z-10 flex justify-end mb-4 px-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-gray-100 p-2 flex gap-2">
              {hasLocalChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelChanges}
                  className="flex items-center gap-1 text-gray-700 hover:text-red-600"
                  disabled={isSaving}
                >
                  <X size={16} />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              )}
              
              <Button
                variant="default"
                size="sm"
                onClick={savePreface}
                className={`flex items-center gap-1 ${
                  !hasLocalChanges 
                    ? "bg-gray-300 hover:bg-gray-300 cursor-not-allowed" 
                    : "bg-amber-500 hover:bg-amber-600 text-white"
                }`}
                disabled={!hasLocalChanges || isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span className="hidden sm:inline">Save Preface</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {editMode && (
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="coreIdea">Core Idea</TabsTrigger>
                <TabsTrigger value="whyItMatters">Why It Matters</TabsTrigger>
                <TabsTrigger value="whatToExpect">What to Expect</TabsTrigger>
                <TabsTrigger value="acknowledgments">Acknowledgments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="coreIdea">
                {renderSection("Core Idea", sections.coreIdea, "coreIdea")}
              </TabsContent>
              
              <TabsContent value="whyItMatters">
                {renderSection("Why It Matters", sections.whyItMatters, "whyItMatters")}
              </TabsContent>
              
              <TabsContent value="whatToExpect">
                {renderSection("What to Expect", sections.whatToExpect, "whatToExpect")}
              </TabsContent>
              
              <TabsContent value="acknowledgments">
                {renderSection("Acknowledgments", sections.acknowledgments, "acknowledgments")}
              </TabsContent>
              
              <TabsContent value="all">
                <div className="space-y-6">
                  {renderSection("Core Idea", sections.coreIdea, "coreIdea")}
                  {renderSection("Why It Matters", sections.whyItMatters, "whyItMatters")}
                  {renderSection("What to Expect", sections.whatToExpect, "whatToExpect")}
                  {renderSection("Acknowledgments", sections.acknowledgments, "acknowledgments")}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {!editMode && (
          <div className="space-y-8">
            {renderSection("Core Idea", sections.coreIdea, "coreIdea")}
            {renderSection("Why It Matters", sections.whyItMatters, "whyItMatters")}
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