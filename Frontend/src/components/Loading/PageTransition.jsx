import React from 'react';
// Migrated to Tailwind CSS - Complex animations kept in CSS file

const PageTransition = ({
  loading = true,
  type = 'cinema',
  message = '',
  size = 'default'
}) => {
  if (!loading) return null;

  const renderLoader = () => {
    switch (type) {
      case 'cinema':
        return (
          <div className="cinema-loader">
            <div className="film-strip">
              <div className="film-hole"></div>
              <div className="film-hole"></div>
              <div className="film-hole"></div>
              <div className="film-hole"></div>
            </div>
            <div className="projector-light"></div>
          </div>
        );

      case 'movie':
        return (
          <div className="movie-loader">
            <div className="clapperboard">
              <div className="clapper-top"></div>
              <div className="clapper-bottom"></div>
            </div>
          </div>
        );

      case 'ticket':
        return (
          <div className="ticket-loader">
            <div className="ticket">
              <div className="ticket-perforation">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="perf-hole"></div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="modern-loader">
            <div className="spinner-ring">
              <div className="ring-segment"></div>
              <div className="ring-segment"></div>
              <div className="ring-segment"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 backdrop-blur-[20px] ${size === 'small' ? '[&_.loader-container]:scale-75' : size === 'large' ? '[&_.loader-container]:scale-130' : ''}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[200px] h-[200px] rounded-full blur-[60px] bg-gradient-to-br from-[#ff6b35] to-amber-500 top-[20%] left-[10%] animate-[float_6s_ease-in-out_infinite] md:w-[100px] md:h-[100px]"></div>
        <div className="absolute w-[150px] h-[150px] rounded-full blur-[60px] bg-gradient-to-br from-blue-500 to-blue-700 top-[60%] right-[15%] animate-[float_6s_ease-in-out_infinite] [animation-delay:2s] md:w-[100px] md:h-[100px]"></div>
        <div className="absolute w-[100px] h-[100px] rounded-full blur-[60px] bg-gradient-to-br from-emerald-500 to-emerald-600 bottom-[30%] left-[60%] animate-[float_6s_ease-in-out_infinite] [animation-delay:4s]"></div>
      </div>

      <div className="relative z-[2] text-center flex flex-col items-center gap-6">
        <div className="mb-4 loader-container md:scale-80 sm:scale-70">
          {renderLoader()}
        </div>

        <div className="flex flex-col items-center gap-3">
          <h3 className="font-sans text-xl font-semibold text-gray-700 m-0 tracking-wide md:text-base sm:text-sm">
            {message || 'Đang tải...'}
          </h3>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full animate-[dotPulse_1.4s_ease-in-out_infinite]"></span>
            <span className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full animate-[dotPulse_1.4s_ease-in-out_infinite] [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full animate-[dotPulse_1.4s_ease-in-out_infinite] [animation-delay:0.4s]"></span>
          </div>
        </div>

        <div className="w-[200px] h-1 bg-black/10 rounded-sm overflow-hidden md:w-[150px] sm:w-[120px] sm:h-0.5">
          <div className="h-full bg-gradient-to-r from-[#ff6b35] via-amber-500 to-blue-500 rounded-sm animate-[progressFill_3s_ease-in-out_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default PageTransition;
