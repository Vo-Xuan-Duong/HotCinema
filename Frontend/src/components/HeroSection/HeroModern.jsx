import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Play, Star, Flame, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroModern = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Featured upcoming movies - Phim ná»•i báº­t sáº¯p chiáº¿u
  const featuredMovies = [
    {
      id: 1,
      title: "Ma KhÃ´ng Äáº§u",
      subtitle: "Kinh dá»‹ hÃ i hÆ°á»›c Ä‘áº§y báº¥t ngá»",
      description: "Má»™t cÃ¢u chuyá»‡n rÃ¹ng rá»£n vá» há»“n ma khÃ´ng Ä‘áº§u Ã¡m áº£nh ngÃ´i lÃ ng cá»• kÃ­nh, gÃ¢y ra nhá»¯ng tÃ¬nh huá»‘ng dá»Ÿ khÃ³c dá»Ÿ cÆ°á»i",
      image: "https://image.tmdb.org/t/p/original/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
      poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
      features: ["Kinh dá»‹", "HÃ i hÆ°á»›c", "Giáº­t gÃ¢n"],
      badge: "COMING SOON",
      releaseDate: "17.10.2025",
      rating: 8.4,
      duration: "148 phÃºt"
    },
    {
      id: 2,
      title: "Doraemon: Nobita vÃ  VÃ¹ng Äáº¥t Má»›i",
      subtitle: "PhiÃªu lÆ°u ká»³ thÃº cÃ¹ng Doraemon",
      description: "Nobita cÃ¹ng báº¡n bÃ¨ khÃ¡m phÃ¡ vÃ¹ng Ä‘áº¥t má»›i Ä‘áº§y bÃ­ áº©n vÃ  thá»­ thÃ¡ch trong má»™t hÃ nh trÃ¬nh Ä‘Ã¡ng nhá»›",
      image: "https://image.tmdb.org/t/p/original/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      features: ["Hoáº¡t hÃ¬nh", "PhiÃªu lÆ°u", "Gia Ä‘Ã¬nh"],
      badge: "Sáº®P CHIáº¾U",
      releaseDate: "25.10.2025",
      rating: 9.0,
      duration: "112 phÃºt"
    },
    {
      id: 3,
      title: "Dune: Part Two",
      subtitle: "Cuá»™c chiáº¿n hÃ nh tinh cÃ¡t tiáº¿p diá»…n",
      description: "Cuá»™c chiáº¿n giÃ nh quyá»n lá»±c trÃªn hÃ nh tinh cÃ¡t tiáº¿p tá»¥c vá»›i nhá»¯ng pha hÃ nh Ä‘á»™ng mÃ£n nhÃ£n vÃ  hÃ¬nh áº£nh choÃ¡ng ngá»£p",
      image: "https://image.tmdb.org/t/p/original/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
      poster: "https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg",
      features: ["Sci-Fi", "HÃ nh Ä‘á»™ng", "Epic"],
      badge: "BLOCKBUSTER",
      releaseDate: "01.11.2025",
      rating: 9.2,
      duration: "166 phÃºt"
    }
  ];

  // Náº¿u cÃ³ movies tá»« props, Æ°u tiÃªn sá»­ dá»¥ng nhá»¯ng phim sáº¯p chiáº¿u tá»« API
  const upcomingMovies = movies.filter(movie => {
    if (!movie.releaseDate) return false;
    const releaseYear = movie.releaseDate.includes('.')
      ? Number(movie.releaseDate.split('.')[2])
      : new Date(movie.releaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return releaseYear >= currentYear;
  }).slice(0, 3);

  // Sá»­ dá»¥ng phim tá»« API náº¿u cÃ³, khÃ´ng thÃ¬ dÃ¹ng data máº«u
  const displayMovies = upcomingMovies.length > 0
    ? upcomingMovies.map(movie => {
      // Láº¥y thá»ƒ loáº¡i tá»« API
      let genres = [];
      if (movie.genre && typeof movie.genre === 'string') {
        genres = movie.genre.split(',').slice(0, 3).map(g => g.trim());
      } else if (movie.genres && Array.isArray(movie.genres)) {
        genres = movie.genres.slice(0, 3).map(g => g.name || g);
      }

      // Náº¿u khÃ´ng cÃ³ thá»ƒ loáº¡i, dÃ¹ng máº·c Ä‘á»‹nh
      if (genres.length === 0) {
        genres = ["HÃ nh Ä‘á»™ng", "PhiÃªu lÆ°u"];
      }

      // Xá»­ lÃ½ URL hÃ¬nh áº£nh
      const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/original${path}`;
      };

      return {
        id: movie.id,
        title: movie.title,
        subtitle: movie.originalTitle || movie.original_title || movie.title,
        description: movie.overview || movie.description || "ThÃ´ng tin chi tiáº¿t vá» phim sáº½ Ä‘Æ°á»£c cáº­p nháº­t sá»›m",
        image: getImageUrl(movie.backdropUrl || movie.backdropPath || movie.backdrop_path || movie.backgroundImage || movie.posterUrl || movie.poster),
        poster: getImageUrl(movie.posterUrl || movie.poster),
        features: genres,
        badge: movie.status === 'COMING_SOON' ? "Sáº®P CHIáº¾U" : "COMING SOON",
        releaseDate: movie.releaseDate || "Sáº¯p cÃ´ng bá»‘",
        rating: movie.averageRating || movie.rating || 8.0,
        duration: movie.durationFormatted || (movie.durationMinutes ? `${movie.durationMinutes} phÃºt` : (movie.duration ? `${movie.duration} phÃºt` : "N/A"))
      };
    })
    : featuredMovies;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayMovies.length);
    }, 5000); // TÄƒng thá»i gian Ä‘á»ƒ ngÆ°á»i xem Ä‘á»c thÃ´ng tin phim
    return () => clearInterval(interval);
  }, [displayMovies.length]);

  const currentItem = displayMovies[currentIndex];

  return (
    <div className="relative min-h-[70vh] py-12 flex items-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 md:py-8 md:min-h-[auto]">
      {/* Backdrop Background */}
      {currentItem.image && (
        <div className="absolute inset-0 z-[1]">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${currentItem.image})`,
              opacity: 0.9
            }}
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
        </div>
      )}


      {/* Content Container */}
      <div className="relative z-[10] w-full max-w-[1200px] mx-auto px-8 md:px-6 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:gap-16 md:gap-8">
          {/* Left Side - Content */}
          <div className="lg:col-span-8 flex flex-col justify-center space-y-4 order-2 lg:order-1 md:text-center lg:text-left">
            <div className="mb-2">
              <StatusBadge tone="red" className="text-xs font-semibold px-3 py-1 rounded-full border-0 shadow-lg backdrop-blur-sm">
                <Flame className="h-3 w-3 inline mr-1" /> {currentItem.badge}
              </StatusBadge>
            </div>

            <h1 className="text-lg lg:text-4xl font-bold leading-tight mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] transition-all duration-300 md:text-2xl sm:text-xl text-white">
              {currentItem.title}
            </h1>

            <p className="text-base lg:text-lg text-white mb-3 block font-medium tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] md:text-sm sm:text-xs">
              {currentItem.subtitle}
            </p>

            <p className="text-sm lg:text-base text-white/95 leading-relaxed mb-5 block md:text-xs md:mb-3 line-clamp-3 min-h-[3.9rem] lg:min-h-[4.5rem] md:min-h-[3rem] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              {currentItem.description}
            </p>


            {/* Movie Info */}
            <div className="mb-6 md:mb-4 flex flex-wrap gap-3 justify-center lg:justify-start">
              <StatusBadge tone="blue" className="text-sm px-3 py-1.5 rounded-lg font-medium border-0 shadow-sm inline-flex items-center gap-1.5 md:text-xs">
                <Clock className="h-3 w-3" />
                {currentItem.duration}
              </StatusBadge>
              <StatusBadge tone="gold" className="text-sm px-3 py-1.5 rounded-lg font-medium border-0 shadow-sm inline-flex items-center gap-1.5 md:text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {currentItem.rating}/10
              </StatusBadge>
              <StatusBadge tone="purple" className="text-sm px-3 py-1.5 rounded-lg font-medium border-0 shadow-sm inline-flex items-center gap-1.5 md:text-xs">
                <Trophy className="h-3 w-3" />
                Khá»Ÿi chiáº¿u: {currentItem.releaseDate}
              </StatusBadge>
            </div>

            {/* Features/Genres */}
            <div className="flex flex-wrap gap-2 mb-8 md:mb-6 md:justify-center lg:justify-start">
              {currentItem.features.map((feature, index) => (
                <span key={index} className="text-sm text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 font-semibold transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:bg-white/30 hover:border-primary/50 hover:text-primary md:text-xs md:px-3 md:py-1.5">
                  {feature}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-4 md:flex-row md:gap-3 md:w-full sm:flex-col sm:gap-3">
              <Link to={`/movies/${currentItem.id}`} className="md:flex-1 sm:w-full">
                <Button
                  className="bg-gradient-to-r from-primary to-[#ff6b35] border-0 h-12 px-8 text-base font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 md:w-full md:h-11 md:text-sm sm:h-10 sm:text-sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Xem Chi Tiáº¿t
                </Button>
              </Link>
              <Link to="/movies?filter=upcoming" className="md:flex-1 sm:w-full">
                <Button
                  size="large"
                  className="h-12 px-8 text-base font-semibold rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30 hover:border-primary hover:text-white hover:shadow-lg md:w-full md:h-11 md:text-sm sm:h-10 sm:text-sm"
                >
                  Phim Sáº¯p Chiáº¿u
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="lg:col-span-4 flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-full max-w-[180px] lg:max-w-[220px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl">
              <img
                src={currentItem.poster || currentItem.image}
                alt={currentItem.title}
                className="w-full h-auto aspect-[2/3] object-cover block"
              />
              {/* Rating Badge */}
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span className="text-gray-900 font-bold text-base">{currentItem.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-1.5 mt-8 md:mt-6">
          {displayMovies.map((_, index) => (
            <button
              key={index}
              className={`w-1 h-1 rounded-full border transition-all duration-300 cursor-pointer hover:scale-125 ${currentIndex === index
                ? 'bg-primary border-primary shadow-md shadow-primary/50'
                : 'bg-gray-300 border-gray-300 hover:border-primary/50'
                }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );

};

export default HeroModern;
