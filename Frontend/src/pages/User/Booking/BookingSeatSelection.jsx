import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    Tag as TagIcon,
    X,
    Lock,
    UserCheck,
    Clock3,
    XCircle,
    Settings,
    Star as StarIcon,
    Heart as HeartIcon,
    User
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import dayjs from 'dayjs';
import ContentLoader from '@/components/Loading/ContentLoader';
import useNotification from '@/hooks/useNotification';
import promotionService from '@/services/promotionService';
import showtimeService from '@/services/showtimeService';
import bookingService from '@/services/bookingService';
import useSeatWebSocket from '@/hooks/useSeatWebSocket';
import useAuth from '@/hooks/useAuth';
import AuthModal from '@/components/Auth/AuthModal';

const BookingSeatSelection = () => {
    const { showtimeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const notification = useNotification();

    const [showtimeInfo, setShowtimeInfo] = useState(location.state || {});
    const [seatLayout, setSeatLayout] = useState({
        rows: [],
        totalSeats: 0,
        availableSeats: 0,
        bookedSeats: 0
    });
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [promotionCode, setPromotionCode] = useState('');
    const [promotionDiscount, setPromotionDiscount] = useState(0);
    const [promotionInfo, setPromotionInfo] = useState(null);
    const [isValidatingPromotion, setIsValidatingPromotion] = useState(false);

    // Helper function để lấy current user ID nhất quán
    const getCurrentUserId = useCallback(() => {
        return user?.id?.toString() || localStorage.getItem('user_id') || null;
    }, [user]);

    const updateSeatStatus = useCallback((seatIds, status, userId = null) => {
        setSeatLayout(prevLayout => {
            const newRows = prevLayout.rows.map(row => ({
                ...row,
                seats: row.seats.map(seat => {
                    if (seatIds.includes(seat.id)) {
                        return {
                            ...seat,
                            status,
                            lockedByUserId: status === 'held' ? userId : null
                        };
                    }
                    return seat;
                })
            }));

            return {
                ...prevLayout,
                rows: newRows
            };
        });
    }, []);

    const handleSeatUpdate = useCallback((updateData) => {
        const { type, seatIds, userId } = updateData;
        const currentUserId = getCurrentUserId();

        switch (type) {
            case 'locked':
            case 'reserved':
            case 'held':
                updateSeatStatus(seatIds, 'held', userId);

                // Chỉ tự động thêm vào selectedSeats nếu là ghế của user hiện tại
                if (userId && currentUserId && userId.toString() === currentUserId.toString()) {
                    setSeatLayout(prevLayout => {
                        const mySeats = [];
                        prevLayout.rows.forEach(row => {
                            row.seats.forEach(seat => {
                                if (seatIds.includes(seat.id)) {
                                    mySeats.push({
                                        ...seat,
                                        status: 'held',
                                        lockedByUserId: userId
                                    });
                                }
                            });
                        });

                        if (mySeats.length > 0) {
                            setSelectedSeats(prev => {
                                const newSelected = [...prev];
                                mySeats.forEach(newSeat => {
                                    if (!newSelected.find(s => s.id === newSeat.id)) {
                                        newSelected.push(newSeat);
                                    }
                                });
                                return newSelected;
                            });
                        }

                        return prevLayout;
                    });
                }
                break;

            case 'unlocked':
            case 'released':
            case 'available':
                updateSeatStatus(seatIds, 'available');
                setSelectedSeats(prev => prev.filter(s => !seatIds.includes(s.id)));
                break;

            case 'booked':
                updateSeatStatus(seatIds, 'booked');
                setSelectedSeats(prev => prev.filter(s => !seatIds.includes(s.id)));
                break;

            case 'unavailable':
                updateSeatStatus(seatIds, 'unavailable');
                break;
            case 'maintenance':
                updateSeatStatus(seatIds, 'maintenance');
                break;
            case 'blocked':
                updateSeatStatus(seatIds, 'blocked');
                break;
            default:
                break;
        }
    }, [updateSeatStatus, getCurrentUserId]);

    const { isConnected: wsConnected } = useSeatWebSocket(showtimeId, handleSeatUpdate);

    useEffect(() => {
        if (showtimeId) {
            loadShowtimeDetails();
        }
    }, [showtimeId]);

    const loadShowtimeDetails = async () => {
        try {
            setLoading(true);

            const [showtimeData, seatsData] = await Promise.all([
                showtimeService.getShowtimeById(showtimeId),
                showtimeService.getSeatsByShowtimeId(showtimeId)
            ]);

            if (showtimeData) {
                const showtime = showtimeData?.data || showtimeData;
                setShowtimeInfo(prev => ({
                    ...prev,
                    movieTitle: showtime.movieTitle || showtime.movie?.title || prev.movieTitle,
                    cinemaName: showtime.cinemaName || showtime.cinema?.name || prev.cinemaName,
                    roomName: showtime.roomName || showtime.room?.name || prev.roomName,
                    startTime: showtime.startTime || prev.startTime,
                    endTime: showtime.endTime || prev.endTime,
                    date: showtime.date || showtime.showtimeDate || prev.date,
                    price: showtime.price || prev.price,
                    formatType: showtime.formatType || prev.formatType,
                    roomId: showtime.roomId || showtime.room?.id || prev.roomId,
                    cinemaId: showtime.cinemaId || showtime.cinema?.id || prev.cinemaId,
                    movieId: showtime.movieId || showtime.movie?.id || prev.movieId
                }));
            }

            if (seatsData) {
                transformSeatsToLayout(seatsData);
            }

        } catch (error) {
            console.error('Error loading showtime details:', error);
            notification.error('Không thể tải thông tin suất chiếu');
        } finally {
            setLoading(false);
        }
    };

    const transformSeatsToLayout = (seatsData) => {
        const seatsArray = Array.isArray(seatsData) ? seatsData :
            (seatsData?.data ? seatsData.data : []);

        if (seatsArray.length === 0) {
            setSeatLayout({
                rows: [],
                totalSeats: 0,
                availableSeats: 0,
                bookedSeats: 0
            });
            setSelectedSeats([]);
            return;
        }

        const rowsMap = {};
        let totalSeats = 0;
        let availableSeats = 0;
        let bookedSeats = 0;
        const mySelectedSeats = [];

        const currentUserId = getCurrentUserId();

        const uniqueSeatsMap = new Map();
        seatsArray.forEach(seat => {
            if (!uniqueSeatsMap.has(seat.id)) {
                uniqueSeatsMap.set(seat.id, seat);
            }
        });

        uniqueSeatsMap.forEach(seat => {
            const rowLabel = seat.row ? String.fromCharCode(64 + seat.row) : 'A';

            if (!rowsMap[rowLabel]) {
                rowsMap[rowLabel] = {
                    label: rowLabel,
                    rowNumber: seat.row || 0,
                    seats: []
                };
            }

            const seatStatus = seat.status?.toLowerCase() || 'available';

            totalSeats++;

            if (seatStatus === 'booked') {
                bookedSeats++;
            } else if (seatStatus === 'available') {
                availableSeats++;
            }

            const seatObj = {
                id: seat.id,
                name: seat.name || `${rowLabel}${seat.col}`,
                seatType: seat.seatType?.toLowerCase() || 'normal',
                status: seatStatus,
                price: seat.price || 0,
                rowLabel: rowLabel,
                row: seat.row || 0,
                col: seat.col || 0,
                lockedByUserId: seat.lockedByUserId || null
            };

            rowsMap[rowLabel].seats.push(seatObj);

            if (seatStatus === 'held' && seat.lockedByUserId && currentUserId) {
                if (seat.lockedByUserId.toString() === currentUserId.toString()) {
                    mySelectedSeats.push(seatObj);
                }
            }
        });

        // Sắp xếp rows theo rowNumber (tăng dần)
        const rows = Object.values(rowsMap).sort((a, b) => {
            const rowA = a.rowNumber || 0;
            const rowB = b.rowNumber || 0;
            return rowA - rowB;
        });

        // Sắp xếp seats trong mỗi row theo col (tăng dần)
        rows.forEach(row => {
            row.seats.sort((a, b) => {
                const colA = a.col || 0;
                const colB = b.col || 0;
                return colA - colB;
            });
        });

        // Tính toán maxColInRoom để đảm bảo alignment giữa các hàng
        const allCols = rows.flatMap(r => r.seats.map(s => s.col || 0));
        const maxColInRoom = allCols.length > 0 ? Math.max(...allCols) : 0;

        // Lưu maxColInRoom vào mỗi row để sử dụng khi render
        rows.forEach(row => {
            row.maxColInRoom = maxColInRoom;
        });

        setSeatLayout({
            rows,
            totalSeats,
            availableSeats,
            bookedSeats
        });

        if (mySelectedSeats.length > 0) {
            setSelectedSeats(mySelectedSeats);
            setTimeout(() => {
                notification.info(`Đã khôi phục ${mySelectedSeats.length} ghế bạn đã chọn trước đó`);
            }, 500);
        }
    };

    const getSeatColor = (seat) => {
        const isSelected = selectedSeats.find(s => s.id === seat.id);
        const currentUserId = getCurrentUserId();
        const isMyHeld = seat.status === 'held' &&
            seat.lockedByUserId &&
            currentUserId &&
            seat.lockedByUserId.toString() === currentUserId.toString();

        // Nếu đang được chọn hoặc đang giữ bởi user hiện tại
        if (isSelected || isMyHeld) {
            return '#1890ff'; // Màu xanh dương - Đang chọn
        }

        // Ưu tiên hiển thị trạng thái trước, sau đó mới đến loại ghế
        switch (seat.status) {
            case 'blocked':
                return '#8c8c8c'; // Màu xám đậm - Ghế bị khóa
            case 'booked':
                return '#ff4d4f'; // Màu đỏ - Ghế đã đặt
            case 'held':
                return '#faad14'; // Màu vàng cam - Ghế đang giữ chỗ (người khác)
            case 'unavailable':
                return '#d9d9d9'; // Màu xám nhạt - Ghế không khả dụng
            case 'maintenance':
                return '#722ed1'; // Màu tím - Ghế đang bảo trì
            case 'available':
            default:
                // Khi available, màu sắc dựa vào loại ghế
                switch (seat.seatType) {
                    case 'vip':
                        return '#faad14'; // Màu vàng cho VIP
                    case 'couple':
                        return '#eb2f96'; // Màu hồng cho ghế đôi
                    case 'normal':
                    default:
                        return '#52c41a'; // Màu xanh cho ghế thường
                }
        }
    };

    const getSeatIcon = (seat) => {
        const isSelected = selectedSeats.find(s => s.id === seat.id);
        const currentUserId = getCurrentUserId();
        const isMyHeld = seat.status === 'held' &&
            seat.lockedByUserId &&
            currentUserId &&
            seat.lockedByUserId.toString() === currentUserId.toString();

        // Nếu đang được chọn hoặc đang giữ bởi user hiện tại
        if (isSelected || isMyHeld) {
            return <UserCheck className="h-4 w-4" />;
        }

        // Ưu tiên hiển thị icon trạng thái trước
        switch (seat.status) {
            case 'blocked':
                return <Lock className="h-4 w-4" />; // Icon khóa
            case 'booked':
                return <UserCheck className="h-4 w-4" />; // Icon user - Đã đặt
            case 'held':
                return <Clock3 className="h-4 w-4" />; // Icon đồng hồ - Đang giữ
            case 'unavailable':
                return <XCircle className="h-4 w-4" />; // Icon X - Không khả dụng
            case 'maintenance':
                return <Settings className="h-4 w-4" />; // Icon công cụ - Bảo trì
            case 'available':
            default:
                // Khi available, icon dựa vào loại ghế
                switch (seat.seatType) {
                    case 'vip':
                        return <StarIcon className="h-4 w-4" />;
                    case 'couple':
                        return <HeartIcon className="h-4 w-4" />;
                    case 'sweetbox':
                        return <HeartIcon className="h-4 w-4" />; // Icon trái tim cho Sweetbox
                    case 'normal':
                    default:
                        return <User className="h-4 w-4" />;
                }
        }
    };

    const getStatusText = (status) => {
        const statusTextMap = {
            'available': 'Có thể đặt',
            'held': 'Đang giữ chỗ',
            'booked': 'Đã đặt',
            'unavailable': 'Không khả dụng',
            'maintenance': 'Đang bảo trì',
            'blocked': 'Bị khóa'
        };
        return statusTextMap[status] || 'Không xác định';
    };

    const handleSeatClick = async (seat) => {
        if (seat.status === 'booked') {
            notification.warning('Ghế này đã được đặt');
            return;
        }

        if (seat.status === 'unavailable') {
            notification.warning('Ghế này không khả dụng');
            return;
        }

        if (seat.status === 'maintenance') {
            notification.warning('Ghế này đang bảo trì');
            return;
        }

        if (seat.status === 'blocked') {
            notification.warning('Ghế này đã bị khóa');
            return;
        }

        const currentUserId = getCurrentUserId();

        if (seat.status === 'held' && seat.lockedByUserId) {
            if (seat.lockedByUserId.toString() !== currentUserId) {
                notification.warning('Ghế này đang được giữ bởi người dùng khác');
                return;
            }
        }

        const seatId = seat.id;
        const isSelected = selectedSeats.find(s => s.id === seatId);

        try {
            if (isSelected) {
                await showtimeService.unlockSeats(showtimeId, seatId);
                const newSelectedSeats = selectedSeats.filter(s => s.id !== seatId);
                setSelectedSeats(newSelectedSeats);
            } else {
                if (selectedSeats.length >= 10) {
                    notification.warning('Chỉ được chọn tối đa 10 ghế');
                    return;
                }

                // Nếu không có userId thì truyền null (backend sẽ xử lý anonymous / guest nếu cần)
                await showtimeService.lockSeats(showtimeId, seatId, currentUserId ?? null);

                const newSelectedSeats = [...selectedSeats, {
                    ...seat,
                    status: 'held',
                    lockedByUserId: currentUserId ?? null
                }];
                setSelectedSeats(newSelectedSeats);
            }
        } catch (error) {
            console.error('Error locking/unlocking seat:', error);

            if (error.response?.status === 409) {
                notification.error('Ghế đã được người khác chọn');
            } else if (error.response?.status === 400) {
                notification.error('Không thể chọn ghế này');
            } else {
                notification.error('Có lỗi xảy ra. Vui lòng thử lại');
            }
        }
    };

    const calculateTotal = () => {
        const subtotal = selectedSeats.reduce((total, seat) => total + seat.price, 0);
        const discount = promotionDiscount || 0;
        return Math.max(0, subtotal - discount);
    };

    const calculateSubtotal = () => {
        return selectedSeats.reduce((total, seat) => total + seat.price, 0);
    };

    const handleValidatePromotion = async () => {
        if (!promotionCode.trim()) {
            notification.warning('Vui lòng nhập mã giảm giá');
            return;
        }

        setIsValidatingPromotion(true);
        try {
            // Call API to validate code
            const response = await promotionService.getPromotionByCode(promotionCode);
            const promotion = response?.data || response;

            if (!promotion) {
                notification.error('Mã giảm giá không tồn tại');
                setPromotionDiscount(0);
                setPromotionInfo(null);
                return;
            }

            // Client-side validation
            const now = dayjs();
            const startDate = dayjs(promotion.startDate);
            const endDate = dayjs(promotion.endDate);

            if (promotion.status !== 'ACTIVE' && promotion.status !== true) {
                notification.error('Mã giảm giá này hiện không hoạt động');
                return;
            }

            if (now.isBefore(startDate)) {
                notification.error(`Mã giảm giá chưa đến ngày áp dụng (bắt đầu từ ${startDate.format('DD/MM/YYYY')})`);
                return;
            }

            if (now.isAfter(endDate)) {
                notification.error('Mã giảm giá đã hết hạn');
                return;
            }

            // Calculate discount
            const subTotal = calculateSubtotal();
            let discountAmount = 0;

            if (promotion.discountType === 'PERCENTAGE') {
                discountAmount = (subTotal * promotion.discountValue) / 100;
            } else {
                discountAmount = promotion.discountValue;
            }

            // Ensure discount doesn't exceed subtotal
            if (discountAmount > subTotal) {
                discountAmount = subTotal;
            }

            setPromotionDiscount(discountAmount);
            setPromotionInfo({
                id: promotion.id,
                code: promotion.code,
                discount: discountAmount,
                discountPercent: promotion.discountType === 'PERCENTAGE' ? promotion.discountValue : 0,
                discountType: promotion.discountType
            });
            notification.success('Áp dụng mã giảm giá thành công!');

        } catch (error) {
            console.error('Error validating promotion code:', error);
            setPromotionDiscount(0);
            setPromotionInfo(null);
            if (error.response?.status === 404) {
                notification.error('Mã giảm giá không tồn tại');
            } else {
                notification.error('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
            }
        } finally {
            setIsValidatingPromotion(false);
        }
    };

    const handleRemovePromotion = () => {
        setPromotionCode('');
        setPromotionDiscount(0);
        setPromotionInfo(null);
        notification.info('Đã xóa mã giảm giá');
    };

    const checkLoginStatus = () => {
        const userId = getCurrentUserId();
        const token = localStorage.getItem('access_token');

        if (!user && (!userId || !token)) {
            notification.warning('Vui lòng đăng nhập để đặt vé');
            setShowAuthModal(true);
            return false;
        }
        return true;
    };

    const handleContinue = async () => {
        if (selectedSeats.length === 0) {
            notification.warning('Vui lòng chọn ít nhất một ghế');
            return;
        }

        if (!checkLoginStatus()) {
            return;
        }

        try {
            setIsCreatingBooking(true);

            // Convert seat IDs to Long (number) - ensure they are numbers, not strings
            const seatIds = selectedSeats.map(seat => {
                const seatId = seat.id;
                // If seatId is already a number, use it; otherwise parse it
                return typeof seatId === 'number' ? seatId : parseInt(seatId, 10);
            }).filter(id => !isNaN(id) && id > 0); // Filter out invalid IDs

            if (seatIds.length === 0) {
                notification.error('Không có ghế hợp lệ để đặt');
                setIsCreatingBooking(false);
                return;
            }

            const bookingPayload = {
                showtimeId: parseInt(showtimeId, 10),
                seatIds: seatIds,
                promotionCode: promotionCode.trim() || null // Send promotion code if provided
            };

            const bookingResponse = await bookingService.createBooking(bookingPayload);

            notification.success('Đã tạo đơn đặt vé thành công!');

            const bookingData = bookingResponse?.data || bookingResponse;

            navigate('/booking/payment', {
                state: {
                    bookingId: bookingData.id || bookingData.bookingId,
                    bookingCode: bookingData.bookingCode,
                    showtimeId,
                    movieTitle: showtimeInfo.movieTitle,
                    moviePoster: showtimeInfo.posterUrl || showtimeInfo.moviePoster,
                    cinemaName: showtimeInfo.cinemaName,
                    cinemaAddress: showtimeInfo.cinemaAddress || '',
                    roomName: showtimeInfo.roomName,
                    showTime: `${showtimeInfo.startTime} ~ ${showtimeInfo.endTime}`,
                    showDate: showtimeInfo.date || showtimeInfo.startTime,
                    formatType: showtimeInfo.formatType,
                    selectedSeats: selectedSeats,
                    totalAmount: calculateTotal()
                }
            });

        } catch (error) {
            console.error('Error creating booking:', error);

            if (error.response?.status === 409) {
                notification.error('Một số ghế đã được người khác đặt. Vui lòng chọn lại.');
                loadShowtimeDetails();
            } else if (error.response?.status === 400) {
                notification.error(error.response?.data?.message || 'Dữ liệu không hợp lệ');
            } else if (error.response?.status === 401) {
                notification.error('Vui lòng đăng nhập để đặt vé');
                navigate('/login', {
                    state: {
                        from: location.pathname,
                        returnData: {
                            showtimeId,
                            selectedSeats: selectedSeats.map(s => s.id)
                        }
                    }
                });
            } else {
                notification.error('Có lỗi xảy ra khi tạo đơn đặt vé. Vui lòng thử lại.');
            }
        } finally {
            setIsCreatingBooking(false);
        }
    };

    if (loading) {
        return <ContentLoader message="Đang tải sơ đồ ghế..." />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-8 px-4 mt-8">
            <div className="max-w-[1200px] mx-auto relative">
                {/* {wsConnected && (
                    <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg shadow-green-500/30 z-[1000] animate-slide-in-right">
                        <div className="w-2 h-2 bg-card text-card-foreground rounded-full animate-pulse"></div>
                        <span>Đang kết nối real-time</span>
                    </div>
                )} */}

                <div className="bg-card text-card-foreground border border-border rounded-xl p-5 mb-4 shadow-md">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-2xl font-semibold text-primary">Chọn Ghế Ngồi</h1>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-sm font-medium mb-1">Phim:</span>
                                <span className="text-foreground font-semibold">{showtimeInfo.movieTitle || 'The Avengers'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-sm font-medium mb-1">Rạp:</span>
                                <span className="text-foreground font-semibold">{showtimeInfo.cinemaName || 'Galaxy Nguyễn Du'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-sm font-medium mb-1">Phòng chiếu:</span>
                                <span className="text-foreground font-semibold">{showtimeInfo.roomName || 'Phòng chiếu 2'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-sm font-medium mb-1">Suất chiếu:</span>
                                <span className="text-foreground font-semibold">
                                    {showtimeInfo.startTime || '18:30'} - {showtimeInfo.date || dayjs().format('DD/MM/YYYY')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 flex-col lg:flex-row">
                    <div className="flex-1">
                        <div className="bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/50 rounded-lg py-1 mb-2 text-center">
                            <div className="text-muted-foreground font-bold text-lg tracking-wider">MÀN HÌNH</div>
                        </div>

                        <div className="bg-card text-card-foreground rounded-xl p-6 shadow-md border border-border mb-6 overflow-x-auto">
                            {seatLayout.rows.map((row, rowIndex) => {
                                // Tính toán số cột tối đa trong phòng để đảm bảo alignment
                                const allCols = seatLayout.rows.flatMap(r => r.seats.map(s => s.col || 0));
                                const maxColInRoom = allCols.length > 0 ? Math.max(...allCols) : 0;
                                const totalCols = maxColInRoom || 20; // Fallback to 20 if no seats
                                const minCol = 1;

                                return (
                                    <div key={row.label || rowIndex} className="flex items-center gap-2 mb-3">
                                        <div
                                            className="seats"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: `repeat(${totalCols}, 36px)`,
                                                gap: '4px',
                                                position: 'relative',
                                                width: '100%',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {Array.from({ length: totalCols }, (_, index) => {
                                                const currentCol = minCol + index;
                                                const gridPosition = index + 1;
                                                const seat = row.seats.find(s => s.col === currentCol);

                                                // Kiểm tra xem cột trước có ghế đôi không (ghế đôi chiếm cột hiện tại)
                                                const prevCol = currentCol - 1;
                                                const prevSeat = row.seats.find(s => s.col === prevCol);
                                                const isOccupiedByCoupleSeat = prevSeat && prevSeat.seatType === 'couple';

                                                if (isOccupiedByCoupleSeat) {
                                                    // Cột này bị ghế đôi chiếm, không render gì
                                                    return null;
                                                }

                                                if (seat) {
                                                    const isCoupleSeat = seat.seatType === 'couple';
                                                    const isSelected = selectedSeats.find(s => s.id === seat.id);
                                                    const isDisabled = ['booked', 'unavailable', 'maintenance', 'blocked'].includes(seat.status);
                                                    const currentUserId = getCurrentUserId();
                                                    const isMyHeld = seat.status === 'held' &&
                                                        seat.lockedByUserId &&
                                                        currentUserId &&
                                                        seat.lockedByUserId.toString() === currentUserId.toString();
                                                    const isOthersHeld = seat.status === 'held' && !isMyHeld;

                                                    let displayStatus = '';
                                                    let canClick = true;

                                                    if (isSelected || isMyHeld) {
                                                        displayStatus = 'Đang chọn (click để bỏ chọn)';
                                                        canClick = true;
                                                    } else if (isOthersHeld) {
                                                        displayStatus = 'Người khác giữ';
                                                        canClick = false;
                                                    } else if (isDisabled) {
                                                        displayStatus = seat.status === 'booked' ? 'Đã bán' : 'Không khả dụng';
                                                        canClick = false;
                                                    } else {
                                                        displayStatus = 'Có thể chọn';
                                                        canClick = true;
                                                    }

                                                    const seatTypeText = seat.seatType === 'vip' ? 'VIP' :
                                                        seat.seatType === 'couple' ? 'Đôi' :
                                                            seat.seatType === 'sweetbox' ? 'Sweetbox' : 'Thường';

                                                    return (
                                                        <Tooltip key={`seat-${seat.id}`}>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`seat clickable ${isSelected ? 'selected' : ''} ${isCoupleSeat ? 'seat-couple' : ''} ${seat.status === 'blocked' ? 'blocked' : ''}`}
                                                                    style={{
                                                                        backgroundColor: getSeatColor(seat),
                                                                        color: 'white',
                                                                        gridColumn: isCoupleSeat
                                                                            ? `${gridPosition} / span 2` // Ghế đôi chiếm 2 cột
                                                                            : gridPosition,
                                                                        width: isCoupleSeat ? '72px' : '36px',
                                                                        height: '36px',
                                                                        borderRadius: '6px',
                                                                        border: isSelected
                                                                            ? '2px solid #1890ff'
                                                                            : '1px solid rgba(255, 255, 255, 0.3)',
                                                                        boxShadow: isSelected
                                                                            ? '0 0 0 2px rgba(24, 144, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)'
                                                                            : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                                        cursor: canClick ? 'pointer' : 'not-allowed',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontWeight: '600',
                                                                        fontSize: '11px',
                                                                        position: 'relative',
                                                                        overflow: 'hidden',
                                                                        willChange: 'auto',
                                                                        opacity: isDisabled && !isSelected ? 0.6 : 1
                                                                    }}
                                                                    onClick={() => canClick && handleSeatClick(seat)}
                                                                >
                                                                    <div className="seat-content" style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '2px',
                                                                        width: '100%',
                                                                        height: '100%'
                                                                    }}>
                                                                        <span style={{ fontSize: '12px', lineHeight: '1' }}>
                                                                            {getSeatIcon(seat)}
                                                                        </span>
                                                                        <span className="seat-number" style={{
                                                                            fontSize: '9px',
                                                                            fontWeight: '600',
                                                                            lineHeight: '1',
                                                                            letterSpacing: '0.3px'
                                                                        }}>
                                                                            {seat.name}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="space-y-1">
                                                                    <div><strong>Ghế {seat.name}</strong></div>
                                                                    <div>Hàng: {row.label} (Cột: {seat.col})</div>
                                                                    <div>Loại: {seatTypeText}</div>
                                                                    <div>Trạng thái: {getStatusText(seat.status)}</div>
                                                                    <div>Giá: {seat.price.toLocaleString()}đ</div>
                                                                    {isCoupleSeat && <div style={{ color: '#eb2f96' }}>âš ï¸ Chiếm 2 vị trí</div>}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                } else {
                                                    // Ô trống - không có ghế ở cột này
                                                    return (
                                                        <div
                                                            key={`empty-${row.label}-${currentCol}`}
                                                            className="w-full h-9 invisible"
                                                        />
                                                    );
                                                }
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center bg-card text-card-foreground rounded-xl p-4 shadow-md border border-border">
                            {/* Loại ghế */}
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#52c41a' }}>
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Ghế thường</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#faad14' }}>
                                    <StarIcon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Ghế VIP</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#eb2f96' }}>
                                    <HeartIcon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Ghế đôi</span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-6 bg-gray-300"></div>

                            {/* Trạng thái */}
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border-2 border-blue-500 flex items-center justify-center" style={{ backgroundColor: '#1890ff' }}>
                                    <UserCheck className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Đang chọn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#faad14' }}>
                                    <Clock3 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Đang giữ</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center opacity-60" style={{ backgroundColor: '#ff4d4f' }}>
                                    <UserCheck className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Đã bán</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center opacity-60" style={{ backgroundColor: '#8c8c8c' }}>
                                    <Lock className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-muted-foreground font-medium">Bị khóa</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-card text-card-foreground rounded-xl shadow-md border border-border p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-foreground mb-6">Tóm tắt đặt vé</h3>

                            <div className="mb-6 pb-4 border-b border-border">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-muted-foreground text-sm">Phim:</span>
                                    <span className="text-foreground font-semibold text-right flex-1 ml-4">{showtimeInfo.movieTitle || 'The Avengers'}</span>
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-muted-foreground text-sm">Rạp:</span>
                                    <span className="text-foreground font-semibold text-right flex-1 ml-4">{showtimeInfo.cinemaName || 'Galaxy Nguyễn Du'}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-muted-foreground text-sm">Suất chiếu:</span>
                                    <span className="text-foreground font-semibold text-right flex-1 ml-4">
                                        {showtimeInfo.startTime || '18:30'} - {showtimeInfo.date || dayjs().format('DD/MM')}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 pb-4 border-b border-border">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-muted-foreground text-sm font-semibold">Ghế đã chọn ({selectedSeats.length}):</span>
                                    <span className="text-foreground font-semibold text-right flex-1 ml-4">
                                        {selectedSeats.length > 0
                                            ? selectedSeats.map(s => s.name).join(', ')
                                            : 'Chưa chọn ghế'
                                        }
                                    </span>
                                </div>
                                {selectedSeats.length > 0 && (
                                    <div className="space-y-2 mt-3">
                                        {selectedSeats.map(seat => (
                                            <div key={seat.id} className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground font-medium">{seat.name}</span>
                                                <span className="text-muted-foreground">
                                                    {seat.seatType === 'vip' ? 'VIP' : seat.seatType === 'couple' ? 'Đôi' : 'Thường'}
                                                </span>
                                                <span className="text-foreground font-semibold">{seat.price.toLocaleString()}đ</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedSeats.length > 0 && (
                                <div className="mb-6 pb-4 border-b border-border">
                                    {['normal', 'vip', 'couple'].map(seatType => {
                                        const seatsOfType = selectedSeats.filter(s => s.seatType === seatType);
                                        if (seatsOfType.length === 0) return null;

                                        const typeName = seatType === 'vip' ? 'VIP' : seatType === 'couple' ? 'Đôi' : 'Thường';
                                        const avgPrice = seatsOfType.reduce((sum, s) => sum + s.price, 0) / seatsOfType.length;

                                        return (
                                            <div key={seatType} className="flex justify-between items-center mb-2">
                                                <span className="text-muted-foreground text-sm">Giá vé {typeName}:</span>
                                                <span className="text-foreground font-semibold">
                                                    {seatsOfType.length} x {avgPrice.toLocaleString()}đ
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Promotion Code Section */}
                            <div className="mb-6 pb-4 border-b border-border">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-muted-foreground">Mã giảm giá</label>
                                    {!promotionInfo ? (
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Nhập mã giảm giá"
                                                value={promotionCode}
                                                onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleValidatePromotion();
                                                    }
                                                }}
                                                className="flex-1 h-10 text-sm"
                                                maxLength={20}
                                            />
                                            <Button
                                                onClick={handleValidatePromotion}
                                                disabled={!promotionCode.trim() || isValidatingPromotion}
                                                className="h-10 px-4 bg-primary hover:bg-red-700 text-white"
                                            >
                                                {isValidatingPromotion ? 'Đang kiểm tra...' : 'Áp dụng'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <TagIcon className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <div className="text-sm font-semibold text-green-800">
                                                        {promotionInfo.code}
                                                    </div>
                                                    {promotionInfo.discountPercent > 0 ? (
                                                        <div className="text-xs text-green-600">
                                                            Giảm {promotionInfo.discountPercent}%
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-green-600">
                                                            Giảm {promotionInfo.discount.toLocaleString()}đ
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleRemovePromotion}
                                                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4 pb-4 border-b border-border">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-muted-foreground text-sm">Tạm tính:</span>
                                    <span className="text-foreground font-semibold">{calculateSubtotal().toLocaleString()}đ</span>
                                </div>
                                {promotionDiscount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600 text-sm">Giảm giá:</span>
                                        <span className="text-green-600 font-semibold">-{promotionDiscount.toLocaleString()}đ</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6 pt-4 border-t border-border">
                                <span className="text-lg font-bold text-foreground">Tổng cộng</span>
                                <span className="text-2xl font-bold text-primary">{calculateTotal().toLocaleString()}đ</span>
                            </div>

                            <button
                                className="w-full bg-primary hover:bg-red-700 text-white rounded-lg py-3 px-6 font-semibold text-base transition-all duration-200 disabled:bg-gray-300 disabled:text-muted-foreground disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
                                onClick={handleContinue}
                                disabled={selectedSeats.length === 0 || isCreatingBooking}
                            >
                                {isCreatingBooking ? 'Đang xử lý...' : 'Đặt vé'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
            />
        </div>
    );
};

export default BookingSeatSelection;
