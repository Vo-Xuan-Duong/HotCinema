import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Film, Loader2, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import cinemaService from '@/services/cinemaService';
import regionService from '@/services/regionService';
import showtimeService from '@/services/showtimeService';
import useNotification from '@/hooks/useNotification';

dayjs.locale('vi');

const BLOCKED_STATUSES = new Set(['CANCELLED', 'SOLD_OUT', 'FULL', 'SALES_ENDED', 'COMPLETED', 'POSTPONED']);

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;
const unwrapList = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};
const unwrapPage = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return { content: payload, totalElements: payload.length };
  const content = Array.isArray(payload?.content) ? payload.content : [];
  return { content, totalElements: Number(payload?.totalElements ?? payload?.total ?? content.length) };
};

const statusMeta = (status) => {
  const value = String(status || 'AVAILABLE').toUpperCase();
  if (value === 'AVAILABLE') return { label: 'Còn vé', tone: 'success' };
  if (value === 'ALMOST_FULL') return { label: 'Sắp hết', tone: 'warning' };
  if (['FULL', 'SOLD_OUT'].includes(value)) return { label: 'Hết chỗ', tone: 'destructive' };
  if (value === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (value === 'POSTPONED') return { label: 'Tạm hoãn', tone: 'warning' };
  if (['SALES_ENDED', 'COMPLETED'].includes(value)) return { label: 'Dừng bán', tone: 'neutral' };
  return { label: value, tone: 'info' };
};

const normalizeShowtimeGroups = (response) => {
  const page = unwrapPage(response);
  return {
    totalElements: page.totalElements,
    groups: page.content.map((item) => ({
      movie: {
        id: item.movieId,
        title: item.movieTitle || 'Không rõ phim',
        posterUrl: item.posterUrl || item.poster || item.moviePoster || '/brand-placeholder.svg',
        duration: item.duration || item.movieDuration || '',
        genre: item.genre || item.movieGenre || '',
      },
      showtimes: (Array.isArray(item.formats) ? item.formats : []).flatMap((format) =>
        (Array.isArray(format.showtimes) ? format.showtimes : []).map((showtime) => ({
          id: showtime.showtimeId ?? showtime.id,
          startTime: String(showtime.startTime || '').slice(0, 5),
          endTime: String(showtime.endTime || '').slice(0, 5),
          roomName: showtime.roomName || '',
          price: Number(showtime.price ?? showtime.basePrice ?? 0),
          status: showtime.status || 'AVAILABLE',
          formatType: format.formatType || showtime.format || '',
        }))
      ),
    })),
  };
};

const Schedule = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [regions, setRegions] = useState([]);
  const [regionKey, setRegionKey] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [cinemaId, setCinemaId] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showtimeGroups, setShowtimeGroups] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [cinemasLoading, setCinemasLoading] = useState(false);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [cinemaPagination, setCinemaPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [showtimePagination, setShowtimePagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => dayjs().add(index, 'day')), []);

  useEffect(() => {
    let active = true;
    setRegionsLoading(true);
    regionService.getRegionsAllNoPage()
      .then((response) => {
        if (!active) return;
        const data = unwrapList(response);
        setRegions(data);
        if (data.length > 0) {
          const preferred = data.find((region) => /hồ chí minh|ho chi minh/i.test(region.name || '') || region.slug === 'ho-chi-minh') || data[0];
          setRegionKey(preferred.slug || String(preferred.id));
        }
      })
      .catch((error) => {
        console.error('Error loading regions:', error);
        if (active) notification.error('Không thể tải danh sách khu vực');
      })
      .finally(() => active && setRegionsLoading(false));
    return () => { active = false; };
  }, [notification]);

  const loadCinemas = useCallback(async () => {
    if (!regionKey) return;
    try {
      setCinemasLoading(true);
      const response = await cinemaService.getCinemasByRegion(regionKey, {
        page: cinemaPagination.current - 1,
        size: cinemaPagination.pageSize,
      });
      const page = unwrapPage(response);
      setCinemas(page.content);
      setCinemaPagination((current) => ({ ...current, total: page.totalElements }));
      setCinemaId((current) => {
        if (page.content.some((cinema) => String(cinema.id) === current)) return current;
        return page.content[0]?.id != null ? String(page.content[0].id) : '';
      });
    } catch (error) {
      console.error('Error loading cinemas:', error);
      setCinemas([]);
      setCinemaId('');
      setCinemaPagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải danh sách rạp');
    } finally {
      setCinemasLoading(false);
    }
  }, [cinemaPagination.current, cinemaPagination.pageSize, notification, regionKey]);

  useEffect(() => {
    loadCinemas();
  }, [loadCinemas]);

  const loadShowtimes = useCallback(async () => {
    if (!cinemaId || !selectedDate) {
      setShowtimeGroups([]);
      return;
    }
    try {
      setShowtimesLoading(true);
      const response = await showtimeService.getShowtimesByDateAndCinema(selectedDate, Number(cinemaId), {
        page: showtimePagination.current - 1,
        size: showtimePagination.pageSize,
      });
      const normalized = normalizeShowtimeGroups(response);
      setShowtimeGroups(normalized.groups);
      setShowtimePagination((current) => ({ ...current, total: normalized.totalElements }));
    } catch (error) {
      console.error('Error loading showtimes:', error);
      setShowtimeGroups([]);
      setShowtimePagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải lịch chiếu');
    } finally {
      setShowtimesLoading(false);
    }
  }, [cinemaId, notification, selectedDate, showtimePagination.current, showtimePagination.pageSize]);

  useEffect(() => {
    loadShowtimes();
  }, [loadShowtimes]);

  const selectedCinema = cinemas.find((cinema) => String(cinema.id) === cinemaId);

  const changeRegion = (value) => {
    setRegionKey(value);
    setCinemaId('');
    setCinemaPagination((current) => ({ ...current, current: 1 }));
    setShowtimePagination((current) => ({ ...current, current: 1 }));
  };

  const changeCinema = (value) => {
    setCinemaId(value);
    setShowtimePagination((current) => ({ ...current, current: 1 }));
  };

  const changeDate = (value) => {
    setSelectedDate(value);
    setShowtimePagination((current) => ({ ...current, current: 1 }));
  };

  const goToSeats = (showtime) => {
    if (!showtime?.id || BLOCKED_STATUSES.has(String(showtime.status).toUpperCase())) return;
    navigate(`/booking/seats/${showtime.id}`);
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lịch chiếu phim</h1>
          <p className="mt-2 text-muted-foreground">Chọn khu vực, rạp và ngày chiếu để xem các suất đang bán vé.</p>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Khu vực</p>
              <Select value={regionKey || undefined} onValueChange={changeRegion} disabled={regionsLoading}>
                <SelectTrigger><SelectValue placeholder={regionsLoading ? 'Đang tải khu vực...' : 'Chọn khu vực'} /></SelectTrigger>
                <SelectContent>{regions.map((region) => <SelectItem key={region.id} value={region.slug || String(region.id)}>{region.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rạp chiếu</p>
              <Select value={cinemaId || undefined} onValueChange={changeCinema} disabled={cinemasLoading || cinemas.length === 0}>
                <SelectTrigger><SelectValue placeholder={cinemasLoading ? 'Đang tải rạp...' : 'Chọn rạp'} /></SelectTrigger>
                <SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {cinemaPagination.total > cinemaPagination.pageSize && (
          <Pagination
            page={cinemaPagination.current}
            itemsPerPage={cinemaPagination.pageSize}
            totalItems={cinemaPagination.total}
            onPageChange={(page) => setCinemaPagination((current) => ({ ...current, current: page }))}
            showTotal={(total, range) => `Rạp ${range[0]}-${range[1]} / ${total}`}
          />
        )}

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {dates.map((date) => {
            const value = date.format('YYYY-MM-DD');
            return (
              <Button key={value} variant={selectedDate === value ? 'default' : 'outline'} className="h-auto flex-col gap-1 py-3" onClick={() => changeDate(value)}>
                <span className="text-xs opacity-80">{date.format('dd')}</span>
                <span>{date.format('DD/MM')}</span>
              </Button>
            );
          })}
        </div>

        {selectedCinema && (
          <Card>
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{selectedCinema.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{selectedCinema.address || 'Đang cập nhật'}</p>
              </div>
              {selectedCinema.address && (
                <Button variant="outline" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCinema.address)}`, '_blank', 'noopener,noreferrer')}>
                  <MapPin className="h-4 w-4" />Chỉ đường
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Suất chiếu</h2>
            <p className="text-sm text-muted-foreground">{dayjs(selectedDate).format('dddd, DD/MM/YYYY')}</p>
          </div>

          {showtimesLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải suất chiếu...</div>
          ) : showtimeGroups.length === 0 ? (
            <Empty description="Không có suất chiếu tại rạp và ngày đã chọn" />
          ) : (
            <div className="space-y-4">
              {showtimeGroups.map((group, index) => (
                <Card key={group.movie.id || `${group.movie.title}-${index}`} className="overflow-hidden">
                  <div className="grid sm:grid-cols-[120px_minmax(0,1fr)]">
                    <img src={group.movie.posterUrl} alt={group.movie.title} className="hidden h-full min-h-44 w-full object-cover sm:block" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                    <div>
                      <CardHeader>
                        <CardTitle className="text-xl">{group.movie.title}</CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          {group.movie.duration && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{group.movie.duration}</span>}
                          {group.movie.genre && <span className="flex items-center gap-1"><Film className="h-4 w-4" />{group.movie.genre}</span>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {group.showtimes.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Chưa có suất chiếu đang mở bán.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {group.showtimes.map((showtime) => {
                              const meta = statusMeta(showtime.status);
                              const disabled = BLOCKED_STATUSES.has(String(showtime.status).toUpperCase());
                              return (
                                <Button key={showtime.id} variant="outline" className="h-auto min-w-28 flex-col items-start gap-1 px-3 py-2" disabled={disabled} onClick={() => goToSeats(showtime)}>
                                  <span className="font-semibold">{showtime.startTime || '--:--'}</span>
                                  <span className="text-xs text-muted-foreground">{showtime.formatType || '2D'}{showtime.roomName ? ` · ${showtime.roomName}` : ''}</span>
                                  {showtime.price > 0 && <span className="text-xs">{showtime.price.toLocaleString('vi-VN')} ₫</span>}
                                  <StatusBadge tone={meta.tone} className="text-[10px]">{meta.label}</StatusBadge>
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {showtimePagination.total > showtimePagination.pageSize && (
            <Pagination
              className="pt-3"
              page={showtimePagination.current}
              itemsPerPage={showtimePagination.pageSize}
              totalItems={showtimePagination.total}
              onPageChange={(page) => setShowtimePagination((current) => ({ ...current, current: page }))}
              showTotal={(total, range) => `Phim ${range[0]}-${range[1]} / ${total}`}
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Schedule;
