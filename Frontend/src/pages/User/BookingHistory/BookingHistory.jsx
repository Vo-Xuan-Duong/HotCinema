import React, { useState, useMemo } from 'react';
import { Eye, Printer, Download, Trash2, Calendar, Clock, Star, User, FileText, Search } from 'lucide-react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DateRangeField } from '@/components/ui/date-field';
import { Empty } from '@/components/ui/empty';
import { MetricCard } from '@/components/ui/metric';
import { StarRating } from '@/components/ui/star-rating';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import { DataTable } from '@/components/ui/data-table';
import { Tooltip } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';

const mockBookings = [
    {
        id: 'BK001',
        movie: 'Spider-Man: No Way Home',
        moviePoster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
        cinema: 'CGV Vincom Äá»“ng Khá»Ÿi',
        cinemaAddress: 'Táº§ng 3, Vincom Center, 72 LÃª ThÃ¡nh TÃ´n, Q.1',
        room: 'PhÃ²ng 2',
        seats: ['G7', 'G8'],
        showtime: '2024-12-01T14:30:00',
        bookingDate: '2024-11-28T10:15:00',
        quantity: 2,
        totalPrice: 200000,
        status: 'completed',
        paymentMethod: 'Tháº» tÃ­n dá»¥ng',
        hasReviewed: true,
        rating: 5
    },
    {
        id: 'BK002',
        movie: 'Dune: Part Two',
        moviePoster: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
        cinema: 'Lotte Cinema Landmark 81',
        cinemaAddress: 'Táº§ng 4-5, Vincom Landmark 81, Vinhomes Central Park',
        room: 'PhÃ²ng IMAX',
        seats: ['E5', 'E6'],
        showtime: '2024-12-15T19:00:00',
        bookingDate: '2024-12-10T16:30:00',
        quantity: 2,
        totalPrice: 300000,
        status: 'upcoming',
        paymentMethod: 'VÃ­ Ä‘iá»‡n tá»­',
        hasReviewed: false
    },
    {
        id: 'BK003',
        movie: 'Avatar: The Way of Water',
        moviePoster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        cinema: 'Galaxy Cinema Nguyá»…n Du',
        cinemaAddress: 'Sá»‘ 116 Nguyá»…n Du, Q.1',
        room: 'PhÃ²ng 3D',
        seats: ['H10'],
        showtime: '2024-11-20T16:45:00',
        bookingDate: '2024-11-18T14:20:00',
        quantity: 1,
        totalPrice: 120000,
        status: 'cancelled',
        paymentMethod: 'Tháº» ATM',
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
                <p className="m-0 text-sm opacity-90">VÃ‰ XEM PHIM ÄIá»†N Tá»¬</p>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-5">
                <div>
                    <div className="mb-2">
                        <strong className="text-base">{ticket.movie}</strong>
                    </div>
                    <div className="text-sm opacity-90">
                        ðŸ“ {ticket.cinema}
                    </div>
                    <div className="text-xs opacity-80 mt-1">
                        {ticket.cinemaAddress}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm mb-1">
                        ðŸ“… {moment(ticket.showtime).format('DD/MM/YYYY')}
                    </div>
                    <div className="text-sm mb-1">
                        ðŸ• {moment(ticket.showtime).format('HH:mm')}
                    </div>
                    <div className="text-sm">
                        ðŸŽ¬ {ticket.room}
                    </div>
                </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-xs opacity-80 mb-1">GHáº¾ NGá»’I</div>
                        <div className="text-lg font-bold">
                            {ticket.seats.join(', ')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs opacity-80 mb-1">Tá»”NG TIá»€N</div>
                        <div className="text-lg font-bold">
                            {ticket.totalPrice.toLocaleString('vi-VN')} VNÄ
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                    <div className="opacity-80">MÃ£ vÃ©: <strong>{ticket.id}</strong></div>
                    <div className="opacity-80">Sá»‘ lÆ°á»£ng: {ticket.quantity} vÃ©</div>
                </div>
                <div className="text-right">
                    <div className="opacity-80">NgÃ y Ä‘áº·t: {moment(ticket.bookingDate).format('DD/MM/YYYY')}</div>
                    <div className="opacity-80">Thanh toÃ¡n: {ticket.paymentMethod}</div>
                </div>
            </div>

            <div className="absolute top-5 right-5 w-15 h-15 bg-white rounded-lg flex items-center justify-center text-xs text-gray-900">
                QR
            </div>

            <div className="mt-5 pt-4 border-t border-dashed border-white/30 text-center text-xs opacity-80">
                <p className="m-0 mb-1">Vui lÃ²ng cÃ³ máº·t táº¡i ráº¡p trÆ°á»›c 15 phÃºt</p>
                <p className="m-0 mb-1">Hotline: 1900-6017 | Website: hotcinemas.vn</p>
                <p className="m-0">Xem vÃ© lÃºc: {moment().format('DD/MM/YYYY HH:mm:ss')}</p>
            </div>
        </div>
    );
};

const BookingHistory = () => {
    const [bookingToCancel, setBookingToCancel] = useState(null);
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
            case 'completed': return 'ÄÃ£ hoÃ n thÃ nh';
            case 'upcoming': return 'Sáº¯p chiáº¿u';
            case 'cancelled': return 'ÄÃ£ há»§y';
            case 'expired': return 'ÄÃ£ háº¿t háº¡n';
            default: return 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
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
                <title>VÃ© xem phim - ${booking.id}</title>
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
                        <p>VÃ‰ XEM PHIM ÄIá»†N Tá»¬</p>
                    </div>
                    <div class="content">
                        <div class="movie-info">
                            <h2>${booking.movie}</h2>
                            <div>ðŸ“ ${booking.cinema}</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${booking.cinemaAddress}</div>
                        </div>
                        <div class="cinema-info">
                            <div>ðŸ“… ${moment(booking.showtime).format('DD/MM/YYYY')}</div>
                            <div>ðŸ• ${moment(booking.showtime).format('HH:mm')}</div>
                            <div>ðŸŽ¬ ${booking.room}</div>
                        </div>
                    </div>
                    <div class="details">
                        <div class="details-grid">
                            <div>
                                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px;">GHáº¾ NGá»’I</div>
                                <div class="seats">${booking.seats.join(', ')}</div>
                            </div>
                            <div class="price">
                                <div style="font-size: 12px; opacity: 0.8; margin-bottom: 4px; text-align: right;">Tá»”NG TIá»€N</div>
                                <div>${booking.totalPrice.toLocaleString('vi-VN')} VNÄ</div>
                            </div>
                        </div>
                    </div>
                    <div class="booking-details">
                        <div>
                            <div>MÃ£ vÃ©: <strong>${booking.id}</strong></div>
                            <div>Sá»‘ lÆ°á»£ng: ${booking.quantity} vÃ©</div>
                        </div>
                        <div style="text-align: right;">
                            <div>NgÃ y Ä‘áº·t: ${moment(booking.bookingDate).format('DD/MM/YYYY')}</div>
                            <div>Thanh toÃ¡n: ${booking.paymentMethod}</div>
                        </div>
                    </div>
                    <div class="qr-code">QR</div>
                    <div class="footer">
                        <p>Vui lÃ²ng cÃ³ máº·t táº¡i ráº¡p trÆ°á»›c 15 phÃºt</p>
                        <p>Hotline: 1900-6017 | Website: hotcinemas.vn</p>
                        <p>In vÃ© lÃºc: ${moment().format('DD/MM/YYYY HH:mm:ss')}</p>
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
        notification.success(`Äang táº£i vÃ© ${bookingId}...`);
    };

    const handleCancelBooking = (bookingId) => {
        setBookingToCancel(bookingId);
    };

    const columns = [
        {
            title: 'MÃ£ vÃ©',
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
            title: 'Ráº¡p chiáº¿u',
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
            title: 'Gháº¿',
            dataIndex: 'seats',
            key: 'seats',
            width: 100,
            render: (seats) => (
                <div className="flex flex-wrap gap-1">
                    {seats.map(seat => (
                        <StatusBadge key={seat} tone="blue">{seat}</StatusBadge>
                    ))}
                </div>
            )
        },
        {
            title: 'Suáº¥t chiáº¿u',
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
            title: 'Tá»•ng tiá»n',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 120,
            render: (price) => (
                <span className="font-semibold text-primary">
                    {new Intl.NumberFormat('vi-VN').format(price)}Ä‘
                </span>
            )
        },
        {
            title: 'Tráº¡ng thÃ¡i',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <StatusBadge tone={getStatusColor(status)}>
                    {getStatusText(status)}
                </StatusBadge>
            )
        },
        {
            title: 'Thao tÃ¡c',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Tooltip content="Xem chi tiáº¿t">
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
                            <Tooltip content="Xem vÃ©">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewTicket(record)}
                                    className="text-blue-600"
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="In vÃ©">
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
                        <Tooltip content="Táº£i vÃ©">
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
                        <Tooltip content="Há»§y vÃ©">
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
                    <h3 className="text-xl font-bold mb-2">Báº¡n chÆ°a Ä‘Äƒng nháº­p</h3>
                    <p className="text-gray-600 mb-4">Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem lá»‹ch sá»­ Ä‘áº·t vÃ©</p>
                    <Button href="/login-demo">
                        ÄÄƒng nháº­p
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
                        ðŸ“‹ Lá»‹ch sá»­ Ä‘áº·t vÃ©
                    </h2>
                    <p className="text-gray-600 text-base">
                        Quáº£n lÃ½ vÃ  theo dÃµi táº¥t cáº£ cÃ¡c vÃ© Ä‘Ã£ Ä‘áº·t cá»§a báº¡n
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <MetricCard
                            label="Tá»•ng sá»‘ vÃ©"
                            value={totalBookings}
                            valueCss={{ color: '#3f8600' }}
                            icon={<Calendar className="h-6 w-6" />}
                        />
                    </Card>
                    <Card>
                        <MetricCard
                            label="ÄÃ£ hoÃ n thÃ nh"
                            value={completedBookings}
                            valueCss={{ color: '#52c41a' }}
                            icon={<Star className="h-6 w-6" />}
                        />
                    </Card>
                    <Card>
                        <MetricCard
                            label="Sáº¯p chiáº¿u"
                            value={upcomingBookings}
                            valueCss={{ color: '#1890ff' }}
                            icon={<Clock className="h-6 w-6" />}
                        />
                    </Card>
                    <Card>
                        <MetricCard
                            label="Tá»•ng chi tiÃªu"
                            value={`${new Intl.NumberFormat('vi-VN').format(totalSpent)}Ä‘`}
                            valueCss={{ color: '#faad14' }}
                            icon={<Star className="h-6 w-6" />}
                        />
                    </Card>
                </div>

                <Card className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="TÃ¬m kiáº¿m theo tÃªn phim, ráº¡p, mÃ£ vÃ©..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                        <Select
                            placeholder="Tráº¡ng thÃ¡i"
                            value={statusFilter}
                            onValueChange={setStatusFilter}
                        >
                            <option value="completed">ÄÃ£ hoÃ n thÃ nh</option>
                            <option value="upcoming">Sáº¯p chiáº¿u</option>
                            <option value="cancelled">ÄÃ£ há»§y</option>
                            <option value="expired">ÄÃ£ háº¿t háº¡n</option>
                        </Select>
                        <DateRangeField
                            value={dateRange}
                            onValueChange={setDateRange}
                            displayFormat="DD/MM/YYYY"
                        />
                    </div>
                </Card>

                <Card>
                    {filteredBookings.length === 0 ? (
                        <Empty description="KhÃ´ng tÃ¬m tháº¥y vÃ© nÃ o" />
                    ) : (
                        <DataTable
                            fields={columns}
                            rows={filteredBookings}
                            getRowId="id"
                            pageControls={{
                                showSizeChanger: true,
                                showQuickJumper: true,
                            }}
                        />
                    )}
                </Card>

                <ResponsiveDialog
                    heading="Chi tiáº¿t Ä‘áº·t vÃ©"
                    open={detailModalVisible}
                    onClose={() => setDetailModalVisible(false)}
                    width={700}
                    footer={[
                        <Button key="close" variant="outline" onClick={() => setDetailModalVisible(false)}>
                            ÄÃ³ng
                        </Button>,
                        (selectedBooking?.status === 'completed' || selectedBooking?.status === 'upcoming') && (
                            <Button
                                key="view"
                                onClick={() => handleViewTicket(selectedBooking)}
                                className="bg-blue-600 text-white"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Xem vÃ©
                            </Button>
                        ),
                        (selectedBooking?.status === 'completed' || selectedBooking?.status === 'upcoming') && (
                            <Button
                                key="print"
                                onClick={() => handlePrintTicket(selectedBooking)}
                                className="bg-green-600 text-white"
                            >
                                <Printer className="h-4 w-4 mr-2" />
                                In vÃ©
                            </Button>
                        ),
                        selectedBooking?.status === 'completed' && (
                            <Button
                                key="download"
                                onClick={() => handleDownloadTicket(selectedBooking?.id)}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Táº£i vÃ©
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
                                Há»§y vÃ©
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
                                    <StatusBadge tone={getStatusColor(selectedBooking.status)} className="mb-4">
                                        {getStatusText(selectedBooking.status)}
                                    </StatusBadge>
                                    <Separator className="mb-4" />
                                    <DetailList columns={1}>
                                        <DetailItem label="MÃ£ vÃ©">
                                            <span className="font-semibold">{selectedBooking.id}</span>
                                        </DetailItem>
                                        <DetailItem label="Ráº¡p chiáº¿u">
                                            {selectedBooking.cinema}
                                        </DetailItem>
                                        <DetailItem label="Äá»‹a chá»‰">
                                            {selectedBooking.cinemaAddress}
                                        </DetailItem>
                                        <DetailItem label="PhÃ²ng chiáº¿u">
                                            {selectedBooking.room}
                                        </DetailItem>
                                        <DetailItem label="Gháº¿ ngá»“i">
                                            <div className="flex flex-wrap gap-1">
                                                {selectedBooking.seats.map(seat => (
                                                    <StatusBadge key={seat} tone="blue">{seat}</StatusBadge>
                                                ))}
                                            </div>
                                        </DetailItem>
                                        <DetailItem label="Suáº¥t chiáº¿u">
                                            {moment(selectedBooking.showtime).format('DD/MM/YYYY HH:mm')}
                                        </DetailItem>
                                        <DetailItem label="NgÃ y Ä‘áº·t">
                                            {moment(selectedBooking.bookingDate).format('DD/MM/YYYY HH:mm')}
                                        </DetailItem>
                                        <DetailItem label="PhÆ°Æ¡ng thá»©c thanh toÃ¡n">
                                            {selectedBooking.paymentMethod}
                                        </DetailItem>
                                        <DetailItem label="Tá»•ng tiá»n">
                                            <span className="font-semibold text-primary text-lg">
                                                {new Intl.NumberFormat('vi-VN').format(selectedBooking.totalPrice)}Ä‘
                                            </span>
                                        </DetailItem>
                                        {selectedBooking.status === 'cancelled' && selectedBooking.refundAmount && (
                                            <DetailItem label="Sá»‘ tiá»n hoÃ n">
                                                <span className="font-semibold text-green-600">
                                                    {new Intl.NumberFormat('vi-VN').format(selectedBooking.refundAmount)}Ä‘
                                                </span>
                                            </DetailItem>
                                        )}
                                        {selectedBooking.hasReviewed && (
                                            <DetailItem label="ÄÃ¡nh giÃ¡ cá»§a báº¡n">
                                                <StarRating readOnly value={selectedBooking.rating} />
                                            </DetailItem>
                                        )}
                                    </DetailList>
                                </div>
                            </div>
                        </div>
                    )}
                </ResponsiveDialog>

                <ResponsiveDialog
                    heading={
                        <span className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Xem vÃ©
                        </span>
                    }
                    open={ticketViewerVisible}
                    onCancel={() => setTicketViewerVisible(false)}
                    width={600}
                    footer={[
                        <Button key="close" variant="outline" onClick={() => setTicketViewerVisible(false)}>
                            ÄÃ³ng
                        </Button>,
                        <Button
                            key="print"
                            onClick={() => {
                                handlePrintTicket(ticketToView);
                                setTicketViewerVisible(false);
                            }}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            In vÃ©
                        </Button>
                    ]}
                >
                    {ticketToView && <TicketViewer ticket={ticketToView} />}
                </ResponsiveDialog>

                <AlertDialog open={Boolean(bookingToCancel)} onOpenChange={(open) => !open && setBookingToCancel(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>XÃ¡c nháº­n há»§y vÃ©</AlertDialogTitle>
                            <AlertDialogDescription>
                                Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n há»§y vÃ© nÃ y khÃ´ng? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Giá»¯ láº¡i vÃ©</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    notification.success(`ÄÃ£ há»§y vÃ© ${bookingToCancel}`);
                                    setBookingToCancel(null);
                                }}
                            >
                                Há»§y vÃ©
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default BookingHistory;
