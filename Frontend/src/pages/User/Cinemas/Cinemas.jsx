import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Building2, Clock3, MapPin, RefreshCw, Search } from 'lucide-react';
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

  const resetFilters = () => {
    setSearchText('');
    setSelectedCity('all');
    setCurrentPage(1);
  };

  if (loading && cinemas.length === 0 && !errorMessage) {
    return <ContentLoader message="Đang tải danh sách rạp..." />;
  }

  return (
    <div className="min-h-dvh bg-background pb-10 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-5 border-b border-border/70 pb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="min-w-0 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                <Building2 className="h-3.5 w-3.5" />
                <span>HotCinema gần bạn</span>
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Hệ thống rạp chiếu</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                Chọn rạp theo thành phố, xem địa chỉ và mở lịch chiếu để tìm suất phù hợp.
              </p>
            </div>
            <div className="shrink-0 text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">{filteredCinemas.length}</strong> rạp
              {loading && <span className="text-xs"> · Đang cập nhật</span>}
            </div>
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

        <Card className="mb-5 bg-muted/20">
          <CardContent className="grid gap-2.5 p-3.5 sm:p-4 md:grid-cols-[minmax(0,1fr)_230px_auto]">
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

            <Button
              type="button"
              variant="outline"
              className="md:px-4"
              disabled={!searchText.trim() && selectedCity === 'all'}
              onClick={resetFilters}
            >
              Đặt lại
            </Button>
          </CardContent>
        </Card>

        {pagedCinemas.length > 0 ? (
          <>
            <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {pagedCinemas.map((cinema, index) => (
                <Card key={cinema.id} className="group overflow-hidden transition-colors hover:border-primary/40">
                  <CardContent className="flex h-full flex-col p-0">
                    <Link
                      to={`/cinemas/${cinema.id}`}
                      className="relative flex min-h-32 items-end overflow-hidden border-b border-border bg-muted/45 p-4 text-foreground"
                    >
                      <div className="absolute -right-4 -top-6 text-[88px] font-black leading-none tracking-tighter text-foreground/[0.035]">
                        {String((currentPage - 1) * pageSize + index + 1).padStart(2, '0')}
                      </div>
                      <div className="relative z-[1] flex min-w-0 items-end gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                          <Building2 className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Rạp HotCinema</p>
                          <h2 className="mt-1 line-clamp-2 text-lg font-semibold leading-6 tracking-tight">{cinema.name}</h2>
                        </div>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start gap-2 text-sm leading-5 text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="line-clamp-3">
                          {cinema.address || 'Địa chỉ đang cập nhật'}{cinema.city ? `, ${cinema.city}` : ''}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5" />
                          Xem lịch chiếu hôm nay
                        </span>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-primary">
                          <Link to={`/cinemas/${cinema.id}`} aria-label={`Xem ${cinema.name}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4">
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
            <CardContent className="py-6">
              <Empty
                description={(
                  <div className="flex flex-col items-center gap-2">
                    <p>Không tìm thấy rạp phù hợp với lựa chọn hiện tại.</p>
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

export default Cinemas;
