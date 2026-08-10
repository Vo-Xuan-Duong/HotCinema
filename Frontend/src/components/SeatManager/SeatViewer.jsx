import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge-count';
import {
    Ban,
    Wrench,
    Star,
    User,
    Heart,
    Clock,
    X,
    Wifi
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import showtimeService from '@/services/showtimeService';
import useSeatWebSocket from '@/hooks/useSeatWebSocket';

const SeatViewer = ({ showtimeId, selectedScreen }) => {
    const [seatLayout, setSeatLayout] = useState({
        rows: [],
        totalSeats: 0,
        vipSeats: 0,
        bookedSeats: 0,
        availableSeats: 0
    });
    const [loading, setLoading] = useState(true);
    const seatLayoutRef = useRef(null);

    // Update seat status helper (nhận updates từ WebSocket)
    const updateSeatStatus = useCallback((seatIds, status) => {
        setSeatLayout(prevLayout => {
            const newRows = prevLayout.rows.map(row => ({
                ...row,
                seats: row.seats.map(seat => {
                    if (seatIds.includes(seat.id)) {
                        return {
                            ...seat,
                            status
                        };
                    }
                    return seat;
                })
            }));

            // Recalculate statistics
            const allSeats = newRows.flatMap(row => row.seats);
            const totalSeats = allSeats.length;
            const vipSeats = allSeats.filter(s => s.type === 'vip').length;
            const bookedSeats = allSeats.filter(s => s.status === 'booked').length;
            const availableSeats = allSeats.filter(s => s.status === 'available').length;

            return {
                ...prevLayout,
                rows: newRows,
                totalSeats,
                vipSeats,
                bookedSeats,
                availableSeats
            };
        });
    }, []);

    // Handle WebSocket seat updates (chỉ nhận real-time updates)
    const handleSeatUpdate = useCallback((updateData) => {
        const { type, seatIds } = updateData;

        switch (type) {
            case 'locked':
            case 'reserved':
            case 'held':
                updateSeatStatus(seatIds, 'held');
                break;

            case 'unlocked':
            case 'released':
            case 'available':
                updateSeatStatus(seatIds, 'available');
                break;

            case 'booked':
                updateSeatStatus(seatIds, 'booked');
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
    }, [updateSeatStatus]);

    // Use Seat WebSocket hook (chỉ để nhận real-time updates)
    const { isConnected: wsConnected } = useSeatWebSocket(showtimeId, handleSeatUpdate);

    useEffect(() => {
        if (showtimeId) {
            loadShowtimeSeats(showtimeId);
        }
    }, [showtimeId]);

    // Handle scroll indicator
    useEffect(() => {
        const seatLayoutEl = seatLayoutRef.current;
        if (!seatLayoutEl) return;

        const handleScroll = () => {
            const { scrollTop } = seatLayoutEl;
            if (scrollTop > 10) {
                seatLayoutEl.classList.add('scrolled');
            } else {
                seatLayoutEl.classList.remove('scrolled');
            }
        };

        seatLayoutEl.addEventListener('scroll', handleScroll);
        return () => seatLayoutEl.removeEventListener('scroll', handleScroll);
    }, []);

    const loadShowtimeSeats = async (showtimeId) => {
        try {
            setLoading(true);
            const response = await showtimeService.getSeatsByShowtimeId(showtimeId);
            const showtimeSeats = response?.data || response || [];

            if (showtimeSeats.length === 0) {
                setSeatLayout({
                    rows: [],
                    totalSeats: 0,
                    vipSeats: 0,
                    bookedSeats: 0,
                    availableSeats: 0
                });
            } else {
                generateSeatLayoutFromShowtime(showtimeSeats);
            }
        } catch (error) {
            console.error('Error loading showtime seats:', error);
            setSeatLayout({
                rows: [],
                totalSeats: 0,
                vipSeats: 0,
                bookedSeats: 0,
                availableSeats: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const generateSeatLayoutFromShowtime = (seats) => {
        // Convert row number to row label (1 -> A, 2 -> B, etc.)
        const numberToRowLabel = (rowNum) => {
            if (!rowNum || rowNum < 1) return 'A';
            // Convert 1-based row number to letter (1 -> A, 2 -> B, ..., 26 -> Z, 27 -> AA, etc.)
            let result = '';
            let num = rowNum;
            while (num > 0) {
                const remainder = (num - 1) % 26;
                result = String.fromCharCode(65 + remainder) + result;
                num = Math.floor((num - 1) / 26);
            }
            return result || 'A';
        };

        const layoutSeats = seats.map(seat => {
            // Parse name if available (e.g., "A1", "B2" -> rowLabel: "A", seatNumber: 1)
            let rowLabel, seatNumber;
            if (seat.name && /^[A-Z]+\d+$/i.test(seat.name)) {
                // Name format: "A1", "B2", etc.
                const match = seat.name.match(/^([A-Z]+)(\d+)$/i);
                if (match) {
                    rowLabel = match[1].toUpperCase();
                    seatNumber = parseInt(match[2]);
                } else {
                    rowLabel = numberToRowLabel(seat.row);
                    seatNumber = seat.col;
                }
            } else {
                // Use row number to generate row label
                rowLabel = numberToRowLabel(seat.row);
                seatNumber = seat.col;
            }

            return {
                id: seat.id,
                name: seat.name || `${rowLabel}${seatNumber}`,
                row: rowLabel,
                number: seatNumber,
                type: mapSeatTypeFromAPI(seat.seatType),
                status: mapSeatStatusFromAPI(seat.status),
                rowLabel: rowLabel,
                seatNumber: seatNumber.toString(),
                col: seat.col,
                rowIndex: seat.row,
                isActive: seat.status !== 'UNAVAILABLE' && seat.status !== 'MAINTENANCE' && seat.status !== 'BLOCKED'
            };
        });

        // Nhóm ghế theo rowLabel
        const groupedByRow = layoutSeats.reduce((acc, seat) => {
            const rowKey = seat.rowLabel;
            if (!acc[rowKey]) {
                acc[rowKey] = [];
            }
            acc[rowKey].push(seat);
            return acc;
        }, {});

        // Tạo rows array
        const rows = Object.keys(groupedByRow)
            .sort((a, b) => a.localeCompare(b))
            .map(rowLabel => {
                const rowSeats = groupedByRow[rowLabel].sort((a, b) => a.col - b.col);
                return {
                    label: rowLabel,
                    seats: rowSeats
                };
            });

        // Tính toán thống kê
        const totalSeats = layoutSeats.length;
        const vipSeats = layoutSeats.filter(s => s.type === 'vip').length;
        const bookedSeats = layoutSeats.filter(s => s.status === 'booked').length;
        const availableSeats = layoutSeats.filter(s => s.status === 'available').length;

        setSeatLayout({
            rows: rows,
            totalSeats: totalSeats,
            vipSeats: vipSeats,
            bookedSeats: bookedSeats,
            availableSeats: availableSeats
        });
    };

    const mapSeatTypeFromAPI = (apiSeatType) => {
        const typeMap = {
            'REGULAR': 'normal',
            'VIP': 'vip',
            'COUPLE': 'couple',
            'SWEETBOX': 'sweetbox',
            'NORMAL': 'normal' // Fallback for old data
        };
        return typeMap[apiSeatType] || 'normal';
    };

    const mapSeatStatusFromAPI = (apiStatus) => {
        const statusMap = {
            'AVAILABLE': 'available',
            'HELD': 'held',
            'BOOKED': 'booked',
            'UNAVAILABLE': 'unavailable',
            'MAINTENANCE': 'maintenance',
            'BLOCKED': 'blocked',
            'RESERVED': 'held' // Fallback for old data
        };
        return statusMap[apiStatus] || 'available';
    };

    const getStatusText = (status) => {
        const statusTextMap = {
            'available': 'Còn trống',
            'held': 'Đang giữ',
            'booked': 'Đã đặt',
            'unavailable': 'Không khả dụng',
            'maintenance': 'Bảo trì',
            'blocked': 'Bị chặn'
        };
        return statusTextMap[status] || 'Không xác định';
    };

    const getSeatColor = (seat) => {
        // Màu sắc dựa trên trạng thái đặt vé
        switch (seat.status) {
            case 'booked':
                return '#ff4d4f'; // Màu đỏ - Đã đặt
            case 'held':
                return '#faad14'; // Màu vàng cam - Đang giữ
            case 'unavailable':
            case 'maintenance':
            case 'blocked':
                return '#d9d9d9'; // Màu xám - Không khả dụng
            case 'available':
            default:
                // Khi available, màu sắc dựa vào loại ghế
                switch (seat.type) {
                    case 'vip':
                        return '#faad14'; // Màu vàng cho VIP
                    case 'couple':
                        return '#eb2f96'; // Màu hồng cho ghế đôi
                    case 'sweetbox':
                        return '#722ed1'; // Màu tím cho sweetbox
                    case 'normal':
                    default:
                        return '#52c41a'; // Màu xanh cho ghế thường
                }
        }
    };

    const getSeatIcon = (seat) => {
        // Icon dựa trên trạng thái
        switch (seat.status) {
            case 'booked':
                return <User className="h-3 w-3" />; // Đã đặt
            case 'held':
                return <Clock className="h-3 w-3" />; // Đang giữ
            case 'unavailable':
            case 'maintenance':
            case 'blocked':
                return <X className="h-3 w-3" />; // Không khả dụng
            case 'available':
            default:
                // Khi available, icon dựa vào loại ghế
                switch (seat.type) {
                    case 'vip':
                        return <Star className="h-3 w-3" />;
                    case 'couple':
                        return <Heart className="h-3 w-3" />;
                    case 'sweetbox':
                        return <Heart className="h-3 w-3" />;
                    case 'normal':
                    default:
                        return <User className="h-3 w-3" />;
                }
        }
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <div className="mt-4">
                    <p className="text-muted-foreground">Đang tải sơ đồ ghế...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* WebSocket Status Indicator */}
            {wsConnected && (
                <div className="mb-4 flex justify-end">
                    <Badge className="bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        Đang kết nối real-time
                    </Badge>
                </div>
            )}

            {/* Screen */}
            <div className="mb-6 text-center">
                <div className="bg-gradient-to-r from-gray-300 to-gray-400from-gray-600to-gray-700 rounded-lg py-3 px-8 inline-block">
                    <div className="text-gray-700text-gray-200 font-bold text-lg tracking-wider">MÀN HÌNH</div>
                </div>
            </div>

            {/* Seat Layout */}
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto p-4 bg-backgroundbg-gray-800 rounded-lg border border-borderborder-gray-700" ref={seatLayoutRef}>
                {seatLayout.rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-10">
                        <Empty description="Chưa có dữ liệu ghế cho lịch chiếu này" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        {seatLayout.rows.map((row) => {
                            const allCols = seatLayout.rows.flatMap(r => r.seats.map(s => s.col));
                            const maxColInRoom = allCols.length > 0 ? Math.max(...allCols) : 20;
                            const totalCols = maxColInRoom;

                            return (
                                <div key={row.label} className="mb-3 flex items-center gap-2">
                                    <div className="w-6 text-center font-semibold text-gray-700text-gray-300">{row.label}</div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${totalCols}, 36px)`,
                                            gap: '4px',
                                            position: 'relative'
                                        }}
                                    >
                                        {Array.from({ length: totalCols }, (_, index) => {
                                            const currentCol = index + 1;
                                            const gridPosition = index + 1;
                                            const seat = row.seats.find(s => s.col === currentCol);

                                            const prevCol = currentCol - 1;
                                            const prevSeat = row.seats.find(s => s.col === prevCol);
                                            const isOccupiedByCoupleSeat = prevSeat && prevSeat.type === 'couple';

                                            if (isOccupiedByCoupleSeat) {
                                                return null;
                                            }

                                            if (seat) {
                                                const isCoupleSeat = seat.type === 'couple';

                                                return (
                                                    <Tooltip
                                                        key={`seat-${seat.id}`}
                                                        title={
                                                            <div>
                                                                <div><strong>Ghế {seat.name || `${seat.row}${seat.number}`}</strong></div>
                                                                <div>Loại: {
                                                                    seat.type === 'normal' ? 'Thường' :
                                                                    seat.type === 'vip' ? 'VIP' :
                                                                    seat.type === 'couple' ? 'Đôi' :
                                                                    seat.type === 'sweetbox' ? 'Sweetbox' : 'Thường'
                                                                }</div>
                                                                <div>Trạng thái: {getStatusText(seat.status)}</div>
                                                                <div>Vị trí: Hàng {seat.row}, Cột {seat.col}</div>
                                                            </div>
                                                        }
                                                    >
                                                        <div
                                                            className={`flex items-center justify-center rounded text-white text-xs font-semibold cursor-default ${
                                                                isCoupleSeat ? 'w-[72px]' : 'w-8'
                                                            } h-8`}
                                                            style={{
                                                                backgroundColor: getSeatColor(seat),
                                                                gridColumn: isCoupleSeat
                                                                    ? `${gridPosition} / span 2`
                                                                    : gridPosition
                                                            }}
                                                        >
                                                            <div className="flex flex-col items-center justify-center">
                                                                {getSeatIcon(seat)}
                                                                <span className="text-[10px] leading-tight">{seat.row}{seat.number}</span>
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                );
                                            } else {
                                                // Ô trống - không có ghế
                                                return (
                                                    <div
                                                        key={`empty-${row.label}-${currentCol}`}
                                                        className="w-8 h-8 invisible"
                                                        style={{
                                                            gridColumn: gridPosition
                                                        }}
                                                    />
                                                );
                                            }
                                        })}
                                    </div>
                                    <div className="w-6 text-center font-semibold text-gray-700text-gray-300">{row.label}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Legend - Chú thích màu sắc */}
            <Card className="mt-4 bg-card rounded-lg border border-border">
                <div className="border-b border-border px-5 py-4 mb-0">
                    <h3 className="text-foreground text-base font-semibold m-0">Chú thích</h3>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                    {/* Loại ghế */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">Thường</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-yellow-500 rounded flex items-center justify-center text-white">
                            <Star className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">VIP</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-pink-500 rounded flex items-center justify-center text-white">
                            <Heart className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">Đôi</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    {/* Trạng thái đặt vé */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">Còn trống</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-yellow-500 rounded flex items-center justify-center text-white">
                            <Clock className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-red-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">Đã đặt</span>
                    </div>
                </div>
            </Card>

            {/* Metrics */}
            {/* <Row gutter={16} style={{ marginTop: '16px' }}>
                <Col span={6}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                                {seatLayout.totalSeats}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tổng số ghế</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                {seatLayout.bookedSeats}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Đã đặt</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                                {seatLayout.availableSeats}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Còn trống</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                                {seatLayout.totalSeats > 0
                                    ? Math.round((seatLayout.bookedSeats / seatLayout.totalSeats) * 100)
                                    : 0}%
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tỷ lệ đặt</div>
                        </div>
                    </Card>
                </Col>
            </Row> */}
        </div>
    );
};

export default SeatViewer;
