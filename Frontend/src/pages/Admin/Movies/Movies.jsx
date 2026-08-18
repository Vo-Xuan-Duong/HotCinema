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
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import movieService from '@/services/movieService';
import { unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;

const statusPresentation = {
  DRAFT: { label: 'Bản nháp', tone: 'neutral' },
  NOW_SHOWING: { label: 'Đang chiếu', tone: 'success' },
  COMING_SOON: { label: 'Sắp chiếu', tone: 'warning' },
  ENDED: { label: 'Đã kết thúc', tone: 'neutral' },
  HIDDEN: { label: 'Đã ẩn', tone: 'destructive' },
};

const getStatusPresentation = (status) => statusPresentation[String(status || '').toUpperCase()] || {
  label: status || 'Chưa xác định',
  tone: 'neutral',
};

const formatDuration = (record) => {
  const minutes = Number(record.durationMinutes ?? record.runtime ?? record.duration);
  return Number.isFinite(minutes) && minutes > 0 ? `${minutes} phút` : 'Chưa cập nhật';
};

const AdminMovies = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const tableRef = useRef(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ status: 'all', releaseYear: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 30 }, (_, index) => String(currentYear - index));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const loadMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        sort: 'updatedAt,desc',
      };
      if (debouncedSearch) params.keyword = debouncedSearch;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.releaseYear !== 'all') params.releaseYear = Number(filters.releaseYear);

      const hasSearchCriteria = Boolean(
        debouncedSearch
        || filters.status !== 'all'
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
      notification.error(error?.message || 'Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.releaseYear, filters.status, notification, pagination.current, pagination.pageSize]);

  useEffect(() => { loadMovies(); }, [loadMovies]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPagination((previous) => ({ ...previous, current: 1 }));
  };

  const clearFilters = () => {
    setSearchText('');
    setFilters({ status: 'all', releaseYear: 'all' });
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
      notification.error(error.response?.data?.message || error?.message || 'Không thể xóa phim');
    }
  };

  const hasActiveFilters = Boolean(searchText.trim() || filters.status !== 'all' || filters.releaseYear !== 'all');

  const columns = [
    {
      title: 'Phim',
      key: 'movie',
      width: 340,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={record.posterUrl || '/brand-placeholder.svg'}
            alt={record.title || 'Poster phim'}
            className="h-16 w-11 shrink-0 rounded-md border border-border bg-muted object-cover"
            onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
          />
          <div className="min-w-0">
            <Button type="button" variant="link" className="h-auto max-w-full justify-start p-0 text-left font-semibold" onClick={() => navigate(`/admin/movies/${record.id}`)}>
              <span className="truncate">{record.title || 'Chưa có tên'}</span>
            </Button>
            {record.originalTitle && record.originalTitle !== record.title && <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.originalTitle}</p>}
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDuration(record)}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Phát hành',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (value) => value && dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY') : '—',
    },
    {
      title: 'Phân loại',
      dataIndex: 'ageRating',
      key: 'ageRating',
      render: (value) => value ? <StatusBadge tone="warning">{value}</StatusBadge> : <span className="text-muted-foreground">—</span>,
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'originalLanguage',
      key: 'originalLanguage',
      render: (value) => value || '—',
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
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (value) => value && dayjs(value).isValid() ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/movies/${record.id}`)} aria-label={`Xem ${record.title}`}><Eye className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/movies/${record.id}/edit`)} aria-label={`Sửa ${record.title}`}><Edit className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMovie(record)} aria-label={`Xóa ${record.title}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Quản lý phim"
        description="Quản lý đúng Movie DTO của backend. Genre hiện là resource độc lập và backend chưa có quan hệ Movie–Genre nên không được dùng làm filter tại đây."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý phim', icon: <Film className="h-4 w-4" /> },
        ]}
        actions={<Button type="button" onClick={() => navigate('/admin/movies/create')}><Plus className="h-4 w-4" />Thêm phim</Button>}
      />

      <Card ref={tableRef}>
        <CardContent className="p-0">
          <div className="border-b border-border p-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_190px_160px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => { setSearchText(event.target.value); setPagination((previous) => ({ ...previous, current: 1 })); }}
                  placeholder="Tìm tên phim, đạo diễn, diễn viên..."
                  className="pl-9"
                />
              </div>

              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="DRAFT">Bản nháp</SelectItem>
                  <SelectItem value="COMING_SOON">Sắp chiếu</SelectItem>
                  <SelectItem value="NOW_SHOWING">Đang chiếu</SelectItem>
                  <SelectItem value="ENDED">Đã kết thúc</SelectItem>
                  <SelectItem value="HIDDEN">Đã ẩn</SelectItem>
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
                <span className="hidden whitespace-nowrap text-xs text-muted-foreground 2xl:inline">{pagination.total.toLocaleString('vi-VN')} phim</span>
                {hasActiveFilters && <Button type="button" variant="outline" onClick={clearFilters}><X className="h-4 w-4" />Đặt lại</Button>}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-sm">Đang tải danh sách phim...</span></div>
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
