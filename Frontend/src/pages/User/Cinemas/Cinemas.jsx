import { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronRight, Clock, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cinemaService from '@/services/cinemaService';
import regionService from '@/services/regionService';
import useNotification from '@/hooks/useNotification';
import { unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 12;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const toCollection = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

const Cinemas = () => {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [cinemas, setCinemas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadRegions = async () => {
      try {
        const response = await regionService.getAllRegions();
        if (!cancelled) setRegions(toCollection(response));
      } catch (error) {
        console.error('Error loading regions:', error);
        if (!cancelled) {
          setRegions([]);
          notification.error('Không thể tải danh sách khu vực');
        }
      }
    };

    loadRegions();
    return () => {
      cancelled = true;
    };
  }, [notification]);

  useEffect(() => {
    let cancelled = false;

    const loadCinemas = async () => {
      setLoading(true);
      try {
        const response = await cinemaService.getAllCinemas({
          page: currentPage - 1,
          size: pageSize,
        });
        if (cancelled) return;

        const data = unwrapApiData(response);
        const content = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
        const total = Array.isArray(data) ? data.length : data?.totalElements ?? data?.total ?? content.length;

        setCinemas(content);
        setTotalItems(total);
      } catch (error) {
        console.error('Error loading cinemas:', error);
        if (!cancelled) {
          setCinemas([]);
          setTotalItems(0);
          notification.error('Không thể tải danh sách rạp chiếu');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCinemas();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize, notification]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedRegion]);

  const filteredCinemas = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return cinemas.filter((cinema) => {
      const matchesSearch = !keyword
        || cinema.name?.toLowerCase().includes(keyword)
        || cinema.address?.toLowerCase().includes(keyword);

      const region = cinema.region;
      const regionSlug = typeof region === 'object' ? region?.slug : cinema.regionSlug;
      const regionName = typeof region === 'object' ? region?.name : cinema.regionName || region;
      const matchesRegion = selectedRegion === 'all'
        || regionSlug === selectedRegion
        || regionName === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [cinemas, searchText, selectedRegion]);

  if (loading && cinemas.length === 0) {
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
              Tìm rạp theo tên, địa chỉ hoặc khu vực và mở lịch chiếu ngay từ danh sách.
            </p>
          </div>
          <div className="shrink-0 text-sm text-muted-foreground">
            {filteredCinemas.length > 0 ? `${filteredCinemas.length} rạp trên trang` : 'Không có kết quả'}
            {loading && <span className="text-xs"> · Đang cập nhật</span>}
          </div>
        </header>

        <Card className="mb-4">
          <CardContent className="grid gap-2 p-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm tên rạp hoặc địa chỉ..."
                className="pl-9"
                aria-label="Tìm kiếm rạp"
              />
            </div>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id ?? region.slug ?? region.name} value={region.slug || region.name}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {filteredCinemas.length > 0 ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredCinemas.map((cinema) => {
                const mapUrl = GOOGLE_MAPS_API_KEY && cinema.address
                  ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&q=${encodeURIComponent(cinema.address)}&zoom=15`
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
                            <span className="px-2 text-[11px] leading-4">Chưa có bản đồ</span>
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
                          <span className="line-clamp-2">{cinema.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>

                        <Button asChild variant="outline" size="sm" className="mt-auto w-full justify-between pt-0 sm:mt-3">
                          <Link to={`/cinemas/${cinema.id}`}>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Lịch chiếu
                            </span>
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
                totalItems={totalItems}
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
        ) : (
          <Card>
            <CardContent className="py-3">
              <Empty
                description={
                  <div className="space-y-1 text-center">
                    <p>Không tìm thấy rạp chiếu phim phù hợp.</p>
                    <p className="text-xs text-muted-foreground">Thử thay đổi từ khóa hoặc khu vực đang chọn.</p>
                  </div>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cinemas;
