import { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, Play, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import useNotification from '@/hooks/useNotification';

const TrailerModal = ({ isOpen, onClose, trailerUrl, movieTitle }) => {
  const notification = useNotification();
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && trailerUrl) setIsLoading(true);
  }, [isOpen, trailerUrl]);

  const handleFullscreen = async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      if (!document.fullscreenElement) await iframe.requestFullscreen();
      else await document.exitFullscreen();
    } catch (error) {
      console.error('Fullscreen trailer failed:', error);
      notification.error('Không thể vào chế độ toàn màn hình');
    }
  };

  const copyTrailerLink = async () => {
    if (!trailerUrl) return;
    try {
      await navigator.clipboard.writeText(trailerUrl);
      notification.success('Đã sao chép link trailer');
    } catch (error) {
      console.error('Copy trailer link failed:', error);
      notification.error('Không thể sao chép link trailer');
    }
  };

  const handleShare = async () => {
    if (!trailerUrl) return;
    if (!navigator.share) {
      await copyTrailerLink();
      return;
    }
    try {
      await navigator.share({
        title: `Trailer: ${movieTitle || 'HotCinema'}`,
        text: `Xem trailer của ${movieTitle || 'phim này'}`,
        url: trailerUrl,
      });
    } catch (error) {
      if (error?.name !== 'AbortError') await copyTrailerLink();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-5xl gap-0 overflow-hidden p-0 sm:w-[calc(100%-2rem)] [&>button]:hidden">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card p-3 text-card-foreground sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Play className="h-5 w-5 fill-current" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate text-base sm:text-lg">{movieTitle || 'Trailer'}</DialogTitle>
              <DialogDescription className="mt-1">Trailer chính thức</DialogDescription>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={handleFullscreen} aria-label="Xem trailer toàn màn hình">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleShare} disabled={!trailerUrl} aria-label="Chia sẻ trailer">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Đóng trailer">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="relative aspect-video w-full bg-black">
          {isLoading && trailerUrl && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/75" role="status" aria-live="polite">
              <div className="text-center text-white">
                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin" aria-hidden="true" />
                <p className="text-sm">Đang tải trailer...</p>
              </div>
            </div>
          )}

          {trailerUrl ? (
            <iframe
              ref={iframeRef}
              className="h-full w-full border-0"
              src={trailerUrl.replace('youtube.com', 'youtube-nocookie.com')}
              title={`Trailer ${movieTitle || ''}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            />
          ) : (
            <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 text-center text-white">
              <Play className="mb-3 h-10 w-10 opacity-70" aria-hidden="true" />
              <p className="text-base font-semibold">Trailer không khả dụng</p>
              <span className="mt-1 text-sm text-white/65">Vui lòng thử lại sau</span>
            </div>
          )}
        </div>

        <footer className="flex flex-wrap justify-end gap-2 border-t border-border bg-card p-3">
          <Button type="button" variant="outline" size="sm" onClick={handleShare} disabled={!trailerUrl}>
            <Share2 className="h-4 w-4" />
            Chia sẻ
          </Button>
          <Button type="button" size="sm" onClick={handleFullscreen} disabled={!trailerUrl}>
            <Maximize2 className="h-4 w-4" />
            Toàn màn hình
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;
