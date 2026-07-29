import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DateField } from '@/components/ui/date-field';
import { NumberStepper } from '@/components/ui/number-stepper';
import { StatusBadge } from '@/components/ui/status-badge';
import { Metric } from '@/components/ui/metric';
import { Badge } from '@/components/ui/badge-count';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Calendar,
    Clock,
    Video,
    Store,
    Eye,
    PlayCircle,
    PauseCircle,
    DollarSign,
    User,
    Grid,
    Settings,
    Home,
    Loader2,
    Building2,
    Film,
    Users,
    X
} from 'lucide-react';
import dayjs from 'dayjs';
import showtimeService from '@/services/showtimeService';
import movieService from '@/services/movieService';
import cinemaService from '@/services/cinemaService';
import useNotification from '@/hooks/useNotification';

const Schedules = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [formValues, setFormValues] = useState({
        movieId: '',
        cinemaId: '',
        screenName: '',
        format: 'TWO_D',
        audioType: 'SUBTITLE',
        date: '',
        time: '',
        price: '',
        status: 'AVAILABLE'
    });
    const [schedules, setSchedules] = useState([]);
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]); // Danh sÃ¡ch phÃ²ng chiáº¿u
    const [loading, setLoading] = useState(true);
    const [moviesLoading, setMoviesLoading] = useState(false);
    const [cinemasLoading, setCinemasLoading] = useState(false);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [movieFilter, setMovieFilter] = useState('all');
    const [cinemaFilter, setCinemaFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
    const [selectedRowKeys, setSelectedRowKeys] = useState([]); // For batch operations

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        loadSchedules();
        loadMovies();
        loadCinemas();
    }, []);

    // Auto-fill form khi má»Ÿ edit modal vÃ  Ä‘Ã£ cÃ³ rooms
    useEffect(() => {
        console.log('useEffect triggered:', {
            showEditModal,
            hasSelectedSchedule: !!selectedSchedule,
            roomsCount: rooms.length,
            selectedSchedule
        });

        if (showEditModal && selectedSchedule) {
            // TÃ¬m movieId vÃ  cinemaId tá»« danh sÃ¡ch
            const movie = movies.find(m => m.title === selectedSchedule.movieTitle);
            const cinema = cinemas.find(c => c.name === selectedSchedule.cinemaName);

            console.log('Auto-filling form with data:', {
                movieId: movie?.id,
                cinemaId: cinema?.id,
                screenName: selectedSchedule.roomName,
                date: selectedSchedule.showDate,
                time: selectedSchedule.startTime,
                price: selectedSchedule.price,
                status: selectedSchedule.status
            });

            // Format date vÃ  time cho Input type="date" vÃ  type="time"
            // Input type="date" cáº§n format "YYYY-MM-DD", Input type="time" cáº§n format "HH:mm"
            const formattedDate = selectedSchedule.showDate
                ? (typeof selectedSchedule.showDate === 'string'
                    ? selectedSchedule.showDate.split('T')[0]
                    : dayjs(selectedSchedule.showDate).format('YYYY-MM-DD'))
                : null;
            const formattedTime = selectedSchedule.startTime
                ? (typeof selectedSchedule.startTime === 'string'
                    ? selectedSchedule.startTime.substring(0, 5) // Láº¥y "HH:mm" tá»« "HH:mm:ss"
                    : dayjs(selectedSchedule.startTime, 'HH:mm:ss').format('HH:mm'))
                : null;

            setFormValues({
                movieId: movie?.id || '',
                cinemaId: cinema?.id || '',
                screenName: selectedSchedule.roomName || '',
                date: formattedDate || '',
                time: formattedTime || '',
                price: selectedSchedule.basePrice || selectedSchedule.price || '',
                format: selectedSchedule.format || 'TWO_D',
                audioType: selectedSchedule.audioType || 'SUBTITLE',
                status: selectedSchedule.status || 'AVAILABLE'
            });
        }
    }, [showEditModal, selectedSchedule, rooms, movies, cinemas]);

    // Reload khi currentPage hoáº·c pageSize thay Ä‘á»•i
    useEffect(() => {
        if (currentPage !== 1 || pageSize !== 10) {
            loadSchedules(currentPage, pageSize);
        }
    }, [currentPage, pageSize]);

    // Reset vá» trang 1 khi filter thay Ä‘á»•i
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            loadSchedules(1, pageSize);
        }
    }, [searchText, movieFilter, cinemaFilter, statusFilter]);

    const loadSchedules = async (page = currentPage, size = pageSize) => {
        try {
            setLoading(true);
            let schedulesData = [];
            let total = 0;

            const hasBackendFilters = movieFilter !== 'all' || cinemaFilter !== 'all';

            if (hasBackendFilters) {
                const filterRequest = {};
                if (movieFilter !== 'all') filterRequest.movieId = parseInt(movieFilter);
                if (cinemaFilter !== 'all') filterRequest.cinemaId = parseInt(cinemaFilter);

                // Call backend filter API
                const response = await showtimeService.getShowtimesWithFilters(filterRequest);
                const data = response?.data || response;

                if (Array.isArray(data)) {
                    schedulesData = data;
                    total = data.length;
                }
            } else {
                // Call API vá»›i tham sá»‘ phÃ¢n trang (page báº¯t Ä‘áº§u tá»« 0)
                const response = await showtimeService.getAllShowtimes(page - 1, size);

                if (response?.data?.content) {
                    schedulesData = response.data.content;
                    total = response.data.totalElements || 0;
                } else if (response?.content) {
                    schedulesData = response.content;
                    total = response.totalElements || 0;
                } else if (Array.isArray(response?.data)) {
                    schedulesData = response.data;
                    total = response.data.length;
                } else if (Array.isArray(response)) {
                    schedulesData = response;
                    total = response.length;
                }
            }

            setSchedules(schedulesData);
            setTotalElements(total);
        } catch (error) {
            console.error('Error loading schedules:', error);
            notification.error('Lá»—i khi táº£i lá»‹ch chiáº¿u');
        } finally {
            setLoading(false);
        }
    };

    const loadMovies = async () => {
        try {
            setMoviesLoading(true);
            // Láº¥y danh sÃ¡ch phim Ä‘ang chiáº¿u (Now Showing)
            const response = await movieService.getNowShowing();
            console.log('Now Showing Movies API response:', response);

            // Xá»­ lÃ½ response - cÃ³ thá»ƒ lÃ  pagination hoáº·c array trá»±c tiáº¿p
            let moviesData = [];
            if (response?.data?.content) {
                // Paginated response: { data: { content: [], totalElements, ... } }
                moviesData = response.data.content;
            } else if (Array.isArray(response?.data)) {
                // Direct array: { data: [...] }
                moviesData = response.data;
            } else if (response?.content) {
                // Direct paginated: { content: [], totalElements, ... }
                moviesData = response.content;
            } else if (Array.isArray(response)) {
                // Direct array without wrapper
                moviesData = response;
            }

            console.log('Parsed now showing movies:', moviesData);

            // Filter active movies only
            const activeMovies = moviesData.filter(m => m.status === 'ACTIVE' || m.isActive !== false);
            setMovies(activeMovies);

            if (activeMovies.length === 0) {
                notification.warning('KhÃ´ng cÃ³ phim Ä‘ang chiáº¿u nÃ o. Vui lÃ²ng thÃªm phim Ä‘ang chiáº¿u trÆ°á»›c.');
            }
        } catch (error) {
            console.error('Error loading now showing movies:', error);
            notification.error('Lá»—i khi táº£i danh sÃ¡ch phim Ä‘ang chiáº¿u: ' + (error.response?.data?.message || error.message));
            setMovies([]);
        } finally {
            setMoviesLoading(false);
        }
    };

    const loadCinemas = async () => {
        try {
            setCinemasLoading(true);
            const response = await cinemaService.getAllCinemas();
            console.log('Cinemas API response:', response);

            // Xá»­ lÃ½ response - cÃ³ thá»ƒ lÃ  pagination hoáº·c array trá»±c tiáº¿p
            let cinemasData = [];
            if (response?.data?.content) {
                // Paginated response: { data: { content: [], totalElements, ... } }
                cinemasData = response.data.content;
            } else if (Array.isArray(response?.data)) {
                // Direct array: { data: [...] }
                cinemasData = response.data;
            } else if (response?.content) {
                // Direct paginated: { content: [], totalElements, ... }
                cinemasData = response.content;
            } else if (Array.isArray(response)) {
                // Direct array without wrapper
                cinemasData = response;
            }

            console.log('Parsed cinemas:', cinemasData);

            // Filter active cinemas only
            const activeCinemas = cinemasData.filter(c => c.status === 'ACTIVE' || c.isActive !== false);
            setCinemas(activeCinemas);

            if (activeCinemas.length === 0) {
                notification.warning('KhÃ´ng cÃ³ ráº¡p nÃ o Ä‘ang hoáº¡t Ä‘á»™ng. Vui lÃ²ng thÃªm ráº¡p trÆ°á»›c.');
            }
        } catch (error) {
            console.error('Error loading cinemas:', error);
            notification.error('Lá»—i khi táº£i danh sÃ¡ch ráº¡p: ' + (error.response?.data?.message || error.message));
            setCinemas([]);
        } finally {
            setCinemasLoading(false);
        }
    };

    // Load danh sÃ¡ch phÃ²ng chiáº¿u khi chá»n ráº¡p
    const loadRoomsByCinema = async (cinemaId) => {
        if (!cinemaId) {
            setRooms([]);
            return;
        }

        try {
            setRoomsLoading(true);
            const response = await cinemaService.getRoomsByCinemaId(cinemaId);
            console.log('Rooms API response:', response);

            // Xá»­ lÃ½ response
            let roomsData = [];
            if (Array.isArray(response?.data)) {
                roomsData = response.data;
            } else if (Array.isArray(response)) {
                roomsData = response;
            }

            console.log('Parsed rooms:', roomsData);

            // Filter active rooms only
            const activeRooms = roomsData.filter(r => r.isActive !== false);
            setRooms(activeRooms);

            if (activeRooms.length === 0) {
                notification.warning('Ráº¡p nÃ y chÆ°a cÃ³ phÃ²ng chiáº¿u nÃ o.');
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            notification.error('Lá»—i khi táº£i danh sÃ¡ch phÃ²ng chiáº¿u: ' + (error.response?.data?.message || error.message));
            setRooms([]);
        } finally {
            setRoomsLoading(false);
        }
    };

    // Xá»­ lÃ½ khi thay Ä‘á»•i ráº¡p
    const handleCinemaChange = (cinemaId) => {
        // Reset phÃ²ng chiáº¿u Ä‘Ã£ chá»n
        // Form values will be reset via form state
        // Load danh sÃ¡ch phÃ²ng cá»§a ráº¡p má»›i
        loadRoomsByCinema(cinemaId);
    };

    // Xá»­ lÃ½ khi thay Ä‘á»•i phÃ²ng chiáº¿u
    const handleRoomChange = (roomName) => {
        // TÃ¬m thÃ´ng tin phÃ²ng Ä‘Ã£ chá»n
        const selectedRoom = rooms.find(r => r.name === roomName);
        if (selectedRoom) {
            // LÆ°u roomId Ä‘á»ƒ submit (khÃ´ng tá»± Ä‘á»™ng set format ná»¯a)
            // Form values will be set via form state
        }
    };

    const getMovieTitle = (movieId) => {
        const movie = movies.find(m => m.id === movieId);
        return movie ? movie.title : 'N/A';
    };

    const getCinemaName = (cinemaId) => {
        const cinema = cinemas.find(c => c.id === cinemaId);
        return cinema ? cinema.name : 'N/A';
    };

    const handleAddSchedule = () => {
        setFormValues({
            movieId: '',
            cinemaId: '',
            screenName: '',
            format: 'TWO_D',
            audioType: 'SUBTITLE',
            date: '',
            time: '',
            price: '',
            status: 'AVAILABLE'
        });
        setShowAddModal(true);
    };

    const handleEditSchedule = async (schedule) => {
        try {
            console.log('handleEditSchedule called with:', schedule);
            setSelectedSchedule(schedule);

            // TÃ¬m cinemaId tá»« cinemaName
            const cinema = cinemas.find(c => c.name === schedule.cinemaName);

            // Load phÃ²ng chiáº¿u cá»§a ráº¡p Ä‘Ã£ chá»n
            if (cinema?.id) {
                console.log('Loading rooms for cinema:', cinema.id);
                await loadRoomsByCinema(cinema.id);
            }

            // Má»Ÿ modal - useEffect sáº½ tá»± Ä‘á»™ng set form values
            console.log('Opening edit modal...');
            setShowEditModal(true);
        } catch (error) {
            console.error('Error in handleEditSchedule:', error);
            notification.error('Lá»—i khi táº£i thÃ´ng tin lá»‹ch chiáº¿u');
        }
    };

    const handleViewSchedule = (schedule) => {
        setSelectedSchedule(schedule);
        setShowDetailModal(true);
    };

    const handleViewSeats = (schedule) => {
        navigate(`/admin/schedules/${schedule.id}/seats`);
    };

    const handleDeleteSchedule = async (scheduleId) => {
        try {
            await showtimeService.deleteShowtime(scheduleId);
            notification.success('XÃ³a lá»‹ch chiáº¿u thÃ nh cÃ´ng!');
            // Reload trang hiá»‡n táº¡i, náº¿u trang hiá»‡n táº¡i khÃ´ng cÃ²n dá»¯ liá»‡u thÃ¬ vá» trang 1
            await loadSchedules(currentPage, pageSize);
        } catch (error) {
            console.error('Error deleting schedule:', error);
            notification.error('Lá»—i khi xÃ³a lá»‹ch chiáº¿u');
        }
    };

    const handleStatusChange = async (scheduleId, newStatus) => {
        try {
            await showtimeService.updateShowtimeStatus(scheduleId, newStatus);
            const statusTextMap = {
                'UPCOMING': 'sáº¯p chiáº¿u',
                'AVAILABLE': 'cÃ²n vÃ©',
                'ALMOST_FULL': 'sáº¯p háº¿t chá»—',
                'FULL': 'háº¿t chá»—',
                'SALES_ENDED': 'dá»«ng bÃ¡n vÃ©',
                'COMPLETED': 'Ä‘Ã£ káº¿t thÃºc',
                'CANCELLED': 'há»§y',
                'POSTPONED': 'táº¡m hoÃ£n'
            };
            const statusText = statusTextMap[newStatus] || 'cáº­p nháº­t';
            notification.success(`ÄÃ£ ${statusText} lá»‹ch chiáº¿u!`);
            await loadSchedules();
        } catch (error) {
            console.error('Error updating status:', error);
            notification.error('Lá»—i khi cáº­p nháº­t tráº¡ng thÃ¡i');
        }
    };

    const handleSubmit = async (values) => {
        try {
            // TÃ¬m theaterId tá»« screenName Ä‘Ã£ chá»n
            const selectedRoom = rooms.find(r => r.name === values.screenName);
            if (!selectedRoom) {
                notification.error('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin phÃ²ng chiáº¿u');
                return;
            }

            // TÃ¬m movie Ä‘á»ƒ láº¥y durationMinutes
            const selectedMovie = movies.find(m => m.id === values.movieId);
            if (!selectedMovie) {
                notification.error('KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin phim');
                return;
            }

            // Chuáº©n bá»‹ data theo format backend yÃªu cáº§u
            // Input type="date" tráº£ vá» string "YYYY-MM-DD", Input type="time" tráº£ vá» "HH:mm"
            const showDate = typeof values.date === 'string' ? values.date : dayjs(values.date).format('YYYY-MM-DD');
            const startTime = typeof values.time === 'string' ? `${values.time}:00` : dayjs(values.time).format('HH:mm:ss');

            // TÃ­nh toÃ¡n endTime tá»« startTime + movie duration (phÃºt)
            const durationMinutes = selectedMovie.durationMinutes || 120; // Máº·c Ä‘á»‹nh 120 phÃºt náº¿u khÃ´ng cÃ³
            const startTimeObj = dayjs(`${showDate} ${startTime}`);
            const endTime = startTimeObj.add(durationMinutes, 'minute').format('HH:mm:ss');

            const scheduleData = {
                movieId: values.movieId,
                theaterId: selectedRoom.id, // Äá»•i tá»« roomId sang theaterId
                format: values.format, // Format enum: TWO_D, THREE_D, IMAX, IMAX_3D, FOUR_DX, SCREEN_X
                audioType: values.audioType, // AudioType enum: SUBTITLE, DUBBED, ORIGINAL
                showDate: showDate, // LocalDate
                startTime: startTime, // LocalTime
                endTime: endTime, // LocalTime - tÃ­nh tá»« startTime + duration
                basePrice: values.price, // BigDecimal - Ä‘á»•i tá»« ticketPrice
                status: values.status || 'AVAILABLE' // ShowtimeStatus enum - máº·c Ä‘á»‹nh: CÃ²n vÃ©
            };

            console.log('Submitting schedule data:', scheduleData);

            if (showEditModal) {
                await showtimeService.updateShowtime(selectedSchedule.id, scheduleData);
                notification.success('Cáº­p nháº­t lá»‹ch chiáº¿u thÃ nh cÃ´ng!');
                setShowEditModal(false);
                setFormValues({
                    movieId: '',
                    cinemaId: '',
                    screenName: '',
                    format: 'TWO_D',
                    audioType: 'SUBTITLE',
                    date: '',
                    time: '',
                    price: '',
                    status: 'AVAILABLE'
                });
                setSelectedSchedule(null);
                await loadSchedules(currentPage, pageSize); // Reload trang hiá»‡n táº¡i
            } else {
                await showtimeService.createShowtime(scheduleData);
                notification.success('ThÃªm lá»‹ch chiáº¿u thÃ nh cÃ´ng!');
                setShowAddModal(false);
                setFormValues({
                    movieId: '',
                    cinemaId: '',
                    screenName: '',
                    format: 'TWO_D',
                    audioType: 'SUBTITLE',
                    date: '',
                    time: '',
                    price: '',
                    status: 'AVAILABLE'
                });
                setSelectedSchedule(null);
                setCurrentPage(1); // Reset vá» trang 1 khi thÃªm má»›i
                await loadSchedules(1, pageSize);
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            notification.error(error.response?.data?.message || 'Lá»—i khi lÆ°u lá»‹ch chiáº¿u');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'UPCOMING': return 'cyan';
            case 'AVAILABLE': return 'success';
            case 'ALMOST_FULL': return 'orange';
            case 'FULL': return 'error';
            case 'SALES_ENDED': return 'warning';
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'error';
            case 'POSTPONED': return 'warning';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'UPCOMING': return 'Sáº¯p chiáº¿u';
            case 'AVAILABLE': return 'CÃ²n vÃ©';
            case 'ALMOST_FULL': return 'Sáº¯p háº¿t chá»—';
            case 'FULL': return 'Háº¿t chá»—';
            case 'SALES_ENDED': return 'Dá»«ng bÃ¡n vÃ©';
            case 'COMPLETED': return 'ÄÃ£ káº¿t thÃºc';
            case 'CANCELLED': return 'ÄÃ£ há»§y';
            case 'POSTPONED': return 'Táº¡m hoÃ£n';
            default: return status;
        }
    };

    const getBookingRate = (seatsBooked, totalSeats) => {
        return Math.round((seatsBooked / totalSeats) * 100);
    };

    const getBookingRateColor = (rate) => {
        if (rate >= 80) return 'red';
        if (rate >= 60) return 'orange';
        if (rate >= 40) return 'blue';
        return 'green';
    };

    const getStatusTagColor = (status) => {
        switch (status) {
            case 'UPCOMING': return 'cyan';
            case 'AVAILABLE': return 'success';
            case 'ALMOST_FULL': return 'orange';
            case 'FULL': return 'error';
            case 'SALES_ENDED': return 'warning';
            case 'COMPLETED': return 'default';
            case 'CANCELLED': return 'error';
            case 'POSTPONED': return 'warning';
            default: return 'default';
        }
    };

    const getFormatLabel = (format) => {
        const formatLabels = {
            'TWO_D': '2D',
            'THREE_D': '3D',
            'IMAX': 'IMAX',
            'IMAX_3D': 'IMAX 3D',
            'FOUR_DX': '4DX',
            'SCREEN_X': 'ScreenX'
        };
        return formatLabels[format] || format || 'N/A';
    };

    const getAudioTypeLabel = (audioType) => {
        const audioLabels = {
            'SUBTITLE': 'Phá»¥ Ä‘á»',
            'DUBBED': 'Lá»“ng tiáº¿ng',
            'ORIGINAL': 'NguyÃªn gá»‘c'
        };
        return audioLabels[audioType] || audioType || 'N/A';
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) return 'N/A';
        const start = dayjs(startTime, 'HH:mm:ss');
        const end = dayjs(endTime, 'HH:mm:ss');
        const diffMinutes = end.diff(start, 'minute');
        const hours = Math.floor(diffMinutes / 60);
        const minutes = diffMinutes % 60;
        return `${hours} giá» ${minutes} phÃºt`;
    };

    const renderShowtimeSeatGrid = (showtimeSeatsData) => {
        if (!showtimeSeatsData || showtimeSeatsData.length === 0) return null;

        // Group seats by row
        const seatsByRow = {};
        showtimeSeatsData.forEach(showtimeSeat => {
            const seat = showtimeSeat.seat;
            if (!seat) return;

            const rowLabel = seat.rowLabel;
            if (!seatsByRow[rowLabel]) {
                seatsByRow[rowLabel] = [];
            }
            seatsByRow[rowLabel].push({
                ...seat,
                status: showtimeSeat.status, // AVAILABLE, BOOKED, RESERVED
                price: showtimeSeat.price,
                showtimeSeatId: showtimeSeat.id
            });
        });

        // Sort rows alphabetically
        const sortedRows = Object.keys(seatsByRow).sort();

        return (
            <TooltipProvider>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {sortedRows.map(rowLabel => {
                        const rowSeats = seatsByRow[rowLabel].sort((a, b) =>
                            parseInt(a.seatNumber) - parseInt(b.seatNumber)
                        );

                        return (
                            <div key={rowLabel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Row Label */}
                                <div style={{
                                    width: '30px',
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                    color: '#1890ff'
                                }}>
                                    {rowLabel}
                                </div>

                                {/* Seats in Row */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {rowSeats.map(seat => {
                                        const isBooked = seat.status === 'BOOKED';
                                        const isReserved = seat.status === 'RESERVED';
                                        const isVIP = seat.seatType === 'VIP';
                                        const isCouple = seat.seatType === 'COUPLE';
                                        const isAvailable = seat.status === 'AVAILABLE' && seat.isActive;

                                        let backgroundColor = '#d9d9d9'; // Default - gray
                                        if (!seat.isActive) {
                                            backgroundColor = '#d9d9d9'; // Inactive - gray
                                        } else if (isBooked) {
                                            backgroundColor = '#ff5500'; // Booked - orange/red
                                        } else if (isReserved) {
                                            backgroundColor = '#faad14'; // Reserved - orange
                                        } else if (isAvailable) {
                                            if (isVIP) {
                                                backgroundColor = '#ffd700'; // VIP Available - gold
                                            } else {
                                                backgroundColor = '#52c41a'; // Available - green
                                            }
                                        }

                                        let statusText = 'KhÃ´ng kháº£ dá»¥ng';
                                        if (seat.isActive) {
                                            if (isBooked) statusText = 'ÄÃ£ Ä‘áº·t';
                                            else if (isReserved) statusText = 'Äang giá»¯';
                                            else statusText = 'CÃ²n trá»‘ng';
                                        }

                                        return (
                                            <Tooltip key={seat.id}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        style={{
                                                            width: isCouple ? '50px' : '35px',
                                                            height: '35px',
                                                            backgroundColor,
                                                            borderRadius: '4px',
                                                            border: `2px solid ${isBooked ? '#d4380d' :
                                                                isReserved ? '#d48806' :
                                                                    isVIP && isAvailable ? '#d4b106' :
                                                                        isAvailable ? '#389e0d' :
                                                                            '#bfbfbf'
                                                                }`,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '11px',
                                                            fontWeight: '500',
                                                            color: !seat.isActive ? '#8c8c8c' : '#fff',
                                                            cursor: 'default',
                                                            userSelect: 'none',
                                                            opacity: !seat.isActive ? 0.5 : 1
                                                        }}
                                                    >
                                                        {seat.seatNumber}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="space-y-1">
                                                        <div>Gháº¿: {seat.rowLabel}{seat.seatNumber}</div>
                                                        <div>Loáº¡i: {seat.seatType}</div>
                                                        <div>Tráº¡ng thÃ¡i: {statusText}</div>
                                                        <div>GiÃ¡: {seat.price?.toLocaleString('vi-VN')} VNÄ</div>
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </TooltipProvider>
        );
    };

    const saveSeatLayout = async (seatData) => {
        // SeatManager sáº½ tá»± Ä‘á»™ng lÆ°u, chá»‰ cáº§n Ä‘Ã³ng modal
        notification.success('Cáº­p nháº­t sÆ¡ Ä‘á»“ gháº¿ thÃ nh cÃ´ng');
    };

    // TÃ­nh toÃ¡n thá»‘ng kÃª (hiá»ƒn thá»‹ tá»« trang hiá»‡n táº¡i)
    const stats = {
        totalSchedules: totalElements, // Tá»•ng sá»‘ tá»« backend
        activeSchedules: schedules.filter(s => s.status === 'OPEN_FOR_BOOKING' || s.status === 'ONGOING').length,
        totalRevenue: schedules.reduce((sum, s) => sum + (s.price * s.seatsBooked), 0),
        avgBookingRate: schedules.length > 0 ?
            schedules.reduce((sum, s) => sum + getBookingRate(s.seatsBooked, s.totalSeats), 0) / schedules.length : 0
    };

    // Filter phÃ­a client cho status, dateRange vÃ  searchText
    // Backend API filters are used for movieId and cinemaId in loadSchedules
    const filteredSchedules = schedules.filter(schedule => {
        const movieTitle = getMovieTitle(schedule.movieId).toLowerCase();
        const cinemaName = getCinemaName(schedule.cinemaId).toLowerCase();
        const searchMatch = movieTitle.includes(searchText.toLowerCase()) ||
            cinemaName.includes(searchText.toLowerCase()) ||
            schedule.screenName.toLowerCase().includes(searchText.toLowerCase());

        const movieMatch = movieFilter === 'all' || schedule.movieId === parseInt(movieFilter);
        const cinemaMatch = cinemaFilter === 'all' || schedule.cinemaId === parseInt(cinemaFilter);
        const statusMatch = statusFilter === 'all' || schedule.status === statusFilter;

        // Date range filter
        let dateMatch = true;
        if (dateRange && dateRange.length === 2) {
            const scheduleDate = dayjs(schedule.date);
            dateMatch = scheduleDate.isSameOrAfter(dateRange[0], 'day') &&
                scheduleDate.isSameOrBefore(dateRange[1], 'day');
        }

        return searchMatch && movieMatch && cinemaMatch && statusMatch && dateMatch;
    });

    // Batch operations
    const handleBatchDelete = async () => {
        if (selectedRowKeys.length === 0) {
            notification.warning('Vui lÃ²ng chá»n Ã­t nháº¥t má»™t lá»‹ch chiáº¿u Ä‘á»ƒ xÃ³a');
            return;
        }

        if (window.confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a ${selectedRowKeys.length} lá»‹ch chiáº¿u Ä‘Ã£ chá»n?`)) {
            try {
                await Promise.all(
                    selectedRowKeys.map(id => showtimeService.deleteShowtime(id))
                );
                notification.success(`ÄÃ£ xÃ³a ${selectedRowKeys.length} lá»‹ch chiáº¿u`);
                setSelectedRowKeys([]);
                await loadSchedules();
            } catch (error) {
                console.error('Error batch deleting:', error);
                notification.error('Lá»—i khi xÃ³a hÃ ng loáº¡t');
            }
        }
    };

    const handleBatchStatusChange = async (newStatus) => {
        if (selectedRowKeys.length === 0) {
            notification.warning('Vui lÃ²ng chá»n Ã­t nháº¥t má»™t lá»‹ch chiáº¿u');
            return;
        }

        try {
            await Promise.all(
                selectedRowKeys.map(id => showtimeService.updateShowtimeStatus(id, newStatus))
            );
            notification.success(`ÄÃ£ cáº­p nháº­t tráº¡ng thÃ¡i cho ${selectedRowKeys.length} lá»‹ch chiáº¿u`);
            setSelectedRowKeys([]);
            await loadSchedules();
        } catch (error) {
            console.error('Error batch status update:', error);
            notification.error('Lá»—i khi cáº­p nháº­t tráº¡ng thÃ¡i hÃ ng loáº¡t');
        }
    };

    const handleDuplicate = (schedule) => {
        // Form values will be set via form state
        setShowAddModal(true);
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    const columns = [
        {
            title: 'Phim',
            key: 'movie',
            width: 200,
            fixed: 'left',
            ellipsis: true,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">{record.movieTitle}</span>
                    <div className="flex gap-1">
                        <StatusBadge tone="blue">{getFormatLabel(record.format)}</StatusBadge>
                        {record.audioType && <StatusBadge tone="cyan">{getAudioTypeLabel(record.audioType)}</StatusBadge>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Ráº¡p chiáº¿u',
            key: 'cinema',
            width: 180,
            ellipsis: true,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span>{record.cinemaName}</span>
                    <span className="text-gray-500 text-sm">{record.roomName}</span>
                </div>
            ),
        },
        {
            title: 'NgÃ y & Giá»',
            key: 'datetime',
            width: 150,
            align: 'center',
            // sorter: (a, b) => dayjs(a.showDate + ' ' + a.startTime).unix() - dayjs(b.showDate + ' ' + b.startTime).unix(),
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{dayjs(record.showDate).format('DD/MM/YYYY')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <StatusBadge tone="green">{record.startTime} - {record.endTime}</StatusBadge>
                    </div>
                </div>
            ),
        },
        {
            title: 'GiÃ¡ vÃ©',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'right',
            // sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <span className="font-semibold text-orange-500">
                    {price?.toLocaleString('vi-VN')} VNÄ
                </span>
            ),
        },
        {
            title: 'Äáº·t vÃ©',
            key: 'booking',
            width: 110,
            align: 'center',
            // sorter: (a, b) => getBookingRate(a.seatsBooked, a.totalSeats) - getBookingRate(b.seatsBooked, b.totalSeats),
            render: (_, record) => {
                const rate = getBookingRate(record.seatsBooked, record.totalSeats);
                return (
                    <div className="flex flex-col gap-1">
                        <span>{record.seatsBooked}/{record.totalSeats} gháº¿</span>
                        <StatusBadge tone={getBookingRateColor(rate)}>{rate}%</StatusBadge>
                    </div>
                );
            },
        },
        {
            title: 'Tráº¡ng thÃ¡i',
            key: 'status',
            width: 140,
            align: 'center',
            filters: [
                { text: 'Sáº¯p chiáº¿u', value: 'UPCOMING' },
                { text: 'CÃ²n vÃ©', value: 'AVAILABLE' },
                { text: 'Sáº¯p háº¿t chá»—', value: 'ALMOST_FULL' },
                { text: 'Háº¿t chá»—', value: 'FULL' },
                { text: 'Dá»«ng bÃ¡n vÃ©', value: 'SALES_ENDED' },
                { text: 'ÄÃ£ káº¿t thÃºc', value: 'COMPLETED' },
                { text: 'ÄÃ£ há»§y', value: 'CANCELLED' },
                { text: 'Táº¡m hoÃ£n', value: 'POSTPONED' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (_, record) => {
                const statusConfig = {
                    'UPCOMING': { color: 'cyan', text: 'Sáº¯p chiáº¿u' },
                    'AVAILABLE': { color: 'success', text: 'CÃ²n vÃ©' },
                    'ALMOST_FULL': { color: 'orange', text: 'Sáº¯p háº¿t chá»—' },
                    'FULL': { color: 'error', text: 'Háº¿t chá»—' },
                    'SALES_ENDED': { color: 'warning', text: 'Dá»«ng bÃ¡n vÃ©' },
                    'COMPLETED': { color: 'default', text: 'ÄÃ£ káº¿t thÃºc' },
                    'CANCELLED': { color: 'error', text: 'ÄÃ£ há»§y' },
                    'POSTPONED': { color: 'warning', text: 'Táº¡m hoÃ£n' }
                };
                const config = statusConfig[record.status] || { color: 'default', text: record.status };
                return (
                    <StatusBadge tone={config.color} style={{ fontWeight: 500 }}>
                        {config.text}
                    </StatusBadge>
                );
            },
        },
        {
            title: 'Thao tÃ¡c',
            key: 'actions',
            width: 300,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <TooltipProvider>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewSchedule(record)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem chi tiáº¿t</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewSeats(record)}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Danh sÃ¡ch gháº¿</TooltipContent>
                        </Tooltip>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSchedule(record)}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Sá»­a
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                                if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a lá»‹ch chiáº¿u nÃ y?')) {
                                    handleDeleteSchedule(record.id);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            XÃ³a
                        </Button>
                    </div>
                </TooltipProvider>
            ),
        },
    ];

    return (
        <div className="min-h-screen">
            <div className="">
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
                            title: 'Quáº£n lÃ½ Lá»‹ch chiáº¿u',
                            icon: <Calendar className="h-4 w-4" />
                        }
                    ]}
                />

                {/* Header */}
                <Card className="p-6 bg-white rounded-xl shadow-md border border-gray-200 mb-6">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-gray-900 m-0 text-2xl font-bold">Quáº£n lÃ½ Lá»‹ch chiáº¿u</h2>
                                <p className="text-sm text-gray-500 mt-1">Quáº£n lÃ½ vÃ  theo dÃµi lá»‹ch chiáº¿u phim</p>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleAddSchedule}
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            ThÃªm Lá»‹ch chiáº¿u
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="TÃ¬m kiáº¿m lá»‹ch chiáº¿u..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="rounded-lg pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <DateField
                                mode="range"
                                className="w-full rounded-lg"
                                displayFormat="DD/MM/YYYY"
                                placeholder={['Tá»« ngÃ y', 'Äáº¿n ngÃ y']}
                                value={dateRange}
                                onValueChange={setDateRange}
                            />
                        </div>
                        <div>
                            <Select
                                value={movieFilter || "all"}
                                onValueChange={setMovieFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Lá»c theo phim" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Táº¥t cáº£ phim</SelectItem>
                                    {movies.map(movie => (
                                        <SelectItem key={movie.id} value={movie.id.toString()}>
                                            {movie.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select
                                value={cinemaFilter || "all"}
                                onValueChange={setCinemaFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Lá»c theo ráº¡p" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Táº¥t cáº£ ráº¡p</SelectItem>
                                    {cinemas.map(cinema => (
                                        <SelectItem key={cinema.id} value={cinema.id.toString()}>
                                            {cinema.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Select
                                value={statusFilter || "all"}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Lá»c theo tráº¡ng thÃ¡i" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
                                    <SelectItem value="DRAFT">NhÃ¡p</SelectItem>
                                    <SelectItem value="OPEN_FOR_BOOKING">Má»Ÿ bÃ¡n vÃ©</SelectItem>
                                    <SelectItem value="BOOKING_CLOSED">ÄÃ£ Ä‘Ã³ng Ä‘áº·t vÃ©</SelectItem>
                                    <SelectItem value="ONGOING">Äang chiáº¿u</SelectItem>
                                    <SelectItem value="FINISHED">ÄÃ£ káº¿t thÃºc</SelectItem>
                                    <SelectItem value="CANCELED">ÄÃ£ há»§y</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Filter Info */}
                {(searchText || dateRange || movieFilter !== 'all' || cinemaFilter !== 'all' || statusFilter !== 'all') && (
                    <Alert
                        variant="default"
                        title={
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold">Äang lá»c:</span>
                                {searchText && (
                                    <StatusBadge tone="blue" className="flex items-center gap-1">
                                        Tá»« khÃ³a: {searchText}
                                        <button
                                            onClick={() => setSearchText('')}
                                            className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </StatusBadge>
                                )}
                                {dateRange && (
                                    <StatusBadge tone="cyan" className="flex items-center gap-1">
                                        Tá»« {dayjs(dateRange[0]).format('DD/MM')} Ä‘áº¿n {dayjs(dateRange[1]).format('DD/MM')}
                                        <button
                                            onClick={() => setDateRange(null)}
                                            className="ml-1 hover:bg-cyan-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </StatusBadge>
                                )}
                                {movieFilter !== 'all' && (
                                    <StatusBadge tone="green" className="flex items-center gap-1">
                                        Phim: {getMovieTitle(parseInt(movieFilter))}
                                        <button
                                            onClick={() => setMovieFilter('all')}
                                            className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </StatusBadge>
                                )}
                                {cinemaFilter !== 'all' && (
                                    <StatusBadge tone="orange" className="flex items-center gap-1">
                                        Ráº¡p: {getCinemaName(parseInt(cinemaFilter))}
                                        <button
                                            onClick={() => setCinemaFilter('all')}
                                            className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </StatusBadge>
                                )}
                                {statusFilter !== 'all' && (
                                    <StatusBadge tone="purple" className="flex items-center gap-1">
                                        Tráº¡ng thÃ¡i: {getStatusText(statusFilter)}
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </StatusBadge>
                                )}
                                <span className="text-gray-500">â†’ TÃ¬m tháº¥y {filteredSchedules.length} káº¿t quáº£</span>
                            </div>
                        }
                        onClose={() => {
                            setSearchText('');
                            setDateRange(null);
                            setMovieFilter('all');
                            setCinemaFilter('all');
                            setStatusFilter('all');
                        }}
                        className="mb-4"
                    />
                )}

                {/* Schedules Table */}
                <Card>
                    <div className="p-5">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                            </div>
                        ) : (
                            <DataTable
                                fields={columns}
                                data={filteredSchedules}
                                getRowId="id"
                                pageControls={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: totalElements,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    pageSizeOptions: ['5', '10', '20', '50', '100'],
                                    showTotal: (total, range) => `Hiá»ƒn thá»‹ ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} trong tá»•ng sá»‘ ${total} lá»‹ch chiáº¿u`,
                                    onChange: (page, size) => {
                                        setCurrentPage(page);
                                        if (size !== pageSize) {
                                            setPageSize(size);
                                        }
                                    },
                                    onShowSizeChange: (current, size) => {
                                        setCurrentPage(1);
                                        setPageSize(size);
                                    },
                                }}
                            />
                        )}
                    </div>
                </Card>

                {/* Add Schedule Modal */}
                <ResponsiveDialog
                    heading={
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Plus className="h-5 w-5 text-indigo-600" />
                            </div>
                            <span className="text-xl font-semibold">ThÃªm Lá»‹ch chiáº¿u</span>
                        </div>
                    }
                    open={showAddModal}
                    onClose={() => {
                        setShowAddModal(false);
                        setFormValues({
                            movieId: '',
                            cinemaId: '',
                            screenName: '',
                            format: 'TWO_D',
                            audioType: 'SUBTITLE',
                            date: '',
                            time: '',
                            price: '',
                            status: 'AVAILABLE'
                        });
                        setRooms([]);
                    }}
                    actions={null}
                    maxWidth={900}
                    destroyOnHidden
                    transitionName=""
                    maskTransitionName=""
                    getContainer={false}
                >
                    {(movies.length === 0 || cinemas.length === 0) && (
                        <Alert
                            variant="default"
                            title="Thiáº¿u dá»¯ liá»‡u"
                            description={
                                <div className="space-y-1">
                                    {movies.length === 0 && <div>â€¢ ChÆ°a cÃ³ phim nÃ o. Vui lÃ²ng thÃªm phim trÆ°á»›c.</div>}
                                    {cinemas.length === 0 && <div>â€¢ ChÆ°a cÃ³ ráº¡p nÃ o. Vui lÃ²ng thÃªm ráº¡p trÆ°á»›c.</div>}
                                </div>
                            }
                            className="mb-4 bg-yellow-50 border-yellow-200"
                        />
                    )}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // Validate required fields
                            if (!formValues.movieId) {
                                notification.error('Vui lÃ²ng chá»n phim');
                                return;
                            }
                            if (!formValues.cinemaId) {
                                notification.error('Vui lÃ²ng chá»n ráº¡p');
                                return;
                            }
                            if (!formValues.screenName) {
                                notification.error('Vui lÃ²ng chá»n phÃ²ng chiáº¿u');
                                return;
                            }
                            if (!formValues.format) {
                                notification.error('Vui lÃ²ng chá»n Ä‘á»‹nh dáº¡ng phim');
                                return;
                            }
                            if (!formValues.audioType) {
                                notification.error('Vui lÃ²ng chá»n loáº¡i Ã¢m thanh');
                                return;
                            }
                            if (!formValues.date) {
                                notification.error('Vui lÃ²ng chá»n ngÃ y');
                                return;
                            }
                            if (!formValues.time) {
                                notification.error('Vui lÃ²ng chá»n giá»');
                                return;
                            }
                            if (!formValues.price) {
                                notification.error('Vui lÃ²ng nháº­p giÃ¡ vÃ©');
                                return;
                            }
                            handleSubmit(formValues);
                        }}
                        className="space-y-6 p-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Film className="h-4 w-4 text-gray-500" />
                                    Phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.movieId?.toString()}
                                    onValueChange={(value) => setFormValues({ ...formValues, movieId: parseInt(value) })}
                                    disabled={moviesLoading || movies.length === 0}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder={moviesLoading ? "Äang táº£i..." : movies.length === 0 ? "KhÃ´ng cÃ³ phim" : "Chá»n phim"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {movies.map(movie => (
                                            <SelectItem key={movie.id} value={movie.id.toString()}>
                                                {movie.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Building2 className="h-4 w-4 text-gray-500" />
                                    Ráº¡p chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.cinemaId?.toString()}
                                    onValueChange={(value) => {
                                        setFormValues({ ...formValues, cinemaId: parseInt(value), screenName: '' });
                                        handleCinemaChange(parseInt(value));
                                    }}
                                    disabled={cinemasLoading || cinemas.length === 0}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder={cinemasLoading ? "Äang táº£i..." : cinemas.length === 0 ? "KhÃ´ng cÃ³ ráº¡p" : "Chá»n ráº¡p"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cinemas.map(cinema => (
                                            <SelectItem key={cinema.id} value={cinema.id.toString()}>
                                                {cinema.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Video className="h-4 w-4 text-gray-500" />
                                    PhÃ²ng chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.screenName}
                                    onValueChange={(value) => {
                                        setFormValues({ ...formValues, screenName: value });
                                        handleRoomChange(value);
                                    }}
                                    disabled={roomsLoading || rooms.length === 0}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder={roomsLoading ? "Äang táº£i..." : rooms.length === 0 ? "Chá»n ráº¡p trÆ°á»›c" : "Chá»n phÃ²ng chiáº¿u"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(room => (
                                            <SelectItem key={room.id} value={room.name}>
                                                {room.name} ({room.roomType})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Settings className="h-4 w-4 text-gray-500" />
                                    Äá»‹nh dáº¡ng phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.format}
                                    onValueChange={(value) => setFormValues({ ...formValues, format: value })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Chá»n Ä‘á»‹nh dáº¡ng phim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TWO_D">2D</SelectItem>
                                        <SelectItem value="THREE_D">3D</SelectItem>
                                        <SelectItem value="IMAX">IMAX</SelectItem>
                                        <SelectItem value="IMAX_3D">IMAX 3D</SelectItem>
                                        <SelectItem value="FOUR_DX">4DX</SelectItem>
                                        <SelectItem value="SCREEN_X">ScreenX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <PlayCircle className="h-4 w-4 text-gray-500" />
                                Loáº¡i Ã¢m thanh <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formValues.audioType}
                                onValueChange={(value) => setFormValues({ ...formValues, audioType: value })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Chá»n loáº¡i Ã¢m thanh" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBTITLE">Phá»¥ Ä‘á»</SelectItem>
                                    <SelectItem value="DUBBED">Lá»“ng tiáº¿ng</SelectItem>
                                    <SelectItem value="ORIGINAL">NguyÃªn gá»‘c</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    NgÃ y chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={formValues.date}
                                    onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                                    className="w-full h-10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    Giá» chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="time"
                                    value={formValues.time}
                                    onChange={(e) => setFormValues({ ...formValues, time: e.target.value })}
                                    className="w-full h-10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <DollarSign className="h-4 w-4 text-gray-500" />
                                    GiÃ¡ vÃ© (VNÄ) <span className="text-red-500">*</span>
                                </label>
                                <NumberStepper
                                    value={formValues.price}
                                    onValueChange={(value) => setFormValues({ ...formValues, price: value })}
                                    min={0}
                                    className="w-full h-10"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <PauseCircle className="h-4 w-4 text-gray-500" />
                                Tráº¡ng thÃ¡i
                            </label>
                            <Select
                                value={formValues.status}
                                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UPCOMING">Sáº¯p chiáº¿u</SelectItem>
                                    <SelectItem value="AVAILABLE">CÃ²n vÃ©</SelectItem>
                                    <SelectItem value="ALMOST_FULL">Sáº¯p háº¿t chá»—</SelectItem>
                                    <SelectItem value="FULL">Háº¿t chá»—</SelectItem>
                                    <SelectItem value="SALES_ENDED">Dá»«ng bÃ¡n vÃ©</SelectItem>
                                    <SelectItem value="COMPLETED">ÄÃ£ káº¿t thÃºc</SelectItem>
                                    <SelectItem value="CANCELLED">ÄÃ£ há»§y</SelectItem>
                                    <SelectItem value="POSTPONED">Táº¡m hoÃ£n</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setFormValues({
                                        movieId: '',
                                        cinemaId: '',
                                        screenName: '',
                                        format: 'TWO_D',
                                        audioType: 'SUBTITLE',
                                        date: '',
                                        time: '',
                                        price: '',
                                        status: 'AVAILABLE'
                                    });
                                    setRooms([]);
                                }}
                                className="h-10"
                            >
                                Há»§y
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                                disabled={movies.length === 0 || cinemas.length === 0}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                ThÃªm Lá»‹ch chiáº¿u
                            </Button>
                        </div>
                    </form>
                </ResponsiveDialog>

                {/* Edit Schedule Modal */}
                <ResponsiveDialog
                    heading="Chá»‰nh sá»­a Lá»‹ch chiáº¿u"
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setFormValues({
                            movieId: '',
                            cinemaId: '',
                            screenName: '',
                            format: 'TWO_D',
                            audioType: 'SUBTITLE',
                            date: '',
                            time: '',
                            price: '',
                            status: 'AVAILABLE'
                        });
                        setSelectedSchedule(null);
                        setRooms([]); // Reset danh sÃ¡ch phÃ²ng
                    }}
                    actions={null}
                    maxWidth={800}
                    destroyOnHidden
                    transitionName=""
                    maskTransitionName=""
                    getContainer={false}
                >
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // Validate required fields
                            if (!formValues.movieId) {
                                notification.error('Vui lÃ²ng chá»n phim');
                                return;
                            }
                            if (!formValues.cinemaId) {
                                notification.error('Vui lÃ²ng chá»n ráº¡p');
                                return;
                            }
                            if (!formValues.screenName) {
                                notification.error('Vui lÃ²ng chá»n phÃ²ng chiáº¿u');
                                return;
                            }
                            if (!formValues.format) {
                                notification.error('Vui lÃ²ng chá»n Ä‘á»‹nh dáº¡ng phim');
                                return;
                            }
                            if (!formValues.audioType) {
                                notification.error('Vui lÃ²ng chá»n loáº¡i Ã¢m thanh');
                                return;
                            }
                            if (!formValues.date) {
                                notification.error('Vui lÃ²ng chá»n ngÃ y');
                                return;
                            }
                            if (!formValues.time) {
                                notification.error('Vui lÃ²ng chá»n giá»');
                                return;
                            }
                            if (!formValues.price) {
                                notification.error('Vui lÃ²ng nháº­p giÃ¡ vÃ©');
                                return;
                            }
                            handleSubmit(formValues);
                        }}
                        className="space-y-6 p-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.movieId?.toString()}
                                    onValueChange={(value) => setFormValues({ ...formValues, movieId: parseInt(value) })}
                                    disabled={moviesLoading || movies.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={moviesLoading ? "Äang táº£i..." : movies.length === 0 ? "KhÃ´ng cÃ³ phim" : "Chá»n phim"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {movies.map(movie => (
                                            <SelectItem key={movie.id} value={movie.id.toString()}>
                                                {movie.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ráº¡p chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.cinemaId?.toString()}
                                    onValueChange={(value) => {
                                        setFormValues({ ...formValues, cinemaId: parseInt(value), screenName: '' });
                                        handleCinemaChange(parseInt(value));
                                    }}
                                    disabled={cinemasLoading || cinemas.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={cinemasLoading ? "Äang táº£i..." : cinemas.length === 0 ? "KhÃ´ng cÃ³ ráº¡p" : "Chá»n ráº¡p"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cinemas.map(cinema => (
                                            <SelectItem key={cinema.id} value={cinema.id.toString()}>
                                                {cinema.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    PhÃ²ng chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.screenName}
                                    onValueChange={(value) => {
                                        setFormValues({ ...formValues, screenName: value });
                                        handleRoomChange(value);
                                    }}
                                    disabled={roomsLoading || rooms.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={roomsLoading ? "Äang táº£i..." : rooms.length === 0 ? "Chá»n ráº¡p trÆ°á»›c" : "Chá»n phÃ²ng chiáº¿u"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map(room => (
                                            <SelectItem key={room.id} value={room.name}>
                                                {room.name} ({room.roomType})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Äá»‹nh dáº¡ng phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.format}
                                    onValueChange={(value) => setFormValues({ ...formValues, format: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chá»n Ä‘á»‹nh dáº¡ng phim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TWO_D">2D</SelectItem>
                                        <SelectItem value="THREE_D">3D</SelectItem>
                                        <SelectItem value="IMAX">IMAX</SelectItem>
                                        <SelectItem value="IMAX_3D">IMAX 3D</SelectItem>
                                        <SelectItem value="FOUR_DX">4DX</SelectItem>
                                        <SelectItem value="SCREEN_X">ScreenX</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loáº¡i Ã¢m thanh <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formValues.audioType}
                                onValueChange={(value) => setFormValues({ ...formValues, audioType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chá»n loáº¡i Ã¢m thanh" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBTITLE">Phá»¥ Ä‘á»</SelectItem>
                                    <SelectItem value="DUBBED">Lá»“ng tiáº¿ng</SelectItem>
                                    <SelectItem value="ORIGINAL">NguyÃªn gá»‘c</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    NgÃ y chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="date"
                                    value={formValues.date}
                                    onChange={(e) => setFormValues({ ...formValues, date: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Giá» chiáº¿u <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="time"
                                    value={formValues.time}
                                    onChange={(e) => setFormValues({ ...formValues, time: e.target.value })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    GiÃ¡ vÃ© (VNÄ) <span className="text-red-500">*</span>
                                </label>
                                <NumberStepper
                                    value={formValues.price}
                                    onValueChange={(value) => setFormValues({ ...formValues, price: value })}
                                    min={0}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tráº¡ng thÃ¡i
                            </label>
                            <Select
                                value={formValues.status}
                                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UPCOMING">Sáº¯p chiáº¿u</SelectItem>
                                    <SelectItem value="AVAILABLE">CÃ²n vÃ©</SelectItem>
                                    <SelectItem value="ALMOST_FULL">Sáº¯p háº¿t chá»—</SelectItem>
                                    <SelectItem value="FULL">Háº¿t chá»—</SelectItem>
                                    <SelectItem value="SALES_ENDED">Dá»«ng bÃ¡n vÃ©</SelectItem>
                                    <SelectItem value="COMPLETED">ÄÃ£ káº¿t thÃºc</SelectItem>
                                    <SelectItem value="CANCELLED">ÄÃ£ há»§y</SelectItem>
                                    <SelectItem value="POSTPONED">Táº¡m hoÃ£n</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setFormValues({
                                        movieId: '',
                                        cinemaId: '',
                                        screenName: '',
                                        format: 'TWO_D',
                                        audioType: 'SUBTITLE',
                                        date: '',
                                        time: '',
                                        price: '',
                                        status: 'AVAILABLE'
                                    });
                                    setSelectedSchedule(null);
                                    setRooms([]);
                                }}
                            >
                                Há»§y
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Cáº­p nháº­t
                            </Button>
                        </div>
                    </form>
                </ResponsiveDialog>

                {/* Detail Modal */}
                <ResponsiveDialog
                    heading="Chi tiáº¿t Lá»‹ch chiáº¿u"
                    open={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedSchedule(null);
                    }}
                    actions={
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedSchedule(null);
                                }}
                            >
                                ÄÃ³ng
                            </Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleEditSchedule(selectedSchedule);
                                }}
                            >
                                Chá»‰nh sá»­a
                            </Button>
                        </div>
                    }
                    maxWidth={800}
                >
                    {selectedSchedule && (
                        <div className="space-y-6">
                            {/* Header Info */}
                            <Alert
                                variant="default"
                                title={
                                    <div className="flex items-center gap-2">
                                        <Film className="h-5 w-5" />
                                        <span className="font-semibold">{selectedSchedule.movieTitle}</span>
                                    </div>
                                }
                                description={
                                    <div className="flex flex-col gap-2 mt-2">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-gray-500" />
                                            <span>{selectedSchedule.cinemaName} - {selectedSchedule.roomName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{dayjs(selectedSchedule.showDate).format('DD/MM/YYYY')}</span>
                                            <span className="mx-2">|</span>
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span>{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                                        </div>
                                    </div>
                                }
                                className="mb-6"
                            />

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Movie & Cinema Info */}
                                <Card className="p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">ThÃ´ng tin cÆ¡ báº£n</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Phim:</p>
                                            <p className="font-semibold text-gray-900">{selectedSchedule.movieTitle}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Ráº¡p chiáº¿u:</p>
                                            <p className="font-semibold text-gray-900">{selectedSchedule.cinemaName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">PhÃ²ng chiáº¿u:</p>
                                            <p className="font-semibold text-gray-900">{selectedSchedule.roomName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Äá»‹nh dáº¡ng phim:</p>
                                            <div className="flex gap-2">
                                                <StatusBadge tone="blue">{getFormatLabel(selectedSchedule.format)}</StatusBadge>
                                                {selectedSchedule.audioType && <StatusBadge tone="cyan">{getAudioTypeLabel(selectedSchedule.audioType)}</StatusBadge>}
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Showtime Info */}
                                    <Card className="p-4 border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4">ThÃ´ng tin chiáº¿u phim</h4>
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">NgÃ y chiáº¿u:</p>
                                                <StatusBadge tone="cyan">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {dayjs(selectedSchedule.showDate).format('DD/MM/YYYY')}
                                                </StatusBadge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Giá» chiáº¿u:</p>
                                                <StatusBadge tone="green">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {selectedSchedule.startTime} - {selectedSchedule.endTime}
                                                </StatusBadge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Thá»i lÆ°á»£ng:</p>
                                                <p className="font-semibold text-gray-900">{calculateDuration(selectedSchedule.startTime, selectedSchedule.endTime)}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Pricing & Status */}
                                    <Card className="p-4 border border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4">GiÃ¡ vÃ© & Tráº¡ng thÃ¡i</h4>
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">GiÃ¡ vÃ©:</p>
                                                <p className="font-semibold text-lg text-orange-500">
                                                    {selectedSchedule.price?.toLocaleString('vi-VN')} VNÄ
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Tráº¡ng thÃ¡i:</p>
                                                <StatusBadge
                                                    tone={getStatusTagColor(selectedSchedule.status)}
                                                    className="text-sm px-3 py-1"
                                                >
                                                    {getStatusText(selectedSchedule.status)}
                                                </StatusBadge>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Booking Metrics */}
                                <Card className="p-4 border border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4">Thá»‘ng kÃª Ä‘áº·t vÃ©</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Metric
                                                label="Tá»•ng sá»‘ gháº¿"
                                                value={selectedSchedule.totalSeats}
                                                leading={<Users className="h-4 w-4" />}
                                            />
                                        </div>
                                        <div>
                                            <Metric
                                                label="ÄÃ£ Ä‘áº·t"
                                                value={selectedSchedule.seatsBooked}
                                                valueCss={{ color: '#3f8600' }}
                                                leading={<Users className="h-4 w-4" />}
                                            />
                                        </div>
                                        <div>
                                            <Metric
                                                label="Tá»· lá»‡ Ä‘áº·t vÃ©"
                                                value={getBookingRate(selectedSchedule.seatsBooked, selectedSchedule.totalSeats)}
                                                trailing="%"
                                                valueCss={{
                                                    color: getBookingRate(selectedSchedule.seatsBooked, selectedSchedule.totalSeats) > 70 ? '#cf1322' : '#3f8600'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </ResponsiveDialog>

            </div>
        </div>
    );
};

export default Schedules;
