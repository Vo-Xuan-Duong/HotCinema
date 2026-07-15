import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Mail, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ContentLoader from '@/components/Loading/ContentLoader';
import useNotification from '@/hooks/useNotification';
import paymentService from '@/services/paymentService';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';
import emailService from '@/services/emailService';
import QRCode from 'qrcode';
import dayjs from 'dayjs';

const BookingSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const notification = useNotification();
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({});

    const bookingCodeParam = searchParams.get('bookingCode') ||
        location.state?.bookingData?.bookingCode ||
        JSON.parse(localStorage.getItem('lastBooking') || '{}').bookingCode;

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);

                if (bookingCodeParam) {
                    const bookingDetails = await bookingService.getBookingByCode(bookingCodeParam);

                    // Extract seat information from SeatSnapshot list
                    let seatInfo = 'Chưa có thông tin ghế';
                    if (bookingDetails.seats && Array.isArray(bookingDetails.seats) && bookingDetails.seats.length > 0) {
                        // SeatSnapshot may have seatName, name, or seatNumber property
                        seatInfo = bookingDetails.seats
                            .map(seat => seat.seatName || seat.name || seat.seatNumber || seat.id)
                            .filter(Boolean)
                            .join(', ');
                    }

                    // Format showtime date from LocalDate
                    let formattedShowDate = '';
                    if (bookingDetails.showtimeDateTime) {
                        try {
                            // Handle LocalDate format (YYYY-MM-DD) or ISO string
                            const dateStr = bookingDetails.showtimeDateTime;
                            const date = dayjs(dateStr);
                            if (date.isValid()) {
                                formattedShowDate = date.format('dddd, DD [Tháng] MM, YYYY');
                                // Convert to Vietnamese day names
                                formattedShowDate = formattedShowDate
                                    .replace('Monday', 'Thứ Hai')
                                    .replace('Tuesday', 'Thứ Ba')
                                    .replace('Wednesday', 'Thứ Tư')
                                    .replace('Thursday', 'Thứ Năm')
                                    .replace('Friday', 'Thứ Sáu')
                                    .replace('Saturday', 'Thứ Bảy')
                                    .replace('Sunday', 'Chủ Nhật');
                            }
                        } catch (e) {
                            console.warn('Error formatting showtime date:', e);
                        }
                    }

                    // Format showtime start time from LocalTime
                    let formattedStartTime = '';
                    if (bookingDetails.showtimeStartTime) {
                        try {
                            // Handle LocalTime format (HH:mm:ss or HH:mm)
                            const timeStr = bookingDetails.showtimeStartTime;
                            if (/^\d{2}:\d{2}:\d{2}/.test(timeStr)) {
                                formattedStartTime = timeStr.substring(0, 5); // Extract HH:mm
                            } else if (/^\d{2}:\d{2}$/.test(timeStr)) {
                                formattedStartTime = timeStr;
                            } else {
                                const time = dayjs(`2000-01-01 ${timeStr}`);
                                if (time.isValid()) {
                                    formattedStartTime = time.format('HH:mm');
                                }
                            }
                        } catch (e) {
                            console.warn('Error formatting showtime start time:', e);
                            formattedStartTime = bookingDetails.showtimeStartTime;
                        }
                    }

                    // Format showtime end time from LocalTime
                    let formattedEndTime = '';
                    if (bookingDetails.showtimeEndTime) {
                        try {
                            const timeStr = bookingDetails.showtimeEndTime;
                            if (/^\d{2}:\d{2}:\d{2}/.test(timeStr)) {
                                formattedEndTime = timeStr.substring(0, 5);
                            } else if (/^\d{2}:\d{2}$/.test(timeStr)) {
                                formattedEndTime = timeStr;
                            } else {
                                const time = dayjs(`2000-01-01 ${timeStr}`);
                                if (time.isValid()) {
                                    formattedEndTime = time.format('HH:mm');
                                }
                            }
                        } catch (e) {
                            console.warn('Error formatting showtime end time:', e);
                            formattedEndTime = bookingDetails.showtimeEndTime;
                        }
                    }

                    // Format total amount - use finalAmount if available, otherwise totalAmount
                    const finalAmount = bookingDetails.finalAmount || bookingDetails.totalAmount || 0;
                    const totalAmountValue = typeof finalAmount === 'number' ? finalAmount : parseFloat(finalAmount) || 0;
                    const formattedTotalAmount = `${totalAmountValue.toLocaleString('vi-VN')}đ`;

                    // Format discount amount
                    const discountAmountValue = bookingDetails.discountAmount || 0;
                    const discountValue = typeof discountAmountValue === 'number' ? discountAmountValue : parseFloat(discountAmountValue) || 0;

                    // Build format string from movieFormat and movieAudioType
                    let formatType = '';
                    if (bookingDetails.movieFormat) {
                        formatType = bookingDetails.movieFormat;
                        if (bookingDetails.movieAudioType) {
                            formatType += ` ${bookingDetails.movieAudioType}`;
                        }
                    }

                    const combinedData = {
                        bookingId: bookingDetails.id,
                        bookingCode: bookingDetails.bookingCode,
                        status: bookingDetails.status,
                        movieTitle: bookingDetails.movieTitle,
                        moviePosterUrl: bookingDetails.moviePosterUrl,
                        movieFormat: bookingDetails.movieFormat,
                        movieAudioType: bookingDetails.movieAudioType,
                        formatType: formatType,
                        cinemaName: bookingDetails.cinemaName,
                        cinemaAddress: bookingDetails.cinemaAddress,
                        roomName: bookingDetails.roomName,
                        seatNumbers: seatInfo,
                        seats: bookingDetails.seats || [],
                        showDate: formattedShowDate,
                        showTime: formattedStartTime,
                        showTimeEnd: formattedEndTime,
                        showTimeRange: formattedEndTime ? `${formattedStartTime} ~ ${formattedEndTime}` : formattedStartTime,
                        totalAmount: formattedTotalAmount,
                        totalAmountValue: totalAmountValue,
                        discountAmount: discountValue,
                        finalAmount: totalAmountValue,
                        moviePoster: bookingDetails.moviePosterUrl || 'https://via.placeholder.com/300x450',
                        bookingDate: bookingDetails.bookingDate,
                        userName: bookingDetails.userName,
                        userEmail: bookingDetails.userEmail
                    };

                    setBookingData(combinedData);

                    const qrData = `BOOKING:${combinedData.bookingCode}`;
                    const qrUrl = await QRCode.toDataURL(qrData, {
                        width: 300,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF'
                        }
                    });
                    setQrCodeUrl(qrUrl);
                } else {
                    const fallbackData = location.state?.bookingData || JSON.parse(localStorage.getItem('lastBooking') || '{}');
                    setBookingData(fallbackData);

                    if (fallbackData.bookingCode) {
                        const qrData = `BOOKING:${fallbackData.bookingCode}`;
                        const qrUrl = await QRCode.toDataURL(qrData, {
                            width: 300,
                            margin: 2,
                            color: {
                                dark: '#000000',
                                light: '#FFFFFF'
                            }
                        });
                        setQrCodeUrl(qrUrl);
                    }
                }
            } catch (error) {
                console.error('Error fetching booking details:', error);
                const fallbackData = location.state?.bookingData || JSON.parse(localStorage.getItem('lastBooking') || '{}');
                setBookingData(fallbackData);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingCodeParam, location.state]);

    const handleDownloadPDF = async () => {
        try {
            if (!bookingData.bookingId) {
                notification.error('Không tìm thấy thông tin booking');
                return;
            }

            notification.info('Đang tải vé...');

            const pdfBlob = await ticketService.downloadBookingPDF(bookingData.bookingId);
            const filename = `Ve_${bookingData.bookingId}.pdf`;
            ticketService.triggerDownload(pdfBlob, filename);

            notification.success('Tải vé thành công!');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            notification.error('Không thể tải vé. Vui lòng thử lại sau.');
        }
    };

    const handleSendEmail = async () => {
        try {
            if (!bookingData.bookingId) {
                notification.error('Không tìm thấy thông tin booking');
                return;
            }

            notification.info('Đang gửi email...');
            await emailService.sendTicketEmail(bookingData.bookingId);
            notification.success('Đã gửi vé qua email thành công!');
        } catch (error) {
            console.error('Error sending email:', error);
            notification.error('Không thể gửi email. Vui lòng thử lại sau.');
        }
    };

    const handleAddToCalendar = () => {
        console.log('Add to calendar');
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading) {
        return <ContentLoader message="Đang tải thông tin đặt vé..." />;
    }

    const {
        bookingCode = 'XYZ123ABC',
        movieTitle = 'Dune: Part Two',
        cinemaName = 'CGV Crescent Mall',
        cinemaAddress = '101 Tôn Dật Tiên, P.Tân Phú, Quận 7, TP.HCM',
        roomName = 'Rạp 05',
        seatNumbers = 'Ghế F11, F12',
        showDate = 'Thứ Sáu, 24 Tháng 6, 2024',
        showTime = '15:30',
        showTimeRange = '15:30',
        totalAmount = '250.000đ',
        moviePoster = 'https://image.tmdb.org/t/p/original/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
        formatType = ''
    } = bookingData;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-5">
            <div className="max-w-[1200px] w-full mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 mb-10">
                    <Card className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                        <div className="text-center mb-5">
                            <p className="text-gray-800 text-base font-semibold block">
                                Mã vé của bạn
                            </p>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-6">
                            {qrCodeUrl && (
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                                </div>
                            )}
                        </div>

                        <div className="text-center mb-6">
                            <p className="text-gray-600 text-sm block mb-2">Mã đặt vé:</p>
                            <h3 className="text-gray-900 text-2xl font-bold mb-2">{bookingCode}</h3>
                            <p className="text-gray-500 text-xs block">
                                Sử dụng mã này để xuất vé tại rạp
                            </p>
                        </div>

                        <div className="mt-6">
                            <p className="text-gray-700 text-sm font-medium block mb-4">Lưu lại vé của bạn</p>
                            <div className="flex flex-col gap-3 w-full">
                                <Button
                                    onClick={handleDownloadPDF}
                                    className="h-12 rounded-lg font-semibold"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Tải vé (PDF)
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleSendEmail}
                                    className="h-12 rounded-lg font-semibold"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Gửi vé qua Email
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleAddToCalendar}
                                    className="h-12 rounded-lg font-semibold"
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Thêm vào Lịch
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">

                        <div className="text-center mb-6">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto animate-pulse" />
                        </div>

                        <h2 className="text-gray-800 text-center mb-2.5 text-3xl font-bold">
                            Chúc mừng! Bạn đã đặt vé thành công.
                        </h2>

                        <h4 className="text-gray-800 text-xl font-bold mb-6">Chi tiết vé</h4>

                        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                            <div className="flex flex-col">
                                <img
                                    src={moviePoster}
                                    alt={movieTitle}
                                    className="w-full h-64 object-cover rounded-lg mb-4"
                                />
                                <div className="flex flex-col">
                                    <p className="text-gray-500 text-xs font-medium mb-1">Phim</p>
                                    <p className="text-gray-900 text-base font-semibold">{movieTitle}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col">
                                        <p className="text-gray-500 text-xs font-medium mb-1">Rạp chiếu</p>
                                        <p className="text-gray-900 text-base font-semibold mb-1">{cinemaName}</p>
                                        <p className="text-gray-600 text-sm">{cinemaAddress}</p>
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-gray-500 text-xs font-medium mb-1">Thông tin chỗ ngồi</p>
                                        <p className="text-gray-900 text-base font-semibold mb-1">{roomName}</p>
                                        <p className="text-gray-600 text-sm">Ghế: {seatNumbers}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="flex flex-col">
                                        <p className="text-gray-500 text-xs font-medium mb-1">Suất chiếu</p>
                                        <p className="text-gray-900 text-base font-semibold mb-1">{showDate}</p>
                                        <p className="text-gray-600 text-sm">{showTimeRange || showTime}</p>
                                        {formatType && (
                                            <p className="text-gray-500 text-xs mt-1">{formatType}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col pt-4 border-t border-gray-200">
                                        <p className="text-gray-500 text-xs font-medium mb-1">Thanh toán</p>
                                        <p className="text-red-600 text-2xl font-bold">{totalAmount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <Button
                    onClick={handleBackToHome}
                    className="w-full max-w-md mx-auto block h-12 rounded-lg font-semibold"
                >
                    Quay về trang chủ
                </Button>
            </div>
        </div>
    );
};

export default BookingSuccess;
