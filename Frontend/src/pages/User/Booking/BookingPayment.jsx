import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, QrCode, Building2, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import dayjs from 'dayjs';
import QRCode from 'qrcode';
import useNotification from '@/hooks/useNotification';
import paymentService from '@/services/paymentService';
import bookingService from '@/services/bookingService';

const BookingPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const notification = useNotification();
    const bookingData = location.state;

    const [paymentMethod, setPaymentMethod] = useState('momo');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (!bookingData) {
            notification.error('Không tìm thấy thông tin đặt vé');
            navigate('/');
            return;
        }

        generateQRCode();
    }, [bookingData, navigate]);

    const generateQRCode = async () => {
        try {
            const total = bookingData.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
            const orderId = `BOOKING_${Date.now()}`;
            const paymentString = `2|99|${orderId}|${total}|Thanh toan ve xem phim|0|0|0`;

            const qrUrl = await QRCode.toDataURL(paymentString, {
                width: 250,
                margin: 2,
                color: {
                    dark: '#A50064',
                    light: '#FFFFFF'
                }
            });

            setQrCodeUrl(qrUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handlePayment = async () => {
        if (!paymentMethod) {
            notification.warning('Vui lòng chọn phương thức thanh toán');
            return;
        }

        try {
            setIsProcessing(true);

            const bookingId = bookingData.bookingId;

            if (!bookingId) {
                notification.error('Không tìm thấy thông tin đơn đặt vé');
                navigate('/');
                return;
            }

            const paymentPayload = {
                bookingId: bookingId,
                paymentMethod: paymentMethod.toUpperCase()
            };

            const response = await paymentService.createPayment(paymentPayload);

            const paymentData = response?.data || response;

            if (paymentData.paymentUrl) {
                const bookingInfo = {
                    bookingCode: bookingData.bookingCode,
                    bookingId: bookingId,
                    paymentId: paymentData.paymentId,
                    transactionId: paymentData.transactionId,
                    movieTitle: bookingData.movieTitle,
                    moviePoster: bookingData.moviePoster,
                    cinemaName: bookingData.cinemaName,
                    cinemaAddress: bookingData.cinemaAddress || '',
                    screen: bookingData.roomName || 'Rạp 01',
                    seatNumbers: bookingData.selectedSeats.map(s => s.seatLabel || s.name).join(', '),
                    showDate: dayjs(bookingData.showDate).format('dddd, DD [Tháng] M, YYYY'),
                    showTime: bookingData.showTime,
                    totalAmount: calculateTotal().toLocaleString() + 'đ',
                    paymentMethod: paymentService.getPaymentMethodName(paymentMethod),
                    paymentDate: paymentData.paymentDate
                };

                localStorage.setItem('pendingPayment', JSON.stringify(bookingInfo));

                notification.info('Đang chuyển đến trang thanh toán...');

                setTimeout(() => {
                    window.location.href = paymentData.paymentUrl;
                }, 500);

            } else {
                notification.success('Thanh toán thành công!');

                const bookingSuccessData = {
                    bookingCode: bookingData.bookingCode || 'XYZ' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                    bookingId: bookingId,
                    paymentId: paymentData.paymentId,
                    transactionId: paymentData.transactionId,
                    movieTitle: bookingData.movieTitle,
                    moviePoster: bookingData.moviePoster,
                    cinemaName: bookingData.cinemaName,
                    cinemaAddress: bookingData.cinemaAddress || '',
                    screen: bookingData.roomName || 'Rạp 01',
                    seatNumbers: bookingData.selectedSeats.map(s => s.seatLabel || s.name).join(', '),
                    showDate: dayjs(bookingData.showDate).format('dddd, DD [Tháng] M, YYYY'),
                    showTime: bookingData.showTime,
                    totalAmount: calculateTotal().toLocaleString() + 'đ',
                    paymentMethod: paymentService.getPaymentMethodName(paymentMethod)
                };

                localStorage.setItem('lastBooking', JSON.stringify(bookingSuccessData));

                setTimeout(() => {
                    navigate('/booking/success', { state: { bookingData: bookingSuccessData } });
                }, 500);
            }

        } catch (error) {
            console.error('Payment error:', error);

            if (error.response?.status === 404) {
                notification.error('Không tìm thấy đơn đặt vé');
                navigate('/');
            } else if (error.response?.status === 400) {
                notification.error(error.response?.data?.message || 'Thanh toán không hợp lệ');
            } else if (error.response?.status === 409) {
                notification.error('Booking đã được thanh toán rồi');
            } else {
                notification.error('Thanh toán thất bại. Vui lòng thử lại.');
            }

            const errorData = {
                errorMessage: error.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.',
                movieTitle: bookingData.movieTitle,
                reason: error.response?.data?.reason || 'Thanh toán không thành công.',
                transactionId: error.response?.data?.transactionId || ''
            };

            setTimeout(() => {
                navigate('/booking/failed', { state: { errorData } });
            }, 1000);

        } finally {
            setIsProcessing(false);
        }
    };

    const calculateTotal = () => {
        return bookingData?.selectedSeats?.reduce((sum, seat) => sum + seat.price, 0) || 0;
    };

    const handleCancelBooking = async () => {
        try {
            setIsCancelling(true);

            const bookingId = bookingData.bookingId;

            if (!bookingId) {
                notification.warning('Không tìm thấy thông tin đơn đặt vé để hủy');
                navigate(-1);
                return;
            }

            await bookingService.deleteBooking(bookingId);

            notification.success('Đã hủy đơn đặt vé thành công');
            navigate(-1);

        } catch (error) {
            console.error('Error cancelling booking:', error);

            if (error.response?.status === 404) {
                notification.warning('Đơn đặt vé không tồn tại');
            } else {
                notification.error('Không thể hủy đơn đặt vé. Vui lòng thử lại.');
            }

            navigate(-1);

        } finally {
            setIsCancelling(false);
        }
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 mt-10">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Thanh toán an toàn</h1>
                </div>

                <div className="flex gap-6 flex-col lg:flex-row">
                    <div className="flex-1">
                        <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Chọn phương thức thanh toán</h2>

                            <RadioGroup
                                value={paymentMethod}
                                onChange={setPaymentMethod}
                                className="w-full"
                            >
                                <RadioGroup.Button value="momo" className="w-full h-auto py-4 px-4 rounded-lg border-2 hover:border-primary transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="w-12 h-12 object-contain" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">MoMo</span>
                                            <span className="text-sm text-gray-600">Ví điện tử MoMo</span>
                                        </div>
                                    </div>
                                </RadioGroup.Button>

                                <RadioGroup.Button value="vnpay" className="w-full h-auto py-4 px-4 rounded-lg border-2 hover:border-primary transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" className="w-12 h-12 object-contain" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">VNPay</span>
                                            <span className="text-sm text-gray-600">Thanh toán qua VNPay</span>
                                        </div>
                                    </div>
                                </RadioGroup.Button>

                                <RadioGroup.Button value="zalopay" className="w-full h-auto py-4 px-4 rounded-lg border-2 hover:border-primary transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="w-12 h-12 object-contain" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">ZaloPay</span>
                                            <span className="text-sm text-gray-600">Ví điện tử ZaloPay</span>
                                        </div>
                                    </div>
                                </RadioGroup.Button>
                            </RadioGroup>
                        </Card>
                    </div>

                    <div className="lg:w-96 flex-shrink-0">
                        <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 text-sm">Phim</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">{bookingData.movieTitle}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 text-sm">Rạp</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">{bookingData.cinemaName}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 text-sm">Suất chiếu</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">{bookingData.showTime} - {dayjs(bookingData.showDate).format('DD/MM/YYYY')}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 text-sm">Ghế</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">
                                        {bookingData.selectedSeats.map(seat => seat.seatLabel || seat.name).join(', ')}
                                    </span>
                                </div>

                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">Giá vé ({bookingData.selectedSeats.length})</span>
                                        <span className="text-gray-900 font-semibold">
                                            {bookingData.selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toLocaleString()}đ
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 text-sm">Phí tiện ích</span>
                                        <span className="text-gray-900 font-semibold">0đ</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-primary">{calculateTotal().toLocaleString()}đ</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleCancelBooking}
                                    className="h-12 rounded-lg font-semibold"
                                    disabled={isProcessing || isCancelling}
                                >
                                    {isCancelling ? 'Đang hủy...' : 'Hủy'}
                                </Button>
                                <Button
                                    onClick={handlePayment}
                                    className="h-12 rounded-lg font-semibold"
                                    disabled={isCancelling}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Thanh toán
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPayment;
