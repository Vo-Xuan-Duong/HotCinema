import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight, Eye, Star } from 'lucide-react';

const MovieCarousel = ({ movies = [], title = 'Movies', onMovieClick, loading = false }) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Touch support for mobile swipe
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Memoize filtered movies for performance
    const validMovies = useMemo(() => {
        return movies.filter(movie => movie && movie.id);
    }, [movies]);

    // Handle movie card click to navigate to detail page
    const handleMovieClick = useCallback((movie) => {
        if (movie && movie.id) {
            // If there's a custom onMovieClick handler, call it first
            if (onMovieClick) {
                onMovieClick(movie);
            }
            // Navigate to movie detail page
            navigate(`/movies/${movie.id}`);
        }
    }, [navigate, onMovieClick]);

    const checkScrollButtons = useCallback(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollLeft = container.scrollLeft;
            const maxScrollLeft = container.scrollWidth - container.clientWidth;

            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < maxScrollLeft - 10);

            // Calculate scroll progress
            const progress = maxScrollLeft > 0 ? (scrollLeft / maxScrollLeft) * 100 : 0;
            setScrollProgress(progress);
        }
    }, []);

    const scroll = useCallback((direction) => {
        const container = scrollContainerRef.current;
        if (container && !isScrolling) {
            setIsScrolling(true);
            setHasInteracted(true);

            // Calculate scroll amount for 4 cards visible (1200px container)
            const cardWidth = 280;
            const gap = 24;
            const cardsToScroll = 2; // Scroll 2 cards at a time for smooth navigation
            const scrollAmount = (cardWidth + gap) * cardsToScroll;

            const newScrollLeft = direction === 'left'
                ? Math.max(0, container.scrollLeft - scrollAmount)
                : container.scrollLeft + scrollAmount;

            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });

            setTimeout(() => setIsScrolling(false), 500);
        }
    }, [isScrolling]);

    // Touch handlers for mobile swipe
    const handleTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const handleTouchMove = useCallback((e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && canScrollRight) {
            scroll('right');
        }
        if (isRightSwipe && canScrollLeft) {
            scroll('left');
        }
    }, [touchStart, touchEnd, canScrollLeft, canScrollRight, scroll]);

    const handleWheelScroll = useCallback((e) => {
        if (!hasInteracted) return;

        // Enhanced wheel scrolling for better UX
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
            e.preventDefault();
            const container = scrollContainerRef.current;
            if (container) {
                const scrollMultiplier = 2; // Smooth scrolling speed
                const scrollAmount = (e.deltaX || e.deltaY) * scrollMultiplier;

                // Smooth scrolling with bounds checking
                const maxScroll = container.scrollWidth - container.clientWidth;
                const newScrollLeft = Math.max(0, Math.min(maxScroll, container.scrollLeft + scrollAmount));

                container.scrollTo({
                    left: newScrollLeft,
                    behavior: 'smooth'
                });
            }
        } else if (Math.abs(e.deltaY) > 10) {
            // Vertical scroll can trigger horizontal scroll
            e.preventDefault();
            const container = scrollContainerRef.current;
            if (container) {
                const scrollAmount = e.deltaY * 1.5;
                container.scrollLeft += scrollAmount;
            }
        }
    }, [hasInteracted]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowLeft' && canScrollLeft) {
            e.preventDefault();
            scroll('left');
        } else if (e.key === 'ArrowRight' && canScrollRight) {
            e.preventDefault();
            scroll('right');
        }
    }, [canScrollLeft, canScrollRight, scroll]);

    useEffect(() => {
        checkScrollButtons();

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollButtons, { passive: true });
            container.addEventListener('wheel', handleWheelScroll, { passive: false });

            return () => {
                container.removeEventListener('scroll', checkScrollButtons);
                container.removeEventListener('wheel', handleWheelScroll);
            };
        }
    }, [checkScrollButtons, handleWheelScroll]);

    if (loading) {
        return (
            <div className="my-10 px-12 relative max-w-[1200px] mx-auto border-0 outline-none overflow-visible md:px-6 sm:px-4">
                <div className="flex justify-between items-end mb-6 gap-4">
                    <div className="flex-1">
                        <h2 className="text-white text-2xl font-bold m-0 mb-2.5 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent md:text-xl">
                            {title}
                        </h2>
                    </div>
                </div>
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-[280px] h-[420px] bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!validMovies.length) {
        return (
            <div className="my-10 px-12 relative max-w-[1200px] mx-auto border-0 outline-none overflow-visible md:px-6 sm:px-4">
                <div className="flex justify-between items-end mb-6 gap-4">
                    <div className="flex-1">
                        <h2 className="text-white text-2xl font-bold m-0 mb-2.5 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent md:text-xl">
                            {title}
                        </h2>
                    </div>
                </div>
                <div className="text-center py-12 text-gray-400">
                    <p>KhÃ´ng cÃ³ phim nÃ o Ä‘á»ƒ hiá»ƒn thá»‹</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-10 px-12 relative max-w-[1200px] mx-auto border-0 outline-none overflow-visible md:px-6 sm:px-4">
            <div className="flex justify-between items-end mb-6 gap-4">
                <div className="flex-1">
                    <h2 className="text-white text-2xl font-bold m-0 mb-2.5 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent md:text-xl">
                        {title}
                        <span className="text-gray-400 text-lg font-normal ml-2">({validMovies.length})</span>
                    </h2>
                    {scrollProgress > 0 && (
                        <div className="w-full max-w-[200px] h-1 bg-white/10 rounded-sm overflow-hidden mt-2.5" role="progressbar" aria-label="Tiáº¿n Ä‘á»™ cuá»™n">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-[#ff6b35] rounded-sm transition-all duration-300"
                                style={{ width: `${Math.max(10, scrollProgress)}%` }}
                            />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="link"
                        className="text-white hover:text-primary"
                        aria-label="Xem táº¥t cáº£ phim"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Xem táº¥t cáº£
                    </Button>
                </div>
            </div>

            <div className="relative flex items-center gap-5 border-0 outline-none">
                {/* Left Navigation Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute left-0 z-10 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/15 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] visible opacity-100 hover:bg-black/80 hover:scale-110 ${!canScrollLeft || isScrolling ? 'opacity-50 cursor-not-allowed' : ''} md:w-10 md:h-10 sm:w-9 sm:h-9`}
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft || isScrolling}
                    aria-label="Xem phim trÆ°á»›c"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>

                <div
                    className={`flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth ${isScrolling ? 'pointer-events-none' : ''}`}
                    ref={scrollContainerRef}
                    onWheel={handleWheelScroll}
                    onKeyDown={handleKeyDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    tabIndex={0}
                    role="list"
                    aria-label={`Danh sÃ¡ch ${title.toLowerCase()}`}
                >
                    <div className="flex gap-6">
                        {validMovies.map((movie, index) => (
                            <div
                                key={movie.id}
                                className="flex-shrink-0 w-[280px] animate-[fadeInCard_0.5s_ease_forwards]"
                                style={{
                                    animationDelay: `${index * 0.1}s`
                                }}
                                role="listitem"
                            >
                                <Card
                                    className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                                    onClick={() => handleMovieClick(movie)}
                                >
                                    <div className="relative group">
                                        <img
                                            alt={`Poster phim ${movie.title}`}
                                            src={movie.poster}
                                            className="w-full h-[420px] object-cover transition-transform duration-300 group-hover:scale-105"
                                            loading={index < 4 ? 'eager' : 'lazy'}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/280x420/1a1a1a/666?text=KhÃ´ng+cÃ³+poster';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <Button
                                                size="icon"
                                                className="bg-primary border-0 w-16 h-16 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 rounded-full"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onMovieClick?.(movie);
                                                }}
                                                aria-label={`PhÃ¡t trailer phim ${movie.title}`}
                                            >
                                                <Play className="h-8 w-8" />
                                            </Button>
                                        </div>
                                        {(movie.averageRating || movie.rating) && (
                                            <div className="absolute top-3 right-3 bg-black/80 text-white px-2 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 backdrop-blur-[10px]">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span>{movie.averageRating || movie.rating}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="text-base font-semibold line-clamp-2" title={movie.title}>
                                            {movie.title}
                                        </div>
                                        <div className="mt-2">
                                            {(movie.genres?.length > 0 || movie.genre) && (
                                                <div className="flex flex-wrap gap-1">
                                                    {movie.genres ? (
                                                        movie.genres.map((genre, index) => (
                                                            <StatusBadge key={index} tone="blue" className="text-xs">
                                                                {genre}
                                                            </StatusBadge>
                                                        ))
                                                    ) : (
                                                        movie.genre.split(',').map((genre, index) => (
                                                            <StatusBadge key={index} tone="blue" className="text-xs">
                                                                {genre.trim()}
                                                            </StatusBadge>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Navigation Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute right-0 z-10 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/15 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-[15px] shadow-[0_4px_15px_rgba(0,0,0,0.3)] visible opacity-100 hover:bg-black/80 hover:scale-110 ${!canScrollRight || isScrolling ? 'opacity-50 cursor-not-allowed' : ''} md:w-10 md:h-10 sm:w-9 sm:h-9`}
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight || isScrolling}
                    aria-label="Xem phim tiáº¿p theo"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default React.memo(MovieCarousel);
