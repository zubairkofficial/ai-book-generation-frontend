import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface TableOfContentsProps {
  tableOfContents: string;
  onClose: () => void;
  onProceed: () => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  tableOfContents,
  onClose,
  onProceed
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Table of Contents</h2>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="prose prose-lg max-w-none">
            {tableOfContents.split('\n').map((chapter, index) => (
              <div key={index} className="py-2 text-gray-700">
                {chapter}
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={onProceed}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Continue to Configuration
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents; 