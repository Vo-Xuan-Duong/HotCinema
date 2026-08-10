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
            notification.error('Không thể tải thông tin đặt vé');
            navigate('/account-settings');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING': { color: 'warning', icon: <Clock className="h-4 w-4" />, text: 'Đang chờ thanh toán' },
            'PAID': { color: 'success', icon: <CheckCircle2 className="h-4 w-4" />, text: 'Đã thanh toán' },
            'CANCELLED': { color: 'default', icon: <XCircle className="h-4 w-4" />, text: 'Đã hủy' },
            'FAILED': { color: 'error', icon: <XCircle className="h-4 w-4" />, text: 'Thanh toán lỗi' },
            'REFUNDED': { color: 'info', icon: <CheckCircle2 className="h-4 w-4" />, text: 'Đã hoàn tiền' }
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
            notification.success('Đã sao chép mã đặt vé');
        }
    };

    if (loading) {
        return <ContentLoader message="Đang tải thông tin..." />;
    }

    if (!booking) {
        return null;
    }

    const statusConfig = getStatusConfig(booking.status);

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/account-settings')}
                        className="rounded-lg"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            disabled={!booking.qrCodeBase64}
                            className="rounded-lg"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Tải xuống
                        </Button>
                        <Button
                            onClick={handlePrint}
                            className="rounded-lg"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            In vé
                        </Button>
                    </div>
                </div>

                <h2 className="text-foreground text-2xl font-bold mb-6">Chi tiết đặt vé</h2>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
                    <div className="space-y-6">
                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <div className="flex flex-col items-center">
                                {booking.qrCodeBase64 ? (
                                    <img
                                        src={`data:image/png;base64,${booking.qrCodeBase64}`}
                                        alt="QR Code"
                                        className="w-64 h-64 mb-6"
                                    />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg mb-6">
                                        <p className="text-muted-foreground">QR Code không khả dụng</p>
                                    </div>
                                )}
                                <div className="text-center mb-4">
                                    <p className="text-muted-foreground text-sm mb-2">Mã đặt vé</p>
                                    <div className="flex items-center gap-2 justify-center">
                                        <h4 className="text-foreground text-xl font-bold">{booking.bookingCode}</h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCopyCode}
                                            className="h-6 w-6 p-0"
                                        >
                                            📋
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
                            <Card className="bg-card rounded-xl shadow-md border border-border">
                                <img
                                    src={booking.moviePosterUrl}
                                    alt={booking.movieTitle}
                                    className="w-full rounded-lg"
                                />
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <h4 className="text-lg font-semibold mb-4">Thông tin phim</h4>
                            <DetailList columns={2}>
                                <DetailItem label="Tên phim">
                                    <span className="font-semibold">{booking.movieTitle}</span>
                                </DetailItem>
                                <DetailItem label="Định dạng">
                                    {booking.movieFormat || 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <h4 className="text-lg font-semibold mb-4">Thông tin rạp</h4>
                            <DetailList columns={2}>
                                <DetailItem label="Rạp chiếu">
                                    <span className="font-semibold">{booking.cinemaName}</span>
                                </DetailItem>
                                <DetailItem label="Phòng chiếu">
                                    {booking.roomName || 'N/A'}
                                </DetailItem>
                                <DetailItem label="Địa chỉ" wide>
                                    {booking.cinemaAddress || 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <h4 className="text-lg font-semibold mb-4">Thông tin suất chiếu</h4>
                            <DetailList columns={2}>
                                <DetailItem label="Ngày chiếu">
                                    {booking.showtimeDateTime ? new Date(booking.showtimeDateTime).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    }) : 'N/A'}
                                </DetailItem>
                                <DetailItem label="Giờ chiếu">
                                    {booking.showtimeStartTime} - {booking.showtimeEndTime}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <h4 className="text-lg font-semibold mb-4">Thông tin ghế</h4>
                            <div className="flex flex-col gap-3">
                                <p className="font-semibold">Ghế đã chọn: </p>
                                <div className="flex flex-wrap gap-2">
                                    {booking.seats?.map((seat, index) => (
                                        <StatusBadge key={index} tone="blue" className="px-3 py-1">
                                            {seat.seatName} - {seat.seatType}
                                        </StatusBadge>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <h4 className="text-lg font-semibold mb-4">Thông tin thanh toán</h4>
                            <DetailList columns={1}>
                                <DetailItem label="Giá gốc">
                                    {(booking.originalPrice || 0).toLocaleString('vi-VN')}đ
                                </DetailItem>
                                {booking.discountAmount > 0 && (
                                    <DetailItem label="Giảm giá">
                                        <span className="text-red-600">-{(booking.discountAmount || 0).toLocaleString('vi-VN')}đ</span>
                                    </DetailItem>
                                )}
                                <DetailItem label="Tổng tiền">
                                    <span className="text-xl text-blue-600 font-bold">
                                        {(booking.totalPrice || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                </DetailItem>
                                <DetailItem label="Ngày đặt vé">
                                    {booking.bookingDate ? new Date(booking.bookingDate).toLocaleString('vi-VN') : 'N/A'}
                                </DetailItem>
                            </DetailList>
                        </Card>

                        <Card className="bg-card rounded-xl shadow-md border border-border">
                            <h4 className="text-lg font-semibold mb-4">Thông tin khách hàng</h4>
                            <DetailList columns={2}>
                                <DetailItem label="Họ tên">
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
