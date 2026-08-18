import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import MovieCard from '@/components/MovieCard/MovieCard';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { BadgeRibbon } from '@/components/ui/badge-ribbon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import movieService from '@/services/movieService';

const DEFAULT_PAGE_SIZE = 15;
const PUBLIC_STATUS_VALUES = new Set(['all', 'NOW_SHOWING', 'COMING_SOON', 'ENDED']);

const getMovieStatus = (movie) => {
  const status = String(movie?.status || '').toUpperCase();
  if (status === 'COMING_SOON') return 'upcoming';
  if (status === 'ENDED') return 'ended';
  return 'now-showing';
};

const movieStatusPresentation = {
  upcoming: { text: 'Sắp chiếu', tone: 'info' },
  ended: { text: 'Đã kết thúc', tone: 'neutral' },
  'now-showing': { text: 'Đang chiếu', tone: 'warning' },
};

const formatReleaseDate = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
};

const normalizeMovie = (movie, index) => ({
  ...movie,
  id: movie.id ?? movie._id ?? index + 1,
  poster: movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg',
  rating: Number(movie.averageRating ?? movie.rating ?? 0),
  releaseDate: formatReleaseDate(movie.releaseDate),
  releaseDateRaw: movie.releaseDate,
  duration: movie.durationFormatted || (movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.duration || ''),
  description: movie.description || movie.overview || '',
});

const Movies = () => {
  const location = useLocation();
  const initialStatus = PUBLIC_STATUS_VALUES.has(location.state?.defaultFilter)
    ? location.state.defaultFilter
    : 'all';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedYear, setSelectedYear] = useState('all');
  const [sort, setSort] = useState('updatedAt:desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalMovies, setTotalMovies] = useState(0);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, index) => String(currentYear - index));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedStatus, selectedYear, sort]);

  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const [sortBy, sortOrder] = sort.split(':');
        const params = {
          page: currentPage - 1,
          size: pageSize,
          sort: `${sortBy},${sortOrder}`,
        };
        if (debouncedSearch) params.keyword = debouncedSearch;
        if (selectedStatus !== 'all') params.status = selectedStatus;
        if (selectedYear !== 'all') params.releaseYear = selectedYear;

        const response = await movieService.searchPublicPage(params);
        if (cancelled) return;

        const content = Array.isArray(response) ? response : response?.content || [];
        const total = Array.isArray(response)
          ? response.length
          : Number(response?.totalElements ?? response?.total) || content.length;
        setMovies(content.map(normalizeMovie));
        setTotalMovies(total);
      } catch (error) {
        if (cancelled) return;
        console.error('Failed to fetch public movies:', error);
        setMovies([]);
        setTotalMovies(0);
        setErrorMessage(error?.message || 'Không thể tải danh sách phim.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMovies();
    return () => { cancelled = true; };
  }, [currentPage, pageSize, sort, debouncedSearch, selectedStatus, selectedYear, refreshKey]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, pageSize]);

  const resetFilters = () => {
    setSearchText('');
    setSelectedStatus('all');
    setSelectedYear('all');
    setSort('updatedAt:desc');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchText.trim()
    || selectedStatus !== 'all'
    || selectedYear !== 'all'
    || sort !== 'updatedAt:desc'
  );

  if (loading && movies.length === 0 && !errorMessage) {
    return <ContentLoader message="Đang tải danh sách phim..." />;
  }

  return (
    <div className="min-h-dvh bg-background pb-8 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">HotCinema</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">Phim đang chiếu & sắp chiếu</h1>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
              Dữ liệu công khai chỉ gồm phim đang chiếu, sắp chiếu và phim đã kết thúc; DRAFT/HIDDEN không được đưa ra customer UI.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <span>{totalMovies > 0 ? `${totalMovies.toLocaleString('vi-VN')} phim` : 'Không có kết quả'}</span>
            {loading && <span className="text-xs">· Đang cập nhật</span>}
          </div>
        </header>

        {errorMessage && (
          <Alert
            variant="destructive"
            showIcon
            message="Không thể tải danh sách phim"
            description={errorMessage}
            action={(
              <Button type="button" variant="outline" size="sm" onClick={() => setRefreshKey((value) => value + 1)}>
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
            )}
            className="mb-4"
          />
        )}

        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
              Bộ lọc
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(260px,1.4fr)_180px_150px_190px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Tìm theo tên, đạo diễn, diễn viên..."
                  className="pl-9"
                  aria-label="Tìm kiếm phim"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue placeholder="Tất cả trạng thái" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Đang/sắp chiếu</SelectItem>
                  <SelectItem value="NOW_SHOWING">Đang chiếu</SelectItem>
                  <SelectItem value="COMING_SOON">Sắp chiếu</SelectItem>
                  <SelectItem value="ENDED">Đã kết thúc</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger><SelectValue placeholder="Tất cả năm" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt:desc">Mới cập nhật</SelectItem>
                  <SelectItem value="title:asc">Tên A → Z</SelectItem>
                  <SelectItem value="title:desc">Tên Z → A</SelectItem>
                  <SelectItem value="releaseDate:desc">Ngày phát hành mới</SelectItem>
                  <SelectItem value="releaseDate:asc">Ngày phát hành cũ</SelectItem>
                </SelectContent>
              </Select>

              <Button type="button" variant="outline" disabled={!hasActiveFilters} onClick={resetFilters}>
                Đặt lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {movies.map((movie) => {
                const status = movieStatusPresentation[getMovieStatus(movie)];
                return (
                  <BadgeRibbon key={movie.id} text={status.text} tone={status.tone}>
                    <MovieCard movie={movie} />
                  </BadgeRibbon>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border pt-3">
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
        ) : !loading && !errorMessage ? (
          <Card>
            <CardContent className="py-3">
              <Empty
                description={(
                  <div className="flex flex-col items-center gap-2">
                    <p>Không tìm thấy phim phù hợp với bộ lọc hiện tại.</p>
                    <Button type="button" variant="outline" size="sm" onClick={resetFilters}>Đặt lại bộ lọc</Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Movies;
