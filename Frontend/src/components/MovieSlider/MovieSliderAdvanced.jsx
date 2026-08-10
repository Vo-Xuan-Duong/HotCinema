import React, { useState, useRef } from 'react';
import Slider from 'react-slick';
import MovieCard from '@/components/MovieCard/MovieCard';
import TrailerModal from '@/components/Trailer/TrailerModal';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MovieSliderAdvanced = ({
    movies,
    title,
    showMoreButton = false,
    onShowMore,
    autoplay = false,
    autoplaySpeed = 3000,
    showDots = false,
    infinite = false
}) => {
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [trailerMovie, setTrailerMovie] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(4);
    const sliderRef = useRef(null);

    // Cấu hình slider nâng cao
    const sliderSettings = {
        dots: showDots,
        infinite: infinite,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        autoplay: autoplay,
        autoplaySpeed: autoplaySpeed,
        pauseOnHover: true,
        beforeChange: (oldIndex, newIndex) => {
            setCurrentSlide(newIndex);
        },
        afterChange: (currentSlide) => {
            setCurrentSlide(currentSlide);
        },
        responsive: [
            {
                breakpoint: 1024,
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
                    afterChange: (currentSlide) => {
                        setCurrentSlide(currentSlide);
                        setSlidesToShow(1);
                    }
                }
            }
        ]
    };

    // Tính toán trạng thái disabled cho navigation buttons
    const isFirstSlide = currentSlide === 0 && !infinite;
    const isLastSlide = currentSlide >= movies.length - slidesToShow && !infinite;

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
        <section className="py-12 px-4">
            <div className="max-w-[1200px] mx-auto">
                {title && (
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold text-foregroundtext-white">{title}</h2>
                    </div>
                )}
                <div className="relative">
                    <button
                        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-cardbg-gray-800 shadow-lg border border-borderborder-gray-700 flex items-center justify-center text-gray-700text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isFirstSlide ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => sliderRef.current?.slickPrev()}
                        disabled={isFirstSlide}
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 19L8.5 12L15.5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className="px-12">
                        <Slider ref={sliderRef} {...sliderSettings}>
                            {movies.map(movie => (
                                <div key={movie.id} className="px-2">
                                    <MovieCard movie={movie} onTrailerClick={handleTrailerClick} />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    <button
                        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-cardbg-gray-800 shadow-lg border border-borderborder-gray-700 flex items-center justify-center text-gray-700text-gray-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isLastSlide ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => sliderRef.current?.slickNext()}
                        disabled={isLastSlide}
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 5L15.5 12L8.5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Custom indicator dots */}
                {showDots && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: Math.ceil(movies.length / slidesToShow) }).map((_, index) => (
                            <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    currentSlide === index 
                                        ? 'bg-red-600 w-8' 
                                        : 'bg-gray-300bg-gray-600 hover:bg-gray-400hover:bg-background0'
                                }`}
                                onClick={() => sliderRef.current?.slickGoTo(index)}
                            />
                        ))}
                    </div>
                )}

                {showMoreButton && (
                    <div className="mt-8 text-center">
                        <button 
                            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                            onClick={onShowMore}
                        >
                            Xem thêm
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

export default MovieSliderAdvanced;
