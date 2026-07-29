import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { NumberStepper } from '@/components/ui/number-stepper';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge-count';
import {
    Save,
    RotateCw,
    Edit,
    Trash2,
    Eye,
    Ban,
    Wrench,
    Star,
    User,
    Heart,
    Plus,
    Minus,
    Clock,
    X,
    Lock,
    UserCheck,
    Clock3,
    XCircle,
    Settings,
    Star as StarIcon,
    Heart as HeartIcon,
    Hash,
    MapPin,
    Tag as TagIcon,
    AlertCircle
} from 'lucide-react';
import useNotification from '@/hooks/useNotification';
import seatService from '@/services/seatService';

const SeatManager = ({ selectedScreen, onSave, onClose }) => {
    const notification = useNotification();
    const [seatLayout, setSeatLayout] = useState({
        rows: [],
        totalSeats: 0,
        vipSeats: [],
        blockedSeats: []
    });

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkForm] = useState({});

    // State cho modal chá»‰nh sá»­a gháº¿ Ä‘Æ¡n láº»
    const [showSeatEditModal, setShowSeatEditModal] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [seatEditFormValues, setSeatEditFormValues] = useState({
        name: '',
        type: 'regular',
        status: 'available'
    });

    // Ref cho scroll indicator
    const seatLayoutRef = useRef(null);

    useEffect(() => {
        if (selectedScreen) {
            loadSeatsFromAPI(selectedScreen);
        }
    }, [selectedScreen]);

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

    const loadSeatsFromAPI = async (screen) => {
        try {
            // Láº¥y gháº¿ tá»« API theo roomId
            const response = await seatService.getSeatsByRoomId(screen.id);
            const seats = response?.data || response || [];

            if (seats.length === 0) {
                // âœ… CHá»ˆ HIá»‚N thá»‹ layout rá»—ng, KHÃ”NG tá»± Ä‘á»™ng táº¡o gháº¿
                console.log('âš ï¸ PhÃ²ng chiáº¿u chÆ°a cÃ³ gháº¿');
                setSeatLayout({
                    rows: [],
                    totalSeats: 0,
                    vipSeats: [],
                    blockedSeats: []
                });
                notification.info('PhÃ²ng chiáº¿u chÆ°a cÃ³ sÆ¡ Ä‘á»“ gháº¿. Vui lÃ²ng táº¡o sÆ¡ Ä‘á»“ gháº¿ máº·c Ä‘á»‹nh.');
            } else {
                // Náº¿u Ä‘Ã£ cÃ³ gháº¿, sá»­ dá»¥ng dá»¯ liá»‡u tá»« API
                generateSeatLayoutFromAPI(seats);
            }
        } catch (error) {
            console.error('Error loading seats:', error);
            notification.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch gháº¿');
            setSeatLayout({
                rows: [],
                totalSeats: 0,
                vipSeats: [],
                blockedSeats: []
            });
        }
    };

    const generateDefaultSeatLayout = async (screen) => {
        const totalRows = screen.rowsCount || 10;
        const seatsPerRow = screen.seatsPerRow || 12;

        const rows = [];

        try {
            for (let i = 0; i < totalRows; i++) {
                const rowLabel = String.fromCharCode(65 + i); // A, B, C, ...
                const rowSeats = [];

                for (let j = 1; j <= seatsPerRow; j++) {
                    // ðŸ“¡ Gá»ŒI API Táº O GHáº¾ NGAY
                    const seatName = `${rowLabel}${j}`;
                    const seatData = {
                        theaterId: screen.id,
                        name: seatName,
                        seatType: 'REGULAR',
                        seatStatus: 'AVAILABLE',
                        col: j,
                        row: i
                    };

                    const response = await seatService.createSeat(seatData);
                    const createdSeat = response?.data?.data || response?.data || response;

                    // âœ… DÃ¹ng ID tháº­t tá»« API (kiá»ƒu Long)
                    rowSeats.push({
                        id: createdSeat.id,
                        name: createdSeat.name,
                        row: rowLabel,
                        number: j,
                        type: mapSeatTypeFromAPI(createdSeat.seatType),
                        status: mapSeatStatusFromAPI(createdSeat.seatStatus || createdSeat.status),
                        rowLabel: rowLabel,
                        col: j,
                        rowIndex: i
                    });
                }

                rows.push({
                    label: rowLabel,
                    seats: rowSeats,
                    isVip: false
                });

                console.log(`âœ… Created row ${rowLabel} with ${rowSeats.length} seats`);
            }

            console.log(`ðŸŽ‰ Successfully created ${totalRows * seatsPerRow} seats in database`);

            setSeatLayout({
                rows: rows,
                totalSeats: totalRows * seatsPerRow,
                vipSeats: [],
                blockedSeats: []
            });

            notification.success(`ÄÃ£ táº¡o ${totalRows * seatsPerRow} gháº¿ cho phÃ²ng chiáº¿u`);
        } catch (error) {
            console.error('âŒ Error creating default seats:', error);
            notification.error(error.response?.data?.message || 'Táº¡o sÆ¡ Ä‘á»“ gháº¿ máº·c Ä‘á»‹nh tháº¥t báº¡i');
        }
    };

    const generateSeatLayoutFromAPI = (seats) => {
        const layoutSeats = seats.map(seat => {
            // Convert row number (1,2,3...) to letter (A,B,C...)
            const rowLabel = seat.row ? String.fromCharCode(64 + seat.row) : 'A';

            return {
                id: seat.id,
                name: seat.name,
                row: rowLabel,
                number: seat.col,
                type: mapSeatTypeFromAPI(seat.seatType),
                status: mapSeatStatusFromAPI(seat.seatStatus || seat.status),
                rowLabel: rowLabel,
                col: seat.col,
                rowIndex: seat.row
            };
        });

        // ðŸ” KIá»‚M TRA TRÃ™NG Tá»ŒA Äá»˜
        const coordinateMap = new Map();
        const duplicates = [];

        layoutSeats.forEach(seat => {
            const coordKey = `${seat.rowIndex}-${seat.col}`;
            if (coordinateMap.has(coordKey)) {
                const existing = coordinateMap.get(coordKey);
                duplicates.push({
                    coord: coordKey,
                    seats: [existing, seat]
                });
                console.error(`âš ï¸ TRÃ™NG Tá»ŒA Äá»˜: Gháº¿ ${existing.id} vÃ  ${seat.id} cÃ¹ng cÃ³ tá»a Ä‘á»™ (row: ${seat.rowIndex}, col: ${seat.col})`);
            } else {
                coordinateMap.set(coordKey, seat);
            }
        });

        if (duplicates.length > 0) {
            console.error(`âŒ TÃ¬m tháº¥y ${duplicates.length} cáº·p gháº¿ bá»‹ trÃ¹ng tá»a Ä‘á»™:`, duplicates);
            notification.warning(`PhÃ¡t hiá»‡n ${duplicates.length} cáº·p gháº¿ cÃ³ tá»a Ä‘á»™ trÃ¹ng nhau!`);
        } else {
            console.log(`âœ… Táº¥t cáº£ ${layoutSeats.length} gháº¿ Ä‘á»u cÃ³ tá»a Ä‘á»™ riÃªng biá»‡t`);
        }

        // NhÃ³m gháº¿ theo rowLabel (A, B, C... thay vÃ¬ rowIndex)
        const groupedByRow = layoutSeats.reduce((acc, seat) => {
            const rowKey = seat.rowLabel; // Sá»­ dá»¥ng rowLabel (A, B, C...)
            if (!acc[rowKey]) {
                acc[rowKey] = [];
            }
            acc[rowKey].push(seat);
            return acc;
        }, {});

        // Táº¡o rows array cho component, sáº¯p xáº¿p theo rowLabel (A-Z)
        const rows = Object.keys(groupedByRow)
            .sort((a, b) => a.localeCompare(b)) // Sáº¯p xáº¿p theo alphabet (A, B, C... I, J...)
            .map(rowLabel => {
                // Sáº¯p xáº¿p gháº¿ trong hÃ ng theo col (tá»a Ä‘á»™ cá»™t)
                const rowSeats = groupedByRow[rowLabel].sort((a, b) => a.col - b.col);

                // ðŸ” KIá»‚M TRA TRÃ™NG COL TRONG CÃ™NG HÃ€NG
                const colsInRow = rowSeats.map(s => s.col);
                const uniqueCols = new Set(colsInRow);
                if (colsInRow.length !== uniqueCols.size) {
                    console.error(`âš ï¸ HÃ ng ${rowLabel} cÃ³ gháº¿ trÃ¹ng cá»™t:`, rowSeats.map(s => `${s.id}(col:${s.col})`));
                }

                const hasVipSeats = rowSeats.some(seat => seat.type === 'vip');

                return {
                    label: rowLabel,
                    seats: rowSeats,
                    isVip: hasVipSeats
                };
            });

        // TÃ­nh toÃ¡n thá»‘ng kÃª
        const totalSeats = layoutSeats.length;
        const vipRows = rows.filter(row => row.isVip).map(row => row.label);
        const blockedSeats = layoutSeats.filter(seat => seat.status === 'blocked').map(seat => seat.id);

        // ðŸ“Š LOG THá»NG KÃŠ
        console.log('ðŸ“Š Thá»‘ng kÃª sÆ¡ Ä‘á»“ gháº¿:');
        console.log(`   - Tá»•ng sá»‘ gháº¿: ${totalSeats}`);
        console.log(`   - Sá»‘ hÃ ng: ${rows.length}`);
        rows.forEach(row => {
            console.log(`   - HÃ ng ${row.label} (rowIndex: ${row.seats[0]?.rowIndex}): ${row.seats.length} gháº¿, cols: [${row.seats.map(s => s.col).join(', ')}]`);
        });

        setSeatLayout({
            rows: rows,
            totalSeats: totalSeats,
            vipSeats: vipRows,
            blockedSeats: blockedSeats
        });
    };

    const mapSeatTypeFromAPI = (apiSeatType) => {
        const typeMap = {
            'REGULAR': 'regular',
            'VIP': 'vip',
            'COUPLE': 'couple',
            'SWEETBOX': 'sweetbox',
            'ALL': 'all'
        };
        return typeMap[apiSeatType] || 'regular';
    };

    const mapSeatTypeToAPI = (componentSeatType) => {
        const typeMap = {
            'regular': 'REGULAR',
            'vip': 'VIP',
            'couple': 'COUPLE',
            'sweetbox': 'SWEETBOX',
            'all': 'ALL'
        };
        return typeMap[componentSeatType] || 'REGULAR';
    };

    const mapSeatStatusFromAPI = (apiStatus) => {
        const statusMap = {
            'AVAILABLE': 'available',
            'HELD': 'held',
            'BOOKED': 'booked',
            'UNAVAILABLE': 'unavailable',
            'MAINTENANCE': 'maintenance',
            'BLOCKED': 'blocked'
        };
        return statusMap[apiStatus] || 'available';
    };

    const mapSeatStatusToAPI = (componentStatus) => {
        const statusMap = {
            'available': 'AVAILABLE',
            'held': 'HELD',
            'booked': 'BOOKED',
            'unavailable': 'UNAVAILABLE',
            'maintenance': 'MAINTENANCE',
            'blocked': 'BLOCKED'
        };
        return statusMap[componentStatus] || 'AVAILABLE';
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

    const getSeatColor = (seat) => {
        if (selectedSeats.includes(seat.id)) return '#1890ff';

        // Æ¯u tiÃªn hiá»ƒn thá»‹ tráº¡ng thÃ¡i trÆ°á»›c, sau Ä‘Ã³ má»›i Ä‘áº¿n loáº¡i gháº¿
        switch (seat.status) {
            case 'blocked':
                return '#8c8c8c'; // MÃ u xÃ¡m Ä‘áº­m - Gháº¿ bá»‹ khÃ³a
            case 'booked':
                return '#ff4d4f'; // MÃ u Ä‘á» - Gháº¿ Ä‘Ã£ Ä‘áº·t
            case 'held':
                return '#faad14'; // MÃ u vÃ ng cam - Gháº¿ Ä‘ang giá»¯ chá»—
            case 'unavailable':
                return '#d9d9d9'; // MÃ u xÃ¡m nháº¡t - Gháº¿ khÃ´ng kháº£ dá»¥ng
            case 'maintenance':
                return '#722ed1'; // MÃ u tÃ­m - Gháº¿ Ä‘ang báº£o trÃ¬
            case 'available':
            default:
                // Khi available, mÃ u sáº¯c dá»±a vÃ o loáº¡i gháº¿
                switch (seat.type) {
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
                switch (seat.type) {
                    case 'vip':
                        return <StarIcon className="h-4 w-4" />;
                    case 'couple':
                        return <HeartIcon className="h-4 w-4" />;
                    case 'sweetbox':
                        return <HeartIcon className="h-4 w-4" />; // Icon trÃ¡i tim cho Sweetbox
                    case 'regular':
                    default:
                        return <User className="h-4 w-4" />;
                }
        }
    };

    const handleSeatClick = (seat) => {
        console.log('ðŸ–±ï¸ Seat clicked:', seat.id, seat.name || `${seat.row}${seat.number}`);
        console.log('ðŸ–±ï¸ Seat clicked:', seat);
        // Má»Ÿ modal chá»‰nh sá»­a gháº¿
        setSelectedSeat(seat);
        setShowSeatEditModal(true);

        // Äáº£m báº£o name cÃ³ giÃ¡ trá»‹, náº¿u khÃ´ng thÃ¬ táº¡o tá»« row vÃ  number
        const seatName = seat.name || `${seat.row}${seat.number}`;

        setSeatEditFormValues({
            name: seatName,
            type: seat.type || 'regular',
            status: seat.status || 'available'
        });

        console.log('Setting form values:', seatEditFormValues);
    };

    const handleBulkEdit = async (values) => {
        try {
            // ðŸ“¡ Gá»ŒI API Cáº¬P NHáº¬T Tá»ªNG GHáº¾ ÄÃƒ CHá»ŒN (Cáº§n Ä‘áº§y Ä‘á»§ SeatRequest fields)
            const updatePromises = selectedSeats.map(seatId => {
                // TÃ¬m seat Ä‘á»ƒ láº¥y thÃ´ng tin Ä‘áº§y Ä‘á»§
                const seat = seatLayout.rows
                    .flatMap(row => row.seats)
                    .find(s => s.id === seatId);

                if (!seat) return Promise.resolve();

                const seatData = {
                    roomId: selectedScreen.id,
                    name: seat.name,
                    seatType: mapSeatTypeToAPI(values.type),
                    status: mapSeatStatusToAPI(values.status),
                    col: seat.col,
                    row: seat.rowIndex,
                    isActive: values.status !== 'blocked'
                };
                return seatService.updateSeat(seatId, seatData);
            });

            await Promise.all(updatePromises);

            // Cáº­p nháº­t state local
            const newRows = seatLayout.rows.map(row => ({
                ...row,
                seats: row.seats.map(seat =>
                    selectedSeats.includes(seat.id)
                        ? {
                            ...seat,
                            type: values.type,
                            status: values.status,
                            isActive: values.status !== 'blocked'
                        }
                        : seat
                )
            }));

            setSeatLayout({ ...seatLayout, rows: newRows });
            setSelectedSeats([]);
            setShowBulkModal(false);
            notification.success(`ÄÃ£ cáº­p nháº­t ${selectedSeats.length} gháº¿`);
        } catch (error) {
            console.error('âŒ Error bulk editing seats:', error);
            notification.error(error.response?.data?.message || 'Cáº­p nháº­t hÃ ng loáº¡t tháº¥t báº¡i');
        }
    };

    const handleSeatEdit = async (values) => {
        try {
            console.log('ðŸ’¾ Editing seat:', selectedSeat.id);

            // Kiá»ƒm tra náº¿u Ä‘á»•i sang gháº¿ Ä‘Ã´i, cáº§n Ä‘áº£m báº£o cá»™t tiáº¿p theo trá»‘ng
            if (values.type === 'couple' && selectedSeat.type !== 'couple') {
                const targetRow = seatLayout.rows.find(r => r.label === selectedSeat.row);
                const nextCol = selectedSeat.col + 1;
                const hasNextSeat = targetRow.seats.some(s => s.col === nextCol && s.id !== selectedSeat.id);

                if (hasNextSeat) {
                    notification.error(`KhÃ´ng thá»ƒ Ä‘á»•i sang gháº¿ Ä‘Ã´i! Cá»™t ${nextCol} Ä‘Ã£ cÃ³ gháº¿. Gháº¿ Ä‘Ã´i cáº§n 2 vá»‹ trÃ­ liÃªn tiáº¿p.`);
                    return;
                }
            }


            // ðŸ“¡ Gá»ŒI API Cáº¬P NHáº¬T GHáº¾ (SeatRequest: theaterId, name, seatType, seatStatus, col, row)
            const seatData = {
                theaterId: selectedScreen.id,
                name: values.name || selectedSeat.name,
                seatType: mapSeatTypeToAPI(values.type),
                seatStatus: mapSeatStatusToAPI(values.status),
                col: selectedSeat.col,
                row: selectedSeat.rowIndex
            };

            console.log('ðŸ“¡ Updating seat via API:', seatData);
            const response = await seatService.updateSeat(selectedSeat.id, seatData);
            const updatedSeat = response?.data?.data || response?.data || response;
            console.log('âœ… Seat updated:', updatedSeat);

            // Convert row number to letter
            const rowLabel = String.fromCharCode(64 + updatedSeat.row); // 1â†’A, 2â†’B, etc.

            // Cáº­p nháº­t state vá»›i dá»¯ liá»‡u Ä‘áº§y Ä‘á»§ tá»« API
            const newRows = seatLayout.rows.map(row => ({
                ...row,
                seats: row.seats.map(seat =>
                    seat.id === selectedSeat.id
                        ? {
                            ...seat,
                            id: updatedSeat.id,
                            name: updatedSeat.name,
                            row: rowLabel,
                            number: updatedSeat.col,
                            type: mapSeatTypeFromAPI(updatedSeat.seatType),
                            status: mapSeatStatusFromAPI(updatedSeat.seatStatus || updatedSeat.status),
                            rowLabel: rowLabel,
                            col: updatedSeat.col,
                            rowIndex: updatedSeat.row
                        }
                        : seat
                )
            }));

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`ÄÃ£ cáº­p nháº­t gháº¿ ${selectedSeat.name}`);

            setShowSeatEditModal(false);
            setSelectedSeat(null);
        } catch (error) {
            console.error('âŒ Error saving seat:', error);
            console.error('Error response:', error.response);
            notification.error(error.response?.data?.message || 'LÆ°u thÃ´ng tin gháº¿ tháº¥t báº¡i');
        }
    };

    const handleDeleteSeat = async () => {
        if (!selectedSeat) {
            notification.warning('KhÃ´ng cÃ³ gháº¿ nÃ o Ä‘Æ°á»£c chá»n');
            return;
        }

        const seatInfo = selectedSeat.name || `${selectedSeat.row}${selectedSeat.number}`;
        console.log('ðŸ”´ Deleting seat:', seatInfo, '| ID:', selectedSeat.id);

        try {
            // ðŸ“¡ Gá»ŒI API XÃ“A GHáº¾
            console.log('ðŸ“¡ Calling API to delete seat ID:', selectedSeat.id);
            await seatService.deleteSeat(selectedSeat.id);
            console.log('âœ… API delete successful');

            // Cáº­p nháº­t state local - loáº¡i bá» gháº¿ Ä‘Ã£ xÃ³a
            const newRows = seatLayout.rows
                .map(row => ({
                    ...row,
                    seats: row.seats.filter(seat => seat.id !== selectedSeat.id)
                }))
                .filter(row => row.seats.length > 0); // XÃ³a hÃ ng náº¿u khÃ´ng cÃ²n gháº¿

            setSeatLayout({ ...seatLayout, rows: newRows });
            setShowSeatEditModal(false);
            setSelectedSeat(null);
            notification.success(`ÄÃ£ xÃ³a gháº¿ ${seatInfo}`);
        } catch (error) {
            console.error('âŒ Error deleting seat:', error);
            notification.error(error.response?.data?.message || 'XÃ³a gháº¿ tháº¥t báº¡i');
        }
    };

    const handleAddSeat = async (rowLabel) => {
        try {
            const targetRow = seatLayout.rows.find(row => row.label === rowLabel);
            if (!targetRow) return;

            // TÃ¬m sá»‘ gháº¿ lá»›n nháº¥t vÃ  tá»a Ä‘á»™ col lá»›n nháº¥t trong hÃ ng
            const maxSeatNumber = Math.max(...targetRow.seats.map(seat => seat.number));
            const maxCol = Math.max(...targetRow.seats.map(seat => seat.col || seat.number));
            const newSeatNumber = maxSeatNumber + 1;
            const newCol = maxCol + 1;
            const newSeatId = `${rowLabel}${newSeatNumber}`;
            const rowIndex = rowLabel.charCodeAt(0) - 65;

            // Chuáº©n bá»‹ dá»¯ liá»‡u Ä‘á»ƒ gá»­i lÃªn API
            const seatData = {
                theaterId: selectedScreen.id,
                name: newSeatId,
                seatType: 'REGULAR', // Máº·c Ä‘á»‹nh lÃ  gháº¿ thÆ°á»ng
                seatStatus: 'AVAILABLE',
                col: newCol,
                row: rowIndex + 1
            };

            // Gá»i API táº¡o gháº¿
            const response = await seatService.createSeat(seatData);
            const createdSeat = response.data;

            // Táº¡o object gháº¿ má»›i cho local state
            const newSeat = {
                id: createdSeat.id, // DÃ¹ng ID tá»« backend
                name: createdSeat.name,
                row: rowLabel,
                number: newSeatNumber,
                type: mapSeatTypeFromAPI(createdSeat.seatType),
                status: mapSeatStatusFromAPI(createdSeat.seatStatus || createdSeat.status),
                rowLabel: rowLabel,
                col: newCol,
                rowIndex: rowIndex + 1
            };

            // Cáº­p nháº­t layout vÃ  sáº¯p xáº¿p láº¡i gháº¿ theo col
            const newRows = seatLayout.rows.map(row =>
                row.label === rowLabel
                    ? {
                        ...row,
                        seats: [...row.seats, newSeat].sort((a, b) => a.col - b.col)
                    }
                    : row
            );

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`ÄÃ£ thÃªm gháº¿ ${newSeatId} (Tá»a Ä‘á»™: hÃ ng ${rowIndex}, cá»™t ${newCol})`);
        } catch (error) {
            console.error('Error creating seat:', error);
            notification.error(error.response?.data?.message || 'Táº¡o gháº¿ tháº¥t báº¡i');
        }
    };

    const handleAddSeatAtPosition = async (rowLabel, targetCol) => {
        try {
            const targetRow = seatLayout.rows.find(row => row.label === rowLabel);
            if (!targetRow) return;

            // Kiá»ƒm tra xem cá»™t nÃ y Ä‘Ã£ cÃ³ gháº¿ chÆ°a
            if (targetRow.seats.some(s => s.col === targetCol)) {
                notification.warning(`Cá»™t ${targetCol} trong hÃ ng ${rowLabel} Ä‘Ã£ cÃ³ gháº¿!`);
                return;
            }

            // TÃªn gháº¿ = rowLabel + sá»‘ cá»™t (vÃ­ dá»¥: A5)
            const seatName = `${rowLabel}${targetCol}`;
            const rowIndex = rowLabel.charCodeAt(0) - 64; // A=1, B=2, etc.

            // Chuáº©n bá»‹ dá»¯ liá»‡u Ä‘á»ƒ gá»­i lÃªn API
            const seatData = {
                theaterId: selectedScreen.id,
                name: seatName,
                col: targetCol,
                row: rowIndex,
                seatType: 'REGULAR',
                seatStatus: 'AVAILABLE'
            };

            console.log("create seat at position", seatData)

            // Gá»i API táº¡o gháº¿
            const response = await seatService.createSeat(seatData);
            const createdSeat = response.data;

            // Táº¡o object gháº¿ má»›i cho local state
            const newSeat = {
                id: createdSeat.id,
                name: createdSeat.name,
                row: rowLabel,
                number: targetCol,
                type: mapSeatTypeFromAPI(createdSeat.seatType),
                status: mapSeatStatusFromAPI(createdSeat.seatStatus || createdSeat.status),
                rowLabel: rowLabel,
                col: createdSeat.col,
                rowIndex: createdSeat.row
            };

            // Cáº­p nháº­t layout vÃ  sáº¯p xáº¿p láº¡i gháº¿ theo col
            const newRows = seatLayout.rows.map(row =>
                row.label === rowLabel
                    ? {
                        ...row,
                        seats: [...row.seats, newSeat].sort((a, b) => a.col - b.col)
                    }
                    : row
            );

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`ÄÃ£ thÃªm gháº¿ ${seatName} táº¡i hÃ ng ${rowLabel}, cá»™t ${targetCol}`);
        } catch (error) {
            console.error('Error creating seat at position:', error);
            notification.error(error.response?.data?.message || 'Táº¡o gháº¿ tháº¥t báº¡i');
        }
    };

    const handleAddRow = async () => {
        try {
            // TÃ¬m label hÃ ng tiáº¿p theo (A, B, C, ... Z)
            const existingLabels = seatLayout.rows.map(row => row.label).sort();
            let nextLabel = 'A';

            for (let i = 0; i < existingLabels.length; i++) {
                const currentLabel = String.fromCharCode(65 + i); // A=65, B=66, ...
                if (!existingLabels.includes(currentLabel)) {
                    nextLabel = currentLabel;
                    break;
                }
                if (i === existingLabels.length - 1) {
                    nextLabel = String.fromCharCode(existingLabels[i].charCodeAt(0) + 1);
                }
            }

            const rowIndex = nextLabel.charCodeAt(0) - 64; // A=1, B=2, etc.
            const defaultSeatsPerRow = 10;

            console.log(`âž• Creating new row ${nextLabel} with ${defaultSeatsPerRow} seats via API...`);

            // ðŸ“¡ Gá»ŒI API Táº O Tá»ªNG GHáº¾ TRONG HÃ€NG Má»šI
            const newRowSeats = [];
            for (let j = 1; j <= defaultSeatsPerRow; j++) {
                const seatName = `${nextLabel}${j}`;
                const seatData = {
                    theaterId: selectedScreen.id,
                    name: seatName,
                    col: j,
                    row: rowIndex,
                    seatType: 'REGULAR',
                    seatStatus: 'AVAILABLE'
                };

                const response = await seatService.createSeat(seatData);
                const createdSeat = response?.data?.data || response?.data || response;

                newRowSeats.push({
                    id: createdSeat.id,
                    name: createdSeat.name,
                    row: nextLabel,
                    number: j,
                    type: mapSeatTypeFromAPI(createdSeat.seatType),
                    status: mapSeatStatusFromAPI(createdSeat.seatStatus || createdSeat.status),
                    rowLabel: nextLabel,
                    col: createdSeat.col,
                    rowIndex: createdSeat.row
                });
            }

            // Táº¡o hÃ ng má»›i vá»›i gháº¿ Ä‘Ã£ cÃ³ ID tá»« API
            const newRow = {
                label: nextLabel,
                seats: newRowSeats,
                isVip: false
            };

            console.log(`âœ… Created row ${nextLabel} with ${newRowSeats.length} seats`);

            // ThÃªm hÃ ng má»›i vÃ o layout (sáº¯p xáº¿p theo thá»© tá»± alphabet)
            const newRows = [...seatLayout.rows, newRow].sort((a, b) => a.label.localeCompare(b.label));

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`ÄÃ£ thÃªm hÃ ng ${nextLabel} vá»›i ${defaultSeatsPerRow} gháº¿`);
        } catch (error) {
            console.error('âŒ Error creating new row:', error);
            notification.error(error.response?.data?.message || 'Táº¡o hÃ ng má»›i tháº¥t báº¡i');
        }
    };

    const handleRemoveRow = async (rowLabel) => {
        try {
            if (seatLayout.rows.length <= 1) {
                notification.warning('KhÃ´ng thá»ƒ xÃ³a hÃ ng. PhÃ²ng chiáº¿u pháº£i cÃ³ Ã­t nháº¥t 1 hÃ ng gháº¿.');
                return;
            }

            const targetRow = seatLayout.rows.find(row => row.label === rowLabel);
            if (!targetRow) {
                notification.error('KhÃ´ng tÃ¬m tháº¥y hÃ ng gháº¿');
                return;
            }

            // ðŸ“¡ Gá»ŒI API XÃ“A Táº¤T Cáº¢ GHáº¾ TRONG HÃ€NG
            const deletePromises = targetRow.seats.map(seat => seatService.deleteSeat(seat.id));
            await Promise.all(deletePromises);

            // Cáº­p nháº­t state local
            const newRows = seatLayout.rows.filter(row => row.label !== rowLabel);
            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`ÄÃ£ xÃ³a hÃ ng ${rowLabel} (${targetRow.seats.length} gháº¿)`);
        } catch (error) {
            console.error('âŒ Error removing row:', error);
            notification.error(error.response?.data?.message || 'XÃ³a hÃ ng gháº¿ tháº¥t báº¡i');
        }
    };

    const resetLayout = async () => {
        try {
            await loadSeatsFromAPI(selectedScreen);
            setSelectedSeats([]);
            notification.success('ÄÃ£ khÃ´i phá»¥c bá»‘ cá»¥c ban Ä‘áº§u');
        } catch (error) {
            console.error('âŒ Error resetting layout:', error);
            notification.error('KhÃ´i phá»¥c bá»‘ cá»¥c tháº¥t báº¡i');
        }
    };

    // const saveLayout = async () => {
    //     try {
    //         // LÆ°u táº¥t cáº£ gháº¿ vÃ o database
    //         const allSeats = seatLayout.rows.flatMap(row => row.seats);

    //         // XÃ³a táº¥t cáº£ gháº¿ cÅ© trÆ°á»›c
    //         await seatService.deleteAllSeatsByRoomId(selectedScreen.id);

    //         // Táº¡o gháº¿ má»›i vá»›i Ä‘áº§y Ä‘á»§ thÃ´ng tin
    //         const createPromises = allSeats.map(seat => {
    //             const seatData = {
    //                 roomId: selectedScreen.id,
    //                 rowLabel: seat.rowLabel || seat.row,
    //                 seatNumber: String(seat.seatNumber || seat.number),
    //                 seatType: mapSeatTypeToAPI(seat.type),
    //                 status: mapSeatStatusToAPI(seat.status),
    //                 col: seat.col || seat.number,
    //                 row: seat.rowIndex !== undefined ? seat.rowIndex : (seat.row.charCodeAt(0) - 65),
    //                 isActive: seat.isActive !== undefined ? seat.isActive : (seat.status !== 'blocked')
    //             };
    //             return seatService.createSeat(seatData);
    //         });

    //         await Promise.all(createPromises);

    //         message.success('ÄÃ£ lÆ°u sÆ¡ Ä‘á»“ gháº¿ thÃ nh cÃ´ng');

    //         // Gá»i callback onSave náº¿u cÃ³
    //         if (onSave) {
    //             const layoutData = {
    //                 rows: seatLayout.rows.length,
    //                 seatsPerRow: seatLayout.rows[0]?.seats.length || 0,
    //                 vipRows: seatLayout.vipSeats,
    //                 seats: allSeats
    //             };
    //             onSave(layoutData);
    //         }
    //     } catch (error) {
    //         console.error('Error saving seat layout:', error);
    //         message.error(error.response?.data?.message || 'LÆ°u sÆ¡ Ä‘á»“ gháº¿ tháº¥t báº¡i');
    //     }
    // };

    const getSeatStats = () => {
        const allSeats = seatLayout.rows.flatMap(row => row.seats);
        return {
            total: allSeats.length,
            vip: allSeats.filter(s => s.type === 'vip').length,
            couple: allSeats.filter(s => s.type === 'couple').length,
            regular: allSeats.filter(s => s.type === 'regular').length,
            sweetbox: allSeats.filter(s => s.type === 'sweetbox').length,
            // Thá»‘ng kÃª theo tráº¡ng thÃ¡i
            available: allSeats.filter(s => s.status === 'available').length,
            booked: allSeats.filter(s => s.status === 'booked').length,
            blocked: allSeats.filter(s => s.status === 'blocked').length
        };
    };

    const stats = getSeatStats();

    return (
        <div className="font-sans scroll-smooth [&_*::-webkit-scrollbar]:w-2 [&_*::-webkit-scrollbar]:h-2 [&_*::-webkit-scrollbar-track]:bg-gray-100 [&_*::-webkit-scrollbar-track]:rounded [&_*::-webkit-scrollbar-thumb]:bg-gray-400 [&_*::-webkit-scrollbar-thumb]:rounded [&_*::-webkit-scrollbar-thumb]:transition-colors [&_*::-webkit-scrollbar-thumb]:duration-200 hover:[&_*::-webkit-scrollbar-thumb]:bg-gray-500">
            {/* Screen */}
            <div className="text-center m-0">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-12 py-2 rounded-t-[10px] rounded-b-sm font-bold text-xs tracking-wider inline-block shadow-[0_4px_15px_rgba(102,126,234,0.3)] mb-8">MÃ€N HÃŒNH</div>
            </div>

            {/* Seat Layout */}
            <div className="flex flex-col items-center gap-2 p-5 bg-gray-50 rounded-xl border border-gray-200 relative mb-5" ref={seatLayoutRef}>
                {seatLayout.rows.length === 0 ? (
                    // âœ… HIá»‚N THá»Š NÃšT Táº O SÆ  Äá»’ GHáº¾ KHI CHÆ¯A CÃ“ GHáº¾
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        padding: '40px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        border: '2px dashed #d9d9d9'
                    }}>
                        <Ban className="h-12 w-12 text-gray-400 mb-4" />
                        <h4 className="text-gray-600 mb-2 text-lg font-semibold">
                            PhÃ²ng chiáº¿u chÆ°a cÃ³ sÆ¡ Ä‘á»“ gháº¿
                        </h4>
                        <p className="text-gray-500 mb-6">
                            Táº¡o sÆ¡ Ä‘á»“ gháº¿ máº·c Ä‘á»‹nh vá»›i {selectedScreen?.rowsCount || 10} hÃ ng Ã— {selectedScreen?.seatsPerRow || 12} gháº¿/hÃ ng
                        </p>
                        <Button
                            className="h-12 text-base font-medium rounded-lg px-8"
                            onClick={() => generateDefaultSeatLayout(selectedScreen)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Táº¡o sÆ¡ Ä‘á»“ gháº¿ máº·c Ä‘á»‹nh
                        </Button>
                    </div>
                ) : (
                    <>
                        {seatLayout.rows.map((row, rowIndex) => {
                            // TÃ¬m cá»™t lá»›n nháº¥t trong toÃ n bá»™ phÃ²ng Ä‘á»ƒ Ä‘áº£m báº£o táº¥t cáº£ hÃ ng cÃ³ cÃ¹ng sá»‘ cá»™t
                            const allCols = seatLayout.rows.flatMap(r => r.seats.map(s => s.col));
                            const maxColInRoom = allCols.length > 0 ? Math.max(...allCols) : 20; // Máº·c Ä‘á»‹nh 20 cá»™t náº¿u chÆ°a cÃ³ gháº¿
                            const minCol = 1; // LuÃ´n báº¯t Ä‘áº§u tá»« cá»™t 1
                            const totalCols = maxColInRoom; // Sá»‘ cá»™t cá»‘ Ä‘á»‹nh cho táº¥t cáº£ hÃ ng

                            // Táº¡o Set cÃ¡c cá»™t Ä‘Ã£ cÃ³ gháº¿ Ä‘á»ƒ kiá»ƒm tra nhanh
                            const occupiedCols = new Set(row.seats.map(s => s.col));

                            return (
                                <div key={row.label} className="flex items-center gap-4 mb-1.5">
                                    <div
                                        className="seats"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${totalCols}, 36px)`,
                                            gap: '4px',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Render táº¥t cáº£ cÃ¡c cá»™t tá»« 1 Ä‘áº¿n maxColInRoom */}
                                        {Array.from({ length: totalCols }, (_, index) => {
                                            const currentCol = minCol + index;
                                            const gridPosition = index + 1;

                                            // Kiá»ƒm tra xem cá»™t nÃ y cÃ³ gháº¿ khÃ´ng
                                            const seat = row.seats.find(s => s.col === currentCol);

                                            // Kiá»ƒm tra xem cá»™t trÆ°á»›c cÃ³ gháº¿ Ä‘Ã´i khÃ´ng (gháº¿ Ä‘Ã´i chiáº¿m cá»™t hiá»‡n táº¡i)
                                            const prevCol = currentCol - 1;
                                            const prevSeat = row.seats.find(s => s.col === prevCol);
                                            const isOccupiedByCoupleSeat = prevSeat && prevSeat.type === 'couple';

                                            if (isOccupiedByCoupleSeat) {
                                                // Cá»™t nÃ y bá»‹ gháº¿ Ä‘Ã´i chiáº¿m, khÃ´ng render gÃ¬
                                                return null;
                                            }

                                            if (seat) {
                                                // Náº¿u cÃ³ gháº¿, render gháº¿
                                                const isCoupleSeat = seat.type === 'couple';

                                                return (
                                                    <Tooltip
                                                        key={`seat-${seat.id}`}
                                                        title={
                                                            <div>
                                                                <div><strong>Gháº¿ {seat.id}</strong></div>
                                                                <div>HÃ ng: {seat.row} (Tá»a Ä‘á»™: {seat.rowIndex})</div>
                                                                <div>Cá»™t: {seat.number} (Tá»a Ä‘á»™: {seat.col})</div>
                                                                <div>Loáº¡i: {
                                                                    seat.type === 'regular' ? 'ThÆ°á»ng' :
                                                                        seat.type === 'vip' ? 'VIP' :
                                                                            seat.type === 'couple' ? 'ÄÃ´i' :
                                                                                seat.type === 'sweetbox' ? 'Sweetbox' :
                                                                                    'N/A'
                                                                }</div>
                                                                <div>Tráº¡ng thÃ¡i: {getStatusText(seat.status)}</div>
                                                                {isCoupleSeat && <div style={{ color: '#eb2f96' }}>âš ï¸ Chiáº¿m 2 vá»‹ trÃ­</div>}
                                                            </div>
                                                        }
                                                        mouseEnterDelay={0.3}
                                                        mouseLeaveDelay={0.1}
                                                        overlayInnerStyle={{ pointerEvents: 'none' }}
                                                    >
                                                        <div
                                                            className={`seat clickable ${selectedSeats.includes(seat.id) ? 'selected' : ''
                                                                } ${seat.type === 'couple' ? 'seat-couple' : ''} ${seat.status === 'blocked' ? 'blocked' : ''}`}
                                                            style={{
                                                                backgroundColor: getSeatColor(seat),
                                                                color: 'white',
                                                                gridColumn: isCoupleSeat
                                                                    ? `${gridPosition} / span 2` // Gháº¿ Ä‘Ã´i chiáº¿m 2 cá»™t
                                                                    : gridPosition,
                                                                width: isCoupleSeat ? '72px' : '36px',
                                                                height: '36px',
                                                                borderRadius: '6px',
                                                                border: selectedSeats.includes(seat.id)
                                                                    ? '2px solid #1890ff'
                                                                    : '1px solid rgba(255, 255, 255, 0.3)',
                                                                boxShadow: selectedSeats.includes(seat.id)
                                                                    ? '0 0 0 2px rgba(24, 144, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)'
                                                                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontWeight: '600',
                                                                fontSize: '11px',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                willChange: 'auto'
                                                            }}
                                                            onClick={() => handleSeatClick(seat)}
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
                                                                    {seat.row}{seat.number}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                );
                                            } else {
                                                // Náº¿u khÃ´ng cÃ³ gháº¿, render nÃºt thÃªm gháº¿
                                                return (
                                                    <Tooltip
                                                        key={`empty-${row.label}-${currentCol}`}
                                                        title={`ThÃªm gháº¿ vÃ o hÃ ng ${row.label}, cá»™t ${currentCol}`}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="add-seat-btn w-8 h-8 border-gray-300 text-gray-500 opacity-50"
                                                            onClick={() => handleAddSeatAtPosition(row.label, currentCol)}
                                                            style={{
                                                                gridColumn: gridPosition
                                                            }}
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </Tooltip>
                                                );
                                            }
                                        })}

                                        {/* NÃºt thÃªm gháº¿ á»Ÿ cuá»‘i hÃ ng */}
                                        <Tooltip content={`ThÃªm gháº¿ má»›i vÃ o cuá»‘i hÃ ng ${row.label}`}>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="add-seat-btn w-8 h-8 border-green-500 text-green-600 ml-2 font-bold"
                                                onClick={() => handleAddSeat(row.label)}
                                                style={{
                                                    gridColumn: totalCols + 1
                                                }}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Row Button at the bottom */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '20px',
                            paddingTop: '16px',
                            borderTop: '1px dashed #d9d9d9'
                        }}>
                            <Button
                                variant="outline"
                                onClick={handleAddRow}
                                className="border-green-500 text-green-600 bg-green-50 min-w-[200px] h-12 rounded-lg text-sm font-medium hover:bg-green-100"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                ThÃªm hÃ ng má»›i
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Legend - ChÃº thÃ­ch mÃ u sáº¯c vÃ  tráº¡ng thÃ¡i */}
            <Card className="mb-4">
                <div className="border-b border-gray-200 px-5 py-4 mb-0">
                    <h3 className="text-gray-800 text-base font-semibold m-0">ChÃº thÃ­ch</h3>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                    {/* Loáº¡i gháº¿ */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">ThÆ°á»ng</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-yellow-500 rounded flex items-center justify-center text-white">
                            <Star className="h-2 w-2" />
                        </div>
                        <span className="text-xs">VIP</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-pink-500 rounded flex items-center justify-center text-white">
                            <Heart className="h-2 w-2" />
                        </div>
                        <span className="text-xs">ÄÃ´i</span>
                    </div>

                    {/* Divider */}
                    <Separator orientation="vertical" className="h-4" />

                    {/* Tráº¡ng thÃ¡i */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">CÃ³ thá»ƒ Ä‘áº·t</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-yellow-500 rounded flex items-center justify-center text-white">
                            <Clock className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Giá»¯ chá»—</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-red-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">ÄÃ£ Ä‘áº·t</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-gray-400 rounded flex items-center justify-center text-white">
                            <X className="h-2 w-2" />
                        </div>
                        <span className="text-xs">KhÃ´ng kháº£ dá»¥ng</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-purple-600 rounded flex items-center justify-center text-white">
                            <Wrench className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Báº£o trÃ¬</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-gray-500 rounded flex items-center justify-center text-white">
                            <Ban className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Bá»‹ khÃ³a</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Äang chá»n</span>
                    </div>
                </div>
            </Card>

            {/* Bulk Edit Modal */}
            {showBulkModal && (
                <ResponsiveDialog
                    heading="Chá»‰nh sá»­a gháº¿ hÃ ng loáº¡t"
                    open={showBulkModal}
                    onClose={() => setShowBulkModal(false)}
                    actions={null}
                    destroyOnClose={true}
                    getPopupContainer={trigger => trigger.parentElement}
                    transitionName=""
                    maskTransitionName=""
                >
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handleBulkEdit({
                            type: formData.get('type') || 'regular',
                            status: formData.get('status') || 'available'
                        });
                    }}>
                        <p>ÄÃ£ chá»n: <strong>{selectedSeats.length}</strong> gháº¿</p>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Loáº¡i gháº¿</label>
                                <Select name="type" defaultValue="regular">
                                    <option value="regular">Gháº¿ thÆ°á»ng</option>
                                    <option value="vip">Gháº¿ VIP</option>
                                    <option value="couple">Gháº¿ Ä‘Ã´i</option>
                                    <option value="sweetbox">Sweetbox</option>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Tráº¡ng thÃ¡i</label>
                                <Select name="status" defaultValue="available">
                                    <option value="available">CÃ³ thá»ƒ Ä‘áº·t</option>
                                    <option value="held">Äang giá»¯ chá»—</option>
                                    <option value="booked">ÄÃ£ Ä‘áº·t</option>
                                    <option value="unavailable">KhÃ´ng kháº£ dá»¥ng</option>
                                    <option value="maintenance">Äang báº£o trÃ¬</option>
                                    <option value="blocked">Bá»‹ khÃ³a</option>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowBulkModal(false)}>
                                    Há»§y
                                </Button>
                                <Button type="submit">
                                    Ãp dá»¥ng
                                </Button>
                            </div>
                        </div>
                    </form>
                </ResponsiveDialog>
            )}

            {/* Single Seat Edit Modal */}
            {showSeatEditModal && selectedSeat && (
                <ResponsiveDialog
                    heading={`Chá»‰nh sá»­a gháº¿ ${selectedSeat?.name || `${selectedSeat?.row}${selectedSeat?.number}`}`}
                    open={showSeatEditModal}
                    onClose={() => {
                        setShowSeatEditModal(false);
                        setSelectedSeat(null);
                        setSeatEditFormValues({
                            name: '',
                            type: 'regular',
                            status: 'available'
                        });
                    }}
                    actions={null}
                    maxWidth={600}
                    destroyOnClose={true}
                >
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSeatEdit(seatEditFormValues);
                    }}>
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-medium mb-2 block text-gray-700">
                                    TÃªn gháº¿ <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="VD: A1, B5, ..."
                                    value={seatEditFormValues.name}
                                    onChange={(e) => setSeatEditFormValues({ ...seatEditFormValues, name: e.target.value })}
                                    required
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">
                                        Tá»a Ä‘á»™ hÃ ng
                                    </label>
                                    <Input
                                        value={selectedSeat?.rowIndex ?? '-'}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">
                                        Tá»a Ä‘á»™ cá»™t
                                    </label>
                                    <Input
                                        value={selectedSeat?.col ?? '-'}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block text-gray-700">
                                    Loáº¡i gháº¿ <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={seatEditFormValues.type}
                                    onValueChange={(value) => setSeatEditFormValues({ ...seatEditFormValues, type: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chá»n loáº¡i gháº¿" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">Gháº¿ thÆ°á»ng</SelectItem>
                                        <SelectItem value="vip">Gháº¿ VIP</SelectItem>
                                        <SelectItem value="couple">Gháº¿ Ä‘Ã´i</SelectItem>
                                        <SelectItem value="sweetbox">Sweetbox</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block text-gray-700">
                                    Tráº¡ng thÃ¡i <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={seatEditFormValues.status}
                                    onValueChange={(value) => setSeatEditFormValues({ ...seatEditFormValues, status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">CÃ³ thá»ƒ Ä‘áº·t</SelectItem>
                                        <SelectItem value="held">Äang giá»¯ chá»—</SelectItem>
                                        <SelectItem value="booked">ÄÃ£ Ä‘áº·t</SelectItem>
                                        <SelectItem value="unavailable">KhÃ´ng kháº£ dá»¥ng</SelectItem>
                                        <SelectItem value="maintenance">Äang báº£o trÃ¬</SelectItem>
                                        <SelectItem value="blocked">Bá»‹ khÃ³a</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowSeatEditModal(false);
                                        setSelectedSeat(null);
                                        setSeatEditFormValues({
                                            name: '',
                                            type: 'regular',
                                            status: 'available'
                                        });
                                    }}
                                >
                                    Há»§y
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    LÆ°u thay Ä‘á»•i
                                </Button>
                            </div>
                        </div>
                    </form>

                    <Separator className="my-4" />
                    <div>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteSeat}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            XÃ³a gháº¿
                        </Button>
                    </div>
                </ResponsiveDialog>
            )}
        </div>
    );
};

export default SeatManager;
