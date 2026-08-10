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
    const [rooms, setRooms] = useState([]); // Danh sách phòng chiếu
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

    // Auto-fill form khi mở edit modal và đã có rooms
    useEffect(() => {
        console.log('useEffect triggered:', {
            showEditModal,
            hasSelectedSchedule: !!selectedSchedule,
            roomsCount: rooms.length,
            selectedSchedule
        });

        if (showEditModal && selectedSchedule) {
            // Tìm movieId và cinemaId từ danh sách
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

            // Format date và time cho Input type="date" và type="time"
            // Input type="date" cần format "YYYY-MM-DD", Input type="time" cần format "HH:mm"
            const formattedDate = selectedSchedule.showDate
                ? (typeof selectedSchedule.showDate === 'string'
                    ? selectedSchedule.showDate.split('T')[0]
                    : dayjs(selectedSchedule.showDate).format('YYYY-MM-DD'))
                : null;
            const formattedTime = selectedSchedule.startTime
                ? (typeof selectedSchedule.startTime === 'string'
                    ? selectedSchedule.startTime.substring(0, 5) // Lấy "HH:mm" từ "HH:mm:ss"
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

    // Reload khi currentPage hoặc pageSize thay đổi
    useEffect(() => {
        if (currentPage !== 1 || pageSize !== 10) {
            loadSchedules(currentPage, pageSize);
        }
    }, [currentPage, pageSize]);

    // Reset về trang 1 khi filter thay đổi
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
                // Call API với tham số phân trang (page bắt đầu từ 0)
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
            notification.error('Lỗi khi tải lịch chiếu');
        } finally {
            setLoading(false);
        }
    };

    const loadMovies = async () => {
        try {
            setMoviesLoading(true);
            // Lấy danh sách phim đang chiếu (Now Showing)
            const response = await movieService.getNowShowing();
            console.log('Now Showing Movies API response:', response);

            // Xử lý response - có thể là pagination hoặc array trực tiếp
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
                notification.warning('Không có phim đang chiếu nào. Vui lòng thêm phim đang chiếu trước.');
            }
        } catch (error) {
            console.error('Error loading now showing movies:', error);
            notification.error('Lỗi khi tải danh sách phim đang chiếu: ' + (error.response?.data?.message || error.message));
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

            // Xử lý response - có thể là pagination hoặc array trực tiếp
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
                notification.warning('Không có rạp nào đang hoạt động. Vui lòng thêm rạp trước.');
            }
        } catch (error) {
            console.error('Error loading cinemas:', error);
            notification.error('Lỗi khi tải danh sách rạp: ' + (error.response?.data?.message || error.message));
            setCinemas([]);
        } finally {
            setCinemasLoading(false);
        }
    };

    // Load danh sách phòng chiếu khi chọn rạp
    const loadRoomsByCinema = async (cinemaId) => {
        if (!cinemaId) {
            setRooms([]);
            return;
        }

        try {
            setRoomsLoading(true);
            const response = await cinemaService.getRoomsByCinemaId(cinemaId);
            console.log('Rooms API response:', response);

            // Xử lý response
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
                notification.warning('Rạp này chưa có phòng chiếu nào.');
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            notification.error('Lỗi khi tải danh sách phòng chiếu: ' + (error.response?.data?.message || error.message));
            setRooms([]);
        } finally {
            setRoomsLoading(false);
        }
    };

    // Xử lý khi thay đổi rạp
    const handleCinemaChange = (cinemaId) => {
        // Reset phòng chiếu đã chọn
        // Form values will be reset via form state
        // Load danh sách phòng của rạp mới
        loadRoomsByCinema(cinemaId);
    };

    // Xử lý khi thay đổi phòng chiếu
    const handleRoomChange = (roomName) => {
        // Tìm thông tin phòng đã chọn
        const selectedRoom = rooms.find(r => r.name === roomName);
        if (selectedRoom) {
            // Lưu roomId để submit (không tự động set format nữa)
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

            // Tìm cinemaId từ cinemaName
            const cinema = cinemas.find(c => c.name === schedule.cinemaName);

            // Load phòng chiếu của rạp đã chọn
            if (cinema?.id) {
                console.log('Loading rooms for cinema:', cinema.id);
                await loadRoomsByCinema(cinema.id);
            }

            // Mở modal - useEffect sẽ tự động set form values
            console.log('Opening edit modal...');
            setShowEditModal(true);
        } catch (error) {
            console.error('Error in handleEditSchedule:', error);
            notification.error('Lỗi khi tải thông tin lịch chiếu');
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
            notification.success('Xóa lịch chiếu thành công!');
            // Reload trang hiện tại, nếu trang hiện tại không còn dữ liệu thì về trang 1
            await loadSchedules(currentPage, pageSize);
        } catch (error) {
            console.error('Error deleting schedule:', error);
            notification.error('Lỗi khi xóa lịch chiếu');
        }
    };

    const handleStatusChange = async (scheduleId, newStatus) => {
        try {
            await showtimeService.updateShowtimeStatus(scheduleId, newStatus);
            const statusTextMap = {
                'UPCOMING': 'sắp chiếu',
                'AVAILABLE': 'còn vé',
                'ALMOST_FULL': 'sắp hết chỗ',
                'FULL': 'hết chỗ',
                'SALES_ENDED': 'dừng bán vé',
                'COMPLETED': 'đã kết thúc',
                'CANCELLED': 'hủy',
                'POSTPONED': 'tạm hoãn'
            };
            const statusText = statusTextMap[newStatus] || 'cập nhật';
            notification.success(`Đã ${statusText} lịch chiếu!`);
            await loadSchedules();
        } catch (error) {
            console.error('Error updating status:', error);
            notification.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleSubmit = async (values) => {
        try {
            // Tìm theaterId từ screenName đã chọn
            const selectedRoom = rooms.find(r => r.name === values.screenName);
            if (!selectedRoom) {
                notification.error('Không tìm thấy thông tin phòng chiếu');
                return;
            }

            // Tìm movie để lấy durationMinutes
            const selectedMovie = movies.find(m => m.id === values.movieId);
            if (!selectedMovie) {
                notification.error('Không tìm thấy thông tin phim');
                return;
            }

            // Chuẩn bị data theo format backend yêu cầu
            // Input type="date" trả về string "YYYY-MM-DD", Input type="time" trả về "HH:mm"
            const showDate = typeof values.date === 'string' ? values.date : dayjs(values.date).format('YYYY-MM-DD');
            const startTime = typeof values.time === 'string' ? `${values.time}:00` : dayjs(values.time).format('HH:mm:ss');

            // Tính toán endTime từ startTime + movie duration (phút)
            const durationMinutes = selectedMovie.durationMinutes || 120; // Mặc định 120 phút nếu không có
            const startTimeObj = dayjs(`${showDate} ${startTime}`);
            const endTime = startTimeObj.add(durationMinutes, 'minute').format('HH:mm:ss');

            const scheduleData = {
                movieId: values.movieId,
                theaterId: selectedRoom.id, // Đổi từ roomId sang theaterId
                format: values.format, // Format enum: TWO_D, THREE_D, IMAX, IMAX_3D, FOUR_DX, SCREEN_X
                audioType: values.audioType, // AudioType enum: SUBTITLE, DUBBED, ORIGINAL
                showDate: showDate, // LocalDate
                startTime: startTime, // LocalTime
                endTime: endTime, // LocalTime - tính từ startTime + duration
                basePrice: values.price, // BigDecimal - đổi từ ticketPrice
                status: values.status || 'AVAILABLE' // ShowtimeStatus enum - mặc định: Còn vé
            };

            console.log('Submitting schedule data:', scheduleData);

            if (showEditModal) {
                await showtimeService.updateShowtime(selectedSchedule.id, scheduleData);
                notification.success('Cập nhật lịch chiếu thành công!');
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
                await loadSchedules(currentPage, pageSize); // Reload trang hiện tại
            } else {
                await showtimeService.createShowtime(scheduleData);
                notification.success('Thêm lịch chiếu thành công!');
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
                setCurrentPage(1); // Reset về trang 1 khi thêm mới
                await loadSchedules(1, pageSize);
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            notification.error(error.response?.data?.message || 'Lỗi khi lưu lịch chiếu');
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
            case 'UPCOMING': return 'Sắp chiếu';
            case 'AVAILABLE': return 'Còn vé';
            case 'ALMOST_FULL': return 'Sắp hết chỗ';
            case 'FULL': return 'Hết chỗ';
            case 'SALES_ENDED': return 'Dừng bán vé';
            case 'COMPLETED': return 'Đã kết thúc';
            case 'CANCELLED': return 'Đã hủy';
            case 'POSTPONED': return 'Tạm hoãn';
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
            'SUBTITLE': 'Phụ đề',
            'DUBBED': 'Lồng tiếng',
            'ORIGINAL': 'Nguyên gốc'
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
        return `${hours} giờ ${minutes} phút`;
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

                                        let statusText = 'Không khả dụng';
                                        if (seat.isActive) {
                                            if (isBooked) statusText = 'Đã đặt';
                                            else if (isReserved) statusText = 'Đang giữ';
                                            else statusText = 'Còn trống';
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
                                                        <div>Ghế: {seat.rowLabel}{seat.seatNumber}</div>
                                                        <div>Loại: {seat.seatType}</div>
                                                        <div>Trạng thái: {statusText}</div>
                                                        <div>Giá: {seat.price?.toLocaleString('vi-VN')} VNĐ</div>
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
        // SeatManager sẽ tự động lưu, chỉ cần đóng modal
        notification.success('Cập nhật sơ đồ ghế thành công');
    };

    // Tính toán thống kê (hiển thị từ trang hiện tại)
    const stats = {
        totalSchedules: totalElements, // Tổng số từ backend
        activeSchedules: schedules.filter(s => s.status === 'OPEN_FOR_BOOKING' || s.status === 'ONGOING').length,
        totalRevenue: schedules.reduce((sum, s) => sum + (s.price * s.seatsBooked), 0),
        avgBookingRate: schedules.length > 0 ?
            schedules.reduce((sum, s) => sum + getBookingRate(s.seatsBooked, s.totalSeats), 0) / schedules.length : 0
    };

    // Filter phía client cho status, dateRange và searchText
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
            notification.warning('Vui lòng chọn ít nhất một lịch chiếu để xóa');
            return;
        }

        if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} lịch chiếu đã chọn?`)) {
            try {
                await Promise.all(
                    selectedRowKeys.map(id => showtimeService.deleteShowtime(id))
                );
                notification.success(`Đã xóa ${selectedRowKeys.length} lịch chiếu`);
                setSelectedRowKeys([]);
                await loadSchedules();
            } catch (error) {
                console.error('Error batch deleting:', error);
                notification.error('Lỗi khi xóa hàng loạt');
            }
        }
    };

    const handleBatchStatusChange = async (newStatus) => {
        if (selectedRowKeys.length === 0) {
            notification.warning('Vui lòng chọn ít nhất một lịch chiếu');
            return;
        }

        try {
            await Promise.all(
                selectedRowKeys.map(id => showtimeService.updateShowtimeStatus(id, newStatus))
            );
            notification.success(`Đã cập nhật trạng thái cho ${selectedRowKeys.length} lịch chiếu`);
            setSelectedRowKeys([]);
            await loadSchedules();
        } catch (error) {
            console.error('Error batch status update:', error);
            notification.error('Lỗi khi cập nhật trạng thái hàng loạt');
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
            title: 'Rạp chiếu',
            key: 'cinema',
            width: 180,
            ellipsis: true,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <span>{record.cinemaName}</span>
                    <span className="text-muted-foreground text-sm">{record.roomName}</span>
                </div>
            ),
        },
        {
            title: 'Ngày & Giờ',
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
            title: 'Giá vé',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            align: 'right',
            // sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <span className="font-semibold text-orange-500">
                    {price?.toLocaleString('vi-VN')} VNĐ
                </span>
            ),
        },
        {
            title: 'Đặt vé',
            key: 'booking',
            width: 110,
            align: 'center',
            // sorter: (a, b) => getBookingRate(a.seatsBooked, a.totalSeats) - getBookingRate(b.seatsBooked, b.totalSeats),
            render: (_, record) => {
                const rate = getBookingRate(record.seatsBooked, record.totalSeats);
                return (
                    <div className="flex flex-col gap-1">
                        <span>{record.seatsBooked}/{record.totalSeats} ghế</span>
                        <StatusBadge tone={getBookingRateColor(rate)}>{rate}%</StatusBadge>
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 140,
            align: 'center',
            filters: [
                { text: 'Sắp chiếu', value: 'UPCOMING' },
                { text: 'Còn vé', value: 'AVAILABLE' },
                { text: 'Sắp hết chỗ', value: 'ALMOST_FULL' },
                { text: 'Hết chỗ', value: 'FULL' },
                { text: 'Dừng bán vé', value: 'SALES_ENDED' },
                { text: 'Đã kết thúc', value: 'COMPLETED' },
                { text: 'Đã hủy', value: 'CANCELLED' },
                { text: 'Tạm hoãn', value: 'POSTPONED' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (_, record) => {
                const statusConfig = {
                    'UPCOMING': { color: 'cyan', text: 'Sắp chiếu' },
                    'AVAILABLE': { color: 'success', text: 'Còn vé' },
                    'ALMOST_FULL': { color: 'orange', text: 'Sắp hết chỗ' },
                    'FULL': { color: 'error', text: 'Hết chỗ' },
                    'SALES_ENDED': { color: 'warning', text: 'Dừng bán vé' },
                    'COMPLETED': { color: 'default', text: 'Đã kết thúc' },
                    'CANCELLED': { color: 'error', text: 'Đã hủy' },
                    'POSTPONED': { color: 'warning', text: 'Tạm hoãn' }
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
            title: 'Thao tác',
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
                            <TooltipContent>Xem chi tiết</TooltipContent>
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
                            <TooltipContent>Danh sách ghế</TooltipContent>
                        </Tooltip>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSchedule(record)}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => {
                                if (window.confirm('Bạn có chắc chắn muốn xóa lịch chiếu này?')) {
                                    handleDeleteSchedule(record.id);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
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
                            title: 'Quản lý Lịch chiếu',
                            icon: <Calendar className="h-4 w-4" />
                        }
                    ]}
                />

                {/* Header */}
                <Card className="p-6 bg-card rounded-xl shadow-md border border-border mb-6">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Calendar className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-foreground m-0 text-2xl font-bold">Quản lý Lịch chiếu</h2>
                                <p className="text-sm text-muted-foreground mt-1">Quản lý và theo dõi lịch chiếu phim</p>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleAddSchedule}
                            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm Lịch chiếu
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm lịch chiếu..."
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
                                placeholder={['Từ ngày', 'Đến ngày']}
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
                                    <SelectValue placeholder="Lọc theo phim" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả phim</SelectItem>
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
                                    <SelectValue placeholder="Lọc theo rạp" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả rạp</SelectItem>
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
                                    <SelectValue placeholder="Lọc theo trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="DRAFT">Nháp</SelectItem>
                                    <SelectItem value="OPEN_FOR_BOOKING">Mở bán vé</SelectItem>
                                    <SelectItem value="BOOKING_CLOSED">Đã đóng đặt vé</SelectItem>
                                    <SelectItem value="ONGOING">Đang chiếu</SelectItem>
                                    <SelectItem value="FINISHED">Đã kết thúc</SelectItem>
                                    <SelectItem value="CANCELED">Đã hủy</SelectItem>
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
                                <span className="font-semibold">Đang lọc:</span>
                                {searchText && (
                                    <StatusBadge tone="blue" className="flex items-center gap-1">
                                        Từ khóa: {searchText}
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
                                        Từ {dayjs(dateRange[0]).format('DD/MM')} đến {dayjs(dateRange[1]).format('DD/MM')}
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
                                        Rạp: {getCinemaName(parseInt(cinemaFilter))}
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
                                        Trạng thái: {getStatusText(statusFilter)}
                                        <button
                                            onClick={() => setStatusFilter('all')}
                                            className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </StatusBadge>
                                )}
                                <span className="text-muted-foreground">→ Tìm thấy {filteredSchedules.length} kết quả</span>
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
                                    showTotal: (total, range) => `Hiển thị ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} trong tổng số ${total} lịch chiếu`,
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
                            <span className="text-xl font-semibold">Thêm Lịch chiếu</span>
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
                            title="Thiếu dữ liệu"
                            description={
                                <div className="space-y-1">
                                    {movies.length === 0 && <div>• Chưa có phim nào. Vui lòng thêm phim trước.</div>}
                                    {cinemas.length === 0 && <div>• Chưa có rạp nào. Vui lòng thêm rạp trước.</div>}
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
                                notification.error('Vui lòng chọn phim');
                                return;
                            }
                            if (!formValues.cinemaId) {
                                notification.error('Vui lòng chọn rạp');
                                return;
                            }
                            if (!formValues.screenName) {
                                notification.error('Vui lòng chọn phòng chiếu');
                                return;
                            }
                            if (!formValues.format) {
                                notification.error('Vui lòng chọn định dạng phim');
                                return;
                            }
                            if (!formValues.audioType) {
                                notification.error('Vui lòng chọn loại âm thanh');
                                return;
                            }
                            if (!formValues.date) {
                                notification.error('Vui lòng chọn ngày');
                                return;
                            }
                            if (!formValues.time) {
                                notification.error('Vui lòng chọn giờ');
                                return;
                            }
                            if (!formValues.price) {
                                notification.error('Vui lòng nhập giá vé');
                                return;
                            }
                            handleSubmit(formValues);
                        }}
                        className="space-y-6 p-4"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Film className="h-4 w-4 text-muted-foreground" />
                                    Phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.movieId?.toString()}
                                    onValueChange={(value) => setFormValues({ ...formValues, movieId: parseInt(value) })}
                                    disabled={moviesLoading || movies.length === 0}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder={moviesLoading ? "Đang tải..." : movies.length === 0 ? "Không có phim" : "Chọn phim"} />
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
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    Rạp chiếu <span className="text-red-500">*</span>
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
                                        <SelectValue placeholder={cinemasLoading ? "Đang tải..." : cinemas.length === 0 ? "Không có rạp" : "Chọn rạp"} />
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
                                    <Video className="h-4 w-4 text-muted-foreground" />
                                    Phòng chiếu <span className="text-red-500">*</span>
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
                                        <SelectValue placeholder={roomsLoading ? "Đang tải..." : rooms.length === 0 ? "Chọn rạp trước" : "Chọn phòng chiếu"} />
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
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    Định dạng phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.format}
                                    onValueChange={(value) => setFormValues({ ...formValues, format: value })}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Chọn định dạng phim" />
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
                                <PlayCircle className="h-4 w-4 text-muted-foreground" />
                                Loại âm thanh <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formValues.audioType}
                                onValueChange={(value) => setFormValues({ ...formValues, audioType: value })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Chọn loại âm thanh" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBTITLE">Phụ đề</SelectItem>
                                    <SelectItem value="DUBBED">Lồng tiếng</SelectItem>
                                    <SelectItem value="ORIGINAL">Nguyên gốc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Ngày chiếu <span className="text-red-500">*</span>
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
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    Giờ chiếu <span className="text-red-500">*</span>
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
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    Giá vé (VNĐ) <span className="text-red-500">*</span>
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
                                <PauseCircle className="h-4 w-4 text-muted-foreground" />
                                Trạng thái
                            </label>
                            <Select
                                value={formValues.status}
                                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
                            >
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UPCOMING">Sắp chiếu</SelectItem>
                                    <SelectItem value="AVAILABLE">Còn vé</SelectItem>
                                    <SelectItem value="ALMOST_FULL">Sắp hết chỗ</SelectItem>
                                    <SelectItem value="FULL">Hết chỗ</SelectItem>
                                    <SelectItem value="SALES_ENDED">Dừng bán vé</SelectItem>
                                    <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                    <SelectItem value="POSTPONED">Tạm hoãn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
                                disabled={movies.length === 0 || cinemas.length === 0}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm Lịch chiếu
                            </Button>
                        </div>
                    </form>
                </ResponsiveDialog>

                {/* Edit Schedule Modal */}
                <ResponsiveDialog
                    heading="Chỉnh sửa Lịch chiếu"
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
                        setRooms([]); // Reset danh sách phòng
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
                                notification.error('Vui lòng chọn phim');
                                return;
                            }
                            if (!formValues.cinemaId) {
                                notification.error('Vui lòng chọn rạp');
                                return;
                            }
                            if (!formValues.screenName) {
                                notification.error('Vui lòng chọn phòng chiếu');
                                return;
                            }
                            if (!formValues.format) {
                                notification.error('Vui lòng chọn định dạng phim');
                                return;
                            }
                            if (!formValues.audioType) {
                                notification.error('Vui lòng chọn loại âm thanh');
                                return;
                            }
                            if (!formValues.date) {
                                notification.error('Vui lòng chọn ngày');
                                return;
                            }
                            if (!formValues.time) {
                                notification.error('Vui lòng chọn giờ');
                                return;
                            }
                            if (!formValues.price) {
                                notification.error('Vui lòng nhập giá vé');
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
                                        <SelectValue placeholder={moviesLoading ? "Đang tải..." : movies.length === 0 ? "Không có phim" : "Chọn phim"} />
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
                                    Rạp chiếu <span className="text-red-500">*</span>
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
                                        <SelectValue placeholder={cinemasLoading ? "Đang tải..." : cinemas.length === 0 ? "Không có rạp" : "Chọn rạp"} />
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
                                    Phòng chiếu <span className="text-red-500">*</span>
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
                                        <SelectValue placeholder={roomsLoading ? "Đang tải..." : rooms.length === 0 ? "Chọn rạp trước" : "Chọn phòng chiếu"} />
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
                                    Định dạng phim <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={formValues.format}
                                    onValueChange={(value) => setFormValues({ ...formValues, format: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn định dạng phim" />
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
                                Loại âm thanh <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formValues.audioType}
                                onValueChange={(value) => setFormValues({ ...formValues, audioType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn loại âm thanh" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SUBTITLE">Phụ đề</SelectItem>
                                    <SelectItem value="DUBBED">Lồng tiếng</SelectItem>
                                    <SelectItem value="ORIGINAL">Nguyên gốc</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngày chiếu <span className="text-red-500">*</span>
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
                                    Giờ chiếu <span className="text-red-500">*</span>
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
                                    Giá vé (VNĐ) <span className="text-red-500">*</span>
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
                                Trạng thái
                            </label>
                            <Select
                                value={formValues.status}
                                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UPCOMING">Sắp chiếu</SelectItem>
                                    <SelectItem value="AVAILABLE">Còn vé</SelectItem>
                                    <SelectItem value="ALMOST_FULL">Sắp hết chỗ</SelectItem>
                                    <SelectItem value="FULL">Hết chỗ</SelectItem>
                                    <SelectItem value="SALES_ENDED">Dừng bán vé</SelectItem>
                                    <SelectItem value="COMPLETED">Đã kết thúc</SelectItem>
                                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                    <SelectItem value="POSTPONED">Tạm hoãn</SelectItem>
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
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Cập nhật
                            </Button>
                        </div>
                    </form>
                </ResponsiveDialog>

                {/* Detail Modal */}
                <ResponsiveDialog
                    heading="Chi tiết Lịch chiếu"
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
                                Đóng
                            </Button>
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleEditSchedule(selectedSchedule);
                                }}
                            >
                                Chỉnh sửa
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
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedSchedule.cinemaName} - {selectedSchedule.roomName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>{dayjs(selectedSchedule.showDate).format('DD/MM/YYYY')}</span>
                                            <span className="mx-2">|</span>
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{selectedSchedule.startTime} - {selectedSchedule.endTime}</span>
                                        </div>
                                    </div>
                                }
                                className="mb-6"
                            />

                            {/* Main Info Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {/* Movie & Cinema Info */}
                                <Card className="p-4 border border-border">
                                    <h4 className="font-semibold text-foreground mb-4">Thông tin cơ bản</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Phim:</p>
                                            <p className="font-semibold text-foreground">{selectedSchedule.movieTitle}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Rạp chiếu:</p>
                                            <p className="font-semibold text-foreground">{selectedSchedule.cinemaName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Phòng chiếu:</p>
                                            <p className="font-semibold text-foreground">{selectedSchedule.roomName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Định dạng phim:</p>
                                            <div className="flex gap-2">
                                                <StatusBadge tone="blue">{getFormatLabel(selectedSchedule.format)}</StatusBadge>
                                                {selectedSchedule.audioType && <StatusBadge tone="cyan">{getAudioTypeLabel(selectedSchedule.audioType)}</StatusBadge>}
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Showtime Info */}
                                    <Card className="p-4 border border-border">
                                        <h4 className="font-semibold text-foreground mb-4">Thông tin chiếu phim</h4>
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Ngày chiếu:</p>
                                                <StatusBadge tone="cyan">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {dayjs(selectedSchedule.showDate).format('DD/MM/YYYY')}
                                                </StatusBadge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Giờ chiếu:</p>
                                                <StatusBadge tone="green">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {selectedSchedule.startTime} - {selectedSchedule.endTime}
                                                </StatusBadge>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Thời lượng:</p>
                                                <p className="font-semibold text-foreground">{calculateDuration(selectedSchedule.startTime, selectedSchedule.endTime)}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Pricing & Status */}
                                    <Card className="p-4 border border-border">
                                        <h4 className="font-semibold text-foreground mb-4">Giá vé & Trạng thái</h4>
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Giá vé:</p>
                                                <p className="font-semibold text-lg text-orange-500">
                                                    {selectedSchedule.price?.toLocaleString('vi-VN')} VNĐ
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Trạng thái:</p>
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
                                <Card className="p-4 border border-border">
                                    <h4 className="font-semibold text-foreground mb-4">Thống kê đặt vé</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Metric
                                                label="Tổng số ghế"
                                                value={selectedSchedule.totalSeats}
                                                leading={<Users className="h-4 w-4" />}
                                            />
                                        </div>
                                        <div>
                                            <Metric
                                                label="Đã đặt"
                                                value={selectedSchedule.seatsBooked}
                                                valueCss={{ color: '#3f8600' }}
                                                leading={<Users className="h-4 w-4" />}
                                            />
                                        </div>
                                        <div>
                                            <Metric
                                                label="Tỷ lệ đặt vé"
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
