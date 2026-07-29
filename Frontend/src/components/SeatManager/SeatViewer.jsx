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

    // Update seat status helper (nháº­n updates tá»« WebSocket)
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

    // Handle WebSocket seat updates (chá»‰ nháº­n real-time updates)
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

    // Use Seat WebSocket hook (chá»‰ Ä‘á»ƒ nháº­n real-time updates)
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

        // NhÃ³m gháº¿ theo rowLabel
        const groupedByRow = layoutSeats.reduce((acc, seat) => {
            const rowKey = seat.rowLabel;
            if (!acc[rowKey]) {
                acc[rowKey] = [];
            }
            acc[rowKey].push(seat);
            return acc;
        }, {});

        // Táº¡o rows array
        const rows = Object.keys(groupedByRow)
            .sort((a, b) => a.localeCompare(b))
            .map(rowLabel => {
                const rowSeats = groupedByRow[rowLabel].sort((a, b) => a.col - b.col);
                return {
                    label: rowLabel,
                    seats: rowSeats
                };
            });

        // TÃ­nh toÃ¡n thá»‘ng kÃª
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
            'available': 'CÃ²n trá»‘ng',
            'held': 'Äang giá»¯',
            'booked': 'ÄÃ£ Ä‘áº·t',
            'unavailable': 'KhÃ´ng kháº£ dá»¥ng',
            'maintenance': 'Báº£o trÃ¬',
            'blocked': 'Bá»‹ cháº·n'
        };
        return statusTextMap[status] || 'KhÃ´ng xÃ¡c Ä‘á»‹nh';
    };

    const getSeatColor = (seat) => {
        // MÃ u sáº¯c dá»±a trÃªn tráº¡ng thÃ¡i Ä‘áº·t vÃ©
        switch (seat.status) {
            case 'booked':
                return '#ff4d4f'; // MÃ u Ä‘á» - ÄÃ£ Ä‘áº·t
            case 'held':
                return '#faad14'; // MÃ u vÃ ng cam - Äang giá»¯
            case 'unavailable':
            case 'maintenance':
            case 'blocked':
                return '#d9d9d9'; // MÃ u xÃ¡m - KhÃ´ng kháº£ dá»¥ng
            case 'available':
            default:
                // Khi available, mÃ u sáº¯c dá»±a vÃ o loáº¡i gháº¿
                switch (seat.type) {
                    case 'vip':
                        return '#faad14'; // MÃ u vÃ ng cho VIP
                    case 'couple':
                        return '#eb2f96'; // MÃ u há»“ng cho gháº¿ Ä‘Ã´i
                    case 'sweetbox':
                        return '#722ed1'; // MÃ u tÃ­m cho sweetbox
                    case 'normal':
                    default:
                        return '#52c41a'; // MÃ u xanh cho gháº¿ thÆ°á»ng
                }
        }
    };

    const getSeatIcon = (seat) => {
        // Icon dá»±a trÃªn tráº¡ng thÃ¡i
        switch (seat.status) {
            case 'booked':
                return <User className="h-3 w-3" />; // ÄÃ£ Ä‘áº·t
            case 'held':
                return <Clock className="h-3 w-3" />; // Äang giá»¯
            case 'unavailable':
            case 'maintenance':
            case 'blocked':
                return <X className="h-3 w-3" />; // KhÃ´ng kháº£ dá»¥ng
            case 'available':
            default:
                // Khi available, icon dá»±a vÃ o loáº¡i gháº¿
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
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-600" />
                <div className="mt-4">
                    <p className="text-gray-600">Äang táº£i sÆ¡ Ä‘á»“ gháº¿...</p>
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
                        Äang káº¿t ná»‘i real-time
                    </Badge>
                </div>
            )}

            {/* Screen */}
            <div className="mb-6 text-center">
                <div className="bg-gradient-to-r from-gray-300 to-gray-400from-gray-600to-gray-700 rounded-lg py-3 px-8 inline-block">
                    <div className="text-gray-700text-gray-200 font-bold text-lg tracking-wider">MÃ€N HÃŒNH</div>
                </div>
            </div>

            {/* Seat Layout */}
            <div className="max-h-[600px] overflow-y-auto overflow-x-auto p-4 bg-gray-50bg-gray-800 rounded-lg border border-gray-200border-gray-700" ref={seatLayoutRef}>
                {seatLayout.rows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] py-10">
                        <Empty description="ChÆ°a cÃ³ dá»¯ liá»‡u gháº¿ cho lá»‹ch chiáº¿u nÃ y" />
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
                                                                <div><strong>Gháº¿ {seat.name || `${seat.row}${seat.number}`}</strong></div>
                                                                <div>Loáº¡i: {
                                                                    seat.type === 'normal' ? 'ThÆ°á»ng' :
                                                                    seat.type === 'vip' ? 'VIP' :
                                                                    seat.type === 'couple' ? 'ÄÃ´i' :
                                                                    seat.type === 'sweetbox' ? 'Sweetbox' : 'ThÆ°á»ng'
                                                                }</div>
                                                                <div>Tráº¡ng thÃ¡i: {getStatusText(seat.status)}</div>
                                                                <div>Vá»‹ trÃ­: HÃ ng {seat.row}, Cá»™t {seat.col}</div>
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
                                                // Ã” trá»‘ng - khÃ´ng cÃ³ gháº¿
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

            {/* Legend - ChÃº thÃ­ch mÃ u sáº¯c */}
            <Card className="mt-4 bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 px-5 py-4 mb-0">
                    <h3 className="text-gray-800 text-base font-semibold m-0">ChÃº thÃ­ch</h3>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                    {/* Loáº¡i gháº¿ */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">ThÆ°á»ng</span>
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
                        <span className="text-xs text-gray-700">ÄÃ´i</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    {/* Tráº¡ng thÃ¡i Ä‘áº·t vÃ© */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">CÃ²n trá»‘ng</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-yellow-500 rounded flex items-center justify-center text-white">
                            <Clock className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">Äang giá»¯</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-red-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs text-gray-700">ÄÃ£ Ä‘áº·t</span>
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
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tá»•ng sá»‘ gháº¿</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f' }}>
                                {seatLayout.bookedSeats}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>ÄÃ£ Ä‘áº·t</div>
                        </div>
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                                {seatLayout.availableSeats}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>CÃ²n trá»‘ng</div>
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
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Tá»· lá»‡ Ä‘áº·t</div>
                        </div>
                    </Card>
                </Col>
            </Row> */}
        </div>
    );
};

export default SeatViewer;
