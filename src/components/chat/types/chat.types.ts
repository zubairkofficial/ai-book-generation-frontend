import { AiAssistantType } from "@/types/enum";

export interface ChatDialogProps {
  isOpen: boolean;
  title: string | null;
  onClose: () => void;
}

export interface ResponseData {
  bookCoverInfo?: Record<string, string>;
  information?: Record<string, string>;
  type: AiAssistantType;
  response: {
    generatedText: string;
    timestamp: string;
  };
}

export interface ContentProps {
  responseData: ResponseData;
  generatedContent: string;
}

export interface ActionButtonProps {
  onClick: () => void;
  isLoading: boolean;
  label?: string;
} 