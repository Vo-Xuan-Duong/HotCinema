import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import HeroModern from '@/components/HeroSection/HeroModern';
import MovieShowcase from '@/components/MovieShowcase/MovieShowcase';
import FeaturesSection from '@/components/FeaturesSection/FeaturesSection';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Skeleton } from '@/components/ui/skeleton';
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
          movieService.listPage({ page: 0, size: 20 }), // Returns Page object
          movieService.getComingSoon({ page: 0, size: 12 }), // Returns array only
          movieService.getNowShowing({ page: 0, size: 12 }), // Returns array only
          movieService.getTopRated({ page: 0, size: 10 })    // Returns array only
        ]);

        // Extract data from settled promises, use empty array/object if failed
        const allMoviesData = results[0].status === "fulfilled" ? results[0].value : { content: [] };
        const upcomingData = results[1].status === "fulfilled" ? results[1].value : [];
        const nowShowingData = results[2].status === "fulfilled" ? results[2].value : [];
        const topRatedData = results[3].status === "fulfilled" ? results[3].value : [];

        // Log any failed API calls
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const apiNames = ['listPage', 'getComingSoon', 'getNowShowing', 'getTopRated'];
            console.error(`API ${apiNames[index]} failed:`, result.reason);
          }
        });

        // Process all movies - handle both Page object and array
        const processMovies = (data) => {
          const items = Array.isArray(data) ? data : (data?.content || []);

          return items.map((m, index) => ({
            ...m,
            id: m.id ?? m._id ?? index + 1,
            poster: m.posterUrl || m.posterPath || '/brand-placeholder.svg',
            backdrop: m.backdropUrl || m.backdropPath || m.poster || m.posterUrl || '/brand-placeholder.svg',
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
    return (
      <div className="bg-background text-foreground min-h-screen relative pt-16">
        <div className="relative mb-0 overflow-hidden w-full h-[60vh]">
          <Skeleton className="w-full h-full rounded-none" />
          <div className="absolute inset-0 flex items-center bg-black/40">
             <div className="max-w-[1200px] mx-auto w-full px-4 flex gap-8">
                 <div className="hidden lg:block w-[320px] aspect-[2/3]">
                     <Skeleton className="w-full h-full rounded-lg opacity-50" />
                 </div>
                 <div className="flex-1 flex flex-col gap-4 justify-center">
                    <Skeleton className="w-3/4 h-12 opacity-50" />
                    <Skeleton className="w-1/2 h-6 opacity-50" />
                    <Skeleton className="w-full h-24 opacity-50" />
                    <div className="flex gap-4 mt-4">
                        <Skeleton className="w-32 h-12 rounded-full opacity-50" />
                        <Skeleton className="w-32 h-12 rounded-full opacity-50" />
                    </div>
                 </div>
             </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto w-full mt-12">
            {[1, 2, 3].map((_, i) => (
               <div key={i} className="mb-12 px-4">
                  <div className="flex items-center gap-4 mb-6">
                     <Skeleton className="w-12 h-12 rounded-full" />
                     <div className="flex flex-col gap-2">
                         <Skeleton className="w-48 h-8" />
                         <Skeleton className="w-64 h-4 hidden md:block" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                      {[1, 2, 3, 4, 5].map((_, j) => (
                          <Skeleton key={j} className="h-[380px] w-full rounded-xl" />
                      ))}
                  </div>
               </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen relative pt-16">
      {/* Hero Section - Full width for background */}
      <section className="relative mb-0 overflow-hidden w-full">
        <HeroModern movies={heroMovies} />
      </section>

      {/* Content Container - Limited to 1200px */}
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Upcoming Movies */}
        <section className="pt-8 relative bg-transparent rounded-none">
          <MovieShowcase
            movies={upcomingMovies}
            title="🔥 Phim sắp chiếu"
            loading={loading}
            showFilters={true}
            category="upcoming"
          />
        </section>

        {/* Now Showing Section */}
        <section className="relative bg-transparent rounded-none">
          <MovieShowcase
            movies={nowShowingMovies}
            title="🎬 Phim đang chiếu hot"
            loading={loading}
            showFilters={true}
            category="now-showing"
          />
        </section>

        {/* Top Rated Movies */}
        <section className="relative bg-transparent rounded-none">
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
