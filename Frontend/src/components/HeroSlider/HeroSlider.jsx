import React, { useState, useEffect, useRef } from 'react';
// Migrated to Tailwind CSS
import HeroOverlayFeatured from '@/components/HeroOverlayFeatured';

const HeroSlider = ({ movies }) => {
  const [index, setIndex] = useState(0);
  const heroMovies = movies && movies.length > 0 ? movies : [];
  const timerRef = useRef();

  // Chuyển phim theo chỉ số
  const goTo = (newIndex) => {
    if (heroMovies.length === 0) return;
    if (newIndex < 0) setIndex(heroMovies.length - 1);
    else if (newIndex >= heroMovies.length) setIndex(0);
    else setIndex(newIndex);
  };

  // Reset timer khi index thay đổi
  useEffect(() => {
    if (heroMovies.length === 0) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroMovies.length);
    }, 10000);
    return () => clearInterval(timerRef.current);
  }, [index, heroMovies.length]);

  if (heroMovies.length === 0) return null;
  const movie = heroMovies[index];

  return (
    <section
      className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-16 flex items-center justify-center h-[60vh] max-h-[600px] min-h-[500px] relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${movie.poster})`,
      }}
    >
      {index === 0 ? (
        <HeroOverlayFeatured />
      ) : (
        <div className="relative z-[2] bg-black/40 border border-white/10 rounded-lg p-8 backdrop-blur-[10px] max-w-[600px] w-[600px] h-[400px] mx-auto text-left overflow-hidden flex flex-col box-border md:p-6 md:max-w-[90vw] md:w-[90vw] md:h-[350px] md:text-center sm:p-4 sm:w-[95vw] sm:h-[320px]">
          <h1 className="text-white text-[2.2rem] font-bold m-0 mb-4 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] overflow-hidden text-ellipsis line-clamp-2 md:text-[1.8rem] sm:text-[1.6rem]">{movie.title}</h1>
          <p className="text-white/90 text-base mb-4 leading-relaxed overflow-hidden text-ellipsis flex-1 max-w-full mb-4 line-clamp-4 md:text-sm md:line-clamp-3 sm:text-[13px] sm:line-clamp-2">{movie.description}</p>
          <div className="text-white/90 text-base mb-4 leading-relaxed overflow-hidden text-ellipsis mb-6 text-sm text-white/70 flex-shrink-0 whitespace-nowrap overflow-hidden text-ellipsis md:text-sm sm:text-[13px]">
            <span><b>Khởi chiếu:</b> {movie.releaseDate}</span> | <span><b>Thể loại:</b> {movie.genre}</span> | <span><b>Thời lượng:</b> {movie.durationFormatted || (movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.duration)}</span>
          </div>
          <button className="bg-[#e50914] text-white border-0 px-6 py-3 rounded text-base font-semibold cursor-pointer transition-all duration-300 flex-shrink-0 self-start mt-auto hover:bg-[#b8070f] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(229,9,20,0.4)] md:w-full md:p-3.5">Đặt vé ngay</button>
        </div>
      )}
      <div className="absolute left-0 right-0 bottom-8 flex justify-center gap-2 z-[4] sm:bottom-5 sm:gap-1.5">
        {heroMovies.map((_, i) => (
          <button
            key={i}
            className={`w-1.5 h-1.5 rounded-full border-0 cursor-pointer transition-all duration-300 outline-none hover:bg-white/80 sm:w-1.25 sm:h-1.25 ${i === index ? 'bg-[#e50914] scale-110' : 'bg-white/50'}`}
            onClick={() => goTo(i)}
            aria-label={`Chuyển đến phim ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;