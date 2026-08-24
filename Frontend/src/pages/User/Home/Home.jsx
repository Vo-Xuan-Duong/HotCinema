import { useEffect, useState } from 'react';
import FeaturesSection from '@/components/FeaturesSection/FeaturesSection';
import HeroModern from '@/components/HeroSection/HeroModern';
import MovieShowcase from '@/components/MovieShowcase/MovieShowcase';
import { Skeleton } from '@/components/ui/skeleton';
import movieService from '@/services/movieService';

const processMovies = (data) => {
  const items = Array.isArray(data) ? data : data?.content || data?.items || [];

  return items.map((movie, index) => ({
    ...movie,
    id: movie.id ?? movie._id ?? index + 1,
    poster: movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg',
    backdrop: movie.bannerUrl || movie.backdropUrl || movie.backdropPath || movie.posterUrl || movie.poster || '/brand-placeholder.svg',
    posterPath: movie.posterUrl || movie.posterPath,
    backdropPath: movie.bannerUrl || movie.backdropUrl || movie.backdropPath,
    rating: Number(movie.averageRating ?? movie.voteAverage ?? 0) || 0,
    ageLabel: movie.ageRating || movie.rating || '',
    duration: movie.durationMinutes || movie.duration,
    durationFormatted: movie.durationFormatted
      || (movie.durationMinutes ? `${Math.floor(movie.durationMinutes / 60)}h ${movie.durationMinutes % 60}m` : null),
  }));
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const results = await Promise.allSettled([
          movieService.listPage({ page: 0, size: 20, sort: 'createdAt,desc' }),
          movieService.getComingSoon({ page: 0, size: 12, sort: 'releaseDate,asc' }),
          movieService.getNowShowing({ page: 0, size: 12, sort: 'releaseDate,desc' }),
        ]);

        if (cancelled) return;

        const allMoviesData = results[0].status === 'fulfilled' ? results[0].value : { content: [] };
        const upcomingData = results[1].status === 'fulfilled' ? results[1].value : [];
        const nowShowingData = results[2].status === 'fulfilled' ? results[2].value : [];

        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const apiNames = ['listPage', 'getComingSoon', 'getNowShowing'];
            console.error(`API ${apiNames[index]} failed:`, result.reason);
          }
        });

        const normalizedAllMovies = processMovies(allMoviesData);
        const normalizedUpcoming = processMovies(upcomingData);
        const normalizedNowShowing = processMovies(nowShowingData);
        const normalizedTopRated = normalizedAllMovies
          .filter((movie) => Number(movie.rating) > 0)
          .sort((left, right) => Number(right.rating) - Number(left.rating))
          .slice(0, 10);

        setMovies(normalizedAllMovies);
        setUpcomingMovies(normalizedUpcoming);
        setNowShowingMovies(normalizedNowShowing);
        setTopRatedMovies(normalizedTopRated);
      } catch (error) {
        console.error('Failed to load movies from API', error);
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
      : movies;

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
        {topRatedMovies.length > 0 && (
          <MovieShowcase movies={topRatedMovies} title="Phim được đánh giá cao" category="top-rated" />
        )}
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Home;
