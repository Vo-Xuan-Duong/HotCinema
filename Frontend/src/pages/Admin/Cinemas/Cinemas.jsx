import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Edit, Eye, Home, Loader2, MapPin, Plus, Search, Trash2, X } from 'lucide-react';
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
import cinemaService from '@/services/cinemaService';

const DEFAULT_PAGE_SIZE = 10;

const statusMeta = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'MAINTENANCE') return { tone: 'warning', label: 'Bảo trì' };
  if (value === 'INACTIVE') return { tone: 'destructive', label: 'Không hoạt động' };
  return { tone: 'success', label: 'Hoạt động' };
};

const AdminCinemas = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const tableRef = useRef(null);
  const [allCinemas, setAllCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const loadCinemas = async () => {
    setLoading(true);
    try {
      const response = await cinemaService.getAllCinemas({ page: 0, size: 500 });
      setAllCinemas(Array.isArray(response) ? response : response?.content || []);
    } catch (error) {
      console.error('Error loading cinemas:', error);
      setAllCinemas([]);
      notification.error(error?.message || 'Không thể tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCinemas(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cities = useMemo(() => (
    [...new Set(allCinemas.map((cinema) => String(cinema.city || '').trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, 'vi', { sensitivity: 'base' }))
  ), [allCinemas]);

  const filtered = useMemo(() => {
    const keyword = debouncedSearch.toLowerCase();
    return allCinemas.filter((cinema) => {
      if (keyword && !`${cinema.code || ''} ${cinema.name || ''} ${cinema.address || ''} ${cinema.city || ''}`.toLowerCase().includes(keyword)) return false;
      if (statusFilter !== 'all' && String(cinema.status || '').toUpperCase() !== statusFilter) return false;
      if (cityFilter !== 'all' && String(cinema.city || '') !== cityFilter) return false;
      return true;
    });
  }, [allCinemas, cityFilter, debouncedSearch, statusFilter]);

  const pageRows = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filtered.slice(start, start + pagination.pageSize);
  }, [filtered, pagination.current, pagination.pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pagination.pageSize));
    if (pagination.current > totalPages) {
      setPagination((previous) => ({ ...previous, current: totalPages }));
    }
  }, [filtered.length, pagination.current, pagination.pageSize]);

  const resetPage = () => setPagination((previous) => ({ ...previous, current: 1 }));
  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setCityFilter('all');
    resetPage();
  };

  const handleDeleteCinema = async (cinema) => {
    if (!window.confirm(`Xóa rạp “${cinema.name}”?`)) return;
    try {
      await cinemaService.deleteCinema(cinema.id);
      notification.success('Xóa rạp chiếu thành công');
      await loadCinemas();
    } catch (error) {
      console.error('Error deleting cinema:', error);
      notification.error(error.response?.data?.message || error?.message || 'Không thể xóa rạp');
    }
  };

  const hasActiveFilters = Boolean(searchText.trim() || statusFilter !== 'all' || cityFilter !== 'all');

  const columns = [
    {
      title: 'Rạp chiếu',
      key: 'cinema',
      width: 340,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={record.logoUrl || '/brand-placeholder.svg'}
            alt={record.name || 'Rạp chiếu'}
            className="h-12 w-20 shrink-0 rounded-md border border-border bg-muted object-contain p-1"
            onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
          />
          <div className="min-w-0">
            <Button type="button" variant="link" className="h-auto max-w-full justify-start p-0 font-semibold" onClick={() => navigate(`/admin/cinemas/${record.id}`)}>
              <span className="truncate">{record.name || 'Chưa có tên'}</span>
            </Button>
            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{record.code || '—'}</p>
            <p className="mt-0.5 flex items-start gap-1 text-xs leading-4 text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{record.address || 'Chưa cập nhật địa chỉ'}</span>
            </p>
          </div>
        </div>
      ),
    },
    { title: 'Thành phố', dataIndex: 'city', key: 'city', render: (value) => value || '—' },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone', render: (value) => value || '—' },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (value) => value || '—' },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const status = statusMeta(record.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/cinemas/${record.id}`)} aria-label={`Xem ${record.name}`}><Eye className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/cinemas/${record.id}/edit`)} aria-label={`Sửa ${record.name}`}><Edit className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCinema(record)} aria-label={`Xóa ${record.name}`}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Quản lý rạp chiếu"
        description="Quản lý Cinema theo đúng contract backend: thành phố nằm trực tiếp trên rạp; không có Region/City ID hay số phòng trong CinemaResponse."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý rạp', icon: <Building2 className="h-4 w-4" /> },
        ]}
        actions={<Button type="button" onClick={() => navigate('/admin/cinemas/create')}><Plus className="h-4 w-4" />Thêm rạp</Button>}
      />

      <Card ref={tableRef}>
        <CardContent className="p-0">
          <div className="border-b border-border p-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_190px_220px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => { setSearchText(event.target.value); resetPage(); }}
                  placeholder="Tìm mã, tên, địa chỉ, thành phố..."
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); resetPage(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                  <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cityFilter} onValueChange={(value) => { setCityFilter(value); resetPage(); }}>
                <SelectTrigger><SelectValue placeholder="Tất cả thành phố" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thành phố</SelectItem>
                  {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end gap-2">
                <span className="hidden whitespace-nowrap text-xs text-muted-foreground 2xl:inline">{filtered.length.toLocaleString('vi-VN')} rạp</span>
                {hasActiveFilters && <Button type="button" variant="outline" onClick={clearFilters}><X className="h-4 w-4" />Đặt lại</Button>}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-sm">Đang tải danh sách rạp...</span></div>
          ) : pageRows.length ? (
            <DataTable fields={columns} rows={pageRows} getRowId="id" framed={false} />
          ) : (
            <Empty description="Không có rạp phù hợp với bộ lọc hiện tại" className="min-h-40" />
          )}

          {!loading && filtered.length > 0 && (
            <div className="border-t border-border p-3">
              <Pagination
                page={pagination.current}
                itemsPerPage={pagination.pageSize}
                totalItems={filtered.length}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[5, 10, 20, 50]}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} rạp`}
                onPageChange={(page) => {
                  setPagination((previous) => ({ ...previous, current: page }));
                  tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                onPageSizeChange={(size) => setPagination({ current: 1, pageSize: size })}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCinemas;
