import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { NumberStepper } from '@/components/ui/number-stepper';
import { RadioGroup } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Metric } from '@/components/ui/metric';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar } from '@/components/ui/avatar';
import { Empty } from '@/components/ui/empty';
import { Badge } from '@/components/ui/badge-count';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Alert } from '@/components/ui/alert';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
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
import { useNotification } from '@/hooks/useNotification';
import cinemaService from '@/services/cinemaService';
import roomService from '@/services/roomService';

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
            // Gá»i API Ä‘á»ƒ láº¥y thÃ´ng tin cinema
            const cinemaResponse = await cinemaService.getCinemaById(id);
            const cinemaData = cinemaResponse?.data?.data || cinemaResponse?.data || cinemaResponse;

            // Gá»i API Ä‘á»ƒ láº¥y danh sÃ¡ch phÃ²ng - handle 404 with empty array
            let roomsData = [];
            try {
                const roomsResponse = await cinemaService.getRoomsByCinemaId(id);
                roomsData = roomsResponse?.data?.data || roomsResponse?.data || roomsResponse || [];
            } catch (roomError) {
                // Náº¿u API rooms tráº£ vá» 404 hoáº·c lá»—i khÃ¡c, sá»­ dá»¥ng danh sÃ¡ch rá»—ng
                if (roomError.response?.status !== 404) {
                    console.warn('Error fetching rooms, using empty array:', roomError);
                }
                roomsData = [];
            }

            if (cinemaData) {
                setCinema(cinemaData);
                setRooms(Array.isArray(roomsData) ? roomsData : []);
            } else {
                showNotification('error', 'Lá»—i', 'KhÃ´ng tÃ¬m tháº¥y ráº¡p phim');
                navigate('/admin/cinemas');
            }
        } catch (error) {
            console.error('Error loading cinema detail:', error);
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'Lá»—i khi táº£i thÃ´ng tin ráº¡p phim');
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
                showNotification('error', 'Lá»—i', 'Vui lÃ²ng nháº­p tÃªn phÃ²ng!');
                return;
            }
            if (roomFormValues.name.trim().length < 3) {
                showNotification('error', 'Lá»—i', 'TÃªn phÃ²ng pháº£i cÃ³ Ã­t nháº¥t 3 kÃ½ tá»±!');
                return;
            }
            if (roomFormValues.name.trim().length > 50) {
                showNotification('error', 'Lá»—i', 'TÃªn phÃ²ng khÃ´ng Ä‘Æ°á»£c quÃ¡ 50 kÃ½ tá»±!');
                return;
            }

            setSubmittingRoom(true);
            console.log('Submitting room data:', roomFormValues);

            // Map theo RoomRequest tá»« backend
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
                showNotification('success', 'ThÃ nh cÃ´ng', 'Cáº­p nháº­t phÃ²ng chiáº¿u thÃ nh cÃ´ng');
            } else {
                // Create new room
                console.log('Creating new room for cinema:', id);
                const response = await cinemaService.addRoom(id, roomData);
                console.log('Create room response:', response);
                showNotification('success', 'ThÃ nh cÃ´ng', 'ThÃªm phÃ²ng chiáº¿u thÃ nh cÃ´ng');
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
            showNotification('error', 'Lá»—i', error.response?.data?.message || error.message || 'LÆ°u thÃ´ng tin phÃ²ng tháº¥t báº¡i');
        } finally {
            setSubmittingRoom(false);
        }
    };

    const handleManageSeats = (room) => {
        navigate(`/admin/cinemas/${id}/rooms/${room.id}/seats`);
    };

    const handleDeleteRoom = async (roomId) => {
        console.log('ðŸ—‘ï¸ Deleting room:', roomId, 'from cinema:', id);
        try {
            await cinemaService.deleteRoom(id, roomId);
            showNotification('success', 'ThÃ nh cÃ´ng', 'XÃ³a phÃ²ng chiáº¿u thÃ nh cÃ´ng');
            // Reload danh sÃ¡ch phÃ²ng
            await loadCinemaDetail();
            setShowDeleteConfirm(false);
            setRoomToDelete(null);
        } catch (error) {
            console.error('Error deleting room:', error);
            const errorMessage = error.response?.data?.message || error.message || 'XÃ³a phÃ²ng tháº¥t báº¡i';
            showNotification('error', 'Lá»—i', errorMessage);
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
            showNotification('error', 'Lá»—i', 'KhÃ´ng tÃ¬m tháº¥y ID phÃ²ng chiáº¿u');
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
            showNotification('success', 'ThÃ nh cÃ´ng', 'XÃ³a ráº¡p thÃ nh cÃ´ng!');
            navigate('/admin/cinemas');
        } catch (error) {
            console.error('Error deleting cinema:', error);
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'Lá»—i khi xÃ³a ráº¡p');
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
                    message="KhÃ´ng tÃ¬m tháº¥y ráº¡p"
                    description="Ráº¡p báº¡n Ä‘ang tÃ¬m kiáº¿m khÃ´ng tá»“n táº¡i hoáº·c Ä‘Ã£ bá»‹ xÃ³a."
                    type="error"
                    showIcon
                />
                <div className="mt-4">
                    <Button
                        onClick={() => navigate('/admin/cinemas')}
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50"
                    >
                        Quay láº¡i danh sÃ¡ch
                    </Button>
                </div>
            </div>
        );
    }

    // Äá»‹nh nghÄ©a columns cho báº£ng phÃ²ng chiáº¿u
    const columns = [
        {
            title: 'TÃªn phÃ²ng',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Loáº¡i ráº¡p',
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
                return <StatusBadge tone={typeInfo.color}>{typeInfo.text}</StatusBadge>;
            }
        },
        {
            title: 'MÃ n hÃ¬nh',
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
            title: 'Ã‚m thanh',
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
            title: 'Sá»©c chá»©a',
            key: 'capacity',
            render: (_, record) => {
                const rows = record.numberOfRows || record.rowsCount || 0;
                const columns = record.numberOfColumns || record.seatsPerRow || 0;
                const seats = rows * columns;
                return seats > 0 ? (
                    <span>
                        <strong>{seats}</strong> gháº¿ ({rows} hÃ ng Ã— {columns} cá»™t)
                    </span>
                ) : (
                    <span className="text-gray-500">ChÆ°a cáº­p nháº­t</span>
                );
            }
        },
        {
            title: 'HÃ nh Ä‘á»™ng',
            key: 'actions',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => handleEditRoom(record)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                        <Edit className="h-4 w-4 mr-1" />
                        Sá»­a
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManageSeats(record)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                    >
                        <Settings className="h-4 w-4 mr-1" />
                        Quáº£n lÃ½ gháº¿
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
                        XÃ³a
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
                        title: 'Quáº£n lÃ½ ráº¡p',
                        icon: <Building2 className="h-4 w-4" />,
                        href: '/admin/cinemas'
                    },
                    {
                        title: cinema ? `Chi tiáº¿t: ${cinema.name}` : 'Chi tiáº¿t ráº¡p',
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
                            Chá»‰nh sá»­a
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            onClick={() => {
                                if (window.confirm(`Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a ráº¡p "${cinema.name}"?`)) {
                                    handleDeleteCinema();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            XÃ³a ráº¡p
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
                            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">ThÃ´ng tin ráº¡p</h3>
                            <DetailList columns={2} bordered>
                                <DetailItem label="Tráº¡ng thÃ¡i">
                                    {(() => {
                                        const statusMap = {
                                            'active': { text: 'Hoáº¡t Ä‘á»™ng', color: 'green' },
                                            'inactive': { text: 'KhÃ´ng hoáº¡t Ä‘á»™ng', color: 'red' },
                                            'maintenance': { text: 'Báº£o trÃ¬', color: 'orange' }
                                        };
                                        const status = cinema.status || 'active';
                                        const statusInfo = statusMap[status] || { text: status || 'N/A', color: 'default' };
                                        return <StatusBadge tone={statusInfo.color}>{statusInfo.text}</StatusBadge>;
                                    })()}
                                </DetailItem>
                                <DetailItem label={
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" /> Äá»‹a chá»‰
                                    </span>
                                }>
                                    {cinema.address || '-'}
                                </DetailItem>
                                {cinema.city && (
                                    <DetailItem label="Khu vá»±c">
                                        {typeof cinema.city === 'object' ? cinema.city.name : cinema.city}
                                    </DetailItem>
                                )}
                                {cinema.facilities && Array.isArray(cinema.facilities) && cinema.facilities.length > 0 && (
                                    <DetailItem label="Tiá»‡n Ã­ch" wide>
                                        <div className="flex flex-wrap gap-2">
                                            {cinema.facilities.map((facility, index) => (
                                                <StatusBadge key={index} tone="cyan">{facility}</StatusBadge>
                                            ))}
                                        </div>
                                    </DetailItem>
                                )}
                            </DetailList>

                            {cinema.description && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <h5 className="text-base font-semibold mb-2 flex items-center gap-2">
                                            <FileText className="h-4 w-4" /> MÃ´ táº£
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
                            <h3 className="text-lg font-semibold m-0">Danh sÃ¡ch phÃ²ng chiáº¿u</h3>
                            <Badge count={rooms.length} />
                        </div>
                        <Button
                            onClick={handleAddRoom}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            ThÃªm phÃ²ng
                        </Button>
                    </div>
                    {rooms.length > 0 ? (
                        <DataTable
                            fields={columns}
                            rows={rooms.map(room => ({ ...room, key: room.id }))}
                            getRowId="id"
                        />
                    ) : (
                        <div className="flex flex-col justify-center items-center py-12">
                            <Empty
                                description="ChÆ°a cÃ³ phÃ²ng chiáº¿u nÃ o"
                            />
                            <Button
                                onClick={handleAddRoom}
                                size="lg"
                                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                ThÃªm phÃ²ng chiáº¿u Ä‘áº§u tiÃªn
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* Add/Edit Room Modal */}
            <ResponsiveDialog
                heading={
                    <div className="flex items-center gap-2">
                        {showEditRoom ? (
                            <Edit className="h-5 w-5 text-yellow-600" />
                        ) : (
                            <Plus className="h-5 w-5 text-green-600" />
                        )}
                        <span className="text-lg font-semibold">
                            {showEditRoom ? 'Chá»‰nh sá»­a phÃ²ng chiáº¿u' : 'Táº¡o phÃ²ng chiáº¿u má»›i'}
                        </span>
                    </div>
                }
                open={showAddRoom || showEditRoom}
                onClose={() => {
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
                actions={null}
                maxWidth="90%"
                style={{ maxWidth: '900px' }}
            >
                {submittingRoom && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); handleSubmitRoom(); }} className="space-y-4">
                    {/* ThÃ´ng tin cÆ¡ báº£n */}
                    <Card className="mb-4 p-4 bg-gray-50">
                        <h5 className="mb-4 text-base font-semibold flex items-center gap-2">
                            <Home className="h-4 w-4 text-blue-600" />
                            <span>ThÃ´ng tin cÆ¡ báº£n</span>
                        </h5>

                        <div className="mb-4">
                            <label className="block mb-2 font-semibold">
                                TÃªn phÃ²ng <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={roomFormValues.name}
                                    onChange={(e) => setRoomFormValues({ ...roomFormValues, name: e.target.value })}
                                    placeholder="VD: PhÃ²ng chiáº¿u 1, Room A, ..."
                                    className="pl-10 h-11"
                                    disabled={submittingRoom}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">TÃªn phÃ²ng chiáº¿u duy nháº¥t trong ráº¡p</p>
                        </div>

                        <div>
                            <label className="block mb-2 font-semibold">
                                Loáº¡i ráº¡p chiáº¿u <span className="text-red-500">*</span>
                            </label>
                            <RadioGroup
                                value={roomFormValues.theaterType}
                                onChange={(value) => setRoomFormValues({ ...roomFormValues, theaterType: value })}
                                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                            >
                                <RadioGroup.Button value="TWO_D" className="text-center text-sm py-2">
                                    ðŸŽ¬ 2D
                                </RadioGroup.Button>
                                <RadioGroup.Button value="THREE_D" className="text-center text-sm py-2">
                                    ðŸ•¶ï¸ 3D
                                </RadioGroup.Button>
                                <RadioGroup.Button value="IMAX" className="text-center text-sm py-2">
                                    ðŸŽ¥ IMAX
                                </RadioGroup.Button>
                                <RadioGroup.Button value="IMAX_3D" className="text-center text-sm py-2">
                                    ðŸŽ¬ IMAX 3D
                                </RadioGroup.Button>
                                <RadioGroup.Button value="FOUR_DX" className="text-center text-sm py-2">
                                    ðŸŽ¢ 4DX
                                </RadioGroup.Button>
                                <RadioGroup.Button value="SCREEN_X" className="text-center text-sm py-2">
                                    ðŸ“º ScreenX
                                </RadioGroup.Button>
                            </RadioGroup>
                            <p className="text-xs text-gray-500 mt-1">Chá»n cÃ´ng nghá»‡ chiáº¿u phim</p>
                        </div>
                    </Card>

                    {/* Cáº¥u hÃ¬nh sÆ¡ Ä‘á»“ gháº¿ */}
                    <Card className="mb-4 p-4 bg-gray-50">
                        <h5 className="mb-4 text-base font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4 text-green-600" />
                            <span>Cáº¥u hÃ¬nh sÆ¡ Ä‘á»“ gháº¿</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Sá»‘ hÃ ng gháº¿ <span className="text-red-500">*</span>
                                </label>
                                <NumberStepper
                                    value={roomFormValues.numberOfRows}
                                    onValueChange={(value) => setRoomFormValues({ ...roomFormValues, numberOfRows: value || 10 })}
                                    min={1}
                                    max={26}
                                    placeholder="VD: 10 hÃ ng"
                                    className="w-full h-11"
                                    disabled={submittingRoom}
                                />
                                <p className="text-xs text-gray-500 mt-1">Sá»‘ hÃ ng gháº¿ tá»« A-Z (tá»‘i Ä‘a 26 hÃ ng)</p>
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Sá»‘ cá»™t gháº¿ <span className="text-red-500">*</span>
                                </label>
                                <NumberStepper
                                    value={roomFormValues.numberOfColumns}
                                    onValueChange={(value) => setRoomFormValues({ ...roomFormValues, numberOfColumns: value || 12 })}
                                    min={1}
                                    max={30}
                                    placeholder="VD: 12 cá»™t"
                                    className="w-full h-11"
                                    disabled={submittingRoom}
                                />
                                <p className="text-xs text-gray-500 mt-1">Sá»‘ gháº¿ trÃªn má»—i hÃ ng (tá»‘i Ä‘a 30 gháº¿)</p>
                            </div>
                        </div>
                    </Card>

                    {/* Cáº¥u hÃ¬nh mÃ n hÃ¬nh vÃ  Ã¢m thanh */}
                    <Card className="mb-4 p-4 bg-gray-50">
                        <h5 className="mb-4 text-base font-semibold flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-blue-600" />
                            <span>Cáº¥u hÃ¬nh mÃ n hÃ¬nh vÃ  Ã¢m thanh</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Loáº¡i mÃ n hÃ¬nh <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={roomFormValues.screenType}
                                    onValueChange={(value) => setRoomFormValues({ ...roomFormValues, screenType: value })}
                                    disabled={submittingRoom}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Chá»n loáº¡i mÃ n hÃ¬nh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STANDARD">Standard</SelectItem>
                                        <SelectItem value="WIDESCREEN">Widescreen</SelectItem>
                                        <SelectItem value="CURVED">Curved Screen</SelectItem>
                                        <SelectItem value="STADIUM">Stadium Seating</SelectItem>
                                        <SelectItem value="IMAX">IMAX</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">Chá»n loáº¡i mÃ n hÃ¬nh chiáº¿u phim</p>
                            </div>
                            <div>
                                <label className="block mb-2 font-semibold">
                                    Há»‡ thá»‘ng Ã¢m thanh <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={roomFormValues.soundSystem}
                                    onValueChange={(value) => setRoomFormValues({ ...roomFormValues, soundSystem: value })}
                                    disabled={submittingRoom}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Chá»n há»‡ thá»‘ng Ã¢m thanh" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STEREO">Stereo</SelectItem>
                                        <SelectItem value="SURROUND_5_1">Surround 5.1</SelectItem>
                                        <SelectItem value="DOLBY_7_1">Dolby 7.1</SelectItem>
                                        <SelectItem value="DTS_X">DTS:X</SelectItem>
                                        <SelectItem value="DOLBY_ATMOS">Dolby Atmos</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">Chá»n há»‡ thá»‘ng Ã¢m thanh</p>
                            </div>
                        </div>
                    </Card>

                    {/* Thá»‘ng kÃª */}
                    {(() => {
                        const numberOfRows = roomFormValues.numberOfRows || 0;
                        const numberOfColumns = roomFormValues.numberOfColumns || 0;
                        const totalSeats = numberOfRows * numberOfColumns;

                        return (
                            <Card className="mb-4 p-4 bg-gradient-to-br from-purple-600 to-purple-800 text-white border-none">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <Metric
                                            label={<span className="text-white/90 text-xs">Tá»•ng sá»‘ gháº¿</span>}
                                            value={totalSeats}
                                            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                            suffix={<span className="text-xs">gháº¿</span>}
                                        />
                                    </div>
                                    <div>
                                        <Metric
                                            label={<span className="text-white/90 text-xs">Sá»‘ hÃ ng</span>}
                                            value={numberOfRows}
                                            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                            suffix={<span className="text-xs">hÃ ng</span>}
                                        />
                                    </div>
                                    <div>
                                        <Metric
                                            label={<span className="text-white/90 text-xs">Sá»‘ cá»™t</span>}
                                            value={numberOfColumns}
                                            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                                            suffix={<span className="text-xs">cá»™t</span>}
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
                            Há»§y bá»
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
                                    Äang xá»­ lÃ½...
                                </>
                            ) : (
                                <>
                                    {showEditRoom ? (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Cáº­p nháº­t
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Táº¡o phÃ²ng
                                        </>
                                    )}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </ResponsiveDialog>

            {/* Delete Room Confirmation Modal */}
            <ResponsiveDialog
                heading="XÃ³a phÃ²ng chiáº¿u"
                open={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setRoomToDelete(null);
                }}
                actions={
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setRoomToDelete(null);
                            }}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            Há»§y
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                        >
                            XÃ³a
                        </Button>
                    </div>
                }
            >
                <p className="mb-2">
                    Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a phÃ²ng <strong>"{roomToDelete?.name}"</strong>?
                </p>
                <p className="text-red-600 text-sm">
                    HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.
                </p>
            </ResponsiveDialog>

        </div >
    );
};

export default CinemaDetail;
