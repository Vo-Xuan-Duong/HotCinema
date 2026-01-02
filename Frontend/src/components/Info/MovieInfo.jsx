import React, { useState } from 'react';
// Migrated to Tailwind CSS
import TrailerModal from '../Trailer/TrailerModal';

const icons = {
  genre: <span className="icon">🎬</span>,
  duration: <span className="icon">⏱️</span>,
  format: <span className="icon">🎞️</span>,
  language: <span className="icon">💬</span>,
  age: <span className="icon">⚠️</span>,
  star: <span className="icon">⭐</span>,
  calendar: <span className="icon">📅</span>,
  director: <span className="icon">🎭</span>,
  cast: <span className="icon">👥</span>
};

const MovieInfo = ({ movie }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const maxChars = 120; // Số ký tự ước lượng cho 2 dòng, có thể điều chỉnh

  const handleTrailerClick = (e) => {
    e.preventDefault();
    setIsTrailerOpen(true);
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  if (!movie) return null;

  // Xử lý chuyển đổi link YouTube sang dạng embed và tự động phát
  let trailerUrl = movie.trailer;
  if (trailerUrl && trailerUrl.includes('youtube.com/watch?v=')) {
    const videoId = trailerUrl.split('v=')[1]?.split('&')[0];
    trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  // Mock rating data
  const rating = movie.averageRating || movie.rating || 8.5;
  const ratingCount = 1247;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden mt-8 relative" style={{
        backgroundImage: movie.backgroundImage ? `url(${movie.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 w-full h-full bg-[rgba(20,20,30,0.75)] backdrop-blur-[8px] z-[1]"></div>
        <div className="flex gap-10 p-10 relative z-[2] md:flex-col md:gap-6 md:p-5 sm:p-4 sm:gap-4">
          <div className="flex-[0_0_400px] max-w-[400px] md:flex-[0_0_420px] md:max-w-[420px] md:mx-auto sm:flex-[0_0_300px] sm:max-w-[300px]">
            <div className="relative rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:-translate-y-1">
              <img
                className="w-full h-auto block rounded-[14px] transition-transform duration-300"
                src={movie.poster || '/default-poster.png'}
                alt={movie.title}
              />
              <div className="absolute top-3 left-3 flex flex-col gap-2 sm:flex-row sm:top-2 sm:left-2">
                <span className="px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide bg-gradient-to-br from-indigo-500 to-purple-600 text-white">{movie.format}</span>
                <span className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wide text-white ${movie.ageLabel?.toLowerCase() === 'k' ? 'bg-gradient-to-br from-green-500 to-green-600' : movie.ageLabel?.toLowerCase() === '13+' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : movie.ageLabel?.toLowerCase() === '16+' ? 'bg-gradient-to-br from-red-600 to-red-700' : movie.ageLabel?.toLowerCase() === '18+' ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-black/80'}`}>
                  {movie.ageLabel}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap mt-4">
              <button
                className="flex items-center gap-2 px-7 py-3.5 border-0 rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 no-underline bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_4px_15px_rgba(102,126,234,0.3)] hover:from-[#5a6fd8] hover:to-[#6a4190] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(102,126,234,0.4)] md:px-5 md:py-2.5 md:text-base sm:px-3.5 sm:py-2 sm:text-sm"
                onClick={handleTrailerClick}
              >
                <span className="text-lg md:text-lg sm:text-base">▶</span>
                Xem Trailer
              </button>
            </div>
          </div>

          <div className="flex-1 text-white">
            <div>
              <h2 className="text-4xl font-black p-2.5 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight tracking-wide md:text-3xl sm:text-2xl">{movie.title}</h2>
              <div className="flex items-center gap-4 md:flex-col md:items-start md:gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xl transition-colors duration-200 ${star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-yellow-400">{rating}</span>
                  <span className="text-sm text-gray-400">({ratingCount} đánh giá)</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-extrabold m-0 mb-4 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-sm md:text-lg sm:text-base">Thông tin phim</h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-5 mb-6 p-6 bg-white/5 rounded-xl backdrop-blur-[10px] md:grid-cols-[repeat(2,1fr)] md:gap-3 md:p-4 sm:grid-cols-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400 text-base mr-1">Thể loại:</span>
                  <span className="font-bold text-base rounded-md px-2.5 py-0.5 bg-[rgba(162,89,255,0.13)] text-[#a259ff] ml-0.5">{movie.genre}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400 text-base mr-1">Phụ đề/Thuyết minh:</span>
                  <span className="font-bold text-base rounded-md px-2.5 py-0.5 bg-[rgba(108,99,255,0.13)] text-[#6c63ff] ml-0.5">{movie.audioOptions[0].type || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400 text-base mr-1">Thời lượng:</span>
                  <span className="font-bold text-base rounded-md px-2.5 py-0.5 bg-[rgba(0,184,148,0.13)] text-[#00b894] ml-0.5">{movie.durationMinutes || movie.duration} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400 text-base mr-1">Định dạng:</span>
                  <span className="font-bold text-base rounded-md px-2.5 py-0.5 bg-[rgba(255,152,0,0.13)] text-[#ff9800] ml-0.5">{movie.format}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yellow-400 text-base mr-1">Khởi chiếu:</span>
                  <span className="font-bold text-base rounded-md px-2.5 py-0.5 bg-[rgba(33,150,243,0.13)] text-[#2196f3] ml-0.5">{movie.releaseDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8 px-6 py-4 bg-[rgba(244,67,54,0.1)] border-l-4 border-red-500 rounded-lg text-red-200">
              <span className="text-xl">{icons.age}</span>
              <span>Phim dành cho {movie.ageLabel} trở lên</span>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-semibold m-0 mb-4 text-white relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-5 before:bg-gradient-to-br before:from-indigo-500 before:to-purple-600 before:rounded-sm">Nội dung phim</h3>
              <div className="bg-transparent px-6 py-0 rounded-xl backdrop-blur-[10px] relative overflow-hidden">
                {!isDescriptionExpanded && movie.description && movie.description.length > maxChars ? (
                  <>
                    {movie.description.slice(0, maxChars)}...
                    <button
                      className="bg-transparent border-0 text-indigo-400 font-semibold cursor-pointer inline ml-0 p-0 text-base underline hover:bg-indigo-500/10 hover:text-indigo-300"
                      onClick={toggleDescription}
                    >
                      Xem thêm
                    </button>
                  </>
                ) : (
                  <>
                    {movie.description}
                    {movie.description && movie.description.length > maxChars && (
                      <button
                        className="bg-transparent border-0 text-indigo-400 font-semibold cursor-pointer inline ml-2 p-0 text-base underline hover:bg-indigo-500/10 hover:text-indigo-300"
                        onClick={toggleDescription}
                      >
                        Thu gọn
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 md:hidden">
              <h3 className="text-lg font-extrabold text-[#a259ff] mb-4 tracking-wide">Ekip sản xuất</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 py-3 border-b border-white/7 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="min-w-[120px] font-bold text-yellow-400 text-base">Đạo diễn : </span>
                    <span className="text-base text-white font-medium">{movie.director || 'Chưa cập nhật'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3 border-b border-white/7 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="min-w-[120px] font-bold text-yellow-400 text-base">Diễn viên : </span>
                    <span className="text-base text-white font-medium">
                      {Array.isArray(movie.cast) ? (
                        <span className="inline">
                          {movie.cast.map((actor, idx) => (
                            <span className="text-base text-white font-medium mr-0.5" key={idx}>
                              {actor.name}{idx < movie.cast.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </span>
                      ) : (
                        movie.cast || 'Chưa cập nhật'
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3 border-b border-white/7 last:border-0">
                  <div className="flex items-center gap-4">
                    <span className="min-w-[120px] font-bold text-yellow-400 text-base">Nhà sản xuất : </span>
                    <span className="text-base text-white font-medium">{movie.productionStudio || 'Chưa cập nhật'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={trailerUrl}
        movieTitle={movie.title}
      />
    </>
  );
};

export default MovieInfo; 