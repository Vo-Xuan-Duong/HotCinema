import { useCallback, useEffect, useRef, useState } from 'react';
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
import regionService from '@/services/regionService';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;

const getCinemaStatus = (cinema) => {
  const status = String(cinema?.status || '').toLowerCase();
  if (status === 'maintenance') return { tone: 'warning', label: 'Bảo trì' };
  if (status === 'inactive' || cinema?.isActive === false) return { tone: 'destructive', label: 'Không hoạt động' };
  return { tone: 'success', label: 'Hoạt động' };
};

const AdminCinemas = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const tableRef = useRef(null);
  const [cinemas, setCinemas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let cancelled = false;

    regionService.getRegionsAllNoPage()
      .then((response) => {
        if (!cancelled) setRegions(unwrapApiArray(response));
      })
      .catch((error) => {
        console.error('Error loading regions:', error);
        if (!cancelled) setRegions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadCinemas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (regionFilter !== 'all') params.cityId = regionFilter;

      const response = debouncedSearch
        ? await cinemaService.searchCinemas(debouncedSearch, params)
        : await cinemaService.getAllCinemas(params);
      const page = unwrapApiData(response) || {};
      const content = Array.isArray(page) ? page : Array.isArray(page.content) ? page.content : [];
      const total = Array.isArray(page) ? page.length : Number(page.totalElements ?? page.total) || content.length;

      setCinemas(content);
      setPagination((previous) => ({ ...previous, total }));
    } catch (error) {
      console.error('Error loading cinemas:', error);
      setCinemas([]);
      setPagination((previous) => ({ ...previous, total: 0 }));
      notification.error('Không thể tải danh sách rạp');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, notification, pagination.current, pagination.pageSize, regionFilter, statusFilter]);

  useEffect(() => {
    loadCinemas();
  }, [loadCinemas]);

  const resetPage = () => setPagination((previous) => ({ ...previous, current: 1 }));

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setRegionFilter('all');
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
      notification.error(error.response?.data?.message || 'Không thể xóa rạp');
    }
  };

  const hasActiveFilters = Boolean(searchText.trim() || statusFilter !== 'all' || regionFilter !== 'all');
  const selectedRegion = regions.find((region) => String(region.id) === regionFilter);

  const columns = [
    {
      title: 'Rạp chiếu',
      key: 'cinema',
      width: 320,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={record.image || record.imageUrl || record.bannerUrl || '/brand-placeholder.svg'}
            alt={record.name || 'Rạp chiếu'}
            className="h-12 w-18 shrink-0 rounded-md border border-border bg-muted object-cover"
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
            <p className="mt-0.5 flex items-start gap-1 text-xs leading-4 text-muted-foreground">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{record.address || 'Chưa cập nhật địa chỉ'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Khu vực',
      key: 'region',
      render: (_, record) => record.region?.name || record.regionName || record.cityName || '—',
    },
    {
      title: 'Phòng chiếu',
      key: 'rooms',
      render: (_, record) => Number(record.numberOfRooms ?? record.rooms?.length ?? 0).toLocaleString('vi-VN'),
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
        description="Quản lý thông tin rạp, khu vực, phòng chiếu và trạng thái vận hành."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý rạp', icon: <Building2 className="h-4 w-4" /> },
        ]}
        actions={(
          <Button type="button" onClick={() => navigate('/admin/cinemas/create')}>
            <Plus className="h-4 w-4" />
            Thêm rạp
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
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    resetPage();
                  }}
                  placeholder="Tìm theo tên hoặc địa chỉ..."
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); resetPage(); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>

              <Select value={regionFilter} onValueChange={(value) => { setRegionFilter(value); resetPage(); }}>
                <SelectTrigger><SelectValue placeholder="Tất cả khu vực" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id ?? region.name} value={String(region.id)}>{region.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center justify-end gap-2">
                <span className="hidden whitespace-nowrap text-xs text-muted-foreground 2xl:inline">
                  {pagination.total.toLocaleString('vi-VN')} rạp
                </span>
                {hasActiveFilters && (
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Đặt lại
                  </Button>
                )}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Đang lọc:</span>
                {statusFilter !== 'all' && (
                  <StatusBadge tone={statusFilter === 'active' ? 'success' : statusFilter === 'maintenance' ? 'warning' : 'destructive'}>
                    {statusFilter === 'active' ? 'Hoạt động' : statusFilter === 'maintenance' ? 'Bảo trì' : 'Không hoạt động'}
                    <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => { setStatusFilter('all'); resetPage(); }} aria-label="Xóa lọc trạng thái">
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                )}
                {selectedRegion && (
                  <StatusBadge tone="info">
                    {selectedRegion.name}
                    <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => { setRegionFilter('all'); resetPage(); }} aria-label="Xóa lọc khu vực">
                      <X className="h-3 w-3" />
                    </button>
                  </StatusBadge>
                )}
                {searchText.trim() && (
                  <StatusBadge tone="neutral">
                    “{searchText.trim()}”
                    <button type="button" className="ml-1 opacity-70 hover:opacity-100" onClick={() => { setSearchText(''); resetPage(); }} aria-label="Xóa từ khóa tìm kiếm">
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
              <span className="text-sm">Đang tải danh sách rạp...</span>
            </div>
          ) : cinemas.length ? (
            <DataTable fields={columns} rows={cinemas} getRowId="id" pageControls={false} framed={false} />
          ) : (
            <Empty description="Không có rạp phù hợp với bộ lọc hiện tại" className="min-h-40" />
          )}

          {!loading && cinemas.length > 0 && (
            <div className="border-t border-border p-3">
              <Pagination
                page={pagination.current}
                itemsPerPage={pagination.pageSize}
                totalItems={pagination.total}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[5, 10, 20, 50]}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} rạp`}
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

export default AdminCinemas;
