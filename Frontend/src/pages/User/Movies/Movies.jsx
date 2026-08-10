import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import MovieCard from '@/components/MovieCard/MovieCard';
import GlobalBackTop from '@/components/GlobalBackTop/GlobalBackTop';
import ContentLoader from '@/components/Loading/ContentLoader';
import { BadgeRibbon } from '@/components/ui/badge-ribbon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import genreService from '@/services/genreService';
import movieService from '@/services/movieService';

const DEFAULT_PAGE_SIZE = 15;

const getMovieStatus = (movie) => {
  if (movie.status === 'COMING_SOON') return 'upcoming';
  if (movie.status === 'ARCHIVED') return 'archived';
  if (movie.status === 'NOW_SHOWING') return 'now-showing';

  if (!movie.releaseDateRaw) return 'now-showing';

  const releaseDate = new Date(movie.releaseDateRaw);
  if (Number.isNaN(releaseDate.getTime())) return 'now-showing';

  return releaseDate.getFullYear() > new Date().getFullYear() ? 'upcoming' : 'now-showing';
};

const movieStatusPresentation = {
  upcoming: { text: 'Sắp chiếu', tone: 'info' },
  archived: { text: 'Đã chiếu', tone: 'neutral' },
  'now-showing': { text: 'Đang chiếu', tone: 'warning' },
};

const formatReleaseDate = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
  }

  if (value.year && value.month && value.day) {
    return `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
  }

  return '';
};

const formatGenre = (genre) => {
  if (!genre) return 'Chưa phân loại';

  const values = Array.isArray(genre) ? genre : [genre];
  const names = values
    .flatMap((item) => {
      if (typeof item === 'string') return item.split(',');
      return item?.name ? [item.name] : [];
    })
    .map((name) => name.replace(/Phim\s+/gi, '').trim())
    .filter(Boolean);

  if (!names.length) return 'Chưa phân loại';
  return names.slice(0, 2).join(', ');
};

const normalizeMovie = (movie, index) => ({
  ...movie,
  id: movie.id ?? movie._id ?? index + 1,
  poster: movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg',
  rating: Number(movie.averageRating ?? movie.rating ?? 0),
  genre: formatGenre(movie.genres || movie.genre),
  releaseDate: formatReleaseDate(movie.releaseDate),
  releaseDateRaw: movie.releaseDate,
  duration: movie.durationFormatted || (movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.duration || ''),
  description: movie.overview || movie.description || '',
});

const Movies = () => {
  const location = useLocation();
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(location.state?.defaultFilter || 'all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [sort, setSort] = useState('id:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalMovies, setTotalMovies] = useState(0);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => String(currentYear - index));
  }, []);

  useEffect(() => {
    genreService
      .getAllGenres()
      .then((response) => setGenres(Array.isArray(response) ? response : []))
      .catch((error) => {
        console.error('Failed to load genres:', error);
        setGenres([]);
      });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedGenre, selectedStatus, selectedYear, sort]);

  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      setLoading(true);

      try {
        const [sortBy, sortOrder] = sort.split(':');
        const params = {
          page: currentPage - 1,
          size: pageSize,
          sort: `${sortBy},${sortOrder}`,
        };

        if (debouncedSearch) params.keyword = debouncedSearch;
        if (selectedGenre !== 'all') params.genre = selectedGenre;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedYear !== 'all') params.releaseYear = selectedYear;

        const response = await movieService.searchPage(params);
        if (cancelled) return;

        const content = Array.isArray(response) ? response : response?.content || [];
        const total = Array.isArray(response)
          ? response.length
          : response?.totalElements ?? response?.total ?? content.length;

        setMovies(content.map(normalizeMovie));
        setTotalMovies(total);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch movies:', error);
        setMovies([]);
        setTotalMovies(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize, sort, debouncedSearch, selectedGenre, selectedStatus, selectedYear]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, pageSize]);

  const resetFilters = () => {
    setSearchText('');
    setSelectedGenre('all');
    setSelectedStatus('all');
    setSelectedYear('all');
    setSort('id:desc');
    setCurrentPage(1);
  };

  if (loading && movies.length === 0) {
    return <ContentLoader message="Đang tải danh sách phim..." />;
  }

  return (
    <div className="min-h-dvh bg-background pb-16 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium text-primary">HotCinema</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Phim đang chiếu & sắp chiếu</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Tìm phim theo thể loại, trạng thái và năm phát hành, sau đó chọn suất chiếu phù hợp với bạn.
          </p>
        </header>

        <Card className="mb-8 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Bộ lọc phim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm kiếm phim..."
                  className="h-9 pl-9"
                  aria-label="Tìm kiếm phim"
                />
              </div>

              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả thể loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thể loại</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id ?? genre.name} value={genre.name}>
                      {genre.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="NOW_SHOWING">Đang chiếu</SelectItem>
                  <SelectItem value="COMING_SOON">Sắp chiếu</SelectItem>
                  <SelectItem value="ARCHIVED">Đã chiếu</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tất cả năm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id:desc">Mới cập nhật</SelectItem>
                  <SelectItem value="title:asc">Tên A → Z</SelectItem>
                  <SelectItem value="title:desc">Tên Z → A</SelectItem>
                  <SelectItem value="releaseDate:desc">Ngày phát hành mới</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" variant="outline" className="h-9" onClick={resetFilters}>
                Đặt lại
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {totalMovies > 0 ? `${totalMovies.toLocaleString('vi-VN')} phim` : 'Không có kết quả'}
          </p>
          {loading && <span className="text-xs text-muted-foreground">Đang cập nhật...</span>}
        </div>

        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {movies.map((movie) => {
                const status = movieStatusPresentation[getMovieStatus(movie)];
                return (
                  <BadgeRibbon key={movie.id} text={status.text} tone={status.tone}>
                    <MovieCard movie={movie} />
                  </BadgeRibbon>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                page={currentPage}
                itemsPerPage={pageSize}
                totalItems={totalMovies}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showSizeChanger
                pageSizeOptions={['15', '30', '45', '60']}
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} phim`}
              />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-4">
              <Empty
                description={
                  <div className="flex flex-col items-center gap-3">
                    <p>Không tìm thấy phim phù hợp với bộ lọc hiện tại.</p>
                    <Button type="button" variant="outline" onClick={resetFilters}>Đặt lại bộ lọc</Button>
                  </div>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>

      <GlobalBackTop />
    </div>
  );
};

export default Movies;
