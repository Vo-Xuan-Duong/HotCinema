import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Rate } from '@/components/ui/rate';
import { Tag } from '@/components/ui/tag';
import { Button } from '@/components/ui/button';
import { Play, Eye } from 'lucide-react';

const MovieCard = ({ movie, onTrailerClick, viewMode = 'grid' }) => {
  const {
    id,
    title,
    poster,
    rating,
    genre,
    releaseDate,
    ageLabel,
    duration,
    description
  } = movie;

  if (viewMode === 'list') {
    return (
      <Card
        className="rounded-xl overflow-hidden bg-white/95 backdrop-blur-[10px] border border-white/20 mb-4 hover:shadow-lg transition-all duration-300 md:flex md:flex-col cursor-pointer"
      >
        <div className="flex items-stretch md:flex-col">
          <div className="w-[140px] h-[200px] relative flex-shrink-0 md:w-full md:h-[200px]">
            <Link to={`/movies/${id}`}>
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </Link>
            {ageLabel && (
              <Tag className="absolute top-2 left-2 z-[2] font-bold uppercase tracking-wide" color="orange">
                {ageLabel}
              </Tag>
            )}
          </div>
          <div className="flex-1 p-5 md:p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3 md:flex-col md:gap-2">
              <Link to={`/movies/${id}`} className="text-inherit no-underline font-semibold text-base hover:text-[#667eea]">
                <h3 className="m-0 text-xl font-semibold text-gray-800 md:text-lg">{title}</h3>
              </Link>
              <div className="flex items-center gap-2">
                <Rate disabled value={rating / 2} allowHalf />
                <span className="font-semibold text-[#f39c12]">{rating}/10</span>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap gap-2">
              {genre && (
                <Tag color="blue">{genre.split(', ')[0]}</Tag>
              )}
              {duration && (
                <span className="text-gray-600 text-sm">{duration}</span>
              )}
              {releaseDate && (
                <span className="text-gray-600 text-sm">{releaseDate}</span>
              )}
            </div>
            {description && (
              <p className="text-gray-600 leading-relaxed mb-4 flex-1">
                {description.length > 120
                  ? `${description.substring(0, 120)}...`
                  : description
                }
              </p>
            )}
            <div className="mt-auto flex gap-2">
              <Link to={`/movies/${id}`}>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  Chi tiết
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onTrailerClick?.(movie);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Trailer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid mode (default)
  return (
    <Card
      className="rounded-2xl overflow-hidden transition-all duration-300 bg-white/95 backdrop-blur-[10px] border border-white/20 hover:-translate-y-2 hover:shadow-xl cursor-pointer"
    >
      <div className="relative overflow-hidden h-[350px] md:h-[280px] sm:h-[240px]">
        <Link to={`/movies/${id}`}>
          <img alt={title} src={poster} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        </Link>
        {ageLabel && (
          <Tag className="absolute top-3 left-3 z-[2] font-bold uppercase tracking-wide text-xs px-1.5 py-0.5" color="orange">
            {ageLabel}
          </Tag>
        )}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="default"
            size="icon"
            className="scale-80 hover:scale-100 transition-transform duration-300 bg-white/15 backdrop-blur-[10px] border-2 border-white/80 w-[50px] h-[50px] flex items-center justify-center text-white hover:bg-gradient-to-br hover:from-primary hover:to-[#ff6b35] hover:border-white hover:scale-110 md:w-10 md:h-10"
            onClick={(e) => {
              e.stopPropagation();
              onTrailerClick?.(movie);
            }}
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/movies/${id}`} className="text-inherit no-underline font-semibold text-base hover:text-[#667eea] block mb-2">
          {title}
        </Link>
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Rate disabled value={rating / 2} allowHalf />
            <span className="font-semibold text-[#f39c12]">{rating}/10</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {genre && genre.split(', ').slice(0, 2).map((g, index) => (
              <Tag key={index} color="blue" className="text-xs">
                {g}
              </Tag>
            ))}
          </div>
          {releaseDate && (
            <div className="text-sm text-gray-600 mt-1">{releaseDate}</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MovieCard; 