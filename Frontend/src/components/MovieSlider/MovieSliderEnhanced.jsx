import React, { useState, useRef, useEffect } from 'react';
import Slider from 'react-slick';
import MovieCard from '@/components/MovieCard/MovieCard';
import TrailerModal from '@/components/Trailer/TrailerModal';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MovieSliderEnhanced = ({
    movies,
    title,
    showMoreButton = false,
    onShowMore,
    isLoading = false
}) => {
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [trailerMovie, setTrailerMovie] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(4);
    const [isSliderReady, setIsSliderReady] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        // Delay để slider render hoàn chỉnh
        const timer = setTimeout(() => {
            setIsSliderReady(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Cấu hình slider với enhanced settings
    const sliderSettings = {
        dots: false,
        infinite: false,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        lazyLoad: 'ondemand',
        swipeToSlide: true,
        touchThreshold: 10,
        beforeChange: (oldIndex, newIndex) => {
            setCurrentSlide(newIndex);
        },
        afterChange: (currentSlide) => {
            setCurrentSlide(currentSlide);
        },
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    afterChange: (currentSlide) => {
                        setCurrentSlide(currentSlide);
                        setSlidesToShow(3);
                    }
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    afterChange: (currentSlide) => {
                        setCurrentSlide(currentSlide);
                        setSlidesToShow(2);
                    }
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                    centerPadding: '20px',
                    afterChange: (currentSlide) => {
                        setCurrentSlide(currentSlide);
                        setSlidesToShow(1);
                    }
                }
            }
        ]
    };

    // Tính toán trạng thái disabled cho navigation buttons
    const isFirstSlide = currentSlide === 0;
    const isLastSlide = currentSlide >= movies.length - slidesToShow;

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

    if (isLoading) {
        return (
            <section className="py-12 px-4">
                <div className="max-w-[1200px] mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200bg-gray-700 rounded w-64 mb-6"></div>
                        <div className="flex gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-96 bg-gray-200bg-gray-700 rounded-lg flex-1"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-4">
            <div className="max-w-[1200px] mx-auto">
                {title && (
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900text-white mb-2">{title}</h2>
                        <div className="w-24 h-1 bg-red-600 mx-auto rounded"></div>
                    </div>
                )}
                <div className={`relative ${!isSliderReady ? 'opacity-50' : ''}`}>
                    <button
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-whitebg-gray-800 shadow-lg border border-gray-200border-gray-700 flex items-center justify-center text-gray-700text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isFirstSlide ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => sliderRef.current?.slickPrev()}
                        disabled={isFirstSlide}
                        aria-label="Previous movies"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 19L8.5 12L15.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="px-12">
                        <Slider ref={sliderRef} {...sliderSettings}>
                            {movies.map((movie, index) => (
                                <div key={movie.id} className="px-2">
                                    <MovieCard
                                        movie={movie}
                                        onTrailerClick={handleTrailerClick}
                                        priority={index < 4} // Load first 4 images with priority
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    <button
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-whitebg-gray-800 shadow-lg border border-gray-200border-gray-700 flex items-center justify-center text-gray-700text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isLastSlide ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => sliderRef.current?.slickNext()}
                        disabled={isLastSlide}
                        aria-label="Next movies"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 5L15.5 12L8.5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Progress indicator */}
                <div className="mt-6 h-1 bg-gray-200bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{
                            width: `${((currentSlide + slidesToShow) / movies.length) * 100}%`
                        }}
                    ></div>
                </div>

                {showMoreButton && (
                    <div className="mt-8 text-center">
                        <button 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            onClick={onShowMore}
                        >
                            <span>Xem thêm</span>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default MovieSliderEnhanced;
