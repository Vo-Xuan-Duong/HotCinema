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
    Loader2,
    Calendar,
    Grid3x3
} from 'lucide-react';
import SeatViewer from '@/components/SeatManager/SeatViewer';
import showtimeService from '@/services/showtimeService';
import { useNotification } from '@/hooks/useNotification';

const ShowtimeSeatManagement = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [showtime, setShowtime] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShowtimeData();
    }, [showtimeId]);

    const loadShowtimeData = async () => {
        setLoading(true);
        try {
            const response = await showtimeService.getShowtimeById(showtimeId);
            const showtimeData = response?.data?.data || response?.data || response;
            setShowtime(showtimeData);
        } catch (error) {
            console.error('Error loading showtime:', error);
            showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i thÃ´ng tin lá»‹ch chiáº¿u');
            navigate('/admin/schedules');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/admin/schedules');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!showtime) {
        return (
            <div className="min-h-screen p-6">
                <Alert
                    variant="default"
                    title="KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin"
                    description="Lá»‹ch chiáº¿u khÃ´ng tá»“n táº¡i."
                    className="mb-4 bg-red-50 border-red-200"
                />
                <Button onClick={handleClose} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay láº¡i
                </Button>
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
                        title: 'Quáº£n lÃ½ lá»‹ch chiáº¿u',
                        icon: <Calendar className="h-4 w-4" />,
                        href: '/admin/schedules'
                    },
                    {
                        title: `SÆ¡ Ä‘á»“ gháº¿ - ${showtime.movieTitle || 'Lá»‹ch chiáº¿u'}`,
                        icon: <Grid3x3 className="h-4 w-4" />
                    },
                ]}
            />

            {/* Header */}
            <Card className="mb-6 rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Grid3x3 className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold m-0 text-gray-800">
                                    SÆ¡ Ä‘á»“ gháº¿
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">Quáº£n lÃ½ sÆ¡ Ä‘á»“ gháº¿ cho lá»‹ch chiáº¿u</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm text-gray-600">
                                {showtime.movieTitle}
                                {showtime.cinemaName && ` - ${showtime.cinemaName}`}
                                {showtime.roomName && ` - ${showtime.roomName}`}
                            </span>
                            {showtime.format && (
                                <StatusBadge tone="blue">
                                    {showtime.format === 'TWO_D' ? '2D' :
                                        showtime.format === 'THREE_D' ? '3D' :
                                            showtime.format === 'IMAX' ? 'IMAX' :
                                                showtime.format === 'IMAX_3D' ? 'IMAX 3D' :
                                                    showtime.format === 'FOUR_DX' ? '4DX' :
                                                        showtime.format === 'SCREEN_X' ? 'ScreenX' : showtime.format}
                                </StatusBadge>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="h-10"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay láº¡i
                    </Button>
                </div>
            </Card>

            {/* Seat Viewer */}
            <Card className="rounded-xl shadow-md border border-gray-200 p-6">
                <SeatViewer
                    showtimeId={showtime.id}
                    selectedScreen={{
                        name: showtime.roomName || 'PhÃ²ng chiáº¿u',
                        cinemaName: showtime.cinemaName || 'Ráº¡p chiáº¿u'
                    }}
                />
            </Card>
        </div>
    );
};

export default ShowtimeSeatManagement;
