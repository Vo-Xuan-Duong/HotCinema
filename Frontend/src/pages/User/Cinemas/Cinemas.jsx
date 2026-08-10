import { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronRight, Clock, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import cinemaService from '@/services/cinemaService';
import regionService from '@/services/regionService';
import useNotification from '@/hooks/useNotification';
import { unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 9;
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
    <div className="min-h-dvh bg-background pb-16 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-2">
          <p className="text-sm font-medium text-primary">HotCinema</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Hệ thống rạp chiếu</h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Tìm rạp phù hợp theo tên, địa chỉ hoặc khu vực và xem lịch chiếu đang có.
          </p>
        </header>

        <Card className="mb-8 shadow-sm">
          <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm tên rạp hoặc địa chỉ..."
                className="h-10 pl-9"
                aria-label="Tìm kiếm rạp"
              />
            </div>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="h-10">
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

        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredCinemas.length > 0
              ? `${filteredCinemas.length} rạp trên trang hiện tại`
              : 'Không có kết quả phù hợp'}
          </p>
          {loading && <span className="text-xs text-muted-foreground">Đang cập nhật...</span>}
        </div>

        {filteredCinemas.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredCinemas.map((cinema) => {
                const mapUrl = GOOGLE_MAPS_API_KEY && cinema.address
                  ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&q=${encodeURIComponent(cinema.address)}&zoom=15`
                  : null;

                return (
                  <Card key={cinema.id} className="group flex h-full flex-col overflow-hidden shadow-sm transition-colors hover:border-primary/40">
                    <div className="relative h-48 overflow-hidden border-b border-border bg-muted">
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
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <span className="text-sm">Bản đồ chưa được cấu hình</span>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">
                        <Link to={`/cinemas/${cinema.id}`} className="hover:text-primary">
                          {cinema.name}
                        </Link>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="line-clamp-3 leading-6">{cinema.address || 'Chưa cập nhật địa chỉ'}</span>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button asChild className="w-full">
                        <Link to={`/cinemas/${cinema.id}`}>
                          <Clock className="mr-2 h-4 w-4" />
                          Xem lịch chiếu
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="mt-10 border-t border-border pt-8">
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
                pageSizeOptions={[9, 18, 27, 36]}
              />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-4">
              <Empty
                description={
                  <div className="space-y-2 text-center">
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
