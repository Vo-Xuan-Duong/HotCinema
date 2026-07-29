import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import ContentLoader from '@/components/Loading/ContentLoader';
import useNotification from '@/hooks/useNotification';
import bookingService from '@/services/bookingService';

const BookingDetail = () => {
    const { bookingCode } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookingDetail();
    }, [bookingCode]);

    const loadBookingDetail = async () => {
        setLoading(true);
        try {
            const response = await bookingService.getBookingByCode(bookingCode);
            setBooking(response);
        } catch (error) {
            console.error('Error loading booking detail:', error);
            notification.error('KhÃ´ng thá»ƒ táº£i thÃ´ng tin Ä‘áº·t vÃ©');
            navigate('/account-settings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING': { color: 'warning', icon: <Clock className="h-4 w-4" />, text: 'Äang chá» thanh toÃ¡n' },
            'PAID': { color: 'success', icon: <CheckCircle2 className="h-4 w-4" />, text: 'ÄÃ£ thanh toÃ¡n' },
            'CANCELLED': { color: 'default', icon: <XCircle className="h-4 w-4" />, text: 'ÄÃ£ há»§y' },
            'FAILED': { color: 'error', icon: <XCircle className="h-4 w-4" />, text: 'Thanh toÃ¡n lá»—i' },
            'REFUNDED': { color: 'info', icon: <CheckCircle2 className="h-4 w-4" />, text: 'ÄÃ£ hoÃ n tiá»n' }
        };
        return configs[status] || configs['PENDING'];
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        if (booking?.qrCodeBase64) {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${booking.qrCodeBase64}`;
            link.download = `ticket-${booking.bookingCode}.png`;
            link.click();
        }
    };

    const handleCopyCode = () => {
        if (booking?.bookingCode) {
            navigator.clipboard.writeText(booking.bookingCode);
            notification.success('ÄÃ£ sao chÃ©p mÃ£ Ä‘áº·t vÃ©');
        }
    };

    if (loading) {
        return <ContentLoader message="Äang táº£i thÃ´ng tin..." />;
    }

    if (!booking) {
        return null;
    }

    const statusConfig = getStatusConfig(booking.status);

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/account-settings')}
                        className="rounded-lg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay láº¡i
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            disabled={!booking.qrCodeBase64}
                            className="rounded-lg"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Táº£i xuá»‘ng
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="rounded-lg"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            In vÃ©
                        </Button>
                    </div>
                </div>

                <h2 className="text-gray-900 text-2xl font-bold mb-6">Chi tiáº¿t Ä‘áº·t vÃ©</h2>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                    <div className="space-y-6">
                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <div className="flex flex-col items-center">
                                {booking.qrCodeBase64 ? (
                                    <img
                                        src={`data:image/png;base64,${booking.qrCodeBase64}`}
                                        alt="QR Code"
                                        className="w-64 h-64 mb-6"
                                    />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg mb-6">
                                        <p className="text-gray-500">QR Code khÃ´ng kháº£ dá»¥ng</p>
                                    </div>
                                )}
                                <div className="text-center mb-4">
                                    <p className="text-gray-500 text-sm mb-2">MÃ£ Ä‘áº·t vÃ©</p>
                                    <div className="flex items-center gap-2 justify-center">
                                        <h4 className="text-gray-900 text-xl font-bold">{booking.bookingCode}</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopyCode}
                                            className="h-6 w-6 p-0"
                                        >
                                            ðŸ“‹
                                        </Button>
                                    </div>
                                </div>
                                <StatusBadge
                                    tone={statusConfig.color}
                                    className="text-base px-4 py-1.5 flex items-center gap-2"
                                >
                                    {statusConfig.icon}
                                    {statusConfig.text}
                                </StatusBadge>
                            </div>
                        </Card>

                        {booking.moviePosterUrl && (
                            <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                                <img
                                    src={booking.moviePosterUrl}
                                    alt={booking.movieTitle}
                                    className="w-full rounded-lg"
                                />
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4">ThÃ´ng tin phim</h4>
                            <DetailList columns={2}>
                                <DetailItem label="TÃªn phim">
                                    <span className="font-semibold">{booking.movieTitle}</span>
                                </DetailItem>
                                <DetailItem label="Äá»‹nh dáº¡ng">
                                    {booking.movieFormat || 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4">ThÃ´ng tin ráº¡p</h4>
                            <DetailList columns={2}>
                                <DetailItem label="Ráº¡p chiáº¿u">
                                    <span className="font-semibold">{booking.cinemaName}</span>
                                </DetailItem>
                                <DetailItem label="PhÃ²ng chiáº¿u">
                                    {booking.roomName || 'N/A'}
                                </DetailItem>
                                <DetailItem label="Äá»‹a chá»‰" wide>
                                    {booking.cinemaAddress || 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4">ThÃ´ng tin suáº¥t chiáº¿u</h4>
                            <DetailList columns={2}>
                                <DetailItem label="NgÃ y chiáº¿u">
                                    {booking.showtimeDateTime ? new Date(booking.showtimeDateTime).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    }) : 'N/A'}
                                </DetailItem>
                                <DetailItem label="Giá» chiáº¿u">
                                    {booking.showtimeStartTime} - {booking.showtimeEndTime}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4">ThÃ´ng tin gháº¿</h4>
                            <div className="flex flex-col gap-3">
                                <p className="font-semibold">Gháº¿ Ä‘Ã£ chá»n: </p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.seats?.map((seat, index) => (
                                        <StatusBadge key={index} tone="blue" className="px-3 py-1">
                                            {seat.seatName} - {seat.seatType}
                                        </StatusBadge>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4">ThÃ´ng tin thanh toÃ¡n</h4>
                            <DetailList columns={1}>
                                <DetailItem label="GiÃ¡ gá»‘c">
                                    {(booking.originalPrice || 0).toLocaleString('vi-VN')}Ä‘
                                </DetailItem>
                                {booking.discountAmount > 0 && (
                                    <DetailItem label="Giáº£m giÃ¡">
                                        <span className="text-red-600">-{(booking.discountAmount || 0).toLocaleString('vi-VN')}Ä‘</span>
                                    </DetailItem>
                                )}
                                <DetailItem label="Tá»•ng tiá»n">
                                    <span className="text-xl text-blue-600 font-bold">
                                        {(booking.totalPrice || 0).toLocaleString('vi-VN')}Ä‘
                                    </span>
                                </DetailItem>
                                <DetailItem label="NgÃ y Ä‘áº·t vÃ©">
                                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleString('vi-VN') : 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                            <h4 className="text-lg font-semibold mb-4">ThÃ´ng tin khÃ¡ch hÃ ng</h4>
                            <DetailList columns={2}>
                                <DetailItem label="Há» tÃªn">
                                    {booking.userName || 'N/A'}
                                </DetailItem>
                                <DetailItem label="Email">
                                    {booking.userEmail || 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDetail;
