import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Tag } from '../../../components/ui/tag';
import { Statistic } from '../../../components/ui/statistic';
import { Tooltip } from '../../../components/ui/tooltip';
import { InputNumber } from '../../../components/ui/input-number';
import { Separator } from '../../../components/ui/separator';
import { Alert } from '../../../components/ui/alert';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Settings,
    CheckCircle2,
    XCircle,
    Ban,
    Home
} from 'lucide-react';
import useNotification from '../../../hooks/useNotification';

const Seats = () => {
    const [seats, setSeats] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [layoutModalVisible, setLayoutModalVisible] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const notification = useNotification();
    const [form] = useState({});
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [seatLayout, setSeatLayout] = useState([]);
    const [stats, setStats] = useState({
        totalSeats: 0,
        availableSeats: 0,
        bookedSeats: 0,
        blockedSeats: 0
    });

    // Cấu hình loại ghế
    const seatTypes = [
        { value: 'normal', label: 'Ghế thường', color: 'blue', price: 70000 },
        { value: 'vip', label: 'Ghế VIP', color: 'gold', price: 100000 },
        { value: 'couple', label: 'Ghế đôi', color: 'pink', price: 150000 },
        { value: 'premium', label: 'Ghế Premium', color: 'purple', price: 120000 }
    ];

    const seatStatus = {
        available: { label: 'Có thể đặt', color: 'success', icon: <CheckCircleOutlined /> },
        booked: { label: 'Đã đặt', color: 'error', icon: <CloseCircleOutlined /> },
        blocked: { label: 'Bị khóa', color: 'warning', icon: <StopOutlined /> }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load seat data
            const seatResponse = await fetch('/src/data/seatData.json');
            const seatData = await seatResponse.json();

            // Load cinema data
            const cinemaResponse = await fetch('/src/data/cinemas.json');
            const cinemaData = await cinemaResponse.json();

            // Process seat data by room
            const roomData = processSeatsIntoRooms(seatData.seats);
            setSeats(roomData);
            setCinemas(cinemaData);

            // Calculate statistics
            calculateStats(seatData.seats);

        } catch (error) {
            message.error('Lỗi khi tải dữ liệu ghế');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const processSeatsIntoRooms = (seatData) => {
        const rooms = {};

        seatData.forEach(seat => {
            const roomKey = seat.row.charAt(0); // Assume room based on first letter
            if (!rooms[roomKey]) {
                rooms[roomKey] = {
                    id: roomKey,
                    name: `Phòng ${roomKey}`,
                    totalSeats: 0,
                    availableSeats: 0,
                    bookedSeats: 0,
                    blockedSeats: 0,
                    seats: []
                };
            }

            rooms[roomKey].seats.push(seat);
            rooms[roomKey].totalSeats++;

            switch (seat.status) {
                case 'available':
                    rooms[roomKey].availableSeats++;
                    break;
                case 'booked':
                    rooms[roomKey].bookedSeats++;
                    break;
                case 'blocked':
                    rooms[roomKey].blockedSeats++;
                    break;
            }
        });

        return Object.values(rooms);
    };

    const calculateStats = (seatData) => {
        const newStats = {
            totalSeats: seatData.length,
            availableSeats: seatData.filter(s => s.status === 'available').length,
            bookedSeats: seatData.filter(s => s.status === 'booked').length,
            blockedSeats: seatData.filter(s => s.status === 'blocked').length
        };
        setStats(newStats);
    };

    const handleCreateRoom = () => {
        setEditingRoom(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditRoom = (room) => {
        setEditingRoom(room);
        form.setFieldsValue({
            name: room.name,
            rows: Math.max(...room.seats.map(s => s.row.charCodeAt(0))) - 64,
            seatsPerRow: Math.max(...room.seats.map(s => s.number))
        });
        setModalVisible(true);
    };

    const handleViewLayout = (room) => {
        setSelectedRoom(room);
        setSeatLayout(generateSeatLayout(room.seats));
        setLayoutModalVisible(true);
    };

    const generateSeatLayout = (seats) => {
        const layout = {};
        seats.forEach(seat => {
            if (!layout[seat.row]) {
                layout[seat.row] = {};
            }
            layout[seat.row][seat.number] = seat;
        });
        return layout;
    };

    const handleSaveRoom = async (values) => {
        try {
            setLoading(true);

            // Tạo layout ghế mới
            const newSeats = [];
            const { name, rows, seatsPerRow, seatType = 'normal' } = values;

            for (let row = 1; row <= rows; row++) {
                const rowLetter = String.fromCharCode(64 + row); // A, B, C...
                for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
                    const seatTypeConfig = seatTypes.find(t => t.value === seatType);
                    newSeats.push({
                        id: `${rowLetter}${seatNum}`,
                        row: rowLetter,
                        number: seatNum,
                        type: seatType,
                        status: 'available',
                        price: seatTypeConfig.price
                    });
                }
            }

            if (editingRoom) {
                // Cập nhật phòng
                const updatedSeats = seats.map(room =>
                    room.id === editingRoom.id
                        ? { ...room, name, seats: newSeats, totalSeats: newSeats.length }
                        : room
                );
                setSeats(updatedSeats);
                message.success('Cập nhật phòng chiếu thành công');
            } else {
                // Tạo phòng mới
                const newRoom = {
                    id: `P${seats.length + 1}`,
                    name,
                    totalSeats: newSeats.length,
                    availableSeats: newSeats.length,
                    bookedSeats: 0,
                    blockedSeats: 0,
                    seats: newSeats
                };
                setSeats([...seats, newRoom]);
                message.success('Tạo phòng chiếu thành công');
            }

            setModalVisible(false);
            form.resetFields();

        } catch (error) {
            message.error('Có lỗi xảy ra khi lưu phòng chiếu');
            console.error('Error saving room:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = (room) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa phòng "${room.name}"?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                const updatedSeats = seats.filter(s => s.id !== room.id);
                setSeats(updatedSeats);
                message.success('Xóa phòng chiếu thành công');
            }
        });
    };

    const updateSeatStatus = (roomId, seatId, newStatus) => {
        const updatedSeats = seats.map(room => {
            if (room.id === roomId) {
                const updatedRoomSeats = room.seats.map(seat =>
                    seat.id === seatId ? { ...seat, status: newStatus } : seat
                );
                return {
                    ...room,
                    seats: updatedRoomSeats,
                    availableSeats: updatedRoomSeats.filter(s => s.status === 'available').length,
                    bookedSeats: updatedRoomSeats.filter(s => s.status === 'booked').length,
                    blockedSeats: updatedRoomSeats.filter(s => s.status === 'blocked').length
                };
            }
            return room;
        });
        setSeats(updatedSeats);
        setSeatLayout(generateSeatLayout(updatedSeats.find(r => r.id === roomId).seats));
    };

    const columns = [
        {
            title: 'Phòng chiếu',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <strong>{text}</strong>
                    <Tag color="blue">ID: {record.id}</Tag>
                </Space>
            )
        },
        {
            title: 'Tổng số ghế',
            dataIndex: 'totalSeats',
            key: 'totalSeats',
            align: 'center',
            render: (count) => <Tag color="blue">{count} ghế</Tag>
        },
        {
            title: 'Trạng thái ghế',
            key: 'status',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Tag color="success">Trống: {record.availableSeats}</Tag>
                    <Tag color="error">Đã đặt: {record.bookedSeats}</Tag>
                    <Tag color="warning">Khóa: {record.blockedSeats}</Tag>
                </Space>
            )
        },
        {
            title: 'Tỷ lệ lấp đầy',
            key: 'occupancy',
            align: 'center',
            render: (_, record) => {
                const occupancy = ((record.bookedSeats / record.totalSeats) * 100).toFixed(1);
                return (
                    <Tooltip title={`${record.bookedSeats}/${record.totalSeats} ghế đã đặt`}>
                        <Tag color={occupancy > 80 ? 'red' : occupancy > 50 ? 'orange' : 'green'}>
                            {occupancy}%
                        </Tag>
                    </Tooltip>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem layout">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewLayout(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            icon={<EditOutlined />}
                            onClick={() => handleEditRoom(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            onClick={() => handleDeleteRoom(record)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="p-6">
            {/* Thống kê tổng quan */}
            <Row gutter={16} className="mb-6">
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng số ghế"
                            value={stats.totalSeats}
                            prefix={<SettingOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Ghế trống"
                            value={stats.availableSeats}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Ghế đã đặt"
                            value={stats.bookedSeats}
                            prefix={<CloseCircleOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Ghế bị khóa"
                            value={stats.blockedSeats}
                            prefix={<StopOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bảng danh sách phòng */}
            <Card
                title="Danh sách phòng chiếu"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateRoom}
                    >
                        Tạo phòng mới
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={seats}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} phòng`
                    }}
                />
            </Card>

            {/* Modal tạo/sửa phòng */}
            <Modal
                title={editingRoom ? "Chỉnh sửa phòng chiếu" : "Tạo phòng chiếu mới"}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveRoom}
                >
                    <Form.Item
                        name="name"
                        label="Tên phòng"
                        rules={[{ required: true, message: 'Vui lòng nhập tên phòng' }]}
                    >
                        <Input placeholder="VD: Phòng A1, Rạp 1..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="rows"
                                label="Số hàng ghế"
                                rules={[{ required: true, message: 'Vui lòng nhập số hàng' }]}
                            >
                                <InputNumber min={1} max={20} placeholder="VD: 10" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="seatsPerRow"
                                label="Số ghế mỗi hàng"
                                rules={[{ required: true, message: 'Vui lòng nhập số ghế mỗi hàng' }]}
                            >
                                <InputNumber min={1} max={30} placeholder="VD: 15" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="seatType"
                        label="Loại ghế mặc định"
                        initialValue="normal"
                    >
                        <Select>
                            {seatTypes.map(type => (
                                <Option key={type.value} value={type.value}>
                                    <Tag color={type.color}>{type.label}</Tag>
                                    <span style={{ marginLeft: 8 }}>
                                        {type.price.toLocaleString('vi-VN')}đ
                                    </span>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Alert
                        message="Lưu ý"
                        description="Sau khi tạo phòng, bạn có thể chỉnh sửa từng ghế trong phần xem layout."
                        type="info"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setModalVisible(false)}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            {editingRoom ? 'Cập nhật' : 'Tạo phòng'}
                        </Button>
                    </Space>
                </Form>
            </Modal>

            {/* Modal xem layout ghế */}
            <Modal
                title={`Layout ghế - ${selectedRoom?.name}`}
                open={layoutModalVisible}
                onCancel={() => setLayoutModalVisible(false)}
                footer={null}
                width={900}
                bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
            >
                {selectedRoom && (
                    <div className="text-center p-5">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-10 rounded-t-2xl mb-8 flex items-center justify-center shadow-lg">
                            <div className="text-white font-bold text-base tracking-widest">MÀN HÌNH</div>
                        </div>

                        <div className="mb-8">
                            {Object.keys(seatLayout).sort().map(row => (
                                <div key={row} className="flex items-center justify-center mb-2">
                                    <div className="w-8 font-bold text-gray-600 mr-5">{row}</div>
                                    <div className="flex gap-1">
                                        {Object.keys(seatLayout[row]).sort((a, b) => Number(a) - Number(b)).map(seatNum => {
                                            const seat = seatLayout[row][seatNum];
                                            const seatTypeConfig = seatTypes.find(t => t.value === seat.type);
                                            const statusClasses = {
                                                available: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-500',
                                                booked: 'bg-red-50 border-pink-300 text-red-700',
                                                blocked: 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                            };
                                            const typeClasses = {
                                                normal: 'bg-green-50 border-green-300 text-green-700',
                                                vip: 'bg-gradient-to-br from-yellow-50 to-yellow-200 border-yellow-400 text-yellow-800 relative',
                                                couple: 'bg-gradient-to-br from-pink-50 to-pink-200 border-pink-400 text-pink-800 w-16',
                                                premium: 'bg-gradient-to-br from-purple-50 to-purple-200 border-purple-400 text-purple-800 relative'
                                            };
                                            return (
                                                <Tooltip
                                                    key={seat.id}
                                                    title={`${seat.id} - ${seatTypeConfig.label} - ${seat.price.toLocaleString('vi-VN')}đ`}
                                                >
                                                    <div
                                                        className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-300 border-2 relative hover:scale-110 hover:z-10 ${statusClasses[seat.status]} ${typeClasses[seat.type]}`}
                                                        onClick={() => {
                                                            // Toggle seat status for demo
                                                            const statuses = ['available', 'booked', 'blocked'];
                                                            const currentIndex = statuses.indexOf(seat.status);
                                                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                                                            updateSeatStatus(selectedRoom.id, seat.id, nextStatus);
                                                        }}
                                                    >
                                                        {seatNum}
                                                        {seat.type === 'vip' && <span className="absolute -top-0.5 -right-0.5 text-[8px] text-yellow-500">★</span>}
                                                        {seat.type === 'couple' && <span className="absolute -top-0.5 right-0.5 text-[8px] text-pink-500">♥</span>}
                                                        {seat.type === 'premium' && <span className="absolute -top-0.5 -right-0.5 text-[8px] text-purple-500">◆</span>}
                                                    </div>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center py-5 border-t border-gray-200 mt-5">
                            <Space>
                                <div className="flex items-center mx-4">
                                    <div className="w-5 h-5 rounded border-2 border-green-300 bg-green-50 mr-2"></div>
                                    <span>Trống</span>
                                </div>
                                <div className="flex items-center mx-4">
                                    <div className="w-5 h-5 rounded border-2 border-pink-300 bg-red-50 mr-2"></div>
                                    <span>Đã đặt</span>
                                </div>
                                <div className="flex items-center mx-4">
                                    <div className="w-5 h-5 rounded border-2 border-yellow-300 bg-yellow-50 mr-2"></div>
                                    <span>Bị khóa</span>
                                </div>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Seats;
