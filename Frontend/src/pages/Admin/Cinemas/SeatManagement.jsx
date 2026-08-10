import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Home, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import SeatManager from '@/components/SeatManager/SeatManager';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import cinemaService from '@/services/cinemaService';
import roomService from '@/services/roomService';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const formatRoomType = (room) => {
  if (room?.theaterType) {
    return {
      TWO_D: '2D',
      THREE_D: '3D',
      IMAX: 'IMAX',
      IMAX_3D: 'IMAX 3D',
      FOUR_DX: '4DX',
      SCREEN_X: 'ScreenX',
    }[room.theaterType] || room.theaterType;
  }

  return roomService.mapRoomTypeToFrontend(room?.roomType) || 'N/A';
};

const SeatManagement = () => {
  const { cinemaId, roomId } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinema, setCinema] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const [cinemaResponse, roomsResponse] = await Promise.all([
          cinemaService.getCinemaById(cinemaId),
          cinemaService.getRoomsByCinemaId(cinemaId),
        ]);
        if (cancelled) return;

        const cinemaData = unwrapApiData(cinemaResponse);
        const rooms = unwrapApiArray(roomsResponse);
        const roomData = rooms.find((item) => String(item.id) === String(roomId));

        if (!roomData) {
          notification.error('Không tìm thấy phòng chiếu');
          navigate(`/admin/cinemas/${cinemaId}`, { replace: true });
          return;
        }

        setCinema(cinemaData);
        setRoom(roomData);
      } catch (error) {
        console.error('Error loading seat management data:', error);
        notification.error(error.response?.data?.message || 'Không thể tải thông tin phòng chiếu');
        navigate(cinemaId ? `/admin/cinemas/${cinemaId}` : '/admin/cinemas', { replace: true });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [cinemaId, roomId, navigate, notification]);

  const backPath = cinemaId ? `/admin/cinemas/${cinemaId}` : '/admin/cinemas';

  if (loading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="mt-3 text-sm">Đang tải thông tin phòng chiếu...</p>
      </div>
    );
  }

  if (!cinema || !room) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
            { title: 'Quản lý rạp', icon: <Building2 className="h-4 w-4" />, href: '/admin/cinemas' },
          ]}
        />
        <Alert
          type="error"
          showIcon
          message="Không tìm thấy thông tin"
          description="Phòng chiếu hoặc rạp không tồn tại."
        />
        <Button type="button" variant="outline" onClick={() => navigate(backPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý rạp', icon: <Building2 className="h-4 w-4" />, href: '/admin/cinemas' },
          { title: cinema.name || 'Chi tiết rạp', href: `/admin/cinemas/${cinemaId}` },
          { title: `Sơ đồ ghế · ${room.name || 'Phòng chiếu'}` },
        ]}
      />

      <Card className="shadow-sm">
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-xl">Quản lý sơ đồ ghế</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{cinema.name} · {room.name}</span>
              <StatusBadge tone="info">{formatRoomType(room)}</StatusBadge>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => navigate(backPath)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <SeatManager selectedScreen={room} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatManagement;
