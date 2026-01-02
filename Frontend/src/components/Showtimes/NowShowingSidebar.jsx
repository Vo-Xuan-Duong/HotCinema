import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Migrated to Tailwind CSS
import Loading from '../Loading';

const icons = {
  movie: <span className="icon">🎬</span>,
  star: <span className="icon">⭐</span>,
  clock: <span className="icon">⏱️</span>
};

const NowShowingSidebar = ({ currentMovieId }) => {
  const [movies, setMovies] = useState([]);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load movies data
    const loadMovies = async () => {
      setLoading(true);
      try {
        const response = await fetch('/src/data/movies.json');
        const data = await response.json();
        setMovies(data.slice(0, 8)); // Show first 8 movies
      } catch (error) {
        console.error('Error loading movies:', error);
        // Fallback data
        setMovies([
          {
            id: 1,
            title: "Avengers: Endgame",
            genre: "Hành động",
            rating: 9.2,
            duration: 181,
            poster: "https://image-worker.momocdn.net/img/80099757410724750-doemon.png?size=M&referer=cinema.momocdn.net"
          },
          {
            id: 2,
            title: "Ma Không Đầu",
            genre: "Kinh Dị, Hài",
            rating: 8.4,
            duration: 148,
            poster: "https://image-worker.momocdn.net/img/80099757410724750-doemon.png?size=M&referer=cinema.momocdn.net"
          },
          {
            id: 3,
            title: "Bí Kíp Luyện Rồng",
            genre: "Phiêu Lưu, Hành Động",
            rating: 9.6,
            duration: 176,
            poster: "https://image-worker.momocdn.net/img/80099757410724750-doemon.png?size=M&referer=cinema.momocdn.net"
          },
          {
            id: 4,
            title: "DAN DA DAN: Tà Nhân",
            genre: "Hoạt Hình, Phiêu Lưu",
            rating: 9.1,
            duration: 161,
            poster: "https://image-worker.momocdn.net/img/80099757410724750-doemon.png?size=M&referer=cinema.momocdn.net"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-[11px] transition-colors duration-200 ${star <= fullStars ? 'text-yellow-400' : star === fullStars + 1 && hasHalfStar ? 'text-yellow-400 relative after:content-["★"] after:absolute after:left-0 after:top-0 after:text-gray-600 after:clip-path-[polygon(0_0,50%_0,50%_100%,0_100%)]' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <aside className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden mt-4 text-white h-[600px] sticky top-8 flex flex-col max-h-[600px] md:w-full md:static md:mt-4 md:h-[500px] md:max-h-[500px] sm:w-[500px] sm:h-[450px] sm:max-h-[450px]">
      <div className="p-6 border-b border-white/10 bg-white/5 flex-shrink-0 md:p-4 sm:p-3">
        <h3 className="text-xl font-bold m-0 mb-2 flex items-center gap-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent md:text-lg sm:text-base">
          {icons.movie} Phim đang chiếu
        </h3>
        <p className="text-gray-400 text-sm m-0 leading-snug sm:text-xs">
          Khám phá những bộ phim mới nhất
        </p>
      </div>

      {loading ? (
        <Loading text="Đang tải phim..." />
      ) : (
        <div className="p-2 flex flex-col gap-2 overflow-y-auto flex-1 scroll-smooth min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-sm [&::-webkit-scrollbar-track]:my-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-white/10 [&::-webkit-scrollbar-thumb]:transition-colors [&::-webkit-scrollbar-thumb]:duration-300 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-corner]:bg-transparent md:p-4 sm:p-3 sm:gap-3">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movies/${movie.id}`}
              className={`flex gap-2 p-2 bg-white/5 rounded-xl no-underline text-inherit transition-all duration-300 border border-white/10 relative overflow-hidden items-center min-h-[100px] hover:bg-white/8 hover:border-white/20 hover:translate-x-1 hover:shadow-[0_4px_15px_rgba(0,0,0,0.3)] sm:min-h-[70px] sm:p-1.5 ${currentMovieId === movie.id ? 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border-indigo-500' : ''} ${hoveredMovie === movie.id ? 'bg-white/8 border-white/20 translate-x-1 shadow-[0_4px_15px_rgba(0,0,0,0.3)]' : ''}`}
              onMouseEnter={() => setHoveredMovie(movie.id)}
              onMouseLeave={() => setHoveredMovie(null)}
            >
              <div className="relative flex-[0_0_60px] h-20 rounded-sm overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.3)] sm:flex-[0_0_50px] sm:h-[70px]">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {currentMovieId === movie.id && (
                  <div className="absolute inset-0 bg-indigo-500/80 flex items-center justify-center text-white text-[11px] font-semibold uppercase tracking-wide p-2.5">
                    <span>Đang xem</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="text-center">
                    <span className="text-white text-[11px] font-semibold uppercase tracking-wide">Xem chi tiết</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-2 min-w-0 max-w-full">
                <h4 className="text-sm font-semibold m-0 text-white leading-snug line-clamp-3 break-words max-w-full sm:text-xs">{movie.title}</h4>

                <div className="flex flex-wrap gap-2 text-xs text-gray-300 min-w-0 max-w-full py-3 px-2 sm:text-[11px] sm:py-2">
                  <span className="bg-white/8 text-white rounded-md px-2.5 py-0.5 text-xs font-medium max-w-[110px] overflow-hidden text-ellipsis whitespace-nowrap inline-block sm:text-[11px] sm:px-1.5 sm:py-0.5">{movie.genre}</span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1 sm:text-[10px]">
                    {icons.clock} {formatDuration(movie.durationMinutes || movie.duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  {renderStars(movie.averageRating || movie.rating)}
                  <span className="text-xs font-semibold text-yellow-400 sm:text-[11px]">{movie.averageRating || movie.rating}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
};

export default NowShowingSidebar; 