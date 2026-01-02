import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectCoverflow } from 'swiper/modules';
import MovieCard from '../MovieCard/MovieCard';
import TrailerModal from '../Trailer/TrailerModal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
// Migrated to Tailwind CSS

const MovieSlider = ({ movies, title, showMoreButton = false, onShowMore }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const handleSwiperInit = (swiper) => {
    setSwiperInstance(swiper);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handleSwiperUpdate = (swiper) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  const handlePrevClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (swiperInstance && !isBeginning) {
      swiperInstance.slidePrev();
    }
  };

  const handleNextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (swiperInstance && !isEnd) {
      swiperInstance.slideNext();
    }
  };

  // Xử lý mở trailer
  const handleTrailerClick = (movie) => {
    setTrailerMovie(movie);
    setIsTrailerOpen(true);
  };

  const handleCloseTrailer = () => {
    setIsTrailerOpen(false);
    setTrailerMovie(null);
  };

  // Xử lý chuyển đổi link YouTube sang embed và tự động phát
  let trailerUrl = '';
  if (trailerMovie && trailerMovie.trailer) {
    trailerUrl = trailerMovie.trailer;
    if (trailerUrl.includes('youtube.com/watch?v=')) {
      const videoId = trailerUrl.split('v=')[1]?.split('&')[0];
      trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
  }

  return (
    <section className="my-12 px-4 relative overflow-x-hidden w-full box-border bg-transparent">
      <div className="max-w-[1400px] mx-auto relative w-full box-border">
        {title && (
          <div className="mb-10 text-left relative">
            <h2 className="text-[2.8rem] font-extrabold text-gray-900 m-0 mb-2 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-400 bg-clip-text text-transparent leading-tight tracking-tight md:text-4xl sm:text-3xl">
              {title}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-sm mt-2 animate-[slideIn_0.6s_ease-out]"></div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-8 relative py-4 flex-nowrap min-h-[60px]">
          <button
            className={`bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 rounded-full w-11 h-11 p-0 text-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(102,126,234,0.3),0_2px_8px_rgba(102,126,234,0.2)] flex items-center justify-center relative overflow-hidden z-10 flex-shrink-0 m-0 outline-none no-underline appearance-none ${isBeginning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-[0_6px_25px_rgba(102,126,234,0.4)]'} md:w-10 md:h-10 sm:w-9 sm:h-9`}
            onClick={handlePrevClick}
            disabled={isBeginning}
            aria-label="Previous movies"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M15.5 19L8.5 12L15.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex-1 min-w-0 overflow-hidden w-full box-border">
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectCoverflow]}
              spaceBetween={20}
              slidesPerView={1}
              speed={800}
              grabCursor={true}
              centeredSlides={false}
              loop={movies.length > 4}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              effect="slide"
              onSwiper={handleSwiperInit}
              onSlideChange={handleSwiperUpdate}
              onReachBeginning={() => setIsBeginning(true)}
              onReachEnd={() => setIsEnd(true)}
              onFromEdge={() => {
                setIsBeginning(false);
                setIsEnd(false);
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 15,
                },
                900: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1200: {
                  slidesPerView: 4,
                  spaceBetween: 20,
                },
                1400: {
                  slidesPerView: 5,
                  spaceBetween: 25,
                }
              }}
              className="swiper-container"
            >
              {movies.map((movie) => (
                <SwiperSlide key={movie.id} className="flex-shrink-0 [&_.movie-card]:w-full [&_.movie-card]:h-auto [&_.movie-card]:min-h-[400px]">
                  <MovieCard
                    movie={movie}
                    onTrailerClick={handleTrailerClick}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <button
            className={`bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 rounded-full w-11 h-11 p-0 text-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(102,126,234,0.3),0_2px_8px_rgba(102,126,234,0.2)] flex items-center justify-center relative overflow-hidden z-10 flex-shrink-0 m-0 outline-none no-underline appearance-none ${isEnd ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 hover:shadow-[0_6px_25px_rgba(102,126,234,0.4)]'} md:w-10 md:h-10 sm:w-9 sm:h-9`}
            onClick={handleNextClick}
            disabled={isEnd}
            aria-label="Next movies"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
              <path d="M8.5 5L15.5 12L8.5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {showMoreButton && (
          <div className="flex justify-center mt-8">
            <button 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md" 
              onClick={onShowMore}
            >
              <span>Xem thêm</span>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={handleCloseTrailer}
        trailerUrl={trailerUrl}
        movieTitle={trailerMovie?.title || ''}
      />
    </section>
  );
};

export default MovieSlider; 