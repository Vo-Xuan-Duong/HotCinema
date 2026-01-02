import React, { useState, useEffect } from 'react';
import { User, Edit, Camera, Save, Heart, Trophy, Gift, Settings, Shield, Bell, MapPin, Phone, Mail, Calendar, Star, Ticket, Clock, Home, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select } from '../../../components/ui/select';
import { DatePicker } from '../../../components/ui/date-picker';
import { Upload } from '../../../components/ui/upload';
import { Avatar } from '../../../components/ui/avatar';
import { Tag } from '../../../components/ui/tag';
import { Progress } from '../../../components/ui/progress';
import { StatisticCard } from '../../../components/ui/statistic';
import { Badge } from '../../../components/ui/badge-count';
import { Tabs } from '../../../components/ui/tabs';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Empty } from '../../../components/ui/empty';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import { Separator } from '../../../components/ui/separator';
import GlobalBackTop from '../../../components/GlobalBackTop/GlobalBackTop';
import useAuth from '../../../hooks/useAuth';
import useNotification from '../../../hooks/useNotification';
import { useForm } from 'react-hook-form';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const notification = useNotification();
    const form = useForm({
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            birthDate: null,
            gender: '',
            address: '',
            city: ''
        }
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    const [userStats, setUserStats] = useState({
        totalBookings: 25,
        totalSpent: 2500000,
        favoriteMovies: 15,
        loyaltyPoints: 1250,
        memberLevel: 'VIP Gold',
        joinDate: '2023-01-15'
    });

    const [bookingHistory, setBookingHistory] = useState([
        {
            id: 1,
            movie: 'Avengers: Endgame',
            cinema: 'CGV Vincom Center',
            date: '2024-01-15',
            time: '19:30',
            seats: ['G7', 'G8'],
            total: 180000,
            status: 'completed'
        },
        {
            id: 2,
            movie: 'Spider-Man: No Way Home',
            cinema: 'Lotte Cinema Diamond Plaza',
            date: '2024-01-10',
            time: '21:00',
            seats: ['F5', 'F6'],
            total: 200000,
            status: 'completed'
        }
    ]);

    const [favoriteMovies, setFavoriteMovies] = useState([
        {
            id: 1,
            title: 'The Dark Knight',
            poster: 'https://picsum.photos/200/300?random=1',
            rating: 9.0,
            year: 2008
        },
        {
            id: 2,
            title: 'Inception',
            poster: 'https://picsum.photos/200/300?random=2',
            rating: 8.8,
            year: 2010
        }
    ]);

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                birthDate: user.birthDate ? dayjs(user.birthDate) : null,
                gender: user.gender || '',
                address: user.address || '',
                city: user.city || ''
            });
        }
    }, [user, form]);

    const handleSave = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            await updateUser({
                ...values,
                birthDate: values.birthDate ? (dayjs.isDayjs(values.birthDate) ? values.birthDate.format('YYYY-MM-DD') : values.birthDate) : null
            });

            notification.success('Cập nhật thông tin thành công!');
            setEditMode(false);
        } catch (error) {
            notification.error('Có lỗi xảy ra khi cập nhật thông tin!');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (info) => {
        if (info.file?.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file?.status === 'done' || info.file) {
            const file = info.file?.originFileObj || info.file;
            if (file) {
                const url = URL.createObjectURL(file);
                setAvatar(url);
                setLoading(false);
            }
        }
    };

    const getLevelColor = (level) => {
        switch (level) {
            case 'VIP Gold': return '#faad14';
            case 'VIP Silver': return '#bfbfbf';
            case 'VIP Platinum': return '#722ed1';
            default: return '#1890ff';
        }
    };

    const getLevelProgress = (points) => {
        const levels = [
            { name: 'Bronze', min: 0, max: 500 },
            { name: 'Silver', min: 500, max: 1000 },
            { name: 'Gold', min: 1000, max: 2000 },
            { name: 'Platinum', min: 2000, max: 5000 }
        ];

        const currentLevel = levels.find(l => points >= l.min && points < l.max);
        if (!currentLevel) return 100;

        return ((points - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100;
    };

    const bookingColumns = [
        {
            title: 'Phim',
            dataIndex: 'movie',
            key: 'movie',
            render: (text) => <span className="font-semibold">{text}</span>
        },
        {
            title: 'Rạp',
            dataIndex: 'cinema',
            key: 'cinema'
        },
        {
            title: 'Ngày chiếu',
            dataIndex: 'date',
            key: 'date',
            render: (date) => (
                <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {dayjs(date).format('DD/MM/YYYY')}
                </div>
            )
        },
        {
            title: 'Giờ chiếu',
            dataIndex: 'time',
            key: 'time',
            render: (time) => (
                <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {time}
                </div>
            )
        },
        {
            title: 'Ghế',
            dataIndex: 'seats',
            key: 'seats',
            render: (seats) => seats.join(', ')
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => (
                <span className="font-semibold text-primary">
                    {total.toLocaleString('vi-VN')}đ
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'blue'}>
                    {status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                </Tag>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <>
                                        <Home className="h-4 w-4 inline mr-1" />
                                        Trang chủ
                                    </>
                                ),
                                href: '/'
                            },
                            {
                                title: (
                                    <>
                                        <User className="h-4 w-4 inline mr-1" />
                                        Hồ sơ cá nhân
                                    </>
                                )
                            }
                        ]}
                    />
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
                <Card className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-center">
                        <div className="flex flex-col items-center">
                            <Badge
                                count={
                                    <Button
                                        size="icon"
                                        className="rounded-full h-8 w-8"
                                        onClick={() => setEditMode(true)}
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                }
                            >
                                <Avatar
                                    className="w-30 h-30 border-4 border-gray-200"
                                    src={avatar || user?.avatar}
                                >
                                    <User className="h-10 w-10" />
                                </Avatar>
                            </Badge>
                            <div className="mt-3">
                                <Tag color="orange" className="px-3 py-1">
                                    {userStats.memberLevel}
                                </Tag>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div>
                                <h2 className="m-0 text-gray-900 text-2xl font-bold">
                                    {user?.name || 'Người dùng'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Thành viên từ {dayjs(userStats.joinDate).format('DD/MM/YYYY')}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">{user?.phone || '1234567890'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">{user?.address || 'Localhost'}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-base text-gray-900 font-semibold">
                                            Điểm tích lũy: {userStats.loyaltyPoints.toLocaleString('vi-VN')}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {userStats.memberLevel}
                                        </span>
                                    </div>
                                    <Progress
                                        percent={getLevelProgress(userStats.loyaltyPoints)}
                                        strokeColor={getLevelColor(userStats.memberLevel)}
                                        showInfo={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <StatisticCard
                            title="Tổng đặt vé"
                            value={userStats.totalBookings}
                            icon={<Ticket className="h-5 w-5 text-primary" />}
                            valueStyle={{ color: '#e50914', fontSize: '28px', fontWeight: '700' }}
                        />
                    </Card>
                    <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <StatisticCard
                            title="Tổng chi tiêu"
                            value={`${userStats.totalSpent.toLocaleString('vi-VN')}đ`}
                            icon={<Gift className="h-5 w-5 text-green-600" />}
                            valueStyle={{ color: '#10b981', fontSize: '28px', fontWeight: '700' }}
                        />
                    </Card>
                    <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <StatisticCard
                            title="Phim yêu thích"
                            value={userStats.favoriteMovies}
                            icon={<Heart className="h-5 w-5 text-red-500" />}
                            valueStyle={{ color: '#ef4444', fontSize: '28px', fontWeight: '700' }}
                        />
                    </Card>
                    <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <StatisticCard
                            title="Điểm tích lũy"
                            value={userStats.loyaltyPoints.toLocaleString('vi-VN')}
                            icon={<Trophy className="h-5 w-5 text-yellow-500" />}
                            valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: '700' }}
                        />
                    </Card>
                </div>

                <Card className="bg-white rounded-xl shadow-md border border-gray-200">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'info',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Thông tin cá nhân
                                    </span>
                                ),
                                children: (
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    rules={{ required: 'Vui lòng nhập họ tên!' }}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Họ và tên</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    prefix={<User className="h-4 w-4 text-gray-400" />}
                                                                    disabled={!editMode}
                                                                    className="h-10"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    rules={[
                                                        { required: 'Vui lòng nhập email!' },
                                                        { type: 'email', message: 'Email không hợp lệ!' }
                                                    ]}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    prefix={<Mail className="h-4 w-4 text-gray-400" />}
                                                                    disabled={!editMode}
                                                                    className="h-10"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Số điện thoại</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    prefix={<Phone className="h-4 w-4 text-gray-400" />}
                                                                    disabled={!editMode}
                                                                    className="h-10"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="birthDate"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Ngày sinh</FormLabel>
                                                            <FormControl>
                                                                <DatePicker
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    disabled={!editMode}
                                                                    format="DD/MM/YYYY"
                                                                    placeholder="Chọn ngày sinh"
                                                                    className="w-full h-10"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="gender"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Giới tính</FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                    disabled={!editMode}
                                                                    placeholder="Chọn giới tính"
                                                                >
                                                                    <option value="male">Nam</option>
                                                                    <option value="female">Nữ</option>
                                                                    <option value="other">Khác</option>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="city"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Thành phố</FormLabel>
                                                            <FormControl>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                    disabled={!editMode}
                                                                    placeholder="Chọn thành phố"
                                                                >
                                                                    <option value="ho-chi-minh">Thành phố Hồ Chí Minh</option>
                                                                    <option value="ha-noi">Hà Nội</option>
                                                                    <option value="da-nang">Đà Nẵng</option>
                                                                    <option value="can-tho">Cần Thơ</option>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Địa chỉ</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                {...field}
                                                                disabled={!editMode}
                                                                rows={3}
                                                                placeholder="Nhập địa chỉ của bạn"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Separator />

                                            <div className="flex gap-2">
                                                {editMode ? (
                                                    <>
                                                        <Button
                                                            type="submit"
                                                            loading={loading}
                                                            disabled={loading}
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Lưu thay đổi
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setEditMode(false)}
                                                        >
                                                            Hủy
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        onClick={() => setEditMode(true)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa thông tin
                                                    </Button>
                                                )}
                                            </div>
                                        </form>
                                    </Form>
                                )
                            },
                            {
                                key: 'history',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Lịch sử đặt vé
                                    </span>
                                ),
                                children: (
                                    <TableWrapper
                                        columns={bookingColumns}
                                        dataSource={bookingHistory}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                    />
                                )
                            },
                            {
                                key: 'favorites',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <Heart className="h-4 w-4" />
                                        Phim yêu thích
                                    </span>
                                ),
                                children: (
                                    favoriteMovies.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {favoriteMovies.map(movie => (
                                                <Card
                                                    key={movie.id}
                                                    className="rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden"
                                                >
                                                    <img
                                                        src={movie.poster}
                                                        alt={movie.title}
                                                        className="h-[200px] w-full object-cover"
                                                    />
                                                    <div className="p-3">
                                                        <h4 className="font-semibold text-sm mb-2 line-clamp-1">
                                                            {movie.title}
                                                        </h4>
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-xs">{movie.rating}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500">{movie.year}</span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Empty description="Chưa có phim yêu thích nào" />
                                    )
                                )
                            },
                            {
                                key: 'settings',
                                label: (
                                    <span className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Cài đặt
                                    </span>
                                ),
                                children: (
                                    <div className="space-y-4">
                                        <Card className="rounded-lg border border-gray-200">
                                            <h4 className="font-semibold mb-4">Cài đặt thông báo</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Bell className="h-4 w-4" />
                                                        <span className="text-gray-900">Thông báo email</span>
                                                    </div>
                                                    <Button size="sm" className="rounded">Bật</Button>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Bell className="h-4 w-4" />
                                                        <span className="text-gray-900">Thông báo push</span>
                                                    </div>
                                                    <Button size="sm" className="rounded">Bật</Button>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="rounded-lg border border-gray-200">
                                            <h4 className="font-semibold mb-4">Bảo mật</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        <span className="text-gray-900">Đổi mật khẩu</span>
                                                    </div>
                                                    <Button size="sm" className="rounded">Đổi</Button>
                                                </div>
                                                <div className="flex justify-between items-center py-2">
                                                    <div className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4" />
                                                        <span className="text-gray-900">Xác thực 2 bước</span>
                                                    </div>
                                                    <Button size="sm" className="rounded">Bật</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            }
                        ]}
                    />
                </Card>
            </div>

            <GlobalBackTop />
        </div>
    );
};

export default Profile;
