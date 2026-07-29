import React, { createContext, useContext, useState, useCallback } from 'react';
import TrailerModal from '@/components/Trailer/TrailerModal';

const TrailerModalContext = createContext();

export const useTrailerModal = () => useContext(TrailerModalContext);

export const TrailerModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [movie, setMovie] = useState(null);

  const openTrailer = useCallback((movieData) => {
    setMovie(movieData);
    setIsOpen(true);
  }, []);

  const closeTrailer = useCallback(() => {
    setIsOpen(false);
    setMovie(null);
  }, []);

  // Xá»­ lÃ½ chuyá»ƒn Ä‘á»•i link YouTube sang embed vÃ  tá»± Ä‘á»™ng phÃ¡t
  let trailerUrl = '';
  if (movie && movie.trailer) {
    trailerUrl = movie.trailer;

    // Convert YouTube watch URL to embed URL with autoplay
    if (trailerUrl.includes('youtube.com/watch?v=')) {
      const videoId = trailerUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
      }
    }
    // Handle youtu.be short URLs
    else if (trailerUrl.includes('youtu.be/')) {
      const videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
      }
    }
    // Handle already embed URLs
    else if (trailerUrl.includes('youtube.com/embed/')) {
      const videoId = trailerUrl.split('/embed/')[1]?.split('?')[0];
      if (videoId) {
        trailerUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`;
      }
    }
  }

  return (
    <TrailerModalContext.Provider value={{ isOpen, movie, openTrailer, closeTrailer }}>
      {children}
      <TrailerModal
        isOpen={isOpen}
        onClose={closeTrailer}
        trailerUrl={trailerUrl}
        movieTitle={movie?.title || ''}
      />
    </TrailerModalContext.Provider>
  );
};
