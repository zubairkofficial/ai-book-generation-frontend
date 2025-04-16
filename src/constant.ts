//baseUrl
export const BASE_URl="http://localhost:3000/api/v1"
//live url
// export const BASE_URl="http://54.167.10.76/backend/api/v1"
export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
  }

  export type Toast = {
    id: string;
    message: string;
    type: ToastType; // Use the enum here
  };

export const DEFAULT_Model="gpt-4o"

export const FONT_OPTIONS = [
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Palatino', value: 'Palatino' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Bookman', value: 'Bookman' },
  { label: 'Baskerville', value: 'Baskerville' }
];

export const FONT_SIZES = [
  '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'
];

export const NAV_STYLES = {
  desktop: `
    hidden md:flex md:flex-col
    fixed left-4 top-1/2 transform -translate-y-1/2 
    bg-white/95 backdrop-blur-sm rounded-xl 
    shadow-lg border border-gray-100
    p-3 space-y-1.5 transition-all duration-300
    hover:shadow-xl
  `,
  mobile: `
    md:hidden fixed bottom-0 left-0 right-0 
    bg-white/95 backdrop-blur-sm
    shadow-[0_-4px_10px_rgba(0,0,0,0.05)]
    border-t border-gray-100
    px-2 py-1.5 z-50
  `,
  button: {
    base: `
      w-full transition-all duration-200
      hover:bg-amber-50 hover:text-amber-700
      focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1
      rounded-lg
    `,
    active: `bg-amber-100 text-amber-900 shadow-inner`,
    inactive: `text-gray-600`
  }
};

export const BookGenresWithImages = [
  {
    name: "Fiction",
    image: "/images/fiction.jpg"
  },
  {
    name: "Non-Fiction",
    image: "/images/non-fiction.jpg"
  },
  {
    name: "Mystery",
    image: "/images/mystery.jpg"
  },
  {
    name: "Science Fiction",
    image: "/images/science-fiction.jpg"
  },
  {
    name: "Fantasy",
    image: "/images/fantasy.jpg"
  },
  {
    name: "Romance",
    image: "/images/romance.jpg"
  },
  {
    name: "Business",
    image: "/images/business.jpg"
  },
  {
    name: "Professional",
    image: "/images/professional.jpg"
  },
  {
    name: "Education",
    image: "/images/education.jpg"
  },
  {
    name: "Health",
    image: "/images/health.jpg"
  },
  {
    name: "History",
    image: "/images/history.jpg"
  },
  {
    name: "Literature",
    image: "/images/literature.jpg"
  },
  {
    name: "Travel",
    image: "/images/travel.jpg"
  },
  {
    name: "Technology",
    image: "/images/technology.jpg"
  },
  {
    name: "Sports",
    image: "/images/sports.jpg"
  },
  {
    name: "Science",
    image: "/images/science-fiction.jpg"
  },
  {
    name: "Politics",
    image: "/images/politics.jpg"
  },
  {
    name: "Philosophy",
    image: "/images/philosophy.jpg"
  },
  {
    name: "Religion",
    image: "/images/religion.jpg"
  },
  {
    name: "Art",
    image: "/images/art.jpg"
  },
  {
    name: "Music",
    image: "/images/music.jpg"
  },
  {
    name: "Comedy",
    image: "/images/comedy.jpg"
  }
];
