export interface ChapterConfig {
  numberOfChapters: string;
  minLength: string;
  maxLength: string;
  additionalInfo: string;
  imagePrompt: string;
  noOfImages: number;
  summary: string;
}

export interface ChapterContent {
  text: string;
  images: Array<{ title: string; url: string }>;
}

export interface SelectedContent {
  text: string;
  index: number;
}

export interface TextFormat {
  isBold: boolean;
  isItalic: boolean;
  color: string;
  fontSize: string;
}

export interface ChapterConfigurationProps {
  previousContent?: string;
} 