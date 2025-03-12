import React, { useState, useEffect } from 'react';
import { QuillEditor } from './QuillEditor';
import { useUpdateBookGeneratedMutation } from '@/api/bookApi';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Save,  X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { markdownComponents } from '@/utils/markdownUtils';
import { useToast } from '@/context/ToastContext';

interface IntroductionContentProps {
  bookData: any;
  editMode: boolean;
  setHasChanges: (value: boolean) => void;
  refetchBook: any;
  setEditMode: any;
}

interface IntroductionSections {
  overview: string;
}

export const IntroductionContent: React.FC<IntroductionContentProps> = ({
  bookData,
  editMode,
  setHasChanges,
  refetchBook,
  setEditMode
}) => {
  const { addToast } = useToast();
  const introductionContent = bookData?.additionalData?.introduction || '';
  const [updateBookGenerated] = useUpdateBookGeneratedMutation();
  const [activeTab, setActiveTab] = useState('fullIntroduction');
  const [isStructured, setIsStructured] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Parsed sections from the introduction
  const [sections, setSections] = useState<IntroductionSections>({
    overview: '',
  });

  // Parse the introduction content when it changes
  useEffect(() => {
    if (introductionContent) {
      // Parse paragraphs
      const paragraphs = introductionContent
        .split(/\n\n+/) // Split by double line breaks
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0);

      if (paragraphs.length === 0) {
        setSections({
          overview: '',
        });
        setIsStructured(false);
        return;
      }

      const sectionsCount = paragraphs.length;
      
      if (sectionsCount === 1) {
        // Single paragraph introduction
        setSections({
          overview: paragraphs[0],
        });
        setIsStructured(false);
      } else if (sectionsCount >= 2) {
        // Two or more paragraphs - use first paragraph as overview
        setSections({
          overview: paragraphs.join('\n\n'),
        });
        setIsStructured(true);
      }
    } else {
      // Reset if no content
      setSections({
        overview: '',
      });
      setIsStructured(false);
    }
  }, [introductionContent]);

  // Update section content
  const updateSection = (section: keyof IntroductionSections, content: string) => {
    setSections(prev => ({
      ...prev,
      [section]: content
    }));
    setHasLocalChanges(true);
    setHasChanges(true);
  };

  // Save changes
  const saveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Use the overview content as the full introduction
      const updatedIntroduction = sections.overview;
      
      await updateBookGenerated({
        bookGenerationId: bookData.id,
        introduction: updatedIntroduction
      }).unwrap();
      
      setEditMode(false);
      await refetchBook();
      setHasChanges(false);
      setHasLocalChanges(false);
      addToast("Introduction saved successfully", "success");
    } catch (error) {
      console.error('Failed to save introduction:', error);
      addToast("Failed to save introduction", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleCancelChanges = () => {
    setSections({
      overview: introductionContent,
    });
    setHasLocalChanges(false);
    setHasChanges(false);
  };

  // Render a section with title
  const renderSection = (title: string, content: string, sectionKey: keyof IntroductionSections) => {
    if (!content && !editMode) return null;
    
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">{title}</h2>
        {editMode ? (
          <QuillEditor
            content={content}
            editMode={true}
            onUpdate={(html) => updateSection(sectionKey, html)}
            className="prose max-w-none p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 min-h-[200px]"
          />
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  // Render the full introduction for editing
  const renderFullIntroduction = () => (
    <QuillEditor
      content={sections.overview}
      editMode={true}
      onUpdate={(html) => updateSection('overview', html)}
      className="prose max-w-none p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200 min-h-[500px]"
    />
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-b from-blue-50/80 to-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
        <h1 className="text-4xl text-center mb-8 text-gray-900">Introduction</h1>
        
        {/* Save/Cancel buttons when in edit mode and changes exist */}
        {editMode && (
          <div className="sticky top-4 z-10 flex justify-end mb-6">
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
                onClick={saveChanges}
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
                    <span className="hidden sm:inline">Save Introduction</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
        
        {editMode && (
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
             
              
              <TabsContent value="fullIntroduction">
                {renderFullIntroduction()}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {!editMode && (
          <div className="space-y-8">
            {isStructured ? (
              // Display structured introduction with sections
              <>
                {sections.overview && renderSection("Overview", sections.overview, "overview")}
              </>
            ) : (
              // Display full introduction for unstructured content
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={markdownComponents}
                >
                  {introductionContent}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
