import React, { useState, useMemo } from 'react';
import { Eye, Printer, Download, Trash2, Calendar, Clock, Star, User, FileText, Search } from 'lucide-react';
import moment from 'moment';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tag } from '../../../components/ui/tag';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { RangePicker } from '../../../components/ui/date-picker';
import { Empty } from '../../../components/ui/empty';
import { StatisticCard } from '../../../components/ui/statistic';
import { Rate } from '../../../components/ui/rate';
import { Modal } from '../../../components/ui/modal';
import { Descriptions } from '../../../components/ui/descriptions';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Tooltip } from '../../../components/ui/tooltip';
import { Separator } from '../../../components/ui/separator';
import useAuth from '../../../hooks/useAuth';
import useNotification from '../../../hooks/useNotification';

const mockBookings = [
    {
        id: 'BK001',
        movie: 'Spider-Man: No Way Home',
        moviePoster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
        cinema: 'CGV Vincom Đồng Khởi',
        cinemaAddress: 'Tầng 3, Vincom Center, 72 Lê Thánh Tôn, Q.1',
        room: 'Phòng 2',
        seats: ['G7', 'G8'],
        showtime: '2024-12-01T14:30:00',
        bookingDate: '2024-11-28T10:15:00',
        quantity: 2,
        totalPrice: 200000,
        status: 'completed',
        paymentMethod: 'Thẻ tín dụng',
        hasReviewed: true,
        rating: 5
    },
    {
        id: 'BK002',
        movie: 'Dune: Part Two',
        moviePoster: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
        cinema: 'Lotte Cinema Landmark 81',
        cinemaAddress: 'Tầng 4-5, Vincom Landmark 81, Vinhomes Central Park',
        room: 'Phòng IMAX',
        seats: ['E5', 'E6'],
        showtime: '2024-12-15T19:00:00',
        bookingDate: '2024-12-10T16:30:00',
        quantity: 2,
        totalPrice: 300000,
        status: 'upcoming',
        paymentMethod: 'Ví điện tử',
        hasReviewed: false
    },
    {
        id: 'BK003',
        movie: 'Avatar: The Way of Water',
        moviePoster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        cinema: 'Galaxy Cinema Nguyễn Du',
        cinemaAddress: 'Số 116 Nguyễn Du, Q.1',
        room: 'Phòng 3D',
        seats: ['H10'],
        showtime: '2024-11-20T16:45:00',
        bookingDate: '2024-11-18T14:20:00',
        quantity: 1,
        totalPrice: 120000,
        status: 'cancelled',
        paymentMethod: 'Thẻ ATM',
        refundAmount: 100000,
        hasReviewed: false
    }
];

