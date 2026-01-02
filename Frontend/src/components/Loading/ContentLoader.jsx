import React from 'react';

const ContentLoader = ({ 
  loading = true, 
  message = 'Đang tải...',
  size = 'default' 
}) => {
  if (!loading) return null;

  return (
    <div className={`w-full min-h-[400px] flex items-center justify-center py-20 ${size === 'small' ? 'min-h-[200px] py-10' : size === 'large' ? 'min-h-[600px] py-32' : ''}`}>
      <div className="flex flex-col items-center gap-8">
        {/* Enhanced Spinner with Gradient */}
        <div className="relative">
          {/* Outer ring with gradient */}
          <div className="w-20 h-20 border-4 border-transparent border-t-primary/20 rounded-full animate-spin"></div>
          {/* Middle ring */}
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-primary/40 rounded-full animate-spin [animation-duration:1.2s] [animation-direction:reverse]"></div>
          {/* Inner ring with primary color */}
          <div className="absolute inset-2 w-16 h-16 border-4 border-transparent border-b-primary rounded-full animate-spin [animation-duration:0.8s]"></div>
          {/* Center dot with pulse */}
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_20px_rgba(229,9,20,0.6)] animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
        
        {/* Message with fade animation */}
        <div className="flex flex-col items-center gap-3 animate-[fadeIn_0.6s_ease-out]">
          <p className="text-lg font-semibold text-gray-800 m-0 tracking-wide">
            {message}
          </p>
          {/* Enhanced dots */}
          <div className="flex gap-2">
            <span className="w-2 h-2 bg-gradient-to-br from-primary to-orange-500 rounded-full shadow-[0_0_8px_rgba(229,9,20,0.4)] animate-[dotPulse_1.4s_ease-in-out_infinite]"></span>
            <span className="w-2 h-2 bg-gradient-to-br from-primary to-orange-500 rounded-full shadow-[0_0_8px_rgba(229,9,20,0.4)] animate-[dotPulse_1.4s_ease-in-out_infinite] [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-gradient-to-br from-primary to-orange-500 rounded-full shadow-[0_0_8px_rgba(229,9,20,0.4)] animate-[dotPulse_1.4s_ease-in-out_infinite] [animation-delay:0.4s]"></span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden md:w-40 sm:w-32">
          <div className="h-full bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full animate-[progressSlide_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(229,9,20,0.3)]"></div>
        </div>
      </div>
    </div>
  );
};

export default ContentLoader;

