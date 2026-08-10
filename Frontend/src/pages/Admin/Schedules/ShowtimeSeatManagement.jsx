import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, Grid3x3, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SeatViewer from '@/components/SeatManager/SeatViewer';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import showtimeService from '@/services/showtimeService';

const FORMAT_LABELS = {
  TWO_D: '2D',
  THREE_D: '3D',
  IMAX: 'IMAX',
  IMAX_3D: 'IMAX 3D',
  FOUR_DX: '4DX',
  SCREEN_X: 'ScreenX',
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

  const format = showtime.format || showtime.formatType;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sơ đồ ghế theo suất chiếu"
        description="Theo dõi trạng thái ghế của một suất chiếu cụ thể."
        breadcrumbs={[
          { label: 'Lịch chiếu', href: '/admin/schedules', icon: Calendar },
          { label: showtime.movieTitle || `Suất #${showtime.id}`, icon: Grid3x3 },
        ]}
        actions={(
          <Button variant="outline" onClick={() => navigate('/admin/schedules')}>
            <ArrowLeft />Quay lại
          </Button>
        )}
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-5">
          <span className="font-medium">{showtime.movieTitle || 'Phim'}</span>
          {showtime.cinemaName && <span className="text-muted-foreground">· {showtime.cinemaName}</span>}
          {showtime.roomName && <span className="text-muted-foreground">· {showtime.roomName}</span>}
          {format && <StatusBadge tone="info">{FORMAT_LABELS[format] || format}</StatusBadge>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <SeatViewer
            showtimeId={showtime.id || showtimeId}
            selectedScreen={{
              name: showtime.roomName || 'Phòng chiếu',
              cinemaName: showtime.cinemaName || 'Rạp chiếu',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShowtimeSeatManagement;