const TicketViewer = ({ ticket }) => {
    if (!ticket) return null;

    return (
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="text-center mb-5 pb-4 border-b-2 border-dashed border-white/30">
                <h2 className="text-white m-0 mb-2 text-2xl font-bold">HOT CINEMAS</h2>
                <p className="m-0 text-sm opacity-90">VÉ XEM PHIM ĐIỆN TỬ</p>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                    <div className="mb-2">
                        <strong className="text-base">{ticket.movie}</strong>
                    </div>
                    <div className="text-sm opacity-90">
                        📍 {ticket.cinema}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                        {ticket.cinemaAddress}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm mb-1">
                        📅 {moment(ticket.showtime).format('DD/MM/YYYY')}
                    </div>
                    <div className="text-sm mb-1">
                        🕐 {moment(ticket.showtime).format('HH:mm')}
                    </div>
                    <div className="text-sm">
                        🎬 {ticket.room}
                    </div>
                </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs opacity-80 mb-1">GHẾ NGỒI</div>
                        <div className="text-lg font-bold">
                            {ticket.seats.join(', ')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs opacity-80 mb-1">TỔNG TIỀN</div>
                        <div className="text-lg font-bold">
                            {ticket.totalPrice.toLocaleString('vi-VN')} VNĐ
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                    <div className="opacity-80">Mã vé: <strong>{ticket.id}</strong></div>
                    <div className="opacity-80">Số lượng: {ticket.quantity} vé</div>
                </div>
                <div className="text-right">
                    <div className="opacity-80">Ngày đặt: {moment(ticket.bookingDate).format('DD/MM/YYYY')}</div>
                    <div className="opacity-80">Thanh toán: {ticket.paymentMethod}</div>
                </div>
            </div>

            <div className="absolute top-5 right-5 w-15 h-15 bg-white rounded-lg flex items-center justify-center text-xs text-gray-900">
                QR
            </div>

            <div className="mt-5 pt-4 border-t border-dashed border-white/30 text-center text-xs opacity-80">
                <p className="m-0 mb-1">Vui lòng có mặt tại rạp trước 15 phút</p>
                <p className="m-0 mb-1">Hotline: 1900-6017 | Website: hotcinemas.vn</p>
                <p className="m-0">Xem vé lúc: {moment().format('DD/MM/YYYY HH:mm:ss')}</p>
            </div>
        </div>
    );
};

const BookingHistory = () => {
    const { isAuthenticated } = useAuth();
    const notification = useNotification();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [dateRange, setDateRange] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [ticketViewerVisible, setTicketViewerVisible] = useState(false);
    const [ticketToView, setTicketToView] = useState(null);

    const filteredBookings = useMemo(() => {
        return mockBookings.filter(booking => {
            if (searchText) {
                const searchLower = searchText.toLowerCase();
                if (!booking.movie.toLowerCase().includes(searchLower) &&
                    !booking.cinema.toLowerCase().includes(searchLower) &&
                    !booking.id.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            if (statusFilter && booking.status !== statusFilter) {
                return false;
            }

            if (dateRange && dateRange.length === 2) {
                const bookingDate = moment(booking.bookingDate);
                if (!bookingDate.isBetween(dateRange[0], dateRange[1], 'day', '[]')) {
                    return false;
                }
            }

            return true;
        });
    }, [searchText, statusFilter, dateRange]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'green';
            case 'upcoming': return 'blue';
            case 'cancelled': return 'red';
            case 'expired': return 'orange';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Đã hoàn thành';
            case 'upcoming': return 'Sắp chiếu';
            case 'cancelled': return 'Đã hủy';
            case 'expired': return 'Đã hết hạn';
            default: return 'Không xác định';
        }
    };

    const handleViewDetail = (record) => {
        setSelectedBooking(record);
        setDetailModalVisible(true);
    };

    const handleViewTicket = (record) => {
        setTicketToView(record);
        setTicketViewerVisible(true);
    };

    const handlePrintTicket = (booking) => {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Vé xem phim - ${booking.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                    .ticket { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; max-width: 400px; margin: 0 auto; border-radius: 12px; padding: 24px; position: relative; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
                    .header { text-align: center; border-bottom: 2px dashed rgba(255,255,255,0.3); padding-bottom: 16px; margin-bottom: 20px; }
                    .header h1 { margin: 0 0 8px 0; font-size: 24px; }
                    .header p { margin: 0; font-size: 14px; opacity: 0.9; }
                    .content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                    .movie-info h2 { margin: 0 0 8px 0; font-size: 16px; }
                    .cinema-info { text-align: right; font-size: 14px; }
                    .details { background: rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                    .seats { font-size: 18px; font-weight: bold; }
                    .price { text-align: right; font-size: 18px; font-weight: bold; }
                    .booking-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 12px; }
                    .qr-code { position: absolute; top: 20px; right: 20px; width: 60px; height: 60px; background: white; border-radius: 8px; display: flex; align-items: center; justify-center; color: #333; font-size: 10px; text-align: center; }
                    .footer { margin-top: 20px; padding-top: 16px; border-top: 1px dashed rgba(255,255,255,0.3); text-align: center; font-size: 10px; opacity: 0.8; }
                    .footer p { margin: 0 0 4px 0; }
                    @media print { body { background: white; padding: 0; } .ticket { box-shadow: none; max-width: none; width: 100%; } }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <h1>HOT CINEMAS</h1>
                        <p>VÉ XEM PHIM ĐIỆN TỬ</p>
                    </div>
                    <div class="content">
                        <div class="movie-info">
                            <h2>${booking.movie}</h2>
                            <div>📍 ${booking.cinema}</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${booking.cinemaAddress}</div>
                        </div>
                        <div class="cinema-info">
                            <div>📅 ${moment(booking.showtime).format('DD/MM/YYYY')}</div>
                            <div>🕐 ${moment(booking.showtime).format('HH:mm')}</div>
                            <div>🎬 ${booking.room}</div>
                        </div>
                    </div>
                    <div class="details">
                        <div class="details-grid">
                            <div>
                                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">GHẾ NGỒI</div>
                                <div class="seats">${booking.seats.join(', ')}</div>
                            </div>
                            <div class="price">
                                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px; text-align: right;">TỔNG TIỀN</div>
                                <div>${booking.totalPrice.toLocaleString('vi-VN')} VNĐ</div>
                            </div>
                        </div>
                    </div>
                    <div class="booking-details">
                        <div>
                            <div>Mã vé: <strong>${booking.id}</strong></div>
                            <div>Số lượng: ${booking.quantity} vé</div>
                        </div>
                        <div style="text-align: right;">
                            <div>Ngày đặt: ${moment(booking.bookingDate).format('DD/MM/YYYY')}</div>
                            <div>Thanh toán: ${booking.paymentMethod}</div>
                        </div>
                    </div>
                    <div class="qr-code">QR</div>
                    <div class="footer">
                        <p>Vui lòng có mặt tại rạp trước 15 phút</p>
                        <p>Hotline: 1900-6017 | Website: hotcinemas.vn</p>
                        <p>In vé lúc: ${moment().format('DD/MM/YYYY HH:mm:ss')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleDownloadTicket = (bookingId) => {
        notification.success(`Đang tải vé ${bookingId}...`);
    };

    const handleCancelBooking = (bookingId) => {
        Modal.confirm({
            title: 'Xác nhận hủy vé',
            content: 'Bạn có chắc chắn muốn hủy vé này không? Hành động này không thể hoàn tác.',
            onOk: () => {
                notification.success(`Đã hủy vé ${bookingId}`);
            }
        });
    };

    const columns = [
        {
            title: 'Mã vé',
            dataIndex: 'id',
            key: 'id',
            width: 100,
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Phim',
            dataIndex: 'movie',
            key: 'movie',
            width: 200,
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <img
                        src={record.moviePoster}
                        alt={text}
                        className="w-10 h-15 object-cover rounded"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40x60?text=No+Image';
                        }}
                    />
                    <div>
                        <span className="font-semibold">{text}</span>
                        <br />
                        <span className="text-gray-500 text-sm">{record.room}</span>
                    </div>
                </div>
            )
        },
        {
            title: 'Rạp chiếu',
            dataIndex: 'cinema',
            key: 'cinema',
            width: 180,
            render: (text, record) => (
                <div>
                    <span className="font-semibold">{text}</span>
                    <br />
                    <span className="text-gray-500 text-xs">{record.cinemaAddress}</span>
                </div>
            )
        },
        {
            title: 'Ghế',
            dataIndex: 'seats',
            key: 'seats',
            width: 100,
            render: (seats) => (
                <div className="flex flex-wrap gap-1">
                    {seats.map(seat => (
                        <Tag key={seat} color="blue">{seat}</Tag>
                    ))}
                </div>
            )
        },
        {
            title: 'Suất chiếu',
            dataIndex: 'showtime',
            key: 'showtime',
            width: 140,
            render: (text) => (
                <div>
                    <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {moment(text).format('DD/MM/YYYY')}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {moment(text).format('HH:mm')}
                    </div>
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 120,
            render: (price) => (
                <span className="font-semibold text-primary">
                    {new Intl.NumberFormat('vi-VN').format(price)}đ
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tooltip content="Xem chi tiết">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(record)}
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                    {(record.status === 'completed' || record.status === 'upcoming') && (
                        <>
                            <Tooltip content="Xem vé">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewTicket(record)}
                                    className="text-blue-600"
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="In vé">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePrintTicket(record)}
                                    className="text-green-600"
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                        </>
                    )}
                    {record.status === 'completed' && (
                        <Tooltip content="Tải vé">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownloadTicket(record.id)}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                    )}
                    {record.status === 'upcoming' && (
                        <Tooltip content="Hủy vé">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelBooking(record.id)}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </Tooltip>
                    )}
                </div>
            )
        }
    ];

    const totalBookings = mockBookings.length;
    const completedBookings = mockBookings.filter(b => b.status === 'completed').length;
    const upcomingBookings = mockBookings.filter(b => b.status === 'upcoming').length;
    const totalSpent = mockBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.totalPrice, 0);

    if (!isAuthenticated) {
        return (
            <div className="p-12 text-center min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-auto">
                    <User className="w-12 h-12 text-primary mx-auto mb-5" />
                    <h3 className="text-xl font-bold mb-2">Bạn chưa đăng nhập</h3>
                    <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem lịch sử đặt vé</p>
                    <Button href="/login-demo">
                        Đăng nhập
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-5 min-h-screen bg-gray-50">
            <div className="max-w-[1200px] mx-auto">
                <div className="mb-6">
                    <h2 className="text-blue-600 mb-2 text-2xl font-bold">
                        📋 Lịch sử đặt vé
                    </h2>
                    <p className="text-gray-600 text-base">
                        Quản lý và theo dõi tất cả các vé đã đặt của bạn
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <StatisticCard
                            title="Tổng số vé"
                            value={totalBookings}
                            valueStyle={{ color: '#3f8600' }}
                            icon={<Calendar className="h-6 w-6" />}
                        />
                    </Card>
                    <Card>
                        <StatisticCard
                            title="Đã hoàn thành"
                            value={completedBookings}
                            valueStyle={{ color: '#52c41a' }}
                            icon={<Star className="h-6 w-6" />}
                        />
                    </Card>
                    <Card>
                        <StatisticCard
                            title="Sắp chiếu"
                            value={upcomingBookings}
                            valueStyle={{ color: '#1890ff' }}
                            icon={<Clock className="h-6 w-6" />}
                        />
                    </Card>
                    <Card>
                        <StatisticCard
                            title="Tổng chi tiêu"
                            value={`${new Intl.NumberFormat('vi-VN').format(totalSpent)}đ`}
                            valueStyle={{ color: '#faad14' }}
                            icon={<Star className="h-6 w-6" />}
                        />
                    </Card>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm theo tên phim, rạp, mã vé..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                        <Select
                            placeholder="Trạng thái"
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <option value="completed">Đã hoàn thành</option>
                            <option value="upcoming">Sắp chiếu</option>
                            <option value="cancelled">Đã hủy</option>
                            <option value="expired">Đã hết hạn</option>
                        </Select>
                        <RangePicker
                            value={dateRange}
                            onChange={setDateRange}
                            format="DD/MM/YYYY"
                        />
                    </div>
                </Card>

                <Card>
                    {filteredBookings.length === 0 ? (
                        <Empty description="Không tìm thấy vé nào" />
                    ) : (
                        <TableWrapper
                            columns={columns}
                            dataSource={filteredBookings}
                            rowKey="id"
                            pagination={{
                                showSizeChanger: true,
                                showQuickJumper: true,
                            }}
                        />
                    )}
                </Card>

                <Modal
                    title="Chi tiết đặt vé"
                    open={detailModalVisible}
                    onCancel={() => setDetailModalVisible(false)}
                    width={700}
                    footer={[
                        <Button key="close" variant="outline" onClick={() => setDetailModalVisible(false)}>
                            Đóng
                        </Button>,
                        (selectedBooking?.status === 'completed' || selectedBooking?.status === 'upcoming') && (
                            <Button
                                key="view"
                                onClick={() => handleViewTicket(selectedBooking)}
                                className="bg-blue-600 text-white"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Xem vé
                            </Button>
                        ),
                        (selectedBooking?.status === 'completed' || selectedBooking?.status === 'upcoming') && (
                            <Button
                                key="print"
                                onClick={() => handlePrintTicket(selectedBooking)}
                                className="bg-green-600 text-white"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                In vé
                            </Button>
                        ),
                        selectedBooking?.status === 'completed' && (
                            <Button
                                key="download"
                                onClick={() => handleDownloadTicket(selectedBooking?.id)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Tải vé
                            </Button>
                        ),
                        selectedBooking?.status === 'upcoming' && (
                            <Button
                                key="cancel"
                                variant="destructive"
                                onClick={() => {
                                    setDetailModalVisible(false);
                                    handleCancelBooking(selectedBooking?.id);
                                }}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hủy vé
                            </Button>
                        )
                    ].filter(Boolean)}
                >
                    {selectedBooking && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                                <img
                                    src={selectedBooking.moviePoster}
                                    alt={selectedBooking.movie}
                                    className="w-full rounded-lg"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
                                    }}
                                />
                                <div>
                                    <h4 className="text-lg font-bold mb-2">
                                        {selectedBooking.movie}
                                    </h4>
                                    <Tag color={getStatusColor(selectedBooking.status)} className="mb-4">
                                        {getStatusText(selectedBooking.status)}
                                    </Tag>
                                    <Separator className="mb-4" />
                                    <Descriptions column={1}>
                                        <Descriptions.Item label="Mã vé">
                                            <span className="font-semibold">{selectedBooking.id}</span>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Rạp chiếu">
                                            {selectedBooking.cinema}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Địa chỉ">
                                            {selectedBooking.cinemaAddress}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Phòng chiếu">
                                            {selectedBooking.room}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ghế ngồi">
                                            <div className="flex flex-wrap gap-1">
                                                {selectedBooking.seats.map(seat => (
                                                    <Tag key={seat} color="blue">{seat}</Tag>
                                                ))}
                                            </div>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Suất chiếu">
                                            {moment(selectedBooking.showtime).format('DD/MM/YYYY HH:mm')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Ngày đặt">
                                            {moment(selectedBooking.bookingDate).format('DD/MM/YYYY HH:mm')}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Phương thức thanh toán">
                                            {selectedBooking.paymentMethod}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tổng tiền">
                                            <span className="font-semibold text-primary text-lg">
                                                {new Intl.NumberFormat('vi-VN').format(selectedBooking.totalPrice)}đ
                                            </span>
                                        </Descriptions.Item>
                                        {selectedBooking.status === 'cancelled' && selectedBooking.refundAmount && (
                                            <Descriptions.Item label="Số tiền hoàn">
                                                <span className="font-semibold text-green-600">
                                                    {new Intl.NumberFormat('vi-VN').format(selectedBooking.refundAmount)}đ
                                                </span>
                                            </Descriptions.Item>
                                        )}
                                        {selectedBooking.hasReviewed && (
                                            <Descriptions.Item label="Đánh giá của bạn">
                                                <Rate disabled value={selectedBooking.rating} />
                                            </Descriptions.Item>
                                        )}
                                    </Descriptions>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>

                <Modal
                    title={
                        <span className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Xem vé
                        </span>
                    }
                    open={ticketViewerVisible}
                    onCancel={() => setTicketViewerVisible(false)}
                    width={600}
                    footer={[
                        <Button key="close" variant="outline" onClick={() => setTicketViewerVisible(false)}>
                            Đóng
                        </Button>,
                        <Button
                            key="print"
                            onClick={() => {
                                handlePrintTicket(ticketToView);
                                setTicketViewerVisible(false);
                            }}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            In vé
                        </Button>
                    ]}
                >
                    {ticketToView && <TicketViewer ticket={ticketToView} />}
                </Modal>
            </div>
        </div>
    );
};

export default BookingHistory;
