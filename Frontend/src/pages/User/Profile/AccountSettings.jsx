import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Clock, Edit, Camera, CheckCircle2, XCircle, Download, Printer, Loader2, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import { Upload } from '@/components/ui/upload';
import { Badge } from '@/components/ui/badge-count';
import useAuth from '@/hooks/useAuth';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';
import userService from '@/services/userService';
import useNotification from '@/hooks/useNotification';
import { uploadAvatar } from '@/utils/cloudinary';
import { useForm } from 'react-hook-form';

const AccountSettings = () => {
    const { user, updateProfile } = useAuth();
    const notification = useNotification();
    const form = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            birthDate: ''
        }
    });
    const passwordForm = useForm({
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [activeMenu, setActiveMenu] = useState('info');
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [generatedQR, setGeneratedQR] = useState(null);
    const [bookingPagination, setBookingPagination] = useState({ page: 0, size: 5, totalPages: 0, totalElements: 0 });
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                birthDate: user.birthDate || ''
            });
        }
    }, [user, form]);


    useEffect(() => {
        if (activeMenu === 'history' && user?.id) {
            loadBookingHistory();
        }
    }, [activeMenu, user]);


    useEffect(() => {
        if (activeMenu === 'history' && user?.id && bookingPagination.page > 0) {
            loadMoreBookings();
        }
    }, [bookingPagination.page]);

    const loadBookingHistory = async () => {
        if (!user?.id) return;

        setBookingLoading(true);
        try {
            const params = {
                page: 0,
                size: bookingPagination.size
            };
            const response = await bookingService.getBookingHistoryByUserId(user.id, params);

            if (response?.content) {
                setBookingHistory(response.content);
                setBookingPagination({
                    page: 0,
                    size: bookingPagination.size,
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0
                });
            } else if (Array.isArray(response)) {
                setBookingHistory(response);
            } else {
                setBookingHistory([]);
            }
        } catch (error) {
            console.error('Error loading booking history:', error);
            notification.error('Không thể tải lịch sử đặt vé');
            setBookingHistory([]);
        } finally {
            setBookingLoading(false);
        }
    };

    const generateQRCode = async (bookingCode) => {
        try {
            const qrDataUrl = await QRCode.toDataURL(bookingCode, {
                width: 250,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setGeneratedQR(qrDataUrl);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handleViewBookingDetail = async (bookingCode) => {
        setDetailLoading(true);
        setDetailModalVisible(true);
        setGeneratedQR(null);
        try {
            const response = await bookingService.getBookingByCode(bookingCode);
            setSelectedBooking(response);

            if (!response.qrCodeBase64) {
                await generateQRCode(response.bookingCode);
            }
        } catch (error) {
            console.error('Error loading booking detail:', error);
            notification.error('Không thể tải thông tin đặt vé');
            setDetailModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedBooking(null);
        setGeneratedQR(null);
    };

    const handleDownloadQR = async () => {
        if (!selectedBooking?.id) return;

        try {
            const blob = await ticketService.downloadBookingPDF(selectedBooking.id);
            ticketService.triggerDownload(blob, `ticket-${selectedBooking.bookingCode}.pdf`);
            notification.success('Đã tải xuống vé thành công');
        } catch (error) {
            console.error('Error downloading ticket:', error);
            notification.error('Không thể tải xuống vé');
        }
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING': { color: 'orange', icon: <Clock className="h-4 w-4" />, text: 'Đang chờ thanh toán' },
            'PAID': { color: 'green', icon: <CheckCircle2 className="h-4 w-4" />, text: 'Đã thanh toán' },
            'CANCELLED': { color: 'default', icon: <XCircle className="h-4 w-4" />, text: 'Đã hủy' },
            'FAILED': { color: 'red', icon: <XCircle className="h-4 w-4" />, text: 'Thanh toán lỗi' },
            'REFUNDED': { color: 'blue', icon: <CheckCircle2 className="h-4 w-4" />, text: 'Đã hoàn tiền' }
        };
        return configs[status] || configs['PENDING'];
    };

    const loadMoreBookings = async () => {
        if (!user?.id) return;

        setBookingLoading(true);
        try {
            const params = {
                page: bookingPagination.page,
                size: bookingPagination.size
            };
            const response = await bookingService.getBookingHistoryByUserId(user.id, params);

            if (response?.content) {
                setBookingHistory(prev => [...prev, ...response.content]);
                setBookingPagination(prev => ({
                    ...prev,
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0
                }));
            }
        } catch (error) {
            console.error('Error loading more bookings:', error);
            notification.error('Không thể tải thêm lịch sử');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleSaveInfo = async (values) => {
        setLoading(true);
        try {
            const updateData = {
                fullName: values.fullName,
                email: values.email,
                phoneNumber: values.phone,
                birthDate: values.birthDate
            };

            await updateProfile(updateData);
            notification.success('Cập nhật thông tin thành công!');
            setIsEditingInfo(false);
        } catch (error) {
            notification.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
        } finally {
            setLoading(false);
        }
    };

    const updateAvatarUrl = async (avatarUrl) => {
        if (!user?.id) return;

        try {
            await userService.updateAvatar(user.id, avatarUrl);
            await updateProfile({ avatar: avatarUrl });
            setAvatarPreview(null);
            setAvatarLoading(false);
            notification.success('Cập nhật avatar thành công!');
        } catch (error) {
            console.error('Error updating avatar:', error);
            setAvatarLoading(false);
            notification.error('Cập nhật avatar thất bại. Vui lòng thử lại!');
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            notification.error('Chỉ có thể tải lên file ảnh!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            notification.error('Ảnh phải nhỏ hơn 2MB!');
            return false;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        return true;
    };

    const handleAvatarUpload = async (options) => {
        const { file, onSuccess, onError, onProgress } = options;

        setAvatarLoading(true);

        try {
            const avatarUrl = await uploadAvatar(file);

            if (onProgress) {
                onProgress({ percent: 100 });
            }

            await updateAvatarUrl(avatarUrl);

            if (onSuccess) {
                onSuccess({ url: avatarUrl }, file);
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            setAvatarLoading(false);
            notification.error(error.message || 'Tải lên avatar thất bại. Vui lòng thử lại!');

            if (onError) {
                onError(error);
            }
        }
    };

    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            if (values.newPassword !== values.confirmPassword) {
                notification.error('Mật khẩu xác nhận không khớp!');
                setLoading(false);
                return;
            }

            await userService.changePassword(user.id, {
                oldPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmNewPassword: values.confirmPassword
            });
            notification.success('Đổi mật khẩu thành công!');
            passwordForm.reset();
            setIsEditingPassword(false);
        } catch (_error) {
            notification.error('Có lỗi xảy ra khi đổi mật khẩu!');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (activeMenu === 'info') {
            form.reset();
            setIsEditingInfo(false);
        } else if (activeMenu === 'security') {
            passwordForm.reset();
            setIsEditingPassword(false);
        }
    };

    const handleEdit = () => {
        if (activeMenu === 'info') {
            setIsEditingInfo(true);
        } else if (activeMenu === 'security') {
            setIsEditingPassword(true);
        }
    };

    const handleCopyCode = () => {
        if (selectedBooking?.bookingCode) {
            navigator.clipboard.writeText(selectedBooking.bookingCode);
            notification.success('Đã sao chép mã đặt vé');
        }
    };

    const menuItems = [
        {
            key: 'info',
            icon: <User className="h-4 w-4" />,
            label: 'Thông tin cá nhân'
        },
        {
            key: 'security',
            icon: <Lock className="h-4 w-4" />,
            label: 'Mật khẩu & Bảo mật'
        },
        {
            key: 'history',
            icon: <Clock className="h-4 w-4" />,
            label: 'Lịch sử đặt vé'
        },
        {
            key: 'notifications',
            icon: <Bell className="h-4 w-4" />,
            label: 'Cài đặt thông báo'
        }
    ];

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-foreground mb-6 text-2xl font-bold">Cài đặt Tài khoản</h2>
                {!user && (
                    <div className="p-5 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                        <p>Vui lòng đăng nhập để xem thông tin cá nhân</p>
                    </div>
                )}

                <div className="flex gap-6 flex-col lg:flex-row">
                    <div className="lg:w-64 flex-shrink-0">
                        <Card className="bg-card rounded-xl shadow-md border border-border p-6 mb-6">
                            <div className="flex flex-col items-center mb-6 pb-6 border-b border-border">
                                <Badge
                                    count={
                                        <Upload
                                            beforeUpload={beforeUpload}
                                            onChange={(info) => {
                                                if (info.file) {
                                                    handleAvatarUpload({
                                                        file: info.file.originFileObj || info.file,
                                                        onSuccess: () => { },
                                                        onError: () => { },
                                                        onProgress: () => { }
                                                    });
                                                }
                                            }}
                                            accept="image/*"
                                            maxCount={1}
                                        >
                                            <Button
                                                size="icon"
                                                className="rounded-full shadow-lg hover:scale-110 transition-transform"
                                                disabled={avatarLoading}
                                            >
                                                {avatarLoading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Camera className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </Upload>
                                    }
                                >
                                    <Avatar
                                        className="w-20 h-20 border-2 border-gray-300 mb-3"
                                        src={avatarPreview || user?.avatarUrl}
                                    >
                                        <User className="h-10 w-10" />
                                    </Avatar>
                                </Badge>
                                <div className="text-center mt-2">
                                    <p className="font-semibold text-foreground mb-1">
                                        {user?.fullName || user?.username || 'Người dùng'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {user?.email || ''}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1">
                                {menuItems.map(item => (
                                    <div
                                        key={item.key}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${activeMenu === item.key
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        onClick={() => setActiveMenu(item.key)}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="flex-1">
                        {activeMenu === 'info' && (
                            <Card className="bg-card rounded-xl shadow-md border border-border p-6">
                                <div className="mb-6">
                                    <h3 className="text-foreground mb-2 text-xl font-bold">Thông tin cá nhân</h3>
                                    <p className="text-muted-foreground">
                                        Cập nhật thông tin và địa chỉ email của bạn.
                                    </p>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSaveInfo)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                rules={{ required: 'Vui lòng nhập họ tên!', minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' } }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Họ và tên</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Nguyễn Văn A"
                                                                disabled={!isEditingInfo}
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage fieldState={fieldState} />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                rules={{ required: 'Vui lòng nhập email!', type: 'email', message: 'Email không hợp lệ!' }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Địa chỉ email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="nguyenvana@email.com"
                                                                disabled={!isEditingInfo}
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage fieldState={fieldState} />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                rules={{ pattern: { value: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' } }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Số điện thoại</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Thêm số điện thoại"
                                                                disabled={!isEditingInfo}
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage fieldState={fieldState} />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="birthDate"
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Ngày sinh</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                placeholder="mm/dd/yyyy"
                                                                disabled={!isEditingInfo}
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage fieldState={fieldState} />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </Card>
                        )}

                        {activeMenu === 'security' && (
                            <Card className="bg-card rounded-xl shadow-md border border-border p-6">
                                <div className="mb-6">
                                    <h3 className="text-foreground mb-2 text-xl font-bold">Mật khẩu & Bảo mật</h3>
                                    <p className="text-muted-foreground">
                                        Thay đổi mật khẩu để bảo vệ tài khoản của bạn.
                                    </p>
                                </div>

                                <Form {...passwordForm}>
                                    <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="currentPassword"
                                            rules={{ required: 'Vui lòng nhập mật khẩu hiện tại!' }}
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                                                    <FormControl>
                                                        <InputPassword
                                                            {...field}
                                                            placeholder="••••••••••"
                                                            disabled={!isEditingPassword}
                                                            className="h-10 rounded-lg"
                                                        />
                                                    </FormControl>
                                                    <FormMessage fieldState={fieldState} />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={passwordForm.control}
                                                name="newPassword"
                                                rules={{ required: 'Vui lòng nhập mật khẩu mới!', minLength: { value: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' } }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Mật khẩu mới</FormLabel>
                                                        <FormControl>
                                                            <InputPassword
                                                                {...field}
                                                                placeholder="Nhập mật khẩu mới"
                                                                disabled={!isEditingPassword}
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage fieldState={fieldState} />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={passwordForm.control}
                                                name="confirmPassword"
                                                rules={{
                                                    required: 'Vui lòng xác nhận mật khẩu!',
                                                    validate: (value) => value === passwordForm.getValues('newPassword') || 'Mật khẩu xác nhận không khớp!'
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                                        <FormControl>
                                                            <InputPassword
                                                                {...field}
                                                                placeholder="Nhập lại mật khẩu mới"
                                                                disabled={!isEditingPassword}
                                                                className="h-10 rounded-lg"
                                                            />
                                                        </FormControl>
                                                        <FormMessage fieldState={fieldState} />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </form>
                                </Form>
                            </Card>
                        )}

                        {activeMenu === 'notifications' && (
                            <Card className="bg-card rounded-xl shadow-md border border-border p-6">
                                <div className="mb-6">
                                    <h3 className="text-foreground mb-2 text-xl font-bold">Cài đặt thông báo</h3>
                                    <p className="text-muted-foreground">
                                        Quản lý cách bạn nhận thông báo từ chúng tôi.
                                    </p>
                                </div>
                                <p className="text-muted-foreground">Tính năng đang được phát triển...</p>
                            </Card>
                        )}

                        {activeMenu === 'history' && (
                            <Card className="bg-card rounded-xl shadow-md border border-border p-6">
                                <div className="mb-6">
                                    <h3 className="text-foreground mb-2 text-xl font-bold">Lịch sử đặt vé</h3>
                                    <p className="text-muted-foreground">
                                        Xem lại tất cả các đơn đặt vé của bạn.
                                    </p>
                                </div>

                                {bookingLoading ? (
                                    <div className="text-center py-10">
                                        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                                        <p className="mt-4 text-muted-foreground">Đang tải lịch sử đặt vé...</p>
                                    </div>
                                ) : bookingHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookingHistory.map((booking) => {
                                            let dateTimeStr = 'N/A';
                                            if (booking.showDate && booking.startTime) {
                                                try {
                                                    const date = new Date(booking.showDate);
                                                    const dateStr = date.toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    });
                                                    dateTimeStr = `${booking.startTime} - ${dateStr}`;
                                                } catch (_e) {
                                                    console.error('Date format error:', _e);
                                                }
                                            }

                                            const seatsStr = booking.seats?.map(s => s.seatName).join(', ') || 'N/A';

                                            const statusMap = {
                                                'PENDING': 'Đang chờ thanh toán',
                                                'PAID': 'Đã thanh toán',
                                                'CANCELLED': 'Đã hủy',
                                                'FAILED': 'Thanh toán lỗi',
                                                'REFUNDED': 'Đã hoàn tiền'
                                            };
                                            const statusText = statusMap[booking.status] || booking.status || 'N/A';

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className="flex gap-4 p-4 bg-background rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 border border-border"
                                                    onClick={() => handleViewBookingDetail(booking.bookingCode)}
                                                >
                                                    <img
                                                        src={booking.posterUrl || '/placeholder-movie.jpg'}
                                                        alt={booking.movieTitle}
                                                        className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                                                        onError={(e) => {
                                                            e.target.src = '/brand-placeholder.svg';
                                                        }}
                                                    />
                                                    <div className="flex-1 flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-foreground mb-1 text-base">
                                                                {booking.movieTitle || 'Không có thông tin phim'}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                {booking.cinemaName || 'N/A'} • {dateTimeStr}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground mb-1">
                                                                Ghế: {seatsStr}
                                                            </p>
                                                            {booking.bookingCode && (
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    Mã đặt vé: {booking.bookingCode}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <p className="font-semibold text-blue-600 text-base mb-1">
                                                                {(booking.finalAmount || 0).toLocaleString('vi-VN')}đ
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {statusText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {bookingPagination.page < bookingPagination.totalPages - 1 && (
                                            <div className="text-center mt-6">
                                                <Button
                                                    onClick={() => {
                                                        setBookingPagination(prev => ({
                                                            ...prev,
                                                            page: prev.page + 1
                                                        }));
                                                    }}
                                                    disabled={bookingLoading}
                                                    className="min-w-[150px] rounded-lg h-10"
                                                >
                                                    {bookingLoading ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Đang tải...
                                                        </>
                                                    ) : (
                                                        'Xem thêm'
                                                    )}
                                                </Button>
                                                <p className="mt-3 text-sm text-muted-foreground">
                                                    Trang {bookingPagination.page + 1} / {bookingPagination.totalPages}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground">Bạn chưa có đơn đặt vé nào</p>
                                    </div>
                                )}
                            </Card>
                        )}

                        {(activeMenu === 'info' || activeMenu === 'security') && (
                            <div className="flex gap-3 justify-end mt-6">
                                {((activeMenu === 'info' && !isEditingInfo) || (activeMenu === 'security' && !isEditingPassword)) ? (
                                    <Button
                                        onClick={handleEdit}
                                        className="h-12 rounded-lg font-semibold"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Chỉnh sửa
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="h-12 rounded-lg font-semibold"
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                if (activeMenu === 'info') {
                                                    form.handleSubmit(handleSaveInfo)();
                                                } else if (activeMenu === 'security') {
                                                    passwordForm.handleSubmit(handleChangePassword)();
                                                }
                                            }}
                                            disabled={loading}
                                            className="h-12 rounded-lg font-semibold"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                'Lưu thay đổi'
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ResponsiveDialog
                heading="Chi tiết đặt vé"
                open={detailModalVisible}
                onClose={handleCloseDetailModal}
                maxWidth={850}
                actions={[
                    <Button key="close" variant="outline" onClick={handleCloseDetailModal}>
                        Đóng
                    </Button>,
                    <Button
                        key="download"
                        onClick={handleDownloadQR}
                        disabled={!selectedBooking?.id}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Tải vé PDF
                    </Button>,
                    <Button
                        key="print"
                        onClick={handlePrintTicket}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        In vé
                    </Button>
                ]}
            >
                {detailLoading ? (
                    <div className="text-center py-10">
                        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                        <p className="mt-4 text-muted-foreground">Đang tải...</p>
                    </div>
                ) : selectedBooking ? (
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 max-h-[70vh] overflow-y-auto">
                        <div className="text-center">
                            {selectedBooking.qrCodeBase64 || generatedQR ? (
                                <img
                                    src={selectedBooking.qrCodeBase64
                                        ? `data:image/png;base64,${selectedBooking.qrCodeBase64}`
                                        : generatedQR
                                    }
                                    alt="QR Code"
                                    className="w-full max-w-[180px] border-2 border-border rounded-lg mb-3 p-1.5 bg-card mx-auto"
                                />
                            ) : (
                                <div className="w-[180px] h-[180px] mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            )}
                            <div className="mb-2">
                                <p className="text-xs text-muted-foreground mb-1">Mã đặt vé</p>
                                <div className="flex items-center gap-2 justify-center">
                                    <h5 className="text-sm font-bold m-0">
                                        {selectedBooking.bookingCode}
                                    </h5>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyCode}
                                        className="h-6 w-6 p-0"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <StatusBadge
                                tone={getStatusConfig(selectedBooking.status).color}
                                className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
                            >
                                {getStatusConfig(selectedBooking.status).icon}
                                {getStatusConfig(selectedBooking.status).text}
                            </StatusBadge>
                            {(selectedBooking.moviePosterUrl || selectedBooking.posterUrl) && (
                                <div className="mt-3 text-center">
                                    <img
                                        src={selectedBooking.moviePosterUrl || selectedBooking.posterUrl}
                                        alt={selectedBooking.movieTitle}
                                        className="w-full max-w-[150px] rounded-lg mx-auto"
                                        onError={(e) => {
                                            e.target.src = '/brand-placeholder.svg';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card className="rounded-lg border border-border">
                                <h4 className="font-semibold mb-3">Thông tin phim</h4>
                                <DetailList columns={1}>
                                    <DetailItem label="Tên phim">
                                        <span className="font-semibold">{selectedBooking.movieTitle || 'N/A'}</span>
                                    </DetailItem>
                                    <DetailItem label="Định dạng">
                                        {selectedBooking.formatType ||
                                            (selectedBooking.movieFormat && selectedBooking.movieAudioType
                                                ? `${selectedBooking.movieFormat} ${selectedBooking.movieAudioType}`
                                                : selectedBooking.movieFormat || 'N/A')}
                                    </DetailItem>
                                </DetailList>
                            </Card>

                            <Card className="rounded-lg border border-border">
                                <h4 className="font-semibold mb-3">Thông tin rạp</h4>
                                <DetailList columns={1}>
                                    <DetailItem label="Rạp chiếu">
                                        <span className="font-semibold">{selectedBooking.cinemaName}</span>
                                    </DetailItem>
                                    <DetailItem label="Phòng chiếu">
                                        {selectedBooking.roomName || 'N/A'}
                                    </DetailItem>
                                    <DetailItem label="Địa chỉ">
                                        {selectedBooking.cinemaAddress || 'N/A'}
                                    </DetailItem>
                                </DetailList>
                            </Card>

                            <Card className="rounded-lg border border-border">
                                <h4 className="font-semibold mb-3">Thông tin suất chiếu</h4>
                                <DetailList columns={1}>
                                    <DetailItem label="Ngày chiếu">
                                        {selectedBooking.showtimeDateTime || selectedBooking.showDate ? (() => {
                                            try {
                                                const dateStr = selectedBooking.showtimeDateTime || selectedBooking.showDate;
                                                const date = dayjs(dateStr);
                                                if (date.isValid()) {
                                                    const formatted = date.format('dddd, DD [Tháng] MM, YYYY');
                                                    return formatted
                                                        .replace('Monday', 'Thứ Hai')
                                                        .replace('Tuesday', 'Thứ Ba')
                                                        .replace('Wednesday', 'Thứ Tư')
                                                        .replace('Thursday', 'Thứ Năm')
                                                        .replace('Friday', 'Thứ Sáu')
                                                        .replace('Saturday', 'Thứ Bảy')
                                                        .replace('Sunday', 'Chủ Nhật');
                                                }
                                                return new Date(dateStr).toLocaleDateString('vi-VN', {
                                                    weekday: 'long',
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                });
                                            } catch (_e) {
                                                return 'N/A';
                                            }
                                        })() : 'N/A'}
                                    </DetailItem>
                                    <DetailItem label="Giờ chiếu">
                                        {(() => {
                                            const startTime = selectedBooking.showtimeStartTime || selectedBooking.startTime;
                                            const endTime = selectedBooking.showtimeEndTime || selectedBooking.endTime;

                                            if (!startTime) return 'N/A';

                                            // Format time from LocalTime (HH:mm:ss or HH:mm)
                                            const formatTime = (timeStr) => {
                                                if (!timeStr) return '';
                                                if (/^\d{2}:\d{2}:\d{2}/.test(timeStr)) {
                                                    return timeStr.substring(0, 5); // Extract HH:mm
                                                } else if (/^\d{2}:\d{2}$/.test(timeStr)) {
                                                    return timeStr;
                                                } else {
                                                    try {
                                                        const time = dayjs(`2000-01-01 ${timeStr}`);
                                                        if (time.isValid()) {
                                                            return time.format('HH:mm');
                                                        }
                                                    } catch (_e) {
                                                        return timeStr;
                                                    }
                                                }
                                                return timeStr;
                                            };

                                            const formattedStart = formatTime(startTime);
                                            const formattedEnd = formatTime(endTime);

                                            return formattedEnd ? `${formattedStart} - ${formattedEnd}` : formattedStart;
                                        })()}
                                    </DetailItem>
                                </DetailList>
                            </Card>

                            <Card className="rounded-lg border border-border">
                                <h4 className="font-semibold mb-3">Thông tin ghế</h4>
                                <div>
                                    <p className="font-semibold mb-2">Ghế đã chọn: </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBooking.seats && selectedBooking.seats.length > 0 ? (
                                            selectedBooking.seats.map((seat, index) => (
                                                <StatusBadge key={index} tone="blue">
                                                    {seat.seatName || seat.name || seat.seatNumber || seat.id || `Ghế ${index + 1}`}
                                                    {seat.seatType && ` - ${seat.seatType}`}
                                                </StatusBadge>
                                            ))
                                        ) : selectedBooking.seatNumbers ? (
                                            <span className="text-gray-700">{selectedBooking.seatNumbers}</span>
                                        ) : (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-lg border border-border">
                                <h4 className="font-semibold mb-3">Thông tin thanh toán</h4>
                                <DetailList columns={1}>
                                    {(() => {
                                        const totalAmount = selectedBooking.totalAmount || selectedBooking.originalPrice || 0;
                                        const discountAmount = selectedBooking.discountAmount || 0;
                                        const finalAmount = selectedBooking.finalAmount || selectedBooking.totalPrice || totalAmount;

                                        return (
                                            <>
                                                {totalAmount > 0 && (
                                                    <DetailItem label="Giá gốc">
                                                        {typeof totalAmount === 'number'
                                                            ? totalAmount.toLocaleString('vi-VN')
                                                            : parseFloat(totalAmount || 0).toLocaleString('vi-VN')}đ
                                                    </DetailItem>
                                                )}
                                                {discountAmount > 0 && (
                                                    <DetailItem label="Giảm giá">
                                                        <span className="text-red-600">
                                                            -{typeof discountAmount === 'number'
                                                                ? discountAmount.toLocaleString('vi-VN')
                                                                : parseFloat(discountAmount || 0).toLocaleString('vi-VN')}đ
                                                        </span>
                                                    </DetailItem>
                                                )}
                                                <DetailItem label="Tổng tiền">
                                                    <span className="font-semibold text-lg text-blue-600">
                                                        {typeof finalAmount === 'number'
                                                            ? finalAmount.toLocaleString('vi-VN')
                                                            : parseFloat(finalAmount || 0).toLocaleString('vi-VN')}đ
                                                    </span>
                                                </DetailItem>
                                            </>
                                        );
                                    })()}
                                    <DetailItem label="Ngày đặt vé">
                                        {selectedBooking.bookingDate ? (() => {
                                            try {
                                                return new Date(selectedBooking.bookingDate).toLocaleString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                });
                                            } catch (_e) {
                                                return selectedBooking.bookingDate;
                                            }
                                        })() : 'N/A'}
                                    </DetailItem>
                                </DetailList>
                            </Card>
                        </div>
                    </div>
                ) : null}
            </ResponsiveDialog>
        </div>
    );
};

export default AccountSettings;
