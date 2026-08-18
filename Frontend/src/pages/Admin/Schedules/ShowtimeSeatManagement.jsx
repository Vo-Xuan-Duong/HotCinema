import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Grid3x3, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SeatViewer from '@/components/SeatManager/SeatViewer';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import showtimeService, { normalizeShowtimeFormat, normalizeShowtimeStatus } from '@/services/showtimeService';

const FORMAT_LABELS = {
  FORMAT_2D: '2D',
  FORMAT_3D: '3D',
  IMAX: 'IMAX',
  FORMAT_4DX: '4DX',
  SCREENX: 'ScreenX',
};

const STATUS_LABELS = {
  SCHEDULED: 'Đã lên lịch',
  OPEN: 'Đang mở bán',
  CLOSED: 'Đã đóng bán',
  CANCELLED: 'Đã hủy',
  FINISHED: 'Đã kết thúc',
};

const ShowtimeSeatManagement = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await showtimeService.getShowtimeById(showtimeId);
        if (active) setShowtime(data);
      } catch (requestError) {
        if (!active) return;
        const message = requestError?.message || 'Không thể tải thông tin lịch chiếu';
        setError(message);
        notification.error(message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [showtimeId, notification]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải sơ đồ ghế...
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" showIcon message="Không tìm thấy lịch chiếu" description={error || 'Lịch chiếu không tồn tại hoặc đã bị xóa.'} />
        <Button variant="outline" onClick={() => navigate('/admin/schedules')}>
          <ArrowLeft />Quay lại lịch chiếu
        </Button>
      </div>
    );
  }

  const format = normalizeShowtimeFormat(showtime.format || showtime.formatType);
  const status = normalizeShowtimeStatus(showtime.status);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sơ đồ ghế theo suất chiếu"
        description="Theo dõi trạng thái ShowtimeSeat kết hợp với cấu hình ghế vật lý của auditorium."
        breadcrumbs={[
          { title: 'Lịch chiếu', href: '/admin/schedules', icon: <Calendar className="h-4 w-4" /> },
          { title: showtime.movieTitle || `Suất ${String(showtime.id).slice(0, 8)}`, icon: <Grid3x3 className="h-4 w-4" /> },
        ]}
        actions={(
          <Button variant="outline" onClick={() => navigate('/admin/schedules')}>
            <ArrowLeft />Quay lại
          </Button>
        )}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-5">
          <span className="font-medium">{showtime.movieTitle || showtime.movie?.title || 'Phim'}</span>
          {showtime.cinemaName && <span className="text-muted-foreground">· {showtime.cinemaName}</span>}
          {showtime.roomName && <span className="text-muted-foreground">· {showtime.roomName}</span>}
          {format && <StatusBadge tone="info">{FORMAT_LABELS[format] || format}</StatusBadge>}
          {status && <StatusBadge tone={status === 'OPEN' ? 'success' : status === 'CANCELLED' ? 'destructive' : 'neutral'}>{STATUS_LABELS[status] || status}</StatusBadge>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <SeatViewer
            showtimeId={showtime.id || showtimeId}
            selectedScreen={{
              id: showtime.auditoriumId || showtime.roomId,
              name: showtime.roomName || showtime.auditorium?.name || 'Phòng chiếu',
              cinemaName: showtime.cinemaName || showtime.cinema?.name || 'Rạp chiếu',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowtimeSeatManagement;
