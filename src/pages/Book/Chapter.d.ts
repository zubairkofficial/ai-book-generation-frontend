type ChapterConfigurationProps= {
  previousContent: string;
}

type ChapterConfig ={
  numberOfChapters: string;
  minLength: string;
  maxLength: string;
  additionalInfo?: string;
  imagePrompt?: string;
  summary?: string;
  noOfImages?: number;
}

type ChapterContent ={
  text: string;
  images: Array<{ title: string; url: string }>;
}

type BookData ={
  id: string;
  bookTitle: string;
  authorName: string;
  genre: string;
  language: string;
  targetAudience: string;
  characters: string;
  authorBio: string;
  numberOfChapters: number;
  additionalData?: {
    coverImageUrl?: string;
    backCoverImageUrl?: string;
    fullContent?: string;
  };
}


type ImageType={
    alt:string;
    src:string
}