import { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronRight, Clock, MapPin, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cinemaService from '@/services/cinemaService';

const DEFAULT_PAGE_SIZE = 12;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const Cinemas = () => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [cinemas, setCinemas] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadCinemas = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await cinemaService.getPublicCinemas({ page: 0, size: 500 });
        if (cancelled) return;
        setCinemas(Array.isArray(response) ? response : response?.content || []);
      } catch (error) {
        console.error('Error loading public cinemas:', error);
        if (!cancelled) {
          setCinemas([]);
          setErrorMessage(error?.message || 'Không thể tải danh sách rạp chiếu.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCinemas();
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedCity]);

  const cities = useMemo(() => (
    [...new Set(cinemas.map((cinema) => String(cinema.city || '').trim()).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right, 'vi', { sensitivity: 'base' }))
  ), [cinemas]);

  const filteredCinemas = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    return cinemas.filter((cinema) => {
      const matchesSearch = !keyword
        || `${cinema.name || ''} ${cinema.address || ''} ${cinema.city || ''}`.toLowerCase().includes(keyword);
      const matchesCity = selectedCity === 'all' || String(cinema.city || '') === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [cinemas, searchText, selectedCity]);

  const pagedCinemas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCinemas.slice(start, start + pageSize);
  }, [currentPage, filteredCinemas, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCinemas.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, filteredCinemas.length, pageSize]);

  if (loading && cinemas.length === 0 && !errorMessage) {
    return <ContentLoader message="Đang tải danh sách rạp..." />;
  }

  return (
    <div className="min-h-dvh bg-background pb-8 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="min-w-0">
            <p className="text-xs font-medium text-primary">HotCinema</p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">Hệ thống rạp chiếu</h1>
            <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">
              Customer UI chỉ hiển thị rạp ACTIVE; lọc khu vực dựa trực tiếp trên trường thành phố của backend.
            </p>
          </div>
          <div className="shrink-0 text-sm text-muted-foreground">
            {filteredCinemas.length > 0 ? `${filteredCinemas.length} rạp` : 'Không có kết quả'}
            {loading && <span className="text-xs"> · Đang cập nhật</span>}
          </div>
        </header>

        {errorMessage && (
          <Alert
            variant="destructive"
            showIcon
            message="Không thể tải danh sách rạp"
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
          <CardContent className="grid gap-2 p-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm tên rạp, địa chỉ hoặc thành phố..."
                className="pl-9"
                aria-label="Tìm kiếm rạp"
              />
            </div>

            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Thành phố" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thành phố</SelectItem>
                {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {pagedCinemas.length > 0 ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {pagedCinemas.map((cinema) => {
                const mapQuery = [cinema.address, cinema.city].filter(Boolean).join(', ');
                const mapUrl = GOOGLE_MAPS_API_KEY && mapQuery
                  ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&q=${encodeURIComponent(mapQuery)}&zoom=15`
                  : null;

                return (
                  <Card key={cinema.id} className="group overflow-hidden transition-colors hover:border-primary/40">
                    <div className="grid h-full sm:grid-cols-[128px_minmax(0,1fr)]">
                      <div className="relative h-28 overflow-hidden border-b border-border bg-muted sm:h-full sm:min-h-36 sm:border-b-0 sm:border-r">
                        {mapUrl ? (
                          <iframe
                            title={`Bản đồ ${cinema.name}`}
                            src={mapUrl}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 h-full w-full border-0"
                            allowFullScreen
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center text-muted-foreground">
                            <MapPin className="h-5 w-5 text-primary" />
                            <span className="px-2 text-[11px] leading-4">Chưa cấu hình bản đồ</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="flex min-w-0 flex-col p-3">
                        <div className="flex min-w-0 items-start gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Building2 className="h-3.5 w-3.5" />
                          </span>
                          <Link to={`/cinemas/${cinema.id}`} className="line-clamp-2 text-sm font-semibold leading-5 hover:text-primary">
                            {cinema.name}
                          </Link>
                        </div>

                        <div className="mt-2 flex items-start gap-1.5 text-xs leading-4 text-muted-foreground">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="line-clamp-2">{cinema.address || 'Chưa cập nhật địa chỉ'}{cinema.city ? `, ${cinema.city}` : ''}</span>
                        </div>

                        <Button asChild variant="outline" size="sm" className="mt-auto w-full justify-between pt-0 sm:mt-3">
                          <Link to={`/cinemas/${cinema.id}`}>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />Lịch chiếu</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-5 border-t border-border pt-3">
              <Pagination
                page={currentPage}
                totalItems={filteredCinemas.length}
                itemsPerPage={pageSize}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showSizeChanger
                pageSizeOptions={[12, 24, 36, 48]}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} rạp`}
              />
            </div>
          </>
        ) : !loading && !errorMessage ? (
          <Card>
            <CardContent className="py-3">
              <Empty description="Không tìm thấy rạp ACTIVE phù hợp với bộ lọc hiện tại." />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Cinemas;
