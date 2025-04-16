import { BASE_URl } from "@/constant"
import { useEffect, useState } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "./BookCarousel.css"
interface Book {
  bookTitle: string
  image: string
  genre?: string
  additionalData: {
    coverImageUrl: string
  }
}

export function BookCarousel({ books }: { books: Book[] }) {
  const [randomBooks, setRandomBooks] = useState<Book[]>([])

  useEffect(() => {
    if (books?.length > 0) {
      const shuffled = [...books].sort(() => 0.5 - Math.random())
      setRandomBooks(shuffled.slice(0, 10))
    }
  }, [books])

  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    arrows: false,
    dots: false,
    focusOnSelect: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          centerPadding: "0px"
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerPadding: "0px"
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerPadding: "60px"
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px"
        }
      }
    ]
  }

  return (
   

    <div className="overflow-hidden slider-container  px-4 mx-52">
      
      <Slider {...settings}>
        {randomBooks.map((book, index) => (
          <div key={`book-${index}`} className="px-2 focus:outline-none">
            <div className="relative transition-transform duration-300 ease-in-out transform hover:scale-105 
              slick-slide-container group">
              <div className="relative rounded-lg shadow-xl overflow-hidden 
                transition-all duration-300 ease-out
                h-[280px] sm:h-[320px] md:h-[360px]
                [&_.genre-tag]:opacity-0
                group-[.slick-center]:scale-110 group-[.slick-center]:z-10
                group-[.slick-center]:[&_.genre-tag]:opacity-100">

                {book?.genre && (
                  <span className="genre-tag absolute top-3 right-3 z-20 bg-amber-500/90 
                    text-white text-xs font-bold px-3 py-1 rounded-full 
                    transition-opacity duration-300">
                    {book.genre}
                  </span>
                )}

                <img
                  src={`${BASE_URl}/uploads/${book?.additionalData?.coverImageUrl || ''}`}
                  alt={book.bookTitle || 'Book cover'}
                  className="w-full h-full object-cover object-center 
                    group-[.slick-center]:brightness-100
                    brightness-75 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x600/f59e0b/ffffff?text=No+Cover";
                  }}
                />

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 
                  to-transparent transition-opacity duration-300">
                  <h3 className="text-white text-sm md:text-base font-semibold 
                    line-clamp-2 text-center drop-shadow-md">
                    {book.bookTitle}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
   
    </div>
   
  )
}