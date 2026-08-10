import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Alert } from '@/components/ui/alert';
import {
    ArrowLeft,
    Home,
    Building2,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import SeatManager from '@/components/SeatManager/SeatManager';
import cinemaService from '@/services/cinemaService';
import roomService from '@/services/roomService';
import { useNotification } from '@/hooks/useNotification';

const SeatManagement = () => {
    const { cinemaId, roomId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [cinema, setCinema] = useState(null);
    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [cinemaId, roomId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load cinema info
            const cinemaResponse = await cinemaService.getCinemaById(cinemaId);
            const cinemaData = cinemaResponse?.data?.data || cinemaResponse?.data || cinemaResponse;
            setCinema(cinemaData);

            // Load room info
            const roomsResponse = await cinemaService.getRoomsByCinemaId(cinemaId);
            const roomsData = roomsResponse?.data?.data || roomsResponse?.data || roomsResponse || [];
            const roomData = Array.isArray(roomsData)
                ? roomsData.find(r => r.id === parseInt(roomId))
                : null;

            if (!roomData) {
                showNotification('error', 'Lỗi', 'Không tìm thấy phòng chiếu');
                navigate(`/admin/cinemas/${cinemaId}`);
                return;
            }

            setRoom(roomData);
        } catch (error) {
            console.error('Error loading data:', error);
            showNotification('error', 'Lỗi', 'Không thể tải thông tin');
            navigate(`/admin/cinemas/${cinemaId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (seatLayoutData) => {
        if (!room) return;

        const updatedRoom = {
            ...room,
            seatLayout: seatLayoutData
        };

        try {
            await cinemaService.updateRoom(cinemaId, room.id, updatedRoom);
            showNotification('success', 'Thành công', 'Lưu sơ đồ ghế thành công');
            // Có thể navigate về trang chi tiết hoặc reload
            await loadData();
        } catch (error) {
            console.error('Error saving seat layout:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Lưu sơ đồ ghế thất bại');
        }
    };

    const handleClose = () => {
        navigate(`/admin/cinemas/${cinemaId}`);
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
        );
    }

    if (!cinema || !room) {
        return (
            <div className="min-h-screen p-6">
                <Breadcrumb
                    className="mb-6"
                    items={[
                        {
                            title: 'Dashboard',
                            icon: <Home className="h-4 w-4" />,
                            href: '/admin/dashboard'
                        },
                        {
                            title: 'Quản lý rạp',
                            icon: <Building2 className="h-4 w-4" />,
                            href: '/admin/cinemas'
                        },
                    ]}
                />
                <Alert
                    message="Không tìm thấy thông tin"
                    description="Phòng chiếu hoặc rạp không tồn tại."
                    type="error"
                    showIcon
                />
                <div className="mt-4">
                    <Button
                        onClick={() => navigate(`/admin/cinemas/${cinemaId || '/admin/cinemas'}`)}
                        variant="outline"
                        className="border-gray-300 hover:bg-background"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <Breadcrumb
                className="mb-6"
                items={[
                    {
                        title: 'Dashboard',
                        icon: <Home className="h-4 w-4" />,
                        href: '/admin/dashboard'
                    },
                    {
                        title: 'Quản lý rạp',
                        icon: <Building2 className="h-4 w-4" />,
                        href: '/admin/cinemas'
                    },
                    {
                        title: cinema?.name || 'Chi tiết rạp',
                        href: `/admin/cinemas/${cinemaId}`
                    },
                    {
                        title: `Quản lý sơ đồ ghế - ${room?.name || ''}`,
                    },
                ]}
            />

            {/* Header */}
            <Card className="mb-6 rounded-xl shadow-md border border-border p-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold m-0 mb-2 text-foreground">
                            Quản lý sơ đồ ghế
                        </h2>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-muted-foreground">
                                {cinema.name} - {room.name}
                            </span>
                            <StatusBadge tone="blue">
                                {room.theaterType
                                    ? (room.theaterType === 'TWO_D' ? '2D' :
                                        room.theaterType === 'THREE_D' ? '3D' :
                                            room.theaterType === 'IMAX' ? 'IMAX' :
                                                room.theaterType === 'IMAX_3D' ? 'IMAX 3D' :
                                                    room.theaterType === 'FOUR_DX' ? '4DX' :
                                                        room.theaterType === 'SCREEN_X' ? 'ScreenX' : room.theaterType)
                                    : (roomService.mapRoomTypeToFrontend(room.roomType) || 'N/A')}
                            </StatusBadge>
                        </div>
                    </div>
                    <Button
                        onClick={handleClose}
                        size="lg"
                        variant="outline"
                        className="border-gray-300 hover:bg-background"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </Card>

            {/* Seat Manager */}
            <Card className="rounded-xl shadow-md border border-border p-6">
                <SeatManager
                    selectedScreen={room}
                    onSave={handleSave}
                    onClose={handleClose}
                />
            </Card>
        </div>
    );
};

export default SeatManagement;
