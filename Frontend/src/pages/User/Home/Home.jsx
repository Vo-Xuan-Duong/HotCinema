import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import HeroModern from '@/components/HeroSection/HeroModern';
import MovieShowcase from '@/components/MovieShowcase/MovieShowcase';
import FeaturedContent from '@/components/FeaturedContent/FeaturedContent';
import FeaturesSection from '@/components/FeaturesSection/FeaturesSection';
import ContentLoader from '@/components/Loading/ContentLoader';
import GlobalBackTop from '@/components/GlobalBackTop/GlobalBackTop';
import movieService from '@/services/movieService';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all movie categories in parallel - using allSettled to handle individual failures
        const results = await Promise.allSettled([
          movieService.getAllMovies({ page: 0, size: 20 }), // Returns Page object
          movieService.getComingSoon({ page: 0, size: 12 }), // Returns array only
          movieService.getNowShowing({ page: 0, size: 12 }), // Returns array only
          movieService.getTopRated({ page: 0, size: 10 })    // Returns array only
        ]);

        console.log('API results:', results);

        // Extract data from settled promises, use empty array/object if failed
        const allMoviesData = results[0].status === "fulfilled" ? results[0].value : { content: [] };
        const upcomingData = results[1].status === "fulfilled" ? results[1].value : [];
        const nowShowingData = results[2].status === "fulfilled" ? results[2].value : [];
        const topRatedData = results[3].status === "fulfilled" ? results[3].value : [];

        // Log any failed API calls
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const apiNames = ['getAllMovies', 'getComingSoon', 'getNowShowing', 'getTopRated'];
            console.error(`API ${apiNames[index]} failed:`, result.reason);
          }
        });

        console.log('Fetched movie data:', { allMoviesData, upcomingData, nowShowingData, topRatedData });

        // Process all movies - handle both Page object and array
        const processMovies = (data) => {
          const items = Array.isArray(data) ? data : (data?.content || []);

          return items.map((m, index) => ({
            ...m,
            id: m.id ?? m._id ?? index + 1,
            poster: m.posterUrl || m.posterPath || '/vite.svg',
            backdrop: m.backdropUrl || m.backdropPath || m.poster || m.posterUrl || '/vite.svg',
            posterPath: m.posterUrl || m.posterPath,
            backdropPath: m.backdropUrl || m.backdropPath,
            rating: m.averageRating ?? m.rating ?? m.voteAverage ?? 0,
            duration: m.durationMinutes || m.duration,
            durationFormatted: m.durationFormatted || (m.durationMinutes ? `${Math.floor(m.durationMinutes / 60)}h ${m.durationMinutes % 60}m` : null),
          }));
        };

        setMovies(processMovies(allMoviesData));
        setUpcomingMovies(processMovies(upcomingData));
        setNowShowingMovies(processMovies(nowShowingData));
        setTopRatedMovies(processMovies(topRatedData));
      } catch (err) {
        console.error('Failed to load movies from API', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Use upcoming movies for hero, fallback to all movies if empty
  const heroMovies = upcomingMovies.length > 0 ? upcomingMovies : movies;

  if (loading) {
    return <ContentLoader message="Đang tải nội dung..." />;
  }

  return (
    <div className="bg-gradient-to-br bg-white min-h-screen relative pt-16">
      {/* Hero Section - Full width for background */}
      <section className="relative mb-0 overflow-hidden w-full">
        <HeroModern movies={heroMovies} />
      </section>

      {/* Content Container - Limited to 1200px */}
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Upcoming Movies */}
        <section className="pt-8 relative bg-white rounded-none">
          <MovieShowcase
            movies={upcomingMovies}
            title="🔥 Phim sắp chiếu"
            loading={loading}
            showFilters={true}
            category="upcoming"
          />
        </section>

        {/* Now Showing Section */}
        <section className="relative bg-white rounded-none">
          <MovieShowcase
            movies={nowShowingMovies}
            title="🎬 Phim đang chiếu hot"
            loading={loading}
            showFilters={true}
            category="now-showing"
          />
        </section>

        {/* Top Rated Movies */}
        <section className="relative bg-white rounded-none">
          <MovieShowcase
            movies={topRatedMovies}
            title="⭐ Phim được đánh giá cao"
            loading={loading}
            showFilters={false}
            category="top-rated"
          />
        </section>

        {/* Featured Content Section */}
        <section className="relative">
          <FeaturedContent movies={movies} />
        </section>

        {/* Features Section */}
        <section className="relative">
          <FeaturesSection />
        </section>
      </div>

      {/* Back to Top Button */}
      <GlobalBackTop visibilityHeight={300} />
    </div>
  );
};

export default Home;
