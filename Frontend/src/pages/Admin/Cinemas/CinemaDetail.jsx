import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { InputNumber } from '../../../components/ui/input-number';
import { RadioGroup } from '../../../components/ui/radio-group';
import { Separator } from '../../../components/ui/separator';
import { Statistic } from '../../../components/ui/statistic';
import { Tag } from '../../../components/ui/tag';
import { Avatar } from '../../../components/ui/avatar';
import { Empty } from '../../../components/ui/empty';
import { Badge } from '../../../components/ui/badge-count';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import { Alert } from '../../../components/ui/alert';
import { Descriptions } from '../../../components/ui/descriptions';
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    Settings,
    Home,
    User,
    Star,
    Wrench,
    MapPin,
    Image as ImageIcon,
    Loader2,
    AlertTriangle,
    XCircle,
    Building2,
    FileText
} from 'lucide-react';
import { useNotification } from '../../../hooks/useNotification';
import cinemaService from '../../../services/cinemaService';
import roomService from '../../../services/roomService';

const CinemaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [cinema, setCinema] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showEditRoom, setShowEditRoom] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [submittingRoom, setSubmittingRoom] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [roomFormValues, setRoomFormValues] = useState({
        name: '',
        theaterType: 'TWO_D',
        numberOfRows: 10,
        numberOfColumns: 12,
        screenType: 'STANDARD',
        soundSystem: 'STEREO'
    });

    useEffect(() => {
        loadCinemaDetail();
    }, [id]);

    const loadCinemaDetail = async () => {
        setLoading(true);
        try {
            // Gọi API để lấy thông tin cinema
            const cinemaResponse = await cinemaService.getCinemaById(id);
            const cinemaData = cinemaResponse?.data?.data || cinemaResponse?.data || cinemaResponse;

            // Gọi API để lấy danh sách phòng - handle 404 with empty array
            let roomsData = [];
            try {
                const roomsResponse = await cinemaService.getRoomsByCinemaId(id);
                roomsData = roomsResponse?.data?.data || roomsResponse?.data || roomsResponse || [];
            } catch (roomError) {
                // Nếu API rooms trả về 404 hoặc lỗi khác, sử dụng danh sách rỗng
                if (roomError.response?.status !== 404) {
                    console.warn('Error fetching rooms, using empty array:', roomError);
                }
                roomsData = [];
            }

            if (cinemaData) {
                setCinema(cinemaData);
                setRooms(Array.isArray(roomsData) ? roomsData : []);
            } else {
                showNotification('error', 'Lỗi', 'Không tìm thấy rạp phim');
                navigate('/admin/cinemas');
            }
        } catch (error) {
            console.error('Error loading cinema detail:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Lỗi khi tải thông tin rạp phim');
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoom = () => {
        setRoomFormValues({
            name: '',
            theaterType: 'TWO_D',
            numberOfRows: 10,
            numberOfColumns: 12,
            screenType: 'STANDARD',
            soundSystem: 'STEREO'
        });
        setSelectedRoom(null);
        setShowAddRoom(true);
    };

    const handleEditRoom = (room) => {
        setSelectedRoom(room);
        setRoomFormValues({
            name: room.name || '',
            theaterType: room.theaterType || 'TWO_D',
            numberOfRows: room.numberOfRows || room.rowsCount || 10,
            numberOfColumns: room.numberOfColumns || room.seatsPerRow || 12,
            screenType: room.screenType || 'STANDARD',
            soundSystem: room.soundSystem || 'STEREO'
        });
        setShowEditRoom(true);
    };

    const handleSubmitRoom = async () => {
        try {
            // Validate
            if (!roomFormValues.name?.trim()) {
                showNotification('error', 'Lỗi', 'Vui lòng nhập tên phòng!');
                return;
            }
            if (roomFormValues.name.trim().length < 3) {
                showNotification('error', 'Lỗi', 'Tên phòng phải có ít nhất 3 ký tự!');
                return;
            }
            if (roomFormValues.name.trim().length > 50) {
                showNotification('error', 'Lỗi', 'Tên phòng không được quá 50 ký tự!');
                return;
            }

            setSubmittingRoom(true);
            console.log('Submitting room data:', roomFormValues);

            // Map theo RoomRequest từ backend
            const roomData = {
                name: roomFormValues.name.trim(),
                theaterType: roomFormValues.theaterType, // TWO_D, THREE_D, IMAX, IMAX_3D, FOUR_DX, SCREEN_X
                numberOfRows: roomFormValues.numberOfRows || 10,
                numberOfColumns: roomFormValues.numberOfColumns || 12,
                screenType: roomFormValues.screenType, // IMAX, STADIUM, WIDESCREEN, CURVED, STANDARD
                soundSystem: roomFormValues.soundSystem // DOLBY_ATMOS, DOLBY_7_1, DTS_X, SURROUND_5_1, STEREO
            };

            console.log('Processed room data:', roomData);

            if (showEditRoom && selectedRoom) {
                // Update existing room
                console.log('Updating room:', selectedRoom.id);
                const response = await cinemaService.updateRoom(id, selectedRoom.id, roomData);
                console.log('Update room response:', response);
                showNotification('success', 'Thành công', 'Cập nhật phòng chiếu thành công');
            } else {
                // Create new room
                console.log('Creating new room for cinema:', id);
                const response = await cinemaService.addRoom(id, roomData);
                console.log('Create room response:', response);
                showNotification('success', 'Thành công', 'Thêm phòng chiếu thành công');
            }

            setShowAddRoom(false);
            setShowEditRoom(false);
            setSelectedRoom(null);
            setRoomFormValues({
                name: '',
                theaterType: 'TWO_D',
                numberOfRows: 10,
                numberOfColumns: 12,
                screenType: 'STANDARD',
                soundSystem: 'STEREO'
            });
            await loadCinemaDetail();
        } catch (error) {
            console.error('Error saving room:', error);
            console.error('Error response:', error.response);
            showNotification('error', 'Lỗi', error.response?.data?.message || error.message || 'Lưu thông tin phòng thất bại');
        } finally {
            setSubmittingRoom(false);
        }
    };

    const handleManageSeats = (room) => {
        navigate(`/admin/cinemas/${id}/rooms/${room.id}/seats`);
    };

    const handleDeleteRoom = async (roomId) => {
        console.log('🗑️ Deleting room:', roomId, 'from cinema:', id);
        try {
            await cinemaService.deleteRoom(id, roomId);
            showNotification('success', 'Thành công', 'Xóa phòng chiếu thành công');
            // Reload danh sách phòng
            await loadCinemaDetail();
            setShowDeleteConfirm(false);
            setRoomToDelete(null);
        } catch (error) {
            console.error('Error deleting room:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Xóa phòng thất bại';
            showNotification('error', 'Lỗi', errorMessage);
        }
    };

    const handleDeleteClick = (record) => {
        setRoomToDelete(record);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (roomToDelete && roomToDelete.id) {
            handleDeleteRoom(roomToDelete.id);
        } else {
            showNotification('error', 'Lỗi', 'Không tìm thấy ID phòng chiếu');
            setShowDeleteConfirm(false);
            setRoomToDelete(null);
        }
    };

    const handleEditCinema = () => {
        navigate(`/admin/cinemas/${cinema.id}/edit`);
    };

    const handleDeleteCinema = async () => {
        try {
            await cinemaService.deleteCinema(cinema.id);
            showNotification('success', 'Thành công', 'Xóa rạp thành công!');
            navigate('/admin/cinemas');
        } catch (error) {
            console.error('Error deleting cinema:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Lỗi khi xóa rạp');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
        );
    }

    if (!cinema) {
        return (
            <div>
                <Alert
                    message="Không tìm thấy rạp"
                    description="Rạp bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
                    type="error"
                    showIcon
                />
                <div className="mt-4">
                    <Button
                        onClick={() => navigate('/admin/cinemas')}
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50"
                    >
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    // Định nghĩa columns cho bảng phòng chiếu
    const columns = [
        {
            title: 'Tên phòng',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Loại rạp',
            dataIndex: 'theaterType',
            key: 'theaterType',
            render: (theaterType) => {
                const typeMap = {
                    'TWO_D': { text: '2D', color: 'blue' },
                    'THREE_D': { text: '3D', color: 'green' },
                    'IMAX': { text: 'IMAX', color: 'orange' },
                    'IMAX_3D': { text: 'IMAX 3D', color: 'purple' },
                    'FOUR_DX': { text: '4DX', color: 'cyan' },
                    'SCREEN_X': { text: 'ScreenX', color: 'geekblue' }
                };
                const typeInfo = typeMap[theaterType] || { text: theaterType || 'N/A', color: 'default' };
                return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
            }
        },
        {
            title: 'Màn hình',
            dataIndex: 'screenType',
            key: 'screenType',
            render: (screenType) => {
                const screenMap = {
                    'STANDARD': 'Standard',
                    'WIDESCREEN': 'Widescreen',
                    'CURVED': 'Curved',
                    'STADIUM': 'Stadium',
                    'IMAX': 'IMAX'
                };
                return <span>{screenMap[screenType] || screenType || '-'}</span>;
            }
        },
        {
            title: 'Âm thanh',
            dataIndex: 'soundSystem',
            key: 'soundSystem',
            render: (soundSystem) => {
                const soundMap = {
                    'STEREO': 'Stereo',
                    'SURROUND_5_1': 'Surround 5.1',
                    'DOLBY_7_1': 'Dolby 7.1',
                    'DTS_X': 'DTS:X',
                    'DOLBY_ATMOS': 'Dolby Atmos'
                };
                return <span>{soundMap[soundSystem] || soundSystem || '-'}</span>;
            }
        },
        {
            title: 'Sức chứa',
            key: 'capacity',
            render: (_, record) => {
                const rows = record.numberOfRows || record.rowsCount || 0;
                const columns = record.numberOfColumns || record.seatsPerRow || 0;
                const seats = rows * columns;
                return seats > 0 ? (
                    <span>
                        <strong>{seats}</strong> ghế ({rows} hàng × {columns} cột)
                    </span>
                ) : (
                    <span className="text-gray-500">Chưa cập nhật</span>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleEditRoom(record)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Sửa
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageSeats(record)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                        <Settings className="h-4 w-4 mr-1" />
                        Quản lý ghế
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(record);
                        }}
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen">
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
                        title: 'Quản lý rạp',
                        icon: <Building2 className="h-4 w-4" />,
                        href: '/admin/cinemas'
                    },
                    {
                        title: cinema ? `Chi tiết: ${cinema.name}` : 'Chi tiết rạp',
                    },
                ]}
            />

            {/* Header */}
            <Card className="mb-6 rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="m-0 mb-1 text-gray-800 text-2xl font-bold">
                                {cinema.name}
                            </h2>
                            {cinema.address && (
                                <p className="text-gray-500 text-sm mt-1">
                                    {cinema.address}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleEditCinema}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            onClick={() => {
                                if (window.confirm(`Bạn có chắc chắn muốn xóa rạp "${cinema.name}"?`)) {
                                    handleDeleteCinema();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa rạp
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Cinema Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {/* Left Column - Image */}
                <div className="md:col-span-1">
                    <Card className="rounded-xl shadow-md border border-gray-200 p-4">
                        <img
                            src={cinema.image}
                            alt={cinema.name}
                            className="w-full rounded-lg"
                            onError={(e) => {
                                e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
                            }}
                        />
                    </Card>
                </div>

                {/* Right Column - Info */}
                <div className="md:col-span-3">
                    <Card className="rounded-xl shadow-md border border-gray-200">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Thông tin rạp</h3>
                            <Descriptions column={2} bordered>
                                <Descriptions.Item label="Trạng thái">
                                    {(() => {
                                        const statusMap = {
                                            'active': { text: 'Hoạt động', color: 'green' },
                                            'inactive': { text: 'Không hoạt động', color: 'red' },
                                            'maintenance': { text: 'Bảo trì', color: 'orange' }
                                        };
                                        const status = cinema.status || 'active';
                                        const statusInfo = statusMap[status] || { text: status || 'N/A', color: 'default' };
                                        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                                    })()}
                                </Descriptions.Item>
                                <Descriptions.Item label={
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> Địa chỉ
                                    </span>
                                }>
                                    {cinema.address || '-'}
                                </Descriptions.Item>
                                {cinema.city && (
                                    <Descriptions.Item label="Khu vực">
                                        {typeof cinema.city === 'object' ? cinema.city.name : cinema.city}
                                    </Descriptions.Item>
                                )}
                                {cinema.facilities && Array.isArray(cinema.facilities) && cinema.facilities.length > 0 && (
                                    <Descriptions.Item label="Tiện ích" span={2}>
                                        <div className="flex flex-wrap gap-2">
                                            {cinema.facilities.map((facility, index) => (
                                                <Tag key={index} color="cyan">{facility}</Tag>
                                            ))}
                                        </div>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {cinema.description && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <h5 className="text-base font-semibold mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> Mô tả
                                        </h5>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {cinema.description}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Rooms Table */}
            <Card className="rounded-xl shadow-md border border-gray-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold m-0">Danh sách phòng chiếu</h3>
                            <Badge count={rooms.length} />
                        </div>
                        <Button
                            onClick={handleAddRoom}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm phòng
                        </Button>
                    </div>
                    {rooms.length > 0 ? (
                        <TableWrapper
                            columns={columns}
                            dataSource={rooms.map(room => ({ ...room, key: room.id }))}
                            rowKey="id"
                            pagination={{
                                current: 1,
                                pageSize: 10,
                                total: rooms.length,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} của ${total} phòng`,
                            }}
                        />
                    ) : (
                        <div className="flex flex-col justify-center items-center py-12">
                            <Empty
                                description="Chưa có phòng chiếu nào"
                            />
                            <Button
                                onClick={handleAddRoom}
                                size="lg"
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Thêm phòng chiếu đầu tiên
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add/Edit Room Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2">
                        {showEditRoom ? (
                            <Edit className="h-5 w-5 text-yellow-600" />
                        ) : (
                            <Plus className="h-5 w-5 text-green-600" />
                        )}
                        <span className="text-lg font-semibold">
                            {showEditRoom ? 'Chỉnh sửa phòng chiếu' : 'Tạo phòng chiếu mới'}
                        </span>
                    </div>
                }
                open={showAddRoom || showEditRoom}
                onCancel={() => {
                    if (!submittingRoom) {
                        setShowAddRoom(false);
                        setShowEditRoom(false);
                        setSelectedRoom(null);
                        setRoomFormValues({
                            name: '',
                            theaterType: 'TWO_D',
                            numberOfRows: 10,
                            numberOfColumns: 12,
                            screenType: 'STANDARD',
                            soundSystem: 'STEREO'
                        });
                    }
                }}
                footer={null}
                width="90%"
                style={{ maxWidth: '900px' }}
            >
                {submittingRoom && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitRoom(); }} className="space-y-4">
                    {/* Thông tin cơ bản */}
                    <Card className="mb-4 p-4 bg-gray-50">
                        <h5 className="mb-4 text-base font-semibold flex items-center gap-2">
                            <Home className="h-4 w-4 text-blue-600" />
                            <span>Thông tin cơ bản</span>
                        </h5>

                        <div className="mb-4">
                            <label className="block mb-2 font-semibold">
                                Tên phòng <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={roomFormValues.name}
                                    onChange={(e) => setRoomFormValues({ ...roomFormValues, name: e.target.value })}
                                    placeholder="VD: Phòng chiếu 1, Room A, ..."
                                    className="pl-10 h-11"
                                    disabled={submittingRoom}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Tên phòng chiếu duy nhất trong rạp</p>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">
                                Loại rạp chiếu <span className="text-red-500">*</span>
                            </label>
                            <RadioGroup
                                value={roomFormValues.theaterType}
                                onChange={(value) => setRoomFormValues({ ...roomFormValues, theaterType: value })}
                                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                            >
                                <RadioGroup.Button value="TWO_D" className="text-center text-sm py-2">
                                    🎬 2D
                                </RadioGroup.Button>
                                <RadioGroup.Button value="THREE_D" className="text-center text-sm py-2">
                                    🕶️ 3D
                                </RadioGroup.Button>
                                <RadioGroup.Button value="IMAX" className="text-center text-sm py-2">
                                    🎥 IMAX
                                </RadioGroup.Button>
                                <RadioGroup.Button value="IMAX_3D" className="text-center text-sm py-2">
                                    🎬 IMAX 3D
                                </RadioGroup.Button>
                                <RadioGroup.Button value="FOUR_DX" className="text-center text-sm py-2">
                                    🎢 4DX
                                </RadioGroup.Button>
                                <RadioGroup.Button value="SCREEN_X" className="text-center text-sm py-2">
                                    📺 ScreenX
                                </RadioGroup.Button>
                            </RadioGroup>
                            <p className="text-xs text-gray-500 mt-1">Chọn công nghệ chiếu phim</p>
                        </div>
                    </Card>

                    {/* Cấu hình sơ đồ ghế */}
                    <Card className="mb-4 p-4 bg-gray-50">
                        <h5 className="mb-4 text-base font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4 text-green-600" />
                            <span>Cấu hình sơ đồ ghế</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Số hàng ghế <span className="text-red-500">*</span>
                                </label>
                                <InputNumber
                                    value={roomFormValues.numberOfRows}
                                    onChange={(value) => setRoomFormValues({ ...roomFormValues, numberOfRows: value || 10 })}
                                    min={1}
                                    max={26}
                                    placeholder="VD: 10 hàng"
                                    className="w-full h-11"
                                    disabled={submittingRoom}
                                />
                                <p className="text-xs text-gray-500 mt-1">Số hàng ghế từ A-Z (tối đa 26 hàng)</p>
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Số cột ghế <span className="text-red-500">*</span>
                                </label>
                                <InputNumber
                                    value={roomFormValues.numberOfColumns}
                                    onChange={(value) => setRoomFormValues({ ...roomFormValues, numberOfColumns: value || 12 })}
                                    min={1}
                                    max={30}
                                    placeholder="VD: 12 cột"
                                    className="w-full h-11"
                                    disabled={submittingRoom}
                                />
                                <p className="text-xs text-gray-500 mt-1">Số ghế trên mỗi hàng (tối đa 30 ghế)</p>
                            </div>
                        </div>
                    </Card>

                    {/* Cấu hình màn hình và âm thanh */}
                    <Card className="mb-4 p-4 bg-gray-50">
                        <h5 className="mb-4 text-base font-semibold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            <span>Cấu hình màn hình và âm thanh</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Loại màn hình <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={roomFormValues.screenType}
                                    onValueChange={(value) => setRoomFormValues({ ...roomFormValues, screenType: value })}
                                    disabled={submittingRoom}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Chọn loại màn hình" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard</SelectItem>
                                        <SelectItem value="WIDESCREEN">Widescreen</SelectItem>
                                        <SelectItem value="CURVED">Curved Screen</SelectItem>
                                        <SelectItem value="STADIUM">Stadium Seating</SelectItem>
                                        <SelectItem value="IMAX">IMAX</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">Chọn loại màn hình chiếu phim</p>
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Hệ thống âm thanh <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={roomFormValues.soundSystem}
                                    onValueChange={(value) => setRoomFormValues({ ...roomFormValues, soundSystem: value })}
                                    disabled={submittingRoom}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Chọn hệ thống âm thanh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STEREO">Stereo</SelectItem>
                                        <SelectItem value="SURROUND_5_1">Surround 5.1</SelectItem>
                                        <SelectItem value="DOLBY_7_1">Dolby 7.1</SelectItem>
                                        <SelectItem value="DTS_X">DTS:X</SelectItem>
                                        <SelectItem value="DOLBY_ATMOS">Dolby Atmos</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">Chọn hệ thống âm thanh</p>
                            </div>
                        </div>
                    </Card>

                    {/* Thống kê */}
                    {(() => {
                        const numberOfRows = roomFormValues.numberOfRows || 0;
                        const numberOfColumns = roomFormValues.numberOfColumns || 0;
                        const totalSeats = numberOfRows * numberOfColumns;

                        return (
                            <Card className="mb-4 p-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white border-none">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <Statistic
                                            title={<span className="text-white/90 text-xs">Tổng số ghế</span>}
                                            value={totalSeats}
                                            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                            suffix={<span className="text-xs">ghế</span>}
                                        />
                                    </div>
                                    <div>
                                        <Statistic
                                            title={<span className="text-white/90 text-xs">Số hàng</span>}
                                            value={numberOfRows}
                                            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                            suffix={<span className="text-xs">hàng</span>}
                                        />
                                    </div>
                                    <div>
                                        <Statistic
                                            title={<span className="text-white/90 text-xs">Số cột</span>}
                                            value={numberOfColumns}
                                            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                            suffix={<span className="text-xs">cột</span>}
                                        />
                                    </div>
                                </div>
                            </Card>
                        );
                    })()}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => {
                                if (!submittingRoom) {
                                    setShowAddRoom(false);
                                    setShowEditRoom(false);
                                    setSelectedRoom(null);
                                    setRoomFormValues({
                                        name: '',
                                        theaterType: 'TWO_D',
                                        numberOfRows: 10,
                                        numberOfColumns: 12,
                                        screenType: 'STANDARD',
                                        soundSystem: 'STEREO'
                                    });
                                }
                            }}
                            disabled={submittingRoom}
                            className="min-w-[100px]"
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            type="submit"
                            size="lg"
                            disabled={submittingRoom}
                            className="min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50"
                        >
                            {submittingRoom ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    {showEditRoom ? (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Cập nhật
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tạo phòng
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Room Confirmation Modal */}
            <Modal
                title="Xóa phòng chiếu"
                open={showDeleteConfirm}
                onCancel={() => {
                    setShowDeleteConfirm(false);
                    setRoomToDelete(null);
                }}
                footer={
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setRoomToDelete(null);
                            }}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                            Xóa
                        </Button>
                    </div>
                }
            >
                <p className="mb-2">
                    Bạn có chắc chắn muốn xóa phòng <strong>"{roomToDelete?.name}"</strong>?
                </p>
                <p className="text-red-600 text-sm">
                    Hành động này không thể hoàn tác.
                </p>
            </Modal>

        </div >
    );
};

export default CinemaDetail;
