import { useEffect, useState } from 'react';
import FeaturesSection from '@/components/FeaturesSection/FeaturesSection';
import HeroModern from '@/components/HeroSection/HeroModern';
import MovieShowcase from '@/components/MovieShowcase/MovieShowcase';
import { Skeleton } from '@/components/ui/skeleton';
import movieService from '@/services/movieService';

const processMovies = (data) => {
  const items = Array.isArray(data) ? data : data?.content || [];

  return items.map((movie, index) => ({
    ...movie,
    id: movie.id ?? movie._id ?? index + 1,
    poster: movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg',
    backdrop: movie.bannerUrl || movie.backdropUrl || movie.backdropPath || movie.posterUrl || movie.poster || '/brand-placeholder.svg',
    posterPath: movie.posterUrl || movie.posterPath,
    backdropPath: movie.bannerUrl || movie.backdropUrl || movie.backdropPath,
    rating: movie.averageRating ?? movie.rating ?? movie.voteAverage ?? 0,
    duration: movie.durationMinutes || movie.duration,
    durationFormatted: movie.durationFormatted
      || (movie.durationMinutes ? `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m` : null),
  }));
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [publicMovies, setPublicMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          movieService.searchPublic({ page: 0, size: 20, sort: 'updatedAt,desc' }),
          movieService.getComingSoon({ page: 0, size: 12, sort: 'releaseDate,asc' }),
          movieService.getNowShowing({ page: 0, size: 12, sort: 'updatedAt,desc' }),
        ]);

        if (cancelled) return;

        const allPublic = results[0].status === 'fulfilled' ? results[0].value : [];
        const upcoming = results[1].status === 'fulfilled' ? results[1].value : [];
        const nowShowing = results[2].status === 'fulfilled' ? results[2].value : [];

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const apiNames = ['searchPublic', 'getComingSoon', 'getNowShowing'];
            console.error(`API ${apiNames[index]} failed:`, result.reason);
          }
        });

        const normalizedPublic = processMovies(allPublic);
        setPublicMovies(normalizedPublic);
        setUpcomingMovies(processMovies(upcoming));
        setNowShowingMovies(processMovies(nowShowing));
        setRecentMovies(normalizedPublic.slice(0, 10));
      } catch (error) {
        console.error('Failed to load public movies from API', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroMovies = upcomingMovies.length > 0
    ? upcomingMovies
    : nowShowingMovies.length > 0
      ? nowShowingMovies
      : publicMovies;

  if (loading) {
    return (
      <div className="min-h-dvh bg-background pt-16 text-foreground">
        <div className="relative h-[56vh] w-full overflow-hidden">
          <Skeleton className="h-full w-full rounded-none" />
          <div className="absolute inset-0 flex items-center bg-black/40">
            <div className="mx-auto flex w-full max-w-7xl gap-5 px-4 sm:px-6 lg:px-8">
              <Skeleton className="hidden aspect-[2/3] w-60 rounded-md opacity-50 lg:block" />
              <div className="flex flex-1 flex-col justify-center gap-3">
                <Skeleton className="h-10 w-2/3 opacity-50" />
                <Skeleton className="h-5 w-2/5 opacity-50" />
                <Skeleton className="h-20 w-full opacity-50" />
                <div className="mt-2 flex gap-3">
                  <Skeleton className="h-9 w-28 rounded-md opacity-50" />
                  <Skeleton className="h-9 w-28 rounded-md opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {[1, 2, 3].map((section) => (
            <div key={section} className="mb-6">
              <Skeleton className="mb-3 h-7 w-48" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                {Array.from({ length: 7 }).map((_, item) => (
                  <Skeleton key={item} className="aspect-[2/3] w-full rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pt-16 text-foreground">
      <section className="relative w-full overflow-hidden">
        <HeroModern movies={heroMovies} />
      </section>

      <main className="w-full">
        <MovieShowcase movies={upcomingMovies} title="Phim sắp chiếu" category="upcoming" />
        <MovieShowcase movies={nowShowingMovies} title="Phim đang chiếu" category="now-showing" />
        <MovieShowcase movies={recentMovies} title="Mới cập nhật" category="recent" />
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Home;
