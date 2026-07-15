import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { InputNumber } from '@/components/ui/input-number';
import { Modal } from '@/components/ui/modal';
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

    // State cho modal chỉnh sửa ghế đơn lẻ
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
            // Lấy ghế từ API theo roomId
            const response = await seatService.getSeatsByRoomId(screen.id);
            const seats = response?.data || response || [];

            if (seats.length === 0) {
                // ✅ CHỈ HIỂN thị layout rỗng, KHÔNG tự động tạo ghế
                console.log('⚠️ Phòng chiếu chưa có ghế');
                setSeatLayout({
                    rows: [],
                    totalSeats: 0,
                    vipSeats: [],
                    blockedSeats: []
                });
                notification.info('Phòng chiếu chưa có sơ đồ ghế. Vui lòng tạo sơ đồ ghế mặc định.');
            } else {
                // Nếu đã có ghế, sử dụng dữ liệu từ API
                generateSeatLayoutFromAPI(seats);
            }
        } catch (error) {
            console.error('Error loading seats:', error);
            notification.error('Không thể tải danh sách ghế');
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
                    // 📡 GỌI API TẠO GHẾ NGAY
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

                    // ✅ Dùng ID thật từ API (kiểu Long)
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

                console.log(`✅ Created row ${rowLabel} with ${rowSeats.length} seats`);
            }

            console.log(`🎉 Successfully created ${totalRows * seatsPerRow} seats in database`);

            setSeatLayout({
                rows: rows,
                totalSeats: totalRows * seatsPerRow,
                vipSeats: [],
                blockedSeats: []
            });

            notification.success(`Đã tạo ${totalRows * seatsPerRow} ghế cho phòng chiếu`);
        } catch (error) {
            console.error('❌ Error creating default seats:', error);
            notification.error(error.response?.data?.message || 'Tạo sơ đồ ghế mặc định thất bại');
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

        // 🔍 KIỂM TRA TRÙNG TỌA ĐỘ
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
                console.error(`⚠️ TRÙNG TỌA ĐỘ: Ghế ${existing.id} và ${seat.id} cùng có tọa độ (row: ${seat.rowIndex}, col: ${seat.col})`);
            } else {
                coordinateMap.set(coordKey, seat);
            }
        });

        if (duplicates.length > 0) {
            console.error(`❌ Tìm thấy ${duplicates.length} cặp ghế bị trùng tọa độ:`, duplicates);
            notification.warning(`Phát hiện ${duplicates.length} cặp ghế có tọa độ trùng nhau!`);
        } else {
            console.log(`✅ Tất cả ${layoutSeats.length} ghế đều có tọa độ riêng biệt`);
        }

        // Nhóm ghế theo rowLabel (A, B, C... thay vì rowIndex)
        const groupedByRow = layoutSeats.reduce((acc, seat) => {
            const rowKey = seat.rowLabel; // Sử dụng rowLabel (A, B, C...)
            if (!acc[rowKey]) {
                acc[rowKey] = [];
            }
            acc[rowKey].push(seat);
            return acc;
        }, {});

        // Tạo rows array cho component, sắp xếp theo rowLabel (A-Z)
        const rows = Object.keys(groupedByRow)
            .sort((a, b) => a.localeCompare(b)) // Sắp xếp theo alphabet (A, B, C... I, J...)
            .map(rowLabel => {
                // Sắp xếp ghế trong hàng theo col (tọa độ cột)
                const rowSeats = groupedByRow[rowLabel].sort((a, b) => a.col - b.col);

                // 🔍 KIỂM TRA TRÙNG COL TRONG CÙNG HÀNG
                const colsInRow = rowSeats.map(s => s.col);
                const uniqueCols = new Set(colsInRow);
                if (colsInRow.length !== uniqueCols.size) {
                    console.error(`⚠️ Hàng ${rowLabel} có ghế trùng cột:`, rowSeats.map(s => `${s.id}(col:${s.col})`));
                }

                const hasVipSeats = rowSeats.some(seat => seat.type === 'vip');

                return {
                    label: rowLabel,
                    seats: rowSeats,
                    isVip: hasVipSeats
                };
            });

        // Tính toán thống kê
        const totalSeats = layoutSeats.length;
        const vipRows = rows.filter(row => row.isVip).map(row => row.label);
        const blockedSeats = layoutSeats.filter(seat => seat.status === 'blocked').map(seat => seat.id);

        // 📊 LOG THỐNG KÊ
        console.log('📊 Thống kê sơ đồ ghế:');
        console.log(`   - Tổng số ghế: ${totalSeats}`);
        console.log(`   - Số hàng: ${rows.length}`);
        rows.forEach(row => {
            console.log(`   - Hàng ${row.label} (rowIndex: ${row.seats[0]?.rowIndex}): ${row.seats.length} ghế, cols: [${row.seats.map(s => s.col).join(', ')}]`);
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
            'available': 'Có thể đặt',
            'held': 'Đang giữ chỗ',
            'booked': 'Đã đặt',
            'unavailable': 'Không khả dụng',
            'maintenance': 'Đang bảo trì',
            'blocked': 'Bị khóa'
        };
        return statusTextMap[status] || 'Không xác định';
    };

    const getSeatColor = (seat) => {
        if (selectedSeats.includes(seat.id)) return '#1890ff';

        // Ưu tiên hiển thị trạng thái trước, sau đó mới đến loại ghế
        switch (seat.status) {
            case 'blocked':
                return '#8c8c8c'; // Màu xám đậm - Ghế bị khóa
            case 'booked':
                return '#ff4d4f'; // Màu đỏ - Ghế đã đặt
            case 'held':
                return '#faad14'; // Màu vàng cam - Ghế đang giữ chỗ
            case 'unavailable':
                return '#d9d9d9'; // Màu xám nhạt - Ghế không khả dụng
            case 'maintenance':
                return '#722ed1'; // Màu tím - Ghế đang bảo trì
            case 'available':
            default:
                // Khi available, màu sắc dựa vào loại ghế
                switch (seat.type) {
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
                switch (seat.type) {
                    case 'vip':
                        return <StarIcon className="h-4 w-4" />;
                    case 'couple':
                        return <HeartIcon className="h-4 w-4" />;
                    case 'sweetbox':
                        return <HeartIcon className="h-4 w-4" />; // Icon trái tim cho Sweetbox
                    case 'regular':
                    default:
                        return <User className="h-4 w-4" />;
                }
        }
    };

    const handleSeatClick = (seat) => {
        console.log('🖱️ Seat clicked:', seat.id, seat.name || `${seat.row}${seat.number}`);
        console.log('🖱️ Seat clicked:', seat);
        // Mở modal chỉnh sửa ghế
        setSelectedSeat(seat);
        setShowSeatEditModal(true);

        // Đảm bảo name có giá trị, nếu không thì tạo từ row và number
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
            // 📡 GỌI API CẬP NHẬT TỪNG GHẾ ĐÃ CHỌN (Cần đầy đủ SeatRequest fields)
            const updatePromises = selectedSeats.map(seatId => {
                // Tìm seat để lấy thông tin đầy đủ
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

            // Cập nhật state local
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
            notification.success(`Đã cập nhật ${selectedSeats.length} ghế`);
        } catch (error) {
            console.error('❌ Error bulk editing seats:', error);
            notification.error(error.response?.data?.message || 'Cập nhật hàng loạt thất bại');
        }
    };

    const handleSeatEdit = async (values) => {
        try {
            console.log('💾 Editing seat:', selectedSeat.id);

            // Kiểm tra nếu đổi sang ghế đôi, cần đảm bảo cột tiếp theo trống
            if (values.type === 'couple' && selectedSeat.type !== 'couple') {
                const targetRow = seatLayout.rows.find(r => r.label === selectedSeat.row);
                const nextCol = selectedSeat.col + 1;
                const hasNextSeat = targetRow.seats.some(s => s.col === nextCol && s.id !== selectedSeat.id);

                if (hasNextSeat) {
                    notification.error(`Không thể đổi sang ghế đôi! Cột ${nextCol} đã có ghế. Ghế đôi cần 2 vị trí liên tiếp.`);
                    return;
                }
            }


            // 📡 GỌI API CẬP NHẬT GHẾ (SeatRequest: theaterId, name, seatType, seatStatus, col, row)
            const seatData = {
                theaterId: selectedScreen.id,
                name: values.name || selectedSeat.name,
                seatType: mapSeatTypeToAPI(values.type),
                seatStatus: mapSeatStatusToAPI(values.status),
                col: selectedSeat.col,
                row: selectedSeat.rowIndex
            };

            console.log('📡 Updating seat via API:', seatData);
            const response = await seatService.updateSeat(selectedSeat.id, seatData);
            const updatedSeat = response?.data?.data || response?.data || response;
            console.log('✅ Seat updated:', updatedSeat);

            // Convert row number to letter
            const rowLabel = String.fromCharCode(64 + updatedSeat.row); // 1→A, 2→B, etc.

            // Cập nhật state với dữ liệu đầy đủ từ API
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
            notification.success(`Đã cập nhật ghế ${selectedSeat.name}`);

            setShowSeatEditModal(false);
            setSelectedSeat(null);
        } catch (error) {
            console.error('❌ Error saving seat:', error);
            console.error('Error response:', error.response);
            notification.error(error.response?.data?.message || 'Lưu thông tin ghế thất bại');
        }
    };

    const handleDeleteSeat = async () => {
        if (!selectedSeat) {
            notification.warning('Không có ghế nào được chọn');
            return;
        }

        const seatInfo = selectedSeat.name || `${selectedSeat.row}${selectedSeat.number}`;
        console.log('🔴 Deleting seat:', seatInfo, '| ID:', selectedSeat.id);

        try {
            // 📡 GỌI API XÓA GHẾ
            console.log('📡 Calling API to delete seat ID:', selectedSeat.id);
            await seatService.deleteSeat(selectedSeat.id);
            console.log('✅ API delete successful');

            // Cập nhật state local - loại bỏ ghế đã xóa
            const newRows = seatLayout.rows
                .map(row => ({
                    ...row,
                    seats: row.seats.filter(seat => seat.id !== selectedSeat.id)
                }))
                .filter(row => row.seats.length > 0); // Xóa hàng nếu không còn ghế

            setSeatLayout({ ...seatLayout, rows: newRows });
            setShowSeatEditModal(false);
            setSelectedSeat(null);
            notification.success(`Đã xóa ghế ${seatInfo}`);
        } catch (error) {
            console.error('❌ Error deleting seat:', error);
            notification.error(error.response?.data?.message || 'Xóa ghế thất bại');
        }
    };

    const handleAddSeat = async (rowLabel) => {
        try {
            const targetRow = seatLayout.rows.find(row => row.label === rowLabel);
            if (!targetRow) return;

            // Tìm số ghế lớn nhất và tọa độ col lớn nhất trong hàng
            const maxSeatNumber = Math.max(...targetRow.seats.map(seat => seat.number));
            const maxCol = Math.max(...targetRow.seats.map(seat => seat.col || seat.number));
            const newSeatNumber = maxSeatNumber + 1;
            const newCol = maxCol + 1;
            const newSeatId = `${rowLabel}${newSeatNumber}`;
            const rowIndex = rowLabel.charCodeAt(0) - 65;

            // Chuẩn bị dữ liệu để gửi lên API
            const seatData = {
                theaterId: selectedScreen.id,
                name: newSeatId,
                seatType: 'REGULAR', // Mặc định là ghế thường
                seatStatus: 'AVAILABLE',
                col: newCol,
                row: rowIndex + 1
            };

            // Gọi API tạo ghế
            const response = await seatService.createSeat(seatData);
            const createdSeat = response.data;

            // Tạo object ghế mới cho local state
            const newSeat = {
                id: createdSeat.id, // Dùng ID từ backend
                name: createdSeat.name,
                row: rowLabel,
                number: newSeatNumber,
                type: mapSeatTypeFromAPI(createdSeat.seatType),
                status: mapSeatStatusFromAPI(createdSeat.seatStatus || createdSeat.status),
                rowLabel: rowLabel,
                col: newCol,
                rowIndex: rowIndex + 1
            };

            // Cập nhật layout và sắp xếp lại ghế theo col
            const newRows = seatLayout.rows.map(row =>
                row.label === rowLabel
                    ? {
                        ...row,
                        seats: [...row.seats, newSeat].sort((a, b) => a.col - b.col)
                    }
                    : row
            );

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`Đã thêm ghế ${newSeatId} (Tọa độ: hàng ${rowIndex}, cột ${newCol})`);
        } catch (error) {
            console.error('Error creating seat:', error);
            notification.error(error.response?.data?.message || 'Tạo ghế thất bại');
        }
    };

    const handleAddSeatAtPosition = async (rowLabel, targetCol) => {
        try {
            const targetRow = seatLayout.rows.find(row => row.label === rowLabel);
            if (!targetRow) return;

            // Kiểm tra xem cột này đã có ghế chưa
            if (targetRow.seats.some(s => s.col === targetCol)) {
                notification.warning(`Cột ${targetCol} trong hàng ${rowLabel} đã có ghế!`);
                return;
            }

            // Tên ghế = rowLabel + số cột (ví dụ: A5)
            const seatName = `${rowLabel}${targetCol}`;
            const rowIndex = rowLabel.charCodeAt(0) - 64; // A=1, B=2, etc.

            // Chuẩn bị dữ liệu để gửi lên API
            const seatData = {
                theaterId: selectedScreen.id,
                name: seatName,
                col: targetCol,
                row: rowIndex,
                seatType: 'REGULAR',
                seatStatus: 'AVAILABLE'
            };

            console.log("create seat at position", seatData)

            // Gọi API tạo ghế
            const response = await seatService.createSeat(seatData);
            const createdSeat = response.data;

            // Tạo object ghế mới cho local state
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

            // Cập nhật layout và sắp xếp lại ghế theo col
            const newRows = seatLayout.rows.map(row =>
                row.label === rowLabel
                    ? {
                        ...row,
                        seats: [...row.seats, newSeat].sort((a, b) => a.col - b.col)
                    }
                    : row
            );

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`Đã thêm ghế ${seatName} tại hàng ${rowLabel}, cột ${targetCol}`);
        } catch (error) {
            console.error('Error creating seat at position:', error);
            notification.error(error.response?.data?.message || 'Tạo ghế thất bại');
        }
    };

    const handleAddRow = async () => {
        try {
            // Tìm label hàng tiếp theo (A, B, C, ... Z)
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

            console.log(`➕ Creating new row ${nextLabel} with ${defaultSeatsPerRow} seats via API...`);

            // 📡 GỌI API TẠO TỪNG GHẾ TRONG HÀNG MỚI
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

            // Tạo hàng mới với ghế đã có ID từ API
            const newRow = {
                label: nextLabel,
                seats: newRowSeats,
                isVip: false
            };

            console.log(`✅ Created row ${nextLabel} with ${newRowSeats.length} seats`);

            // Thêm hàng mới vào layout (sắp xếp theo thứ tự alphabet)
            const newRows = [...seatLayout.rows, newRow].sort((a, b) => a.label.localeCompare(b.label));

            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`Đã thêm hàng ${nextLabel} với ${defaultSeatsPerRow} ghế`);
        } catch (error) {
            console.error('❌ Error creating new row:', error);
            notification.error(error.response?.data?.message || 'Tạo hàng mới thất bại');
        }
    };

    const handleRemoveRow = async (rowLabel) => {
        try {
            if (seatLayout.rows.length <= 1) {
                notification.warning('Không thể xóa hàng. Phòng chiếu phải có ít nhất 1 hàng ghế.');
                return;
            }

            const targetRow = seatLayout.rows.find(row => row.label === rowLabel);
            if (!targetRow) {
                notification.error('Không tìm thấy hàng ghế');
                return;
            }

            // 📡 GỌI API XÓA TẤT CẢ GHẾ TRONG HÀNG
            const deletePromises = targetRow.seats.map(seat => seatService.deleteSeat(seat.id));
            await Promise.all(deletePromises);

            // Cập nhật state local
            const newRows = seatLayout.rows.filter(row => row.label !== rowLabel);
            setSeatLayout({ ...seatLayout, rows: newRows });
            notification.success(`Đã xóa hàng ${rowLabel} (${targetRow.seats.length} ghế)`);
        } catch (error) {
            console.error('❌ Error removing row:', error);
            notification.error(error.response?.data?.message || 'Xóa hàng ghế thất bại');
        }
    };

    const resetLayout = async () => {
        try {
            await loadSeatsFromAPI(selectedScreen);
            setSelectedSeats([]);
            notification.success('Đã khôi phục bố cục ban đầu');
        } catch (error) {
            console.error('❌ Error resetting layout:', error);
            notification.error('Khôi phục bố cục thất bại');
        }
    };

    // const saveLayout = async () => {
    //     try {
    //         // Lưu tất cả ghế vào database
    //         const allSeats = seatLayout.rows.flatMap(row => row.seats);

    //         // Xóa tất cả ghế cũ trước
    //         await seatService.deleteAllSeatsByRoomId(selectedScreen.id);

    //         // Tạo ghế mới với đầy đủ thông tin
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

    //         message.success('Đã lưu sơ đồ ghế thành công');

    //         // Gọi callback onSave nếu có
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
    //         message.error(error.response?.data?.message || 'Lưu sơ đồ ghế thất bại');
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
            // Thống kê theo trạng thái
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
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-12 py-2 rounded-t-[10px] rounded-b-sm font-bold text-xs tracking-wider inline-block shadow-[0_4px_15px_rgba(102,126,234,0.3)] mb-8">MÀN HÌNH</div>
            </div>

            {/* Seat Layout */}
            <div className="flex flex-col items-center gap-2 p-5 bg-gray-50 rounded-xl border border-gray-200 relative mb-5" ref={seatLayoutRef}>
                {seatLayout.rows.length === 0 ? (
                    // ✅ HIỂN THỊ NÚT TẠO SƠ ĐỒ GHẾ KHI CHƯA CÓ GHẾ
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
                            Phòng chiếu chưa có sơ đồ ghế
                        </h4>
                        <p className="text-gray-500 mb-6">
                            Tạo sơ đồ ghế mặc định với {selectedScreen?.rowsCount || 10} hàng × {selectedScreen?.seatsPerRow || 12} ghế/hàng
                        </p>
                        <Button
                            className="h-12 text-base font-medium rounded-lg px-8"
                            onClick={() => generateDefaultSeatLayout(selectedScreen)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo sơ đồ ghế mặc định
                        </Button>
                    </div>
                ) : (
                    <>
                        {seatLayout.rows.map((row, rowIndex) => {
                            // Tìm cột lớn nhất trong toàn bộ phòng để đảm bảo tất cả hàng có cùng số cột
                            const allCols = seatLayout.rows.flatMap(r => r.seats.map(s => s.col));
                            const maxColInRoom = allCols.length > 0 ? Math.max(...allCols) : 20; // Mặc định 20 cột nếu chưa có ghế
                            const minCol = 1; // Luôn bắt đầu từ cột 1
                            const totalCols = maxColInRoom; // Số cột cố định cho tất cả hàng

                            // Tạo Set các cột đã có ghế để kiểm tra nhanh
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
                                        {/* Render tất cả các cột từ 1 đến maxColInRoom */}
                                        {Array.from({ length: totalCols }, (_, index) => {
                                            const currentCol = minCol + index;
                                            const gridPosition = index + 1;

                                            // Kiểm tra xem cột này có ghế không
                                            const seat = row.seats.find(s => s.col === currentCol);

                                            // Kiểm tra xem cột trước có ghế đôi không (ghế đôi chiếm cột hiện tại)
                                            const prevCol = currentCol - 1;
                                            const prevSeat = row.seats.find(s => s.col === prevCol);
                                            const isOccupiedByCoupleSeat = prevSeat && prevSeat.type === 'couple';

                                            if (isOccupiedByCoupleSeat) {
                                                // Cột này bị ghế đôi chiếm, không render gì
                                                return null;
                                            }

                                            if (seat) {
                                                // Nếu có ghế, render ghế
                                                const isCoupleSeat = seat.type === 'couple';

                                                return (
                                                    <Tooltip
                                                        key={`seat-${seat.id}`}
                                                        title={
                                                            <div>
                                                                <div><strong>Ghế {seat.id}</strong></div>
                                                                <div>Hàng: {seat.row} (Tọa độ: {seat.rowIndex})</div>
                                                                <div>Cột: {seat.number} (Tọa độ: {seat.col})</div>
                                                                <div>Loại: {
                                                                    seat.type === 'regular' ? 'Thường' :
                                                                        seat.type === 'vip' ? 'VIP' :
                                                                            seat.type === 'couple' ? 'Đôi' :
                                                                                seat.type === 'sweetbox' ? 'Sweetbox' :
                                                                                    'N/A'
                                                                }</div>
                                                                <div>Trạng thái: {getStatusText(seat.status)}</div>
                                                                {isCoupleSeat && <div style={{ color: '#eb2f96' }}>⚠️ Chiếm 2 vị trí</div>}
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
                                                                    ? `${gridPosition} / span 2` // Ghế đôi chiếm 2 cột
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
                                                // Nếu không có ghế, render nút thêm ghế
                                                return (
                                                    <Tooltip
                                                        key={`empty-${row.label}-${currentCol}`}
                                                        title={`Thêm ghế vào hàng ${row.label}, cột ${currentCol}`}
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

                                        {/* Nút thêm ghế ở cuối hàng */}
                                        <Tooltip content={`Thêm ghế mới vào cuối hàng ${row.label}`}>
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
                                Thêm hàng mới
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Legend - Chú thích màu sắc và trạng thái */}
            <Card className="mb-4">
                <div className="border-b border-gray-200 px-5 py-4 mb-0">
                    <h3 className="text-gray-800 text-base font-semibold m-0">Chú thích</h3>
                </div>
                <div className="p-5 flex flex-wrap gap-3">
                    {/* Loại ghế */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Thường</span>
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
                        <span className="text-xs">Đôi</span>
                    </div>

                    {/* Divider */}
                    <Separator orientation="vertical" className="h-4" />

                    {/* Trạng thái */}
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-green-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Có thể đặt</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-yellow-500 rounded flex items-center justify-center text-white">
                            <Clock className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Giữ chỗ</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-red-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Đã đặt</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-gray-400 rounded flex items-center justify-center text-white">
                            <X className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Không khả dụng</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-purple-600 rounded flex items-center justify-center text-white">
                            <Wrench className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Bảo trì</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-gray-500 rounded flex items-center justify-center text-white">
                            <Ban className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Bị khóa</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 bg-blue-500 rounded flex items-center justify-center text-white">
                            <User className="h-2 w-2" />
                        </div>
                        <span className="text-xs">Đang chọn</span>
                    </div>
                </div>
            </Card>

            {/* Bulk Edit Modal */}
            {showBulkModal && (
                <Modal
                    title="Chỉnh sửa ghế hàng loạt"
                    open={showBulkModal}
                    onCancel={() => setShowBulkModal(false)}
                    footer={null}
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
                        <p>Đã chọn: <strong>{selectedSeats.length}</strong> ghế</p>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Loại ghế</label>
                                <Select name="type" defaultValue="regular">
                                    <option value="regular">Ghế thường</option>
                                    <option value="vip">Ghế VIP</option>
                                    <option value="couple">Ghế đôi</option>
                                    <option value="sweetbox">Sweetbox</option>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block">Trạng thái</label>
                                <Select name="status" defaultValue="available">
                                    <option value="available">Có thể đặt</option>
                                    <option value="held">Đang giữ chỗ</option>
                                    <option value="booked">Đã đặt</option>
                                    <option value="unavailable">Không khả dụng</option>
                                    <option value="maintenance">Đang bảo trì</option>
                                    <option value="blocked">Bị khóa</option>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowBulkModal(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit">
                                    Áp dụng
                                </Button>
                            </div>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Single Seat Edit Modal */}
            {showSeatEditModal && selectedSeat && (
                <Modal
                    title={`Chỉnh sửa ghế ${selectedSeat?.name || `${selectedSeat?.row}${selectedSeat?.number}`}`}
                    open={showSeatEditModal}
                    onCancel={() => {
                        setShowSeatEditModal(false);
                        setSelectedSeat(null);
                        setSeatEditFormValues({
                            name: '',
                            type: 'regular',
                            status: 'available'
                        });
                    }}
                    footer={null}
                    width={600}
                    destroyOnClose={true}
                >
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSeatEdit(seatEditFormValues);
                    }}>
                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-medium mb-2 block text-gray-700">
                                    Tên ghế <span className="text-red-500">*</span>
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
                                        Tọa độ hàng
                                    </label>
                                    <Input
                                        value={selectedSeat?.rowIndex ?? '-'}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-2 block text-gray-700">
                                        Tọa độ cột
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
                                    Loại ghế <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={seatEditFormValues.type}
                                    onValueChange={(value) => setSeatEditFormValues({ ...seatEditFormValues, type: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn loại ghế" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">Ghế thường</SelectItem>
                                        <SelectItem value="vip">Ghế VIP</SelectItem>
                                        <SelectItem value="couple">Ghế đôi</SelectItem>
                                        <SelectItem value="sweetbox">Sweetbox</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-2 block text-gray-700">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={seatEditFormValues.status}
                                    onValueChange={(value) => setSeatEditFormValues({ ...seatEditFormValues, status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Chọn trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="available">Có thể đặt</SelectItem>
                                        <SelectItem value="held">Đang giữ chỗ</SelectItem>
                                        <SelectItem value="booked">Đã đặt</SelectItem>
                                        <SelectItem value="unavailable">Không khả dụng</SelectItem>
                                        <SelectItem value="maintenance">Đang bảo trì</SelectItem>
                                        <SelectItem value="blocked">Bị khóa</SelectItem>
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
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Lưu thay đổi
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
                            Xóa ghế
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SeatManager;
