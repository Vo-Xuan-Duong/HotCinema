import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { XCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import ContentLoader from '../../../components/Loading/ContentLoader';
import dayjs from 'dayjs';
import paymentService from '../../../services/paymentService';
import bookingService from '../../../services/bookingService';

const BookingFailed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [errorData, setErrorData] = useState({});

    const transactionId = searchParams.get('transactionId') || location.state?.errorData?.transactionId;

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchBookingDetails = async () => {
            try {
                setLoading(true);

                if (transactionId) {
                    const paymentData = await paymentService.getPaymentByTransactionId(transactionId);
                    const bookingDetails = await bookingService.getBookingById(paymentData.bookingId);

                    const combinedData = {
                        errorMessage: location.state?.errorData?.errorMessage || 'Thanh toán không thành công',
                        reason: location.state?.errorData?.reason || 'Lỗi không xác định',
                        movieTitle: bookingDetails.movieTitle || bookingDetails.movie?.title,
                        cinemaName: bookingDetails.cinemaName || bookingDetails.cinema?.name,
                        showTime: bookingDetails.showtimeTime || bookingDetails.showtime?.time,
                        showDate: bookingDetails.showtimeDate || bookingDetails.showtime?.date,
                        seatNumbers: bookingDetails.seatNames || bookingDetails.seats?.map(s => s.name).join(', '),
                        totalAmount: bookingDetails.totalAmount ? `${bookingDetails.totalAmount?.toLocaleString('vi-VN')}đ` : '0đ',
                        transactionId: paymentData.transactionId,
                        bookingCode: bookingDetails.code,
                        bookingId: bookingDetails.id,
                        moviePoster: bookingDetails.moviePoster || bookingDetails.movie?.poster,
                        cinemaAddress: bookingDetails.cinemaAddress || bookingDetails.cinema?.address,
                        screen: bookingDetails.screenName || bookingDetails.screen?.name
                    };

                    setErrorData(combinedData);
                } else {
                    const fallbackData = location.state?.errorData || JSON.parse(localStorage.getItem('pendingPayment') || '{}');
                    const errorMessage = searchParams.get('error');
                    const reason = searchParams.get('reason');
                    if (errorMessage) fallbackData.errorMessage = decodeURIComponent(errorMessage);
                    if (reason) fallbackData.reason = decodeURIComponent(reason);

                    if (fallbackData.totalAmount && !fallbackData.totalAmount.includes('đ')) {
                        fallbackData.totalAmount = fallbackData.totalAmount + 'đ';
                    }

                    setErrorData(fallbackData);
                }
            } catch (error) {
                console.error('Error fetching booking details:', error);
                const fallbackData = location.state?.errorData || JSON.parse(localStorage.getItem('pendingPayment') || '{}');
                setErrorData(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [transactionId, location.state]);

    const handleTryAgain = () => {
        const retryData = {
            bookingId: errorData.bookingId,
            bookingCode: errorData.bookingCode,
            movieTitle: errorData.movieTitle,
            moviePoster: errorData.moviePoster,
            cinemaName: errorData.cinemaName,
            cinemaAddress: errorData.cinemaAddress,
            roomName: errorData.screen,
            selectedSeats: errorData.seatNumbers ? errorData.seatNumbers.split(', ').map((seat, idx) => ({
                name: seat,
                seatLabel: seat,
                price: 0
            })) : [],
            showDate: errorData.showDate,
            showTime: errorData.showTime,
            totalAmount: errorData.totalAmount
        };

        navigate('/booking/payment', { state: retryData });
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleContactSupport = () => {
        navigate('/support');
    };

    if (loading) {
        return <ContentLoader message="Đang tải thông tin..." />;
    }

    const {
        errorMessage = 'Rất tiếc, giao dịch của bạn không thể hoàn tất do thông tin thẻ không hợp lệ. Vui lòng kiểm tra lại và thử lại.',
        movieTitle = '',
        cinemaName = '',
        showTime = '',
        showDate = '',
        seatNumbers = '',
        totalAmount = '0đ',
        reason = 'Thanh toán không thành công.',
        bookingCode = ''
    } = errorData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center py-10 px-5">
            <div className="max-w-[800px] w-full mt-6">
                {/* <div className="flex justify-center mb-8">
                    <div className="w-28 h-28 rounded-full bg-red-100 flex items-center justify-center shadow-lg animate-pulse">
                        <XCircle className="w-16 h-16 text-red-600" />
                    </div>
                </div> */}

                <h2 className="text-center text-gray-900 mb-4 text-3xl md:text-4xl font-bold">
                    Thanh toán không thành công
                </h2>

                {/* <p className="block text-center text-gray-600 mb-2 text-base md:text-lg max-w-2xl mx-auto">
                    {errorMessage}
                </p> */}
                
                {reason && reason !== 'Thanh toán không thành công.' && (
                    <p className="block text-center text-gray-500 mb-8 text-sm">
                        Lý do: {reason}
                    </p>
                )}

                <Card className="bg-white rounded-xl shadow-xl border border-gray-200 mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary to-red-600 p-4">
                        <p className="text-white text-lg font-bold">Tóm tắt đơn hàng</p>
                    </div>

                    <div className="p-6 space-y-4">
                        {movieTitle && (
                            <div className="flex justify-between items-start py-2">
                                <p className="text-gray-600 font-medium text-sm">Phim:</p>
                                <p className="text-gray-900 font-semibold text-right flex-1 ml-4 text-sm">{movieTitle}</p>
                            </div>
                        )}

                        {cinemaName && (
                            <div className="flex justify-between items-start py-2">
                                <p className="text-gray-600 font-medium text-sm">Rạp:</p>
                                <p className="text-gray-900 font-semibold text-right flex-1 ml-4 text-sm">{cinemaName}</p>
                            </div>
                        )}

                        {showTime && (
                            <div className="flex justify-between items-start py-2">
                                <p className="text-gray-600 font-medium text-sm">Suất chiếu:</p>
                                <p className="text-gray-900 font-semibold text-right flex-1 ml-4 text-sm">
                                    {showTime} - {showDate ? dayjs(showDate).format('DD/MM/YYYY') : ''}
                                </p>
                            </div>
                        )}

                        {seatNumbers && (
                            <div className="flex justify-between items-start py-2">
                                <p className="text-gray-600 font-medium text-sm">Số vé:</p>
                                <p className="text-gray-900 font-semibold text-right flex-1 ml-4 text-sm">{seatNumbers}</p>
                            </div>
                        )}

                        {bookingCode && (
                            <div className="flex justify-between items-start py-2">
                                <p className="text-gray-600 font-medium text-sm">Mã đặt vé:</p>
                                <p className="text-gray-900 font-semibold text-right flex-1 ml-4 text-sm font-mono">{bookingCode}</p>
                            </div>
                        )}

                        <div className="border-t border-gray-200 my-4"></div>

                        <div className="flex justify-between items-center pt-2">
                            <p className="text-gray-900 font-bold text-lg">Tổng cộng:</p>
                            <p className="text-red-600 font-bold text-xl">{totalAmount}</p>
                        </div>
                    </div>

                    <div className="mx-6 mb-6 flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <XCircle className="text-yellow-600 text-xl flex-shrink-0" />
                        <p className="text-yellow-800 text-sm">
                            <strong>Lưu ý:</strong> Ghế của bạn sẽ được giữ trong thời gian nhất định. Vui lòng hoàn tất thanh toán để giữ chỗ.
                        </p>
                    </div>
                </Card>

                <div className="flex flex-col gap-3 mb-6">
                    <Button
                        onClick={handleTryAgain}
                        className="h-12 rounded-lg font-semibold bg-primary hover:bg-red-700 text-white"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Thử lại thanh toán
                    </Button>
                    <Button
                        onClick={handleBackToHome}
                        variant="outline"
                        className="h-12 rounded-lg font-semibold border-2"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Về trang chủ
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default BookingFailed;
