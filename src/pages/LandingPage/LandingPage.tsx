import { Bell, Search,  ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "./LandingPage.css"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "./AnimatedSection"
import { BookCarousel } from "../BookCarousel"
import { Link, useNavigate } from "react-router-dom"
import {  useLandingFetchBooksQuery } from "@/api/bookApi"
import { BookGenresWithImages } from "@/constant"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Card } from "@/components/ui/card"
import { PenTool, Star } from "lucide-react"
import CircularGallery from "../CircularGallery/CircularGallery "

export default function Home() {

  const { data: refetchAllBooks }: any = useLandingFetchBooksQuery({});

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const navigate=useNavigate()
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const startCarousel = () => {
      intervalRef.current = window.setInterval(() => {
        if (carouselRef.current) {
          const container = carouselRef.current;
          const scrollAmount = container.scrollLeft + container.offsetWidth;
          
          // If we're at the end, scroll back to beginning
          if (scrollAmount >= container.scrollWidth - 100) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
          }
        }
      }, 5000); // Change slide every 5 seconds
    };
    
    startCarousel();
    
    // Cleanup interval on component unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  

  
 
  
  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-amber-50/30">
      {/* Enhanced Newsletter Banner with gradient and shadow */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 px-4 text-center text-white shadow-sm">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-100" />
            <span className="text-sm font-medium">Get latest updates on new deals with our newsletter!</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-amber-700 hover:bg-amber-50 text-xs h-7 rounded-sm font-medium shadow-sm transition-all duration-300"
          >
            SUBSCRIBE NOW
          </Button>
        </div>
      </div>

      {/* Professional Header with shadow and animation */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md transition-all duration-300">
        <div className="container mx-auto py-3 md:py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform hover:scale-105 duration-300">
                <span className="text-amber-600 font-bold">AI</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">AI Books</span>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="#home" 
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-white hover:text-amber-900 transition-colors font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-white after:transition-all"
              >
                Home
              </Link>
              <Link 
                to="#category" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('category')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-white hover:text-amber-900 transition-colors font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-white after:transition-all"
              >
                Category
              </Link>
              <Link 
                to="#about" 
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-white hover:text-amber-900 transition-colors font-medium text-sm relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-white after:transition-all"
              >
                About Us
              </Link>
            </nav>

            {/* Search and Get Started - consistent with AllBookTable style */}
            <div className="flex items-center gap-4">
              <div style={{display: "inline-flex", alignItems: "center"}}>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition duration-300 flex items-center shadow-sm transform hover:scale-105"
                  onClick={handleGetStarted}
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <button className="text-white hover:text-amber-900 transition-colors bg-amber-600/30 p-2 rounded-full hover:bg-amber-600/40">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Enhanced Hero Section with gradient text similar to HomePage */}
        <section id="home" className="bg-gradient-to-b from-white to-amber-50 text-gray-900 py-10 md:py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 pb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-800"
              >
                Transform Ideas into Books with AI Magic
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-amber-700 text-sm md:text-base max-w-2xl font-medium"
              >
                AI simplifies turning your ideas into books. With powerful tools, you can brainstorm, create, and publish with ease. Embrace this technology and watch your creativity come to life!
              </motion.p>
            </div>
            
            <div ref={carouselRef} className="overflow-x-auto rounded-xl shadow-lg border border-amber-100">
              {refetchAllBooks?.data ? (
                <div style={{ height: '600px', position: 'relative' }}>
                <CircularGallery bend={3} textColor="#ffffff" borderRadius={0.05} books={refetchAllBooks.data} />
              </div>
                // <BookCarousel books={refetchAllBooks.data} />
              ) : (
                <div className="flex justify-center items-center h-64 bg-amber-50">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-t-amber-500 border-amber-200 animate-spin"></div>
                    <p className="text-amber-700 font-medium">Loading books...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Book Categories with Analytics-style filter pills */}
        <AnimatedSection>
          <section id="category" className="py-16 bg-gradient-to-b from-white to-amber-50/80 overflow-hidden">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <div className="inline-block bg-amber-100 px-4 py-1 rounded-full text-amber-800 text-xs font-medium mb-3">
                    EXPLORE BY GENRE
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 relative">
                    Book Categories
                    <span className="absolute -bottom-2 left-0 w-20 h-1 bg-amber-400 rounded-full"></span>
                  </h2>
                  <p className="text-gray-600 mt-4 max-w-xl">Explore our extensive collection by genre and discover your next favorite read</p>
                </div>
                
                {/* Category filter like Analytics page */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="relative group hover:z-20">
                    <div className="px-3 py-1.5 text-sm rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center gap-1 cursor-pointer transition-all">
                      <Search className="w-3.5 h-3.5 mr-1" />
                      Filter
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </div>
                    
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                   invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                   cursor-default transform translate-y-1 group-hover:translate-y-0">
                      <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                      
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Search Categories</label>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                          placeholder="Search genres..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Slider
                dots={false}
                infinite={true}
                speed={600}
                slidesToShow={6}
                slidesToScroll={1}
                autoplay={true}
                autoplaySpeed={400}
                pauseOnHover={true}
                responsive={[
                  {
                    breakpoint: 1280,
                    settings: {
                      slidesToShow: 5,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 4,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 3,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 640,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                    }
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                    }
                  }
                ]}
                className="category-slider"
              >
                {BookGenresWithImages?.map((category, index) => (
                  <div key={index} className="px-2">
                    <div
                      className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md"
                    >
                      <div className="relative h-44 w-full overflow-hidden rounded-xl">
                        <img
                          src={category?.image || "/placeholder.svg"}
                          alt={category?.name}
                          className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm font-medium transform translate-y-0 group-hover:translate-y-[-5px] transition-transform duration-300">
                          {category.name}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </section>
        </AnimatedSection>

        {/* Feature section with AllBookTable styling */}
        <section className="py-16 bg-gradient-to-b from-amber-50/80 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block bg-amber-100 px-4 py-1 rounded-full text-amber-800 text-xs font-medium mb-3">
                WHY CHOOSE US
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Discover why AI Books is the perfect solution for authors and readers alike</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* AI-Powered Writing */}
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <PenTool className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">AI-Powered Writing</h3>
                  <p className="text-gray-600 mb-4">Generate ideas, outlines, and complete chapters with our advanced AI technology</p>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                    Premium Feature
                  </span>
                </div>
              </Card>
              
              {/* Cover Image Generation */}
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-600">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Cover Image Generation</h3>
                  <p className="text-gray-600 mb-4">Create stunning book covers instantly with our AI image generator tailored to your book's theme</p>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                    Premium Feature
                  </span>
                </div>
              </Card>
              
              {/* Book Core Idea Generation */}
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-600">
                      <path d="M2 12h1" />
                      <path d="M6 12h1" />
                      <path d="M10 12h1" />
                      <path d="m15.6 8.5-.87.5m-5.37-3 .5.87m4 6.93.5.87m-6.37-3 .5-.87m12.74 3L12 8" />
                      <path d="M20 12a8 8 0 0 0-8-8" />
                      <path d="M12 20a8 8 0 0 0 8-8" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Core Idea Generation</h3>
                  <p className="text-gray-600 mb-4">Develop compelling book concepts and storylines with AI-powered brainstorming assistance</p>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Basic Feature
                  </span>
                </div>
              </Card>
              
              {/* Writing Tips & Guidance */}
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-600">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Writing Tips & Guidance</h3>
                  <p className="text-gray-600 mb-4">Receive personalized suggestions to improve your writing style, structure, and narrative flow</p>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Basic Feature
                  </span>
                </div>
              </Card>
              
              {/* Chapter Summary Generation */}
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-600">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                      <path d="M10 9H8" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Chapter Summaries</h3>
                  <p className="text-gray-600 mb-4">Generate concise summaries of your chapters to maintain coherence and track narrative progression</p>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                    Premium Feature
                  </span>
                </div>
              </Card>
              
              {/* Book Presentation Generation */}
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border border-gray-100 p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-amber-600">
                      <path d="M3 3v18h18" />
                      <path d="m7 12 4-4 4 4 6-6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">Book Presentations</h3>
                  <p className="text-gray-600 mb-4">Transform your book into compelling presentations for marketing, pitches, or reader engagement</p>
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                    Premium Feature
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials like HomePage "Top Contributor" */}
        <section className="py-16 bg-gradient-to-b from-amber-50/30 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block bg-amber-100 px-4 py-1 rounded-full text-amber-800 text-xs font-medium mb-3">
                TESTIMONIALS
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Hear from our community of authors who have transformed their writing process</p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 overflow-hidden relative max-w-4xl mx-auto"
            >
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-100 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute bottom-0 left-20 w-32 h-32 bg-amber-200/30 rounded-full blur-lg"></div>
              
              <div className="relative">
                <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-xl">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full blur-sm animate-pulse"></div>
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg relative">
                      J
                    </div>
                    <div className="absolute -right-1 -bottom-1 bg-amber-100 p-1.5 rounded-full border-2 border-white">
                      <Star className='w-5 h-5 text-amber-600' />
                    </div>
                  </div>
                  
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">John Smith</h3>
                    <p className="text-sm text-gray-600 mb-4">Professional Author</p>
                    <p className="text-gray-700 italic">"AI Books transformed my writing process. I can now create books in half the time with twice the quality. The AI suggestions are remarkably insightful!"</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer with better mobile spacing */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold">AI</span>
                </div>
                <span className="text-xl font-semibold tracking-tight">AI Books</span>
              </div>
              <p className="text-gray-400 mb-6">
                AI Books helps authors create quality content faster with advanced artificial intelligence.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors bg-gray-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors bg-gray-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors bg-gray-800 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="md:pl-8">
              <h3 className="font-semibold text-lg mb-5 text-amber-300">Shop</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    Genres
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    Offers
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-5 text-amber-300">Help</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    Customer Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    Get Started Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors hover:translate-x-1 inline-block">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-5 text-amber-300">Contact</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-amber-500 mt-0.5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-gray-400">123 Book Street, Library City, 10001</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-amber-500 mt-0.5"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span className="text-gray-400">+1 (234) 567-8901</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-amber-500 mt-0.5"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span className="text-gray-400">support@aibooks.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} AI Books. All rights reserved.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Shipping Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
