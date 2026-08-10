import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { StarRating } from '@/components/ui/star-rating';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge-count';
import { Tooltip } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import {
  Play,
  Calendar,
  Heart,
  Share2,
  Info,
  Bookmark,
  Ticket,
  Star,
  Zap,
  Smile,
  Users,
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const MovieShowcase = ({ movies = [], title = "Phim Ä‘áº·c sáº¯c", loading = false, maxItems = 12, showFilters = true, enableSlider = true, category = 'all' }) => {
  const navigate = useNavigate();
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [likedMovies, setLikedMovies] = useState(new Set());
  const [bookmarkedMovies, setBookmarkedMovies] = useState(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = React.useRef(null);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Movies are already filtered by parent component, just limit by maxItems
  const filteredMovies = movies.slice(0, maxItems);

  const handleTrailerClick = (movie, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedMovie(movie);
    setTrailerModalVisible(true);
  };

  const handleLike = (movieId, event) => {
    event.preventDefault();
    event.stopPropagation();
    const newLikedMovies = new Set(likedMovies);
    if (newLikedMovies.has(movieId)) {
      newLikedMovies.delete(movieId);
    } else {
      newLikedMovies.add(movieId);
    }
    setLikedMovies(newLikedMovies);
  };

  const handleBookmark = (movieId, event) => {
    event.preventDefault();
    event.stopPropagation();
    const newBookmarkedMovies = new Set(bookmarkedMovies);
    if (newBookmarkedMovies.has(movieId)) {
      newBookmarkedMovies.delete(movieId);
    } else {
      newBookmarkedMovies.add(movieId);
    }
    setBookmarkedMovies(newBookmarkedMovies);
  };

  const handleShare = (movie, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Sharing movie:', movie.title);
  };

  // Slider navigation functions
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = containerWidth * 1; // Scroll 100% of container width
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount = containerWidth * 1; // Scroll 100% of container width
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  React.useEffect(() => {
    // Force recheck after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScrollButtons();
    }, 100);

    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);

    // Also check on scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener('scroll', checkScrollButtons);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', checkScrollButtons);
      }
    };
  }, [filteredMovies, enableSlider]);

  if (loading) {
    return (
      <div className="py-4 pb-12 bg-transparent">
        <div className="max-w-[1200px] mx-auto px-8 md:px-6 sm:px-4">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6">
            {[...Array(Math.min(maxItems, 8))].map((_, index) => (
              <Skeleton key={index} className="h-[400px] w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-4 pb-12 bg-transparent">
      <div className="max-w-[1200px] mx-auto px-8 md:px-6 sm:px-4">
        {/* Section Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4 md:flex-col md:items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 bg-[#ff6b35] flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </Avatar>
              <div>
                <h2 className="text-foreground m-0 font-bold text-2xl md:text-xl">
                  {title}
                </h2>
                <p className="text-muted-foreground text-base block mt-2 md:hidden">
                  KhÃ¡m phÃ¡ nhá»¯ng bá»™ phim hay nháº¥t Ä‘ang chiáº¿u táº¡i HotCinemas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Grid/Slider */}
        {filteredMovies.length > 0 ? (
          <div className="relative">
            {enableSlider && (
              <>
                {/* NÃºt bÃªn trÃ¡i */}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!canScrollLeft}
                  className="absolute -left-5 top-1/2 z-10 bg-background text-foreground shadow-lg border border-border w-12 h-10 rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-orange-500 hover:text-white hover:brightness-125 disabled:hidden"
                  onClick={scrollLeft}
                >
                  <ChevronRight className="h-5 w-5 rotate-180" />
                </Button>

                {/* NÃºt bÃªn pháº£i */}
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!canScrollRight}
                  className="absolute -right-5 top-1/2 z-10 bg-background text-foreground shadow-lg border border-border w-12 h-10 rounded-full transition-all duration-300 hover:bg-gradient-to-br hover:from-primary hover:to-orange-500 hover:text-white hover:brightness-125 disabled:hidden"
                  onClick={scrollRight}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            <div
              className={`mb-5 ${enableSlider ? 'overflow-x-auto overflow-y-hidden p-0 scroll-smooth scrollbar-hide' : ''}`}
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              key={`showcase-${category}-${filteredMovies.length}`}
            >
              <div className={`${enableSlider ? 'flex flex-nowrap gap-0' : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5'}`}>
                {filteredMovies.map((movie, index) => (
                  <div
                    key={movie.id || index}
                    className={`${enableSlider ? 'flex-shrink-0 flex-[0_0_calc(20%-9.6px)] max-w-[calc(20%-9.6px)] mx-[4.8px] md:flex-[0_0_calc(20%-9.6px)] md:max-w-[calc(20%-9.6px)] sm:flex-[0_0_calc(50%-6px)] sm:max-w-[calc(50%-6px)]' : ''}`}
                  >
                    <Link to={`/movies/${movie.id}`} className="block text-inherit no-underline w-full h-full hover:text-inherit">
                      <Card
                        className="bg-card text-card-foreground border border-border rounded-xl overflow-hidden h-[380px] flex flex-col shadow-none md:h-[380px] sm:h-[280px] hover:!shadow-none hover:!transform-none hover:!scale-100"
                      >
                        {/* Movie Poster Container */}
                        <div
                          className="relative overflow-hidden h-[320px] md:h-[320px] sm:h-[240px] group rounded-b-xl"
                          onMouseEnter={() => setHoveredMovie(movie.id)}
                          onMouseLeave={() => setHoveredMovie(null)}
                        >
                          {/* Age Rating Badge */}
                          <div className="absolute top-2 left-2 bg-gradient-to-br from-red-500 to-red-600 text-white px-2 py-0.5 rounded-xl text-[10px] font-semibold z-[4]">
                            {movie.ageLabel || "13+"}
                          </div>

                          {/* Rating Badge - Top Right */}
                          <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-[10px] text-white px-2 py-1 rounded-2xl text-[11px] font-medium z-[4] flex items-center gap-1 border border-white/20">
                            <Star size={12} fill="#faad14" color="#faad14" />
                            <span>{movie.averageRating || movie.rating || '8.5'}</span>
                          </div>

                          <img
                            src={movie.poster || `https://picsum.photos/300/450?random=${index}`}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-all duration-[400ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105 group-hover:brightness-90 rounded-b-xl"
                          />

                          {/* Hover Overlay */}
                          {(movie.trailerUrl || movie.trailer) && (
                            <div className={`absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-[10] ${hoveredMovie === movie.id ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                              <div className="absolute bottom-0 left-0 right-0 p-5 pb-4 flex flex-col items-center gap-3">
                                {/* Play Button */}
                                <Button
                                  size="icon"
                                  className="absolute bottom-[250%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500 to-blue-600 border-0 transition-all duration-300 z-[5] hover:from-blue-400 hover:to-blue-500 hover:scale-110 rounded-full w-14 h-14"
                                  onClick={(e) => handleTrailerClick(movie, e)}
                                >
                                  <Play className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Movie Info Section */}
                        <div className="p-1 pt-2 pb-2 bg-transparent">
                          {/* Movie Title */}
                          <div className="mb-1.5 text-foreground">
                            <span className="text-xs font-semibold leading-snug text-primary md:text-sm block truncate" title={movie.title}>
                              {movie.title}
                            </span>
                          </div>

                          {/* Genre Tags */}
                          <div className="mb-1 text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis sm:text-[9px]">
                            {(() => {
                              let genreList = [];
                              if (Array.isArray(movie.genres) && movie.genres.length > 0) {
                                genreList = movie.genres.map(g => typeof g === 'object' ? g.name : g);
                              } else if (typeof movie.genre === 'string' && movie.genre) {
                                genreList = movie.genre.split(',').map(g => g.trim());
                              } else if (Array.isArray(movie.genre) && movie.genre.length > 0) {
                                genreList = movie.genre.map(g => typeof g === 'object' ? g.name : g);
                              } else {
                                genreList = ['Phim hay'];
                              }
                              return genreList.slice(0, 3).join(', ');
                            })()}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Empty
            description={
              <div className="flex flex-col items-center gap-2">
                <p className="text-muted-foreground">KhÃ´ng cÃ³ phim nÃ o Ä‘á»ƒ hiá»ƒn thá»‹</p>
              </div>
            }
            className="my-12 py-8"
          />
        )}

        {/* Load More Section */}
        {filteredMovies.length > 0 && category !== 'top-rated' && (
          <div className="text-center mt-5 py-4">
            <div className="flex flex-col items-center gap-4">
              <Button
                className="bg-gradient-to-r from-[#ff6b35] to-[#e55a28] border-0 rounded-[25px] h-12 px-8 font-semibold transition-all duration-300 hover:-translate-y-0.5 md:h-10 md:px-6 md:text-sm sm:h-9 sm:px-5 sm:text-[13px] sm:rounded-[18px]"
                onClick={() => {
                  const filterMap = {
                    'upcoming': 'COMING_SOON',
                    'now-showing': 'NOW_SHOWING',
                    'top-rated': 'all',
                    'all': 'all'
                  };
                  navigate('/movies', { state: { defaultFilter: filterMap[category] || 'all' } });
                }}>
                <span className="hidden md:inline">Xem thÃªm</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <ResponsiveDialog
        heading={
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            <span>Trailer - {selectedMovie?.title}</span>
          </div>
        }
        open={trailerModalVisible}
        onClose={() => {
          setTrailerModalVisible(false);
          setSelectedMovie(null);
        }}
        actions={null}
        maxWidth={900}
      >
        {(selectedMovie?.trailerUrl || selectedMovie?.trailer) && (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              src={`https://www.youtube.com/embed/${getYouTubeId(selectedMovie.trailerUrl || selectedMovie.trailer)}?autoplay=1`}
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </ResponsiveDialog>
    </section >
  );
};

// Helper function to extract YouTube video ID
const getYouTubeId = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
};

export default MovieShowcase;
