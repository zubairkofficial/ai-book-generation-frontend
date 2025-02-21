import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { ActionButtonProps } from '../types/chat.types';

const ActionButton = ({ onClick, isLoading, label = 'Generate' }: ActionButtonProps) => (
  <Button
    onClick={onClick}
    disabled={isLoading}
    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full
      flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 
      transition-all duration-200 hover:scale-[1.02]"
  >
    {isLoading ? (
      <>
        Generating...
        <Loader2 className="w-4 h-4 animate-spin" />
      </>
    ) : (
      <>
        {label}
        <Send className="w-4 h-4" />
      </>
    )}
  </Button>
);

export default ActionButton; 