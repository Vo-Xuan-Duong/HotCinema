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

    // Helper function Ä‘á»ƒ láº¥y current user ID nháº¥t quÃ¡n
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

                // Chá»‰ tá»± Ä‘á»™ng thÃªm vÃ o selectedSeats náº¿u lÃ  gháº¿ cá»§a user hiá»‡n táº¡i
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
            notification.error('KhÃ´ng thá»ƒ táº£i thÃ´ng tin suáº¥t chiáº¿u');
        } finally {
            setLoading(false);
        }
    };

    const transformSeatsToLayout = (seatsData) => {
        const seatsArray = Array.isArray(seatsData) ? seatsData :
            (seatsData?.data ? seatsData.data : []);

        if (seatsArray.length === 0) {
            generateMockSeats();
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

        // Sáº¯p xáº¿p rows theo rowNumber (tÄƒng dáº§n)
        const rows = Object.values(rowsMap).sort((a, b) => {
            const rowA = a.rowNumber || 0;
            const rowB = b.rowNumber || 0;
            return rowA - rowB;
        });

        // Sáº¯p xáº¿p seats trong má»—i row theo col (tÄƒng dáº§n)
        rows.forEach(row => {
            row.seats.sort((a, b) => {
                const colA = a.col || 0;
                const colB = b.col || 0;
                return colA - colB;
            });
        });

        // TÃ­nh toÃ¡n maxColInRoom Ä‘á»ƒ Ä‘áº£m báº£o alignment giá»¯a cÃ¡c hÃ ng
        const allCols = rows.flatMap(r => r.seats.map(s => s.col || 0));
        const maxColInRoom = allCols.length > 0 ? Math.max(...allCols) : 0;

        // LÆ°u maxColInRoom vÃ o má»—i row Ä‘á»ƒ sá»­ dá»¥ng khi render
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
                notification.info(`ÄÃ£ khÃ´i phá»¥c ${mySelectedSeats.length} gháº¿ báº¡n Ä‘Ã£ chá»n trÆ°á»›c Ä‘Ã³`);
            }, 500);
        }
    };

    const generateMockSeats = () => {
        const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
        const rows = [];
        let totalSeats = 0;
        let availableSeats = 0;
        let bookedSeats = 0;

        rowLabels.forEach((label, rowIndex) => {
            const seats = [];
            const seatsPerRow = rowIndex < 2 ? 4 : 10;

            for (let i = 1; i <= seatsPerRow; i++) {
                const seatId = `${label}${i}`;
                let status = 'available';
                let seatType = 'normal';

                if (['C4', 'C5', 'C6', 'C7'].includes(seatId)) {
                    status = 'booked';
                }

                if (['D', 'E'].includes(label)) {
                    seatType = 'vip';
                }

                totalSeats++;
                if (status === 'booked') {
                    bookedSeats++;
                } else {
                    availableSeats++;
                }

                seats.push({
                    id: seatId,
                    col: i,
                    name: seatId,
                    seatType: seatType,
                    status: status,
                    price: seatType === 'vip' ? 135000 : seatType === 'couple' ? 190000 : 95000,
                    rowLabel: label,
                    row: rowIndex + 1,
                    lockedByUserId: null
                });
            }

            rows.push({
                label,
                seats
            });
        });

        setSeatLayout({
            rows,
            totalSeats,
            availableSeats,
            bookedSeats
        });
    };

    const getSeatColor = (seat) => {
        const isSelected = selectedSeats.find(s => s.id === seat.id);
        const currentUserId = getCurrentUserId();
        const isMyHeld = seat.status === 'held' &&
            seat.lockedByUserId &&
            currentUserId &&
            seat.lockedByUserId.toString() === currentUserId.toString();

        // Náº¿u Ä‘ang Ä‘Æ°á»£c chá»n hoáº·c Ä‘ang giá»¯ bá»Ÿi user hiá»‡n táº¡i
        if (isSelected || isMyHeld) {
            return '#1890ff'; // MÃ u xanh dÆ°Æ¡ng - Äang chá»n
        }

        // Æ¯u tiÃªn hiá»ƒn thá»‹ tráº¡ng thÃ¡i trÆ°á»›c, sau Ä‘Ã³ má»›i Ä‘áº¿n loáº¡i gháº¿
        switch (seat.status) {
            case 'blocked':
                return '#8c8c8c'; // MÃ u xÃ¡m Ä‘áº­m - Gháº¿ bá»‹ khÃ³a
            case 'booked':
                return '#ff4d4f'; // MÃ u Ä‘á» - Gháº¿ Ä‘Ã£ Ä‘áº·t
            case 'held':
                return '#faad14'; // MÃ u vÃ ng cam - Gháº¿ Ä‘ang giá»¯ chá»— (ngÆ°á»i khÃ¡c)
            case 'unavailable':
                return '#d9d9d9'; // MÃ u xÃ¡m nháº¡t - Gháº¿ khÃ´ng kháº£ dá»¥ng
            case 'maintenance':
                return '#722ed1'; // MÃ u tÃ­m - Gháº¿ Ä‘ang báº£o trÃ¬
            case 'available':
            default:
                // Khi available, mÃ u sáº¯c dá»±a vÃ o loáº¡i gháº¿
                switch (seat.seatType) {
                    case 'vip':
                        return '#faad14'; // MÃ u vÃ ng cho VIP
                    case 'couple':
                        return '#eb2f96'; // MÃ u há»“ng cho gháº¿ Ä‘Ã´i
                    case 'normal':
                    default:
                        return '#52c41a'; // MÃ u xanh cho gháº¿ thÆ°á»ng
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

        // Náº¿u Ä‘ang Ä‘Æ°á»£c chá»n hoáº·c Ä‘ang giá»¯ bá»Ÿi user hiá»‡n táº¡i
        if (isSelected || isMyHeld) {
            return <UserCheck className="h-4 w-4" />;
        }

        // Æ¯u tiÃªn hiá»ƒn thá»‹ icon tráº¡ng thÃ¡i trÆ°á»›c
        switch (seat.status) {
            case 'blocked':
                return <Lock className="h-4 w-4" />; // Icon khÃ³a
            case 'booked':
                return <UserCheck className="h-4 w-4" />; // Icon user - ÄÃ£ Ä‘áº·t
            case 'held':
                return <Clock3 className="h-4 w-4" />; // Icon Ä‘á»“ng há»“ - Äang giá»¯
            case 'unavailable':
                return <XCircle className="h-4 w-4" />; // Icon X - KhÃ´ng kháº£ dá»¥ng
            case 'maintenance':
                return <Settings className="h-4 w-4" />; // Icon cÃ´ng cá»¥ - Báº£o trÃ¬
            case 'available':
            default:
                // Khi available, icon dá»±a vÃ o loáº¡i gháº¿
                switch (seat.seatType) {
                    case 'vip':
                        return <StarIcon className="h-4 w-4" />;
                    case 'couple':
                        return <HeartIcon className="h-4 w-4" />;
                    case 'sweetbox':
                        return <HeartIcon className="h-4 w-4" />; // Icon trÃ¡i tim cho Sweetbox
                    case 'normal':
                    default:
                        return <User className="h-4 w-4" />;
                }
        }
    };

    const getStatusText = (status) => {
        const statusTextMap = {
            'available': 'CÃ³ thá»ƒ Ä‘áº·t',
            'held': 'Äang giá»¯ chá»—',
            'booked': 'ÄÃ£ Ä‘áº·t',
            'unavailable': 'KhÃ´ng kháº£ dá»¥ng',
            'maintenance': 'Äang báº£o trÃ¬',
            'blocked': 'Bá»‹ khÃ³a'
        };
        return statusTextMap[status] || 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
    };

    const handleSeatClick = async (seat) => {
        if (seat.status === 'booked') {
            notification.warning('Gháº¿ nÃ y Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t');
            return;
        }

        if (seat.status === 'unavailable') {
            notification.warning('Gháº¿ nÃ y khÃ´ng kháº£ dá»¥ng');
            return;
        }

        if (seat.status === 'maintenance') {
            notification.warning('Gháº¿ nÃ y Ä‘ang báº£o trÃ¬');
            return;
        }

        if (seat.status === 'blocked') {
            notification.warning('Gháº¿ nÃ y Ä‘Ã£ bá»‹ khÃ³a');
            return;
        }

        const currentUserId = getCurrentUserId();

        if (seat.status === 'held' && seat.lockedByUserId) {
            if (seat.lockedByUserId.toString() !== currentUserId) {
                notification.warning('Gháº¿ nÃ y Ä‘ang Ä‘Æ°á»£c giá»¯ bá»Ÿi ngÆ°á»i dÃ¹ng khÃ¡c');
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
                    notification.warning('Chá»‰ Ä‘Æ°á»£c chá»n tá»‘i Ä‘a 10 gháº¿');
                    return;
                }

                // Náº¿u khÃ´ng cÃ³ userId thÃ¬ truyá»n null (backend sáº½ xá»­ lÃ½ anonymous / guest náº¿u cáº§n)
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
                notification.error('Gháº¿ Ä‘Ã£ Ä‘Æ°á»£c ngÆ°á»i khÃ¡c chá»n');
            } else if (error.response?.status === 400) {
                notification.error('KhÃ´ng thá»ƒ chá»n gháº¿ nÃ y');
            } else {
                notification.error('CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i');
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
            notification.warning('Vui lÃ²ng nháº­p mÃ£ giáº£m giÃ¡');
            return;
        }

        setIsValidatingPromotion(true);
        try {
            // Call API to validate code
            const response = await promotionService.getPromotionByCode(promotionCode);
            const promotion = response?.data || response;

            if (!promotion) {
                notification.error('MÃ£ giáº£m giÃ¡ khÃ´ng tá»“n táº¡i');
                setPromotionDiscount(0);
                setPromotionInfo(null);
                return;
            }

            // Client-side validation
            const now = dayjs();
            const startDate = dayjs(promotion.startDate);
            const endDate = dayjs(promotion.endDate);

            if (promotion.status !== 'ACTIVE' && promotion.status !== true) {
                notification.error('MÃ£ giáº£m giÃ¡ nÃ y hiá»‡n khÃ´ng hoáº¡t Ä‘á»™ng');
                return;
            }

            if (now.isBefore(startDate)) {
                notification.error(`MÃ£ giáº£m giÃ¡ chÆ°a Ä‘áº¿n ngÃ y Ã¡p dá»¥ng (báº¯t Ä‘áº§u tá»« ${startDate.format('DD/MM/YYYY')})`);
                return;
            }

            if (now.isAfter(endDate)) {
                notification.error('MÃ£ giáº£m giÃ¡ Ä‘Ã£ háº¿t háº¡n');
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
            notification.success('Ãp dá»¥ng mÃ£ giáº£m giÃ¡ thÃ nh cÃ´ng!');

        } catch (error) {
            console.error('Error validating promotion code:', error);
            setPromotionDiscount(0);
            setPromotionInfo(null);
            if (error.response?.status === 404) {
                notification.error('MÃ£ giáº£m giÃ¡ khÃ´ng tá»“n táº¡i');
            } else {
                notification.error('KhÃ´ng thá»ƒ kiá»ƒm tra mÃ£ giáº£m giÃ¡. Vui lÃ²ng thá»­ láº¡i.');
            }
        } finally {
            setIsValidatingPromotion(false);
        }
    };

    const handleRemovePromotion = () => {
        setPromotionCode('');
        setPromotionDiscount(0);
        setPromotionInfo(null);
        notification.info('ÄÃ£ xÃ³a mÃ£ giáº£m giÃ¡');
    };

    const checkLoginStatus = () => {
        const userId = getCurrentUserId();
        const token = localStorage.getItem('access_token');

        if (!user && (!userId || !token)) {
            notification.warning('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘áº·t vÃ©');
            setShowAuthModal(true);
            return false;
        }
        return true;
    };

    const handleContinue = async () => {
        if (selectedSeats.length === 0) {
            notification.warning('Vui lÃ²ng chá»n Ã­t nháº¥t má»™t gháº¿');
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
                notification.error('KhÃ´ng cÃ³ gháº¿ há»£p lá»‡ Ä‘á»ƒ Ä‘áº·t');
                setIsCreatingBooking(false);
                return;
            }

            const bookingPayload = {
                showtimeId: parseInt(showtimeId, 10),
                seatIds: seatIds,
                promotionCode: promotionCode.trim() || null // Send promotion code if provided
            };

            const bookingResponse = await bookingService.createBooking(bookingPayload);

            notification.success('ÄÃ£ táº¡o Ä‘Æ¡n Ä‘áº·t vÃ© thÃ nh cÃ´ng!');

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
                notification.error('Má»™t sá»‘ gháº¿ Ä‘Ã£ Ä‘Æ°á»£c ngÆ°á»i khÃ¡c Ä‘áº·t. Vui lÃ²ng chá»n láº¡i.');
                loadShowtimeDetails();
            } else if (error.response?.status === 400) {
                notification.error(error.response?.data?.message || 'Dá»¯ liá»‡u khÃ´ng há»£p lá»‡');
            } else if (error.response?.status === 401) {
                notification.error('Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ Ä‘áº·t vÃ©');
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
                notification.error('CÃ³ lá»—i xáº£y ra khi táº¡o Ä‘Æ¡n Ä‘áº·t vÃ©. Vui lÃ²ng thá»­ láº¡i.');
            }
        } finally {
            setIsCreatingBooking(false);
        }
    };

    if (loading) {
        return <ContentLoader message="Äang táº£i sÆ¡ Ä‘á»“ gháº¿..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 mt-8">
            <div className="max-w-[1200px] mx-auto relative">
                {/* {wsConnected && (
                    <div className="fixed top-20 right-5 bg-green-500 text-white py-2 px-4 rounded-full flex items-center gap-2 text-sm font-medium shadow-lg shadow-green-500/30 z-[1000] animate-slide-in-right">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Äang káº¿t ná»‘i real-time</span>
                    </div>
                )} */}

                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-md">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-2xl font-semibold text-primary">Chá»n Gháº¿ Ngá»“i</h1>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col">
                                <span className="text-gray-600 text-sm font-medium mb-1">Phim:</span>
                                <span className="text-gray-900 font-semibold">{showtimeInfo.movieTitle || 'The Avengers'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-600 text-sm font-medium mb-1">Ráº¡p:</span>
                                <span className="text-gray-900 font-semibold">{showtimeInfo.cinemaName || 'Galaxy Nguyá»…n Du'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-600 text-sm font-medium mb-1">PhÃ²ng chiáº¿u:</span>
                                <span className="text-gray-900 font-semibold">{showtimeInfo.roomName || 'PhÃ²ng chiáº¿u 2'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-600 text-sm font-medium mb-1">Suáº¥t chiáº¿u:</span>
                                <span className="text-gray-900 font-semibold">
                                    {showtimeInfo.startTime || '18:30'} - {showtimeInfo.date || dayjs().format('DD/MM/YYYY')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 flex-col lg:flex-row">
                    <div className="flex-1">
                        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg py-1 mb-2 text-center">
                            <div className="text-gray-700 font-bold text-lg tracking-wider">MÃ€N HÃŒNH</div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6 overflow-x-auto">
                            {seatLayout.rows.map((row, rowIndex) => {
                                // TÃ­nh toÃ¡n sá»‘ cá»™t tá»‘i Ä‘a trong phÃ²ng Ä‘á»ƒ Ä‘áº£m báº£o alignment
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

                                                // Kiá»ƒm tra xem cá»™t trÆ°á»›c cÃ³ gháº¿ Ä‘Ã´i khÃ´ng (gháº¿ Ä‘Ã´i chiáº¿m cá»™t hiá»‡n táº¡i)
                                                const prevCol = currentCol - 1;
                                                const prevSeat = row.seats.find(s => s.col === prevCol);
                                                const isOccupiedByCoupleSeat = prevSeat && prevSeat.seatType === 'couple';

                                                if (isOccupiedByCoupleSeat) {
                                                    // Cá»™t nÃ y bá»‹ gháº¿ Ä‘Ã´i chiáº¿m, khÃ´ng render gÃ¬
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
                                                        displayStatus = 'Äang chá»n (click Ä‘á»ƒ bá» chá»n)';
                                                        canClick = true;
                                                    } else if (isOthersHeld) {
                                                        displayStatus = 'NgÆ°á»i khÃ¡c giá»¯';
                                                        canClick = false;
                                                    } else if (isDisabled) {
                                                        displayStatus = seat.status === 'booked' ? 'ÄÃ£ bÃ¡n' : 'KhÃ´ng kháº£ dá»¥ng';
                                                        canClick = false;
                                                    } else {
                                                        displayStatus = 'CÃ³ thá»ƒ chá»n';
                                                        canClick = true;
                                                    }

                                                    const seatTypeText = seat.seatType === 'vip' ? 'VIP' :
                                                        seat.seatType === 'couple' ? 'ÄÃ´i' :
                                                            seat.seatType === 'sweetbox' ? 'Sweetbox' : 'ThÆ°á»ng';

                                                    return (
                                                        <Tooltip key={`seat-${seat.id}`}>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className={`seat clickable ${isSelected ? 'selected' : ''} ${isCoupleSeat ? 'seat-couple' : ''} ${seat.status === 'blocked' ? 'blocked' : ''}`}
                                                                    style={{
                                                                        backgroundColor: getSeatColor(seat),
                                                                        color: 'white',
                                                                        gridColumn: isCoupleSeat
                                                                            ? `${gridPosition} / span 2` // Gháº¿ Ä‘Ã´i chiáº¿m 2 cá»™t
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
                                                                    <div><strong>Gháº¿ {seat.name}</strong></div>
                                                                    <div>HÃ ng: {row.label} (Cá»™t: {seat.col})</div>
                                                                    <div>Loáº¡i: {seatTypeText}</div>
                                                                    <div>Tráº¡ng thÃ¡i: {getStatusText(seat.status)}</div>
                                                                    <div>GiÃ¡: {seat.price.toLocaleString()}Ä‘</div>
                                                                    {isCoupleSeat && <div style={{ color: '#eb2f96' }}>âš ï¸ Chiáº¿m 2 vá»‹ trÃ­</div>}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    );
                                                } else {
                                                    // Ã” trá»‘ng - khÃ´ng cÃ³ gháº¿ á»Ÿ cá»™t nÃ y
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

                        <div className="flex flex-wrap gap-4 justify-center bg-white rounded-xl p-4 shadow-md border border-gray-200">
                            {/* Loáº¡i gháº¿ */}
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#52c41a' }}>
                                    <User className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Gháº¿ thÆ°á»ng</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#faad14' }}>
                                    <StarIcon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Gháº¿ VIP</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#eb2f96' }}>
                                    <HeartIcon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Gháº¿ Ä‘Ã´i</span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-6 bg-gray-300"></div>

                            {/* Tráº¡ng thÃ¡i */}
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border-2 border-blue-500 flex items-center justify-center" style={{ backgroundColor: '#1890ff' }}>
                                    <UserCheck className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Äang chá»n</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center" style={{ backgroundColor: '#faad14' }}>
                                    <Clock3 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Äang giá»¯</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center opacity-60" style={{ backgroundColor: '#ff4d4f' }}>
                                    <UserCheck className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">ÄÃ£ bÃ¡n</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg border border-white/30 flex items-center justify-center opacity-60" style={{ backgroundColor: '#8c8c8c' }}>
                                    <Lock className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Bá»‹ khÃ³a</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">TÃ³m táº¯t Ä‘áº·t vÃ©</h3>

                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-gray-600 text-sm">Phim:</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">{showtimeInfo.movieTitle || 'The Avengers'}</span>
                                </div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-gray-600 text-sm">Ráº¡p:</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">{showtimeInfo.cinemaName || 'Galaxy Nguyá»…n Du'}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600 text-sm">Suáº¥t chiáº¿u:</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">
                                        {showtimeInfo.startTime || '18:30'} - {showtimeInfo.date || dayjs().format('DD/MM')}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-gray-600 text-sm font-semibold">Gháº¿ Ä‘Ã£ chá»n ({selectedSeats.length}):</span>
                                    <span className="text-gray-900 font-semibold text-right flex-1 ml-4">
                                        {selectedSeats.length > 0
                                            ? selectedSeats.map(s => s.name).join(', ')
                                            : 'ChÆ°a chá»n gháº¿'
                                        }
                                    </span>
                                </div>
                                {selectedSeats.length > 0 && (
                                    <div className="space-y-2 mt-3">
                                        {selectedSeats.map(seat => (
                                            <div key={seat.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-700 font-medium">{seat.name}</span>
                                                <span className="text-gray-600">
                                                    {seat.seatType === 'vip' ? 'VIP' : seat.seatType === 'couple' ? 'ÄÃ´i' : 'ThÆ°á»ng'}
                                                </span>
                                                <span className="text-gray-900 font-semibold">{seat.price.toLocaleString()}Ä‘</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {selectedSeats.length > 0 && (
                                <div className="mb-6 pb-4 border-b border-gray-200">
                                    {['normal', 'vip', 'couple'].map(seatType => {
                                        const seatsOfType = selectedSeats.filter(s => s.seatType === seatType);
                                        if (seatsOfType.length === 0) return null;

                                        const typeName = seatType === 'vip' ? 'VIP' : seatType === 'couple' ? 'ÄÃ´i' : 'ThÆ°á»ng';
                                        const avgPrice = seatsOfType.reduce((sum, s) => sum + s.price, 0) / seatsOfType.length;

                                        return (
                                            <div key={seatType} className="flex justify-between items-center mb-2">
                                                <span className="text-gray-600 text-sm">GiÃ¡ vÃ© {typeName}:</span>
                                                <span className="text-gray-900 font-semibold">
                                                    {seatsOfType.length} x {avgPrice.toLocaleString()}Ä‘
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Promotion Code Section */}
                            <div className="mb-6 pb-4 border-b border-gray-200">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">MÃ£ giáº£m giÃ¡</label>
                                    {!promotionInfo ? (
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Nháº­p mÃ£ giáº£m giÃ¡"
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
                                                {isValidatingPromotion ? 'Äang kiá»ƒm tra...' : 'Ãp dá»¥ng'}
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
                                                            Giáº£m {promotionInfo.discountPercent}%
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-green-600">
                                                            Giáº£m {promotionInfo.discount.toLocaleString()}Ä‘
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

                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600 text-sm">Táº¡m tÃ­nh:</span>
                                    <span className="text-gray-900 font-semibold">{calculateSubtotal().toLocaleString()}Ä‘</span>
                                </div>
                                {promotionDiscount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-green-600 text-sm">Giáº£m giÃ¡:</span>
                                        <span className="text-green-600 font-semibold">-{promotionDiscount.toLocaleString()}Ä‘</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
                                <span className="text-lg font-bold text-gray-900">Tá»•ng cá»™ng</span>
                                <span className="text-2xl font-bold text-primary">{calculateTotal().toLocaleString()}Ä‘</span>
                            </div>

                            <button
                                className="w-full bg-primary hover:bg-red-700 text-white rounded-lg py-3 px-6 font-semibold text-base transition-all duration-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-lg"
                                onClick={handleContinue}
                                disabled={selectedSeats.length === 0 || isCreatingBooking}
                            >
                                {isCreatingBooking ? 'Äang xá»­ lÃ½...' : 'Äáº·t vÃ©'}
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
