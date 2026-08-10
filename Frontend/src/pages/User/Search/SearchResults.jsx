import { useEffect, useState } from 'react';
import { Building2, MapPin, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import MovieCard from '@/components/MovieCard/MovieCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cinemaService from '@/services/cinemaService';
import movieService from '@/services/movieService';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const normalizeMovie = (movie) => ({
  ...movie,
  poster: movie.poster || movie.posterUrl || movie.posterPath || '/brand-placeholder.svg',
  rating: Number(movie.averageRating ?? movie.rating ?? 0),
  genre: Array.isArray(movie.genres)
    ? movie.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean).join(', ')
    : typeof movie.genre === 'string'
      ? movie.genre
      : movie.genre?.name || '',
  releaseDate: movie.releaseDate || '',
  description: movie.overview || movie.description || '',
});

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
  const [results, setResults] = useState({ movies: [], cinemas: [], total: 0 });

  useEffect(() => {
    const query = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type') || 'all';
    setSearchQuery(query);
    setSearchType(type);

    if (!query) {
      setResults({ movies: [], cinemas: [], total: 0 });
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setLoading(true);
      try {
        const shouldSearchMovies = type === 'all' || type === 'movies';
        const shouldSearchCinemas = type === 'all' || type === 'cinemas';

        const [moviesResponse, cinemasResponse] = await Promise.all([
          shouldSearchMovies
            ? movieService.searchPage({ keyword: query, page: 0, size: 24 })
            : Promise.resolve([]),
          shouldSearchCinemas
            ? cinemaService.searchCinemas(query, { page: 0, size: 18 })
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const movieData = unwrapApiData(moviesResponse);
        const cinemaData = unwrapApiData(cinemasResponse);
        const movies = (Array.isArray(movieData) ? movieData : movieData?.content || []).map(normalizeMovie);
        const cinemas = Array.isArray(cinemaData) ? cinemaData : cinemaData?.content || unwrapApiArray(cinemasResponse);

        setResults({
          movies,
          cinemas,
          total: movies.length + cinemas.length,
        });
      } catch (error) {
        console.error('Search error:', error);
        if (!cancelled) setResults({ movies: [], cinemas: [], total: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    performSearch();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const submitSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchParams({ q: query, type: searchType });
  };

  const handleTypeChange = (type) => {
    setSearchType(type);
    const query = searchQuery.trim();
    if (query) setSearchParams({ q: query, type });
  };

  return (
    <div className="min-h-dvh bg-background px-4 pb-16 pt-20 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium text-primary">HotCinema</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tìm kiếm</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Tìm phim hoặc rạp chiếu phù hợp với nhu cầu của bạn.</p>
        </header>

        <Card className="mb-8 shadow-sm">
          <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_200px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm phim hoặc rạp chiếu..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
                className="h-10 pl-9"
              />
            </div>

            <Select value={searchType} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="movies">Phim</SelectItem>
                <SelectItem value="cinemas">Rạp chiếu</SelectItem>
              </SelectContent>
            </Select>

            <Button type="button" className="h-10" onClick={submitSearch} disabled={!searchQuery.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Tìm kiếm
            </Button>
          </CardContent>
        </Card>

        {loading ? (
          <ContentLoader message="Đang tìm kiếm..." />
        ) : searchParams.get('q') ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold">Kết quả cho “{searchParams.get('q')}”</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tìm thấy {results.total} kết quả.</p>
            </div>

            {results.total === 0 ? (
              <Card>
                <CardContent className="py-4">
                  <Empty description="Không tìm thấy kết quả phù hợp" />
                </CardContent>
              </Card>
            ) : (
              <>
                {results.movies.length > 0 && (
                  <section>
                    <h3 className="mb-4 text-lg font-semibold">Phim ({results.movies.length})</h3>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {results.movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>
                  </section>
                )}

                {results.cinemas.length > 0 && (
                  <section>
                    <h3 className="mb-4 text-lg font-semibold">Rạp chiếu ({results.cinemas.length})</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {results.cinemas.map((cinema) => (
                        <Card key={cinema.id} className="flex h-full flex-col shadow-sm transition-colors hover:border-primary/40">
                          <CardHeader className="pb-3">
                            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Building2 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">
                              <Link to={`/cinemas/${cinema.id}`} className="hover:text-primary">{cinema.name}</Link>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-1 flex-col gap-3">
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span className="line-clamp-3">{cinema.address || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                            {cinema.rooms?.length > 0 && (
                              <p className="text-xs text-muted-foreground">{cinema.rooms.length} phòng chiếu</p>
                            )}
                            <Button asChild variant="outline" className="mt-auto w-full">
                              <Link to={`/cinemas/${cinema.id}`}>Xem rạp</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-4">
              <Empty description="Nhập từ khóa để bắt đầu tìm kiếm" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
