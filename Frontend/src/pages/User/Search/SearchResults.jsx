import { useEffect, useState } from 'react';
import { Building2, MapPin, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import MovieCard from '@/components/MovieCard/MovieCard';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  releaseDate: movie.releaseDate || '',
  description: movie.description || movie.overview || '',
});

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
  const [results, setResults] = useState({ movies: [], cinemas: [], total: 0 });

  useEffect(() => {
    const query = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type') || 'all';
    setSearchQuery(query);
    setSearchType(type);

    if (!query) {
      setErrorMessage('');
      setResults({ movies: [], cinemas: [], total: 0 });
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const shouldSearchMovies = type === 'all' || type === 'movies';
        const shouldSearchCinemas = type === 'all' || type === 'cinemas';

        const [moviesResponse, cinemasResponse] = await Promise.all([
          shouldSearchMovies
            ? movieService.searchPublicPage({ keyword: query, page: 0, size: 28, sort: 'updatedAt,desc' })
            : Promise.resolve([]),
          shouldSearchCinemas
            ? cinemaService.searchPublicCinemas(query, { page: 0, size: 20 })
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const movieData = unwrapApiData(moviesResponse);
        const cinemaData = unwrapApiData(cinemasResponse);
        const movies = (Array.isArray(movieData) ? movieData : movieData?.content || []).map(normalizeMovie);
        const cinemas = Array.isArray(cinemaData) ? cinemaData : cinemaData?.content || unwrapApiArray(cinemasResponse);

        setResults({ movies, cinemas, total: movies.length + cinemas.length });
      } catch (error) {
        console.error('Public search error:', error);
        if (!cancelled) {
          setResults({ movies: [], cinemas: [], total: 0 });
          setErrorMessage(error?.message || 'Không thể thực hiện tìm kiếm.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    performSearch();
    return () => { cancelled = true; };
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
    <div className="min-h-dvh bg-background px-4 pb-8 pt-20 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-4 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div>
            <p className="text-xs font-medium text-primary">HotCinema</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">Tìm kiếm</h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">Chỉ hiển thị phim và rạp đang được công khai cho khách hàng.</p>
        </header>

        <Card className="mb-5">
          <CardContent className="grid gap-2 p-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm phim hoặc rạp chiếu..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
                className="pl-9"
              />
            </div>

            <Select value={searchType} onValueChange={handleTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="movies">Phim</SelectItem>
                <SelectItem value="cinemas">Rạp chiếu</SelectItem>
              </SelectContent>
            </Select>

            <Button type="button" onClick={submitSearch} disabled={!searchQuery.trim()}>
              <Search className="h-4 w-4" />
              Tìm kiếm
            </Button>
          </CardContent>
        </Card>

        {errorMessage && (
          <Alert variant="destructive" showIcon message="Tìm kiếm thất bại" description={errorMessage} className="mb-4" />
        )}

        {loading ? (
          <ContentLoader message="Đang tìm kiếm..." />
        ) : searchParams.get('q') ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-lg font-semibold">Kết quả cho “{searchParams.get('q')}”</h2>
              <p className="text-sm text-muted-foreground">{results.total} kết quả</p>
            </div>

            {results.total === 0 ? (
              <Card><CardContent className="py-4"><Empty description="Không tìm thấy kết quả công khai phù hợp" /></CardContent></Card>
            ) : (
              <>
                {results.movies.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-base font-semibold">Phim ({results.movies.length})</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                      {results.movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
                    </div>
                  </section>
                )}

                {results.cinemas.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-base font-semibold">Rạp chiếu ({results.cinemas.length})</h3>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {results.cinemas.map((cinema) => (
                        <Card key={cinema.id} className="flex h-full flex-col transition-colors hover:border-primary/40">
                          <CardContent className="flex h-full flex-col gap-2.5 p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <Link to={`/cinemas/${cinema.id}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">{cinema.name}</Link>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span className="line-clamp-2">{cinema.address || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                            {cinema.city && <p className="text-xs text-muted-foreground">{cinema.city}</p>}
                            <Button asChild variant="outline" size="sm" className="mt-auto">
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
          <Card><CardContent className="py-4"><Empty description="Nhập từ khóa để bắt đầu tìm kiếm" /></CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
