import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X, Maximize2, Share2, Loader2 } from 'lucide-react';
import useNotification from '@/hooks/useNotification';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  const notification = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen && trailerUrl) {
      setIsLoading(true);
    }
  }, [isOpen, trailerUrl]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector('.trailer-iframe');
    if (iframe) {
      if (!document.fullscreenElement) {
        iframe.requestFullscreen().catch(err => {
          notification.error('Không thể vào chế độ toàn màn hình');
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && trailerUrl) {
      try {
        await navigator.share({
          title: `Trailer: ${movieTitle}`,
          text: `Xem trailer của ${movieTitle}`,
          url: trailerUrl
        });
      } catch (err) {
        // User cancelled or error
        if (err.name !== 'AbortError') {
          // Copy to clipboard as fallback
          navigator.clipboard.writeText(trailerUrl);
          notification.success('Đã sao chép link trailer');
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(trailerUrl || '');
      notification.success('Đã sao chép link trailer');
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 bg-white border-gray-800 overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 bg-gradient-to-r from-primary/90 via-red-600/90 to-orange-600/90 border-b border-white/10">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-white truncate drop-shadow-lg">
                {movieTitle || 'Trailer'}
              </h2>
              <p className="text-xs md:text-sm text-white/80 font-medium">Official Trailer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 text-white hover:bg-white/20"
              onClick={handleFullscreen}
              title="Toàn màn hình"
            >
              <Maximize2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 text-white hover:bg-white/20"
              onClick={handleShare}
              title="Chia sẻ"
            >
              <Share2 className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 text-white hover:bg-white/20"
              onClick={onClose}
              title="Đóng"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative w-full bg-black flex items-center justify-center" style={{ aspectRatio: '16/9', minHeight: '400px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
                <p className="text-white text-sm md:text-base">Đang tải trailer...</p>
              </div>
            </div>
          )}

          {trailerUrl ? (
            <iframe
              className="trailer-iframe w-full h-full border-0"
              src={trailerUrl.replace('youtube.com', 'youtube-nocookie.com')}
              title={`Trailer ${movieTitle}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="text-center py-16 px-6">
              <div className="text-6xl mb-4">🎬</div>
              <p className="text-white text-lg md:text-xl mb-2 font-semibold">Trailer không khả dụng</p>
              <span className="text-white/60 text-sm md:text-base">Vui lòng thử lại sau</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 md:p-4 bg-gradient-to-t from-black/50 to-transparent border-t border-white/5">
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={handleFullscreen}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Toàn màn hình
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Chia sẻ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal; 