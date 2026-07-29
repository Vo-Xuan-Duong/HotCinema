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
            notification.error('KhÃ´ng thá»ƒ táº£i lá»‹ch sá»­ Ä‘áº·t vÃ©');
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
            notification.error('KhÃ´ng thá»ƒ táº£i thÃ´ng tin Ä‘áº·t vÃ©');
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
            notification.success('ÄÃ£ táº£i xuá»‘ng vÃ© thÃ nh cÃ´ng');
        } catch (error) {
            console.error('Error downloading ticket:', error);
            notification.error('KhÃ´ng thá»ƒ táº£i xuá»‘ng vÃ©');
        }
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING': { color: 'orange', icon: <Clock className="h-4 w-4" />, text: 'Äang chá» thanh toÃ¡n' },
            'PAID': { color: 'green', icon: <CheckCircle2 className="h-4 w-4" />, text: 'ÄÃ£ thanh toÃ¡n' },
            'CANCELLED': { color: 'default', icon: <XCircle className="h-4 w-4" />, text: 'ÄÃ£ há»§y' },
            'FAILED': { color: 'red', icon: <XCircle className="h-4 w-4" />, text: 'Thanh toÃ¡n lá»—i' },
            'REFUNDED': { color: 'blue', icon: <CheckCircle2 className="h-4 w-4" />, text: 'ÄÃ£ hoÃ n tiá»n' }
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
            notification.error('KhÃ´ng thá»ƒ táº£i thÃªm lá»‹ch sá»­');
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
            notification.success('Cáº­p nháº­t thÃ´ng tin thÃ nh cÃ´ng!');
            setIsEditingInfo(false);
        } catch (error) {
            notification.error(error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi cáº­p nháº­t thÃ´ng tin!');
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
            notification.success('Cáº­p nháº­t avatar thÃ nh cÃ´ng!');
        } catch (error) {
            console.error('Error updating avatar:', error);
            setAvatarLoading(false);
            notification.error('Cáº­p nháº­t avatar tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i!');
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            notification.error('Chá»‰ cÃ³ thá»ƒ táº£i lÃªn file áº£nh!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            notification.error('áº¢nh pháº£i nhá» hÆ¡n 2MB!');
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
            notification.error(error.message || 'Táº£i lÃªn avatar tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i!');

            if (onError) {
                onError(error);
            }
        }
    };

    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            if (values.newPassword !== values.confirmPassword) {
                notification.error('Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p!');
                setLoading(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            notification.success('Äá»•i máº­t kháº©u thÃ nh cÃ´ng!');
            passwordForm.reset();
            setIsEditingPassword(false);
        } catch (_error) {
            notification.error('CÃ³ lá»—i xáº£y ra khi Ä‘á»•i máº­t kháº©u!');
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
            notification.success('ÄÃ£ sao chÃ©p mÃ£ Ä‘áº·t vÃ©');
        }
    };

    const menuItems = [
        {
            key: 'info',
            icon: <User className="h-4 w-4" />,
            label: 'ThÃ´ng tin cÃ¡ nhÃ¢n'
        },
        {
            key: 'security',
            icon: <Lock className="h-4 w-4" />,
            label: 'Máº­t kháº©u & Báº£o máº­t'
        },
        {
            key: 'history',
            icon: <Clock className="h-4 w-4" />,
            label: 'Lá»‹ch sá»­ Ä‘áº·t vÃ©'
        },
        {
            key: 'notifications',
            icon: <Bell className="h-4 w-4" />,
            label: 'CÃ i Ä‘áº·t thÃ´ng bÃ¡o'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                <h2 className="text-gray-900 mb-6 text-2xl font-bold">CÃ i Ä‘áº·t TÃ i khoáº£n</h2>
                {!user && (
                    <div className="p-5 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
                        <p>Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ xem thÃ´ng tin cÃ¡ nhÃ¢n</p>
                    </div>
                )}

                <div className="flex gap-6 flex-col lg:flex-row">
                    <div className="lg:w-64 flex-shrink-0">
                        <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
                            <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
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
                                    <p className="font-semibold text-gray-900 mb-1">
                                        {user?.fullName || user?.username || 'NgÆ°á»i dÃ¹ng'}
                                    </p>
                                    <p className="text-sm text-gray-600">
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
                            <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h3 className="text-gray-900 mb-2 text-xl font-bold">ThÃ´ng tin cÃ¡ nhÃ¢n</h3>
                                    <p className="text-gray-600">
                                        Cáº­p nháº­t thÃ´ng tin vÃ  Ä‘á»‹a chá»‰ email cá»§a báº¡n.
                                    </p>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleSaveInfo)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fullName"
                                                rules={{ required: 'Vui lÃ²ng nháº­p há» tÃªn!', minLength: { value: 2, message: 'Há» tÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±!' } }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Há» vÃ  tÃªn</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Nguyá»…n VÄƒn A"
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
                                                rules={{ required: 'Vui lÃ²ng nháº­p email!', type: 'email', message: 'Email khÃ´ng há»£p lá»‡!' }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Äá»‹a chá»‰ email</FormLabel>
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
                                                rules={{ pattern: { value: /^[0-9]{10,11}$/, message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡!' } }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Sá»‘ Ä‘iá»‡n thoáº¡i</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="ThÃªm sá»‘ Ä‘iá»‡n thoáº¡i"
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
                                                        <FormLabel>NgÃ y sinh</FormLabel>
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
                            <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h3 className="text-gray-900 mb-2 text-xl font-bold">Máº­t kháº©u & Báº£o máº­t</h3>
                                    <p className="text-gray-600">
                                        Thay Ä‘á»•i máº­t kháº©u Ä‘á»ƒ báº£o vá»‡ tÃ i khoáº£n cá»§a báº¡n.
                                    </p>
                                </div>

                                <Form {...passwordForm}>
                                    <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                                        <FormField
                                            control={passwordForm.control}
                                            name="currentPassword"
                                            rules={{ required: 'Vui lÃ²ng nháº­p máº­t kháº©u hiá»‡n táº¡i!' }}
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel>Máº­t kháº©u hiá»‡n táº¡i</FormLabel>
                                                    <FormControl>
                                                        <InputPassword
                                                            {...field}
                                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
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
                                                rules={{ required: 'Vui lÃ²ng nháº­p máº­t kháº©u má»›i!', minLength: { value: 6, message: 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±!' } }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>Máº­t kháº©u má»›i</FormLabel>
                                                        <FormControl>
                                                            <InputPassword
                                                                {...field}
                                                                placeholder="Nháº­p máº­t kháº©u má»›i"
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
                                                    required: 'Vui lÃ²ng xÃ¡c nháº­n máº­t kháº©u!',
                                                    validate: (value) => value === passwordForm.getValues('newPassword') || 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p!'
                                                }}
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel>XÃ¡c nháº­n máº­t kháº©u má»›i</FormLabel>
                                                        <FormControl>
                                                            <InputPassword
                                                                {...field}
                                                                placeholder="Nháº­p láº¡i máº­t kháº©u má»›i"
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
                            <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h3 className="text-gray-900 mb-2 text-xl font-bold">CÃ i Ä‘áº·t thÃ´ng bÃ¡o</h3>
                                    <p className="text-gray-600">
                                        Quáº£n lÃ½ cÃ¡ch báº¡n nháº­n thÃ´ng bÃ¡o tá»« chÃºng tÃ´i.
                                    </p>
                                </div>
                                <p className="text-gray-600">TÃ­nh nÄƒng Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn...</p>
                            </Card>
                        )}

                        {activeMenu === 'history' && (
                            <Card className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                                <div className="mb-6">
                                    <h3 className="text-gray-900 mb-2 text-xl font-bold">Lá»‹ch sá»­ Ä‘áº·t vÃ©</h3>
                                    <p className="text-gray-600">
                                        Xem láº¡i táº¥t cáº£ cÃ¡c Ä‘Æ¡n Ä‘áº·t vÃ© cá»§a báº¡n.
                                    </p>
                                </div>

                                {bookingLoading ? (
                                    <div className="text-center py-10">
                                        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                                        <p className="mt-4 text-gray-600">Äang táº£i lá»‹ch sá»­ Ä‘áº·t vÃ©...</p>
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
                                                'PENDING': 'Äang chá» thanh toÃ¡n',
                                                'PAID': 'ÄÃ£ thanh toÃ¡n',
                                                'CANCELLED': 'ÄÃ£ há»§y',
                                                'FAILED': 'Thanh toÃ¡n lá»—i',
                                                'REFUNDED': 'ÄÃ£ hoÃ n tiá»n'
                                            };
                                            const statusText = statusMap[booking.status] || booking.status || 'N/A';

                                            return (
                                                <div
                                                    key={booking.id}
                                                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200 border border-gray-200"
                                                    onClick={() => handleViewBookingDetail(booking.bookingCode)}
                                                >
                                                    <img
                                                        src={booking.posterUrl || '/placeholder-movie.jpg'}
                                                        alt={booking.movieTitle}
                                                        className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/80x120?text=No+Image';
                                                        }}
                                                    />
                                                    <div className="flex-1 flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 mb-1 text-base">
                                                                {booking.movieTitle || 'KhÃ´ng cÃ³ thÃ´ng tin phim'}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                {booking.cinemaName || 'N/A'} â€¢ {dateTimeStr}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mb-1">
                                                                Gháº¿: {seatsStr}
                                                            </p>
                                                            {booking.bookingCode && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    MÃ£ Ä‘áº·t vÃ©: {booking.bookingCode}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <p className="font-semibold text-blue-600 text-base mb-1">
                                                                {(booking.finalAmount || 0).toLocaleString('vi-VN')}Ä‘
                                                            </p>
                                                            <p className="text-xs text-gray-600">
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
                                                            Äang táº£i...
                                                        </>
                                                    ) : (
                                                        'Xem thÃªm'
                                                    )}
                                                </Button>
                                                <p className="mt-3 text-sm text-gray-600">
                                                    Trang {bookingPagination.page + 1} / {bookingPagination.totalPages}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-gray-600">Báº¡n chÆ°a cÃ³ Ä‘Æ¡n Ä‘áº·t vÃ© nÃ o</p>
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
                                        Chá»‰nh sá»­a
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="h-12 rounded-lg font-semibold"
                                        >
                                            Há»§y
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
                                                    Äang lÆ°u...
                                                </>
                                            ) : (
                                                'LÆ°u thay Ä‘á»•i'
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
                heading="Chi tiáº¿t Ä‘áº·t vÃ©"
                open={detailModalVisible}
                onClose={handleCloseDetailModal}
                maxWidth={850}
                actions={[
                    <Button key="close" variant="outline" onClick={handleCloseDetailModal}>
                        ÄÃ³ng
                    </Button>,
                    <Button
                        key="download"
                        onClick={handleDownloadQR}
                        disabled={!selectedBooking?.id}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Táº£i vÃ© PDF
                    </Button>,
                    <Button
                        key="print"
                        onClick={handlePrintTicket}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        In vÃ©
                    </Button>
                ]}
            >
                {detailLoading ? (
                    <div className="text-center py-10">
                        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                        <p className="mt-4 text-gray-600">Äang táº£i...</p>
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
                                    className="w-full max-w-[180px] border-2 border-gray-200 rounded-lg mb-3 p-1.5 bg-white mx-auto"
                                />
                            ) : (
                                <div className="w-[180px] h-[180px] mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            )}
                            <div className="mb-2">
                                <p className="text-xs text-gray-500 mb-1">MÃ£ Ä‘áº·t vÃ©</p>
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
                                            e.target.src = 'https://via.placeholder.com/150x225?text=No+Image';
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Card className="rounded-lg border border-gray-200">
                                <h4 className="font-semibold mb-3">ThÃ´ng tin phim</h4>
                                <DetailList columns={1}>
                                    <DetailItem label="TÃªn phim">
                                        <span className="font-semibold">{selectedBooking.movieTitle || 'N/A'}</span>
                                    </DetailItem>
                                    <DetailItem label="Äá»‹nh dáº¡ng">
                                        {selectedBooking.formatType ||
                                            (selectedBooking.movieFormat && selectedBooking.movieAudioType
                                                ? `${selectedBooking.movieFormat} ${selectedBooking.movieAudioType}`
                                                : selectedBooking.movieFormat || 'N/A')}
                                    </DetailItem>
                                </DetailList>
                            </Card>

                            <Card className="rounded-lg border border-gray-200">
                                <h4 className="font-semibold mb-3">ThÃ´ng tin ráº¡p</h4>
                                <DetailList columns={1}>
                                    <DetailItem label="Ráº¡p chiáº¿u">
                                        <span className="font-semibold">{selectedBooking.cinemaName}</span>
                                    </DetailItem>
                                    <DetailItem label="PhÃ²ng chiáº¿u">
                                        {selectedBooking.roomName || 'N/A'}
                                    </DetailItem>
                                    <DetailItem label="Äá»‹a chá»‰">
                                        {selectedBooking.cinemaAddress || 'N/A'}
                                    </DetailItem>
                                </DetailList>
                            </Card>

                            <Card className="rounded-lg border border-gray-200">
                                <h4 className="font-semibold mb-3">ThÃ´ng tin suáº¥t chiáº¿u</h4>
                                <DetailList columns={1}>
                                    <DetailItem label="NgÃ y chiáº¿u">
                                        {selectedBooking.showtimeDateTime || selectedBooking.showDate ? (() => {
                                            try {
                                                const dateStr = selectedBooking.showtimeDateTime || selectedBooking.showDate;
                                                const date = dayjs(dateStr);
                                                if (date.isValid()) {
                                                    const formatted = date.format('dddd, DD [ThÃ¡ng] MM, YYYY');
                                                    return formatted
                                                        .replace('Monday', 'Thá»© Hai')
                                                        .replace('Tuesday', 'Thá»© Ba')
                                                        .replace('Wednesday', 'Thá»© TÆ°')
                                                        .replace('Thursday', 'Thá»© NÄƒm')
                                                        .replace('Friday', 'Thá»© SÃ¡u')
                                                        .replace('Saturday', 'Thá»© Báº£y')
                                                        .replace('Sunday', 'Chá»§ Nháº­t');
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
                                    <DetailItem label="Giá» chiáº¿u">
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

                            <Card className="rounded-lg border border-gray-200">
                                <h4 className="font-semibold mb-3">ThÃ´ng tin gháº¿</h4>
                                <div>
                                    <p className="font-semibold mb-2">Gháº¿ Ä‘Ã£ chá»n: </p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedBooking.seats && selectedBooking.seats.length > 0 ? (
                                            selectedBooking.seats.map((seat, index) => (
                                                <StatusBadge key={index} tone="blue">
                                                    {seat.seatName || seat.name || seat.seatNumber || seat.id || `Gháº¿ ${index + 1}`}
                                                    {seat.seatType && ` - ${seat.seatType}`}
                                                </StatusBadge>
                                            ))
                                        ) : selectedBooking.seatNumbers ? (
                                            <span className="text-gray-700">{selectedBooking.seatNumbers}</span>
                                        ) : (
                                            <span className="text-gray-500">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-lg border border-gray-200">
                                <h4 className="font-semibold mb-3">ThÃ´ng tin thanh toÃ¡n</h4>
                                <DetailList columns={1}>
                                    {(() => {
                                        const totalAmount = selectedBooking.totalAmount || selectedBooking.originalPrice || 0;
                                        const discountAmount = selectedBooking.discountAmount || 0;
                                        const finalAmount = selectedBooking.finalAmount || selectedBooking.totalPrice || totalAmount;

                                        return (
                                            <>
                                                {totalAmount > 0 && (
                                                    <DetailItem label="GiÃ¡ gá»‘c">
                                                        {typeof totalAmount === 'number'
                                                            ? totalAmount.toLocaleString('vi-VN')
                                                            : parseFloat(totalAmount || 0).toLocaleString('vi-VN')}Ä‘
                                                    </DetailItem>
                                                )}
                                                {discountAmount > 0 && (
                                                    <DetailItem label="Giáº£m giÃ¡">
                                                        <span className="text-red-600">
                                                            -{typeof discountAmount === 'number'
                                                                ? discountAmount.toLocaleString('vi-VN')
                                                                : parseFloat(discountAmount || 0).toLocaleString('vi-VN')}Ä‘
                                                        </span>
                                                    </DetailItem>
                                                )}
                                                <DetailItem label="Tá»•ng tiá»n">
                                                    <span className="font-semibold text-lg text-blue-600">
                                                        {typeof finalAmount === 'number'
                                                            ? finalAmount.toLocaleString('vi-VN')
                                                            : parseFloat(finalAmount || 0).toLocaleString('vi-VN')}Ä‘
                                                    </span>
                                                </DetailItem>
                                            </>
                                        );
                                    })()}
                                    <DetailItem label="NgÃ y Ä‘áº·t vÃ©">
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
