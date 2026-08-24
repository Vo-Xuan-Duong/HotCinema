import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const normalize = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const getCinemaStatus = (cinema) => {
  const status = String(cinema?.status || '').toUpperCase();
  if (status === 'MAINTENANCE') return { tone: 'warning', label: 'Bảo trì' };
  if (status === 'INACTIVE' || cinema?.isActive === false) return { tone: 'destructive', label: 'Không hoạt động' };
  if (status === 'ACTIVE') return { tone: 'success', label: 'Hoạt động' };
  return { tone: 'neutral', label: status || 'Không rõ' };
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

  const loadCinemas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await cinemaService.getAllCinemas();
      setAllCinemas(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading cinemas:', error);
      setAllCinemas([]);
      notification.error(error?.message || 'Không thể tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    loadCinemas();
  }, [loadCinemas]);

  const cities = useMemo(
    () => [...new Set(allCinemas.map((cinema) => cinema.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')),
    [allCinemas]
  );

  const filteredCinemas = useMemo(() => {
    const keyword = normalize(debouncedSearch);
    return allCinemas.filter((cinema) => {
      const matchesStatus = statusFilter === 'all' || String(cinema.status || '').toUpperCase() === statusFilter;
      const matchesCity = cityFilter === 'all' || cinema.city === cityFilter;
      const matchesKeyword = !keyword || [
        cinema.code,
        cinema.name,
        cinema.address,
        cinema.ward,
        cinema.district,
        cinema.city,
        cinema.phone,
        cinema.email,
      ].some((value) => normalize(value).includes(keyword));
      return matchesStatus && matchesCity && matchesKeyword;
    });
  }, [allCinemas, cityFilter, debouncedSearch, statusFilter]);

  const total = filteredCinemas.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const safePage = Math.min(pagination.current, totalPages);
  const pageStart = (safePage - 1) * pagination.pageSize;
  const cinemas = filteredCinemas.slice(pageStart, pageStart + pagination.pageSize);

  useEffect(() => {
    if (pagination.current !== safePage) {
      setPagination((previous) => ({ ...previous, current: safePage }));
    }
  }, [pagination.current, safePage]);

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
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa rạp');
    }
  };

  const hasActiveFilters = Boolean(searchText.trim() || statusFilter !== 'all' || cityFilter !== 'all');

  const columns = [
    {
      title: 'Rạp chiếu',
      key: 'cinema',
      width: 320,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={record.logoUrl || '/brand-placeholder.svg'}
            alt={record.name || 'Rạp chiếu'}
            className="h-12 w-20 shrink-0 rounded-md border border-border bg-muted object-cover"
            onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
          />
          <div className="min-w-0">
            <Button
              type="button"
              variant="link"
              className="h-auto max-w-full justify-start p-0 font-semibold"
              onClick={() => navigate(`/admin/cinemas/${record.id}`)}
            >
              <span className="truncate">{record.name || 'Chưa có tên'}</span>
            </Button>
            <p className="mt-0.5 text-xs text-muted-foreground">{record.code || 'Chưa có mã'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      render: (_, record) => (
        <div className="max-w-[360px]">
          <p className="flex items-start gap-1 text-sm">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="line-clamp-2">{record.address || 'Chưa cập nhật địa chỉ'}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[record.ward, record.district, record.city].filter(Boolean).join(', ') || '—'}
          </p>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="text-sm">
          <p>{record.phone || '—'}</p>
          <p className="text-xs text-muted-foreground">{record.email || '—'}</p>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const status = getCinemaStatus(record);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/cinemas/${record.id}`)} aria-label={`Xem ${record.name}`}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/cinemas/${record.id}/edit`)} aria-label={`Sửa ${record.name}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => handleDeleteCinema(record)}
            aria-label={`Xóa ${record.name}`}
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
        title="Quản lý rạp chiếu"
        description="Quản lý thông tin rạp, địa chỉ, liên hệ, phòng chiếu và trạng thái vận hành."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý rạp', icon: <Building2 className="h-4 w-4" /> },
        ]}
        actions={(
          <Button type="button" onClick={() => navigate('/admin/cinemas/create')}>
            <Plus className="h-4 w-4" />Thêm rạp
          </Button>
        )}
      />

      <Card ref={tableRef}>
        <CardContent className="p-0">
          <div className="border-b border-border p-3">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(280px,1fr)_180px_220px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => { setSearchText(event.target.value); resetPage(); }}
                  placeholder="Tìm tên, mã, địa chỉ hoặc liên hệ..."
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
                <SelectTrigger><SelectValue placeholder="Tất cả tỉnh/thành" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tỉnh/thành</SelectItem>
                  {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end gap-2">
                <span className="hidden whitespace-nowrap text-xs text-muted-foreground 2xl:inline">{total.toLocaleString('vi-VN')} rạp</span>
                {hasActiveFilters && (
                  <Button type="button" variant="outline" onClick={clearFilters}><X className="h-4 w-4" />Đặt lại</Button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Đang lọc:</span>
                {statusFilter !== 'all' && (
                  <StatusBadge tone={statusFilter === 'ACTIVE' ? 'success' : statusFilter === 'MAINTENANCE' ? 'warning' : 'destructive'}>
                    {getCinemaStatus({ status: statusFilter }).label}
                    <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => { setStatusFilter('all'); resetPage(); }} aria-label="Xóa lọc trạng thái"><X className="h-3 w-3" /></button>
                  </StatusBadge>
                )}
                {cityFilter !== 'all' && (
                  <StatusBadge tone="info">
                    {cityFilter}
                    <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => { setCityFilter('all'); resetPage(); }} aria-label="Xóa lọc tỉnh thành"><X className="h-3 w-3" /></button>
                  </StatusBadge>
                )}
                {searchText.trim() && (
                  <StatusBadge tone="neutral">
                    “{searchText.trim()}”
                    <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => { setSearchText(''); resetPage(); }} aria-label="Xóa từ khóa tìm kiếm"><X className="h-3 w-3" /></button>
                  </StatusBadge>
                )}
                <span className="text-xs text-muted-foreground">{total.toLocaleString('vi-VN')} kết quả</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách rạp...</span>
            </div>
          ) : cinemas.length ? (
            <DataTable fields={columns} rows={cinemas} getRowId="id" framed={false} />
          ) : (
            <Empty description="Không có rạp phù hợp với bộ lọc hiện tại" className="min-h-40" />
          )}

          {!loading && total > 0 && (
            <div className="border-t border-border p-3">
              <Pagination
                page={safePage}
                itemsPerPage={pagination.pageSize}
                totalItems={total}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[5, 10, 20, 50]}
                showTotal={(count, range) => `${range[0]}-${range[1]} của ${count} rạp`}
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
