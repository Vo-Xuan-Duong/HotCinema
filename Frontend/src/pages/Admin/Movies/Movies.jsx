import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Clock, Edit, Eye, Film, Home, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import genreService from '@/services/genreService';
import movieService from '@/services/movieService';
import { unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;

const statusPresentation = {
  NOW_SHOWING: { label: 'Đang chiếu', tone: 'success' },
  COMING_SOON: { label: 'Sắp chiếu', tone: 'warning' },
  ARCHIVED: { label: 'Đã lưu trữ', tone: 'neutral' },
  ENDED: { label: 'Đã kết thúc', tone: 'neutral' },
};

const getStatusPresentation = (status) => statusPresentation[status] || {
  label: status || 'Chưa xác định',
  tone: 'neutral',
};

const formatDuration = (record) => {
  if (record.durationFormatted) return record.durationFormatted;
  const minutes = Number(record.durationMinutes ?? record.runtime ?? record.duration);
  return Number.isFinite(minutes) && minutes > 0 ? `${minutes} phút` : 'Chưa cập nhật';
};

const getGenreNames = (record) => {
  if (Array.isArray(record.genres)) {
    return record.genres
      .map((genre) => typeof genre === 'string' ? genre : genre?.name)
      .filter(Boolean);
  }

  if (typeof record.genre === 'string') {
    return record.genre.split(',').map((genre) => genre.trim()).filter(Boolean);
  }

  return [];
};

const AdminMovies = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const tableRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', genreId: 'all', releaseYear: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, index) => String(currentYear - index));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let cancelled = false;

    genreService.getAllGenres()
      .then((response) => {
        if (!cancelled) setGenres(Array.isArray(response) ? response : []);
      })
      .catch((error) => {
        console.error('Error loading genres:', error);
        if (!cancelled) setGenres([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        sort: 'releaseDate,desc',
      };

      if (debouncedSearch) params.keyword = debouncedSearch;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.genreId !== 'all') params.genre = [Number(filters.genreId)];
      if (filters.releaseYear !== 'all') params.releaseYear = Number(filters.releaseYear);

      const hasSearchCriteria = Boolean(
        debouncedSearch
        || filters.status !== 'all'
        || filters.genreId !== 'all'
        || filters.releaseYear !== 'all'
      );

      const response = hasSearchCriteria
        ? await movieService.searchPage(params)
        : await movieService.listPage(params);
      const page = unwrapApiData(response) || {};
      const content = Array.isArray(page) ? page : Array.isArray(page.content) ? page.content : [];
      const total = Array.isArray(page) ? page.length : Number(page.totalElements ?? page.total) || content.length;

      setMovies(content);
      setPagination((previous) => ({ ...previous, total }));
    } catch (error) {
      console.error('Error loading movies:', error);
      setMovies([]);
      setPagination((previous) => ({ ...previous, total: 0 }));
      notification.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.genreId, filters.releaseYear, filters.status, notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPagination((previous) => ({ ...previous, current: 1 }));
  };

  const clearFilters = () => {
    setSearchText('');
    setFilters({ status: 'all', genreId: 'all', releaseYear: 'all' });
    setPagination((previous) => ({ ...previous, current: 1 }));
  };

  const handleDeleteMovie = async (movie) => {
    if (!window.confirm(`Xóa phim “${movie.title}”?`)) return;

    try {
      await movieService.deleteMovie(movie.id);
      notification.success('Xóa phim thành công');
      await loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      notification.error(error.response?.data?.message || 'Không thể xóa phim');
    }
  };

  const hasActiveFilters = Boolean(
    searchText.trim()
    || filters.status !== 'all'
    || filters.genreId !== 'all'
    || filters.releaseYear !== 'all'
  );

  const activeFilters = [
    filters.status !== 'all' && {
      key: 'status',
      label: getStatusPresentation(filters.status).label,
      tone: getStatusPresentation(filters.status).tone,
      clear: () => updateFilter('status', 'all'),
    },
    filters.genreId !== 'all' && {
      key: 'genre',
      label: genres.find((genre) => String(genre.id) === filters.genreId)?.name || 'Thể loại',
      tone: 'info',
      clear: () => updateFilter('genreId', 'all'),
    },
    filters.releaseYear !== 'all' && {
      key: 'year',
      label: `Năm ${filters.releaseYear}`,
      tone: 'warning',
      clear: () => updateFilter('releaseYear', 'all'),
    },
  ].filter(Boolean);

  const columns = [
    {
      title: 'Phim',
      key: 'movie',
      width: 340,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={record.posterUrl || record.poster || record.posterPath || '/brand-placeholder.svg'}
            alt={record.title || 'Poster phim'}
            className="h-16 w-11 shrink-0 rounded-md border border-border bg-muted object-cover"
            onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
          />
          <div className="min-w-0">
            <Button
              type="button"
              variant="link"
              className="h-auto max-w-full justify-start p-0 text-left font-semibold"
              onClick={() => navigate(`/admin/movies/${record.id}`)}
            >
              <span className="truncate">{record.title || 'Chưa có tên'}</span>
            </Button>
            {record.originalTitle && record.originalTitle !== record.title && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.originalTitle}</p>
            )}
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDuration(record)}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Thể loại',
      key: 'genres',
      render: (_, record) => {
        const genreNames = getGenreNames(record);
        return genreNames.length ? (
          <div className="flex max-w-64 flex-wrap gap-1">
            {genreNames.slice(0, 2).map((genre) => (
              <StatusBadge key={genre} tone="info">{genre}</StatusBadge>
            ))}
            {genreNames.length > 2 && <span className="text-xs text-muted-foreground">+{genreNames.length - 2}</span>}
          </div>
        ) : <span className="text-sm text-muted-foreground">Chưa phân loại</span>;
      },
    },
    {
      title: 'Phát hành',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (value) => value && dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : '—',
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_, record) => {
        const rating = Number(record.averageRating ?? record.voteAverage ?? record.rating ?? 0);
        return rating > 0 ? (
          <div className="flex items-center gap-1.5">
            <StarRating readOnly value={Math.min(5, rating > 5 ? rating / 2 : rating)} className="gap-0.5" />
            <span className="text-xs font-medium tabular-nums">{rating.toFixed(1)}{rating > 5 ? '/10' : '/5'}</span>
          </div>
        ) : <span className="text-xs text-muted-foreground">Chưa có</span>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const presentation = getStatusPresentation(status);
        return <StatusBadge tone={presentation.tone}>{presentation.label}</StatusBadge>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/movies/${record.id}`)} aria-label={`Xem ${record.title}`}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/movies/${record.id}/edit`)} aria-label={`Sửa ${record.title}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDeleteMovie(record)}
            aria-label={`Xóa ${record.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Quản lý phim"
        description="Quản lý nội dung phim, trạng thái phát hành, thể loại và thông tin hiển thị trên HotCinema."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý phim', icon: <Film className="h-4 w-4" /> },
        ]}
        actions={(
          <Button type="button" onClick={() => navigate('/admin/movies/create')}>
            <Plus className="h-4 w-4" />
            Thêm phim
          </Button>
        )}
      />

      <Card ref={tableRef}>
        <CardContent className="p-0">
          <div className="border-b border-border p-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_170px_190px_140px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setPagination((previous) => ({ ...previous, current: 1 }));
                  }}
                  placeholder="Tìm theo tên phim..."
                  className="pl-9"
                />
              </div>

              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="NOW_SHOWING">Đang chiếu</SelectItem>
                  <SelectItem value="COMING_SOON">Sắp chiếu</SelectItem>
                  <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.genreId} onValueChange={(value) => updateFilter('genreId', value)}>
                <SelectTrigger><SelectValue placeholder="Tất cả thể loại" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thể loại</SelectItem>
                  {genres.map((genre) => (
                    <SelectItem key={genre.id ?? genre.name} value={String(genre.id)}>{genre.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.releaseYear} onValueChange={(value) => updateFilter('releaseYear', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {years.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end gap-2">
                <span className="hidden whitespace-nowrap text-xs text-muted-foreground 2xl:inline">
                  {pagination.total.toLocaleString('vi-VN')} phim
                </span>
                {hasActiveFilters && (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Đặt lại
                  </Button>
                )}
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Đang lọc:</span>
                {activeFilters.map((filter) => (
                  <StatusBadge key={filter.key} tone={filter.tone}>
                    {filter.label}
                    <button type="button" onClick={filter.clear} className="ml-1 rounded-sm opacity-70 hover:opacity-100" aria-label={`Xóa bộ lọc ${filter.label}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                ))}
                {searchText.trim() && (
                  <StatusBadge tone="neutral">
                    “{searchText.trim()}”
                    <button type="button" onClick={() => { setSearchText(''); setPagination((previous) => ({ ...previous, current: 1 })); }} className="ml-1 opacity-70 hover:opacity-100" aria-label="Xóa từ khóa tìm kiếm">
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                )}
                <span className="text-xs text-muted-foreground">{pagination.total.toLocaleString('vi-VN')} kết quả</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách phim...</span>
            </div>
          ) : movies.length ? (
            <DataTable fields={columns} rows={movies} getRowId="id" framed={false} />
          ) : (
            <Empty description="Không có phim phù hợp với bộ lọc hiện tại" className="min-h-40" />
          )}

          {!loading && movies.length > 0 && (
            <div className="border-t border-border p-3">
              <Pagination
                page={pagination.current}
                itemsPerPage={pagination.pageSize}
                totalItems={pagination.total}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[10, 20, 50]}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} phim`}
                onPageChange={(page) => {
                  setPagination((previous) => ({ ...previous, current: page }));
                  tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                onPageSizeChange={(size) => setPagination((previous) => ({ ...previous, current: 1, pageSize: size }))}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMovies;