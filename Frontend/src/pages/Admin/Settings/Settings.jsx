import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
    Settings as SettingsIcon,
    DollarSign,
    ShoppingCart,
    Video,
    Save,
    RotateCw,
    Info,
    Home,
    Loader2,
    Building2
} from 'lucide-react';
import dayjs from 'dayjs';
import useNotification from '@/hooks/useNotification';
import settingsService from '@/services/settingsService';

const Settings = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [settings, setSettings] = useState({});
    const [activeTab, setActiveTab] = useState('pricing');
    const [hasChanges, setHasChanges] = useState(false);

    // Form values state
    const [formValues, setFormValues] = useState({
        pricing: {
            basePrice: 0,
            weekendSurcharge: 0,
            holidaySurcharge: 0,
            vipSurcharge: 0,
            premiumSurcharge: 0,
            coupleSurcharge: 0,
            childDiscount: 0,
            studentDiscount: 0,
            seniorDiscount: 0
        },
        company: {
            name: '',
            slogan: '',
            email: '',
            phone: '',
            website: '',
            address: '',
            facebook: '',
            instagram: '',
            youtube: ''
        },
        booking: {
            maxSeatsPerBooking: 10,
            holdSeatDuration: 15,
            advanceBookingDays: 30,
            cancellationPolicy: {
                enableCancellation: false,
                cancellationDeadlineHours: 24,
                refundPercentage: 100
            },
            payment: {
                enabledMethods: [],
                defaultMethod: 'vnpay',
                autoRefundEnabled: false
            }
        },
        system: {
            maintenanceMode: false,
            enableRegistration: true,
            maintenanceMessage: '',
            enableGuestBooking: false,
            enableReviews: true,
            enableRatings: true,
            timezone: 'Asia/Ho_Chi_Minh',
            dateFormat: 'DD/MM/YYYY',
            currency: 'VND'
        },
        cinema: {
            defaultOpenTime: '08:00',
            defaultCloseTime: '23:00',
            cleaningTimeBetweenShows: 30,
            maxShowsPerDay: 10,
            enableOnlineSeating: true,
            enableFoodOrdering: true
        }
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await settingsService.get();
            setSettings(data);

            // Update form values with loaded data
            if (data) {
                setFormValues(prev => ({
                    ...prev,
                    ...data,
                    pricing: {
                        ...prev.pricing,
                        ...data.pricing
                    },
                    company: {
                        ...prev.company,
                        ...data.company
                    },
                    booking: {
                        ...prev.booking,
                        ...data.booking,
                        cancellationPolicy: {
                            ...prev.booking.cancellationPolicy,
                            ...data.booking?.cancellationPolicy
                        },
                        payment: {
                            ...prev.booking.payment,
                            ...data.booking?.payment
                        }
                    },
                    system: {
                        ...prev.system,
                        ...data.system
                    },
                    cinema: {
                        ...prev.cinema,
                        ...data.cinema,
                        defaultOpenTime: data.cinema?.defaultOpenTime || '08:00',
                        defaultCloseTime: data.cinema?.defaultCloseTime || '23:00'
                    }
                }));
            }
        } catch (error) {
            notification.error('Lỗi khi tải cài đặt hệ thống');
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        try {
            setSaveLoading(true);

            // Validation
            if (!formValues.company?.name?.trim()) {
                notification.error('Vui lòng nhập tên công ty!');
                return;
            }
            if (!formValues.pricing?.basePrice || formValues.pricing.basePrice <= 0) {
                notification.error('Vui lòng nhập giá vé cơ bản hợp lệ!');
                return;
            }

            // Format data before saving
            const formattedData = {
                ...formValues,
                lastUpdated: new Date().toISOString(),
                updatedBy: 'admin'
            };

            const savedSettings = await settingsService.update(formattedData);
            setSettings(savedSettings || formattedData);
            setHasChanges(false);
            notification.success('Lưu cài đặt thành công');

        } catch (error) {
            notification.error('Có lỗi xảy ra khi lưu cài đặt');
            console.error('Error saving settings:', error);
        } finally {
            setSaveLoading(false);
        }
    };

    const handleReset = () => {
        if (settings && Object.keys(settings).length > 0) {
            setFormValues(prev => ({
                ...prev,
                ...settings
            }));
        }
        setHasChanges(false);
        notification.info('Đã khôi phục về cài đặt ban đầu');
    };

    const handleFormChange = (path, value) => {
        setHasChanges(true);
        if (path.includes('.')) {
            const keys = path.split('.');
            setFormValues(prev => {
                const newValues = { ...prev };
                let current = newValues;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                current[keys[keys.length - 1]] = value;
                return newValues;
            });
        } else {
            setFormValues(prev => ({
                ...prev,
                [path]: value
            }));
        }
    };

    const pricingSection = (
        <Card className="mb-6 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                Cài đặt giá vé
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá vé cơ bản <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            value={formValues.pricing?.basePrice || 0}
                            onValueChange={(value) => handleFormChange('pricing.basePrice', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phụ thu cuối tuần
                    </label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            value={formValues.pricing?.weekendSurcharge || 0}
                            onValueChange={(value) => handleFormChange('pricing.weekendSurcharge', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phụ thu ngày lễ
                    </label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            value={formValues.pricing?.holidaySurcharge || 0}
                            onValueChange={(value) => handleFormChange('pricing.holidaySurcharge', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                </div>
            </div>

            <Separator className="my-6">
                <span className="text-sm text-muted-foreground px-2 bg-card">Phụ thu theo loại ghế</span>
            </Separator>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghế VIP</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            value={formValues.pricing?.vipSurcharge || 0}
                            onValueChange={(value) => handleFormChange('pricing.vipSurcharge', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghế Premium</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            value={formValues.pricing?.premiumSurcharge || 0}
                            onValueChange={(value) => handleFormChange('pricing.premiumSurcharge', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghế đôi</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            value={formValues.pricing?.coupleSurcharge || 0}
                            onValueChange={(value) => handleFormChange('pricing.coupleSurcharge', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                    </div>
                </div>
            </div>

            <Separator className="my-6">
                <span className="text-sm text-muted-foreground px-2 bg-card">Chiết khấu đặc biệt</span>
            </Separator>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giảm giá trẻ em</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            max={100}
                            value={formValues.pricing?.childDiscount || 0}
                            onValueChange={(value) => handleFormChange('pricing.childDiscount', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giảm giá học sinh/sinh viên</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            max={100}
                            value={formValues.pricing?.studentDiscount || 0}
                            onValueChange={(value) => handleFormChange('pricing.studentDiscount', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giảm giá người cao tuổi</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            max={100}
                            value={formValues.pricing?.seniorDiscount || 0}
                            onValueChange={(value) => handleFormChange('pricing.seniorDiscount', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                </div>
            </div>
        </Card>
    );

    const companySection = (
        <Card className="mb-6 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Thông tin công ty
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên công ty <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={formValues.company?.name || ''}
                        onChange={(e) => handleFormChange('company.name', e.target.value)}
                        placeholder="Nhập tên công ty"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slogan</label>
                    <Input
                        value={formValues.company?.slogan || ''}
                        onChange={(e) => handleFormChange('company.slogan', e.target.value)}
                        placeholder="Nhập slogan"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                        type="email"
                        value={formValues.company?.email || ''}
                        onChange={(e) => handleFormChange('company.email', e.target.value)}
                        placeholder="email@example.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <Input
                        value={formValues.company?.phone || ''}
                        onChange={(e) => handleFormChange('company.phone', e.target.value)}
                        placeholder="0123456789"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <Input
                        value={formValues.company?.website || ''}
                        onChange={(e) => handleFormChange('company.website', e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                <Textarea
                    rows={3}
                    value={formValues.company?.address || ''}
                    onChange={(e) => handleFormChange('company.address', e.target.value)}
                    placeholder="Nhập địa chỉ công ty"
                />
            </div>

            <Separator className="my-6">
                <span className="text-sm text-muted-foreground px-2 bg-card">Mạng xã hội</span>
            </Separator>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <Input
                        value={formValues.company?.facebook || ''}
                        onChange={(e) => handleFormChange('company.facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <Input
                        value={formValues.company?.instagram || ''}
                        onChange={(e) => handleFormChange('company.instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                    <Input
                        value={formValues.company?.youtube || ''}
                        onChange={(e) => handleFormChange('company.youtube', e.target.value)}
                        placeholder="https://youtube.com/..."
                    />
                </div>
            </div>
        </Card>
    );

    const bookingSection = (
        <Card className="mb-6 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                Cài đặt đặt vé
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số ghế tối đa/lần đặt</label>
                    <NumberStepper
                        min={1}
                        max={20}
                        value={formValues.booking?.maxSeatsPerBooking || 10}
                        onValueChange={(value) => handleFormChange('booking.maxSeatsPerBooking', value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian giữ chỗ (phút)</label>
                    <NumberStepper
                        min={5}
                        max={60}
                        value={formValues.booking?.holdSeatDuration || 15}
                        onValueChange={(value) => handleFormChange('booking.holdSeatDuration', value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đặt vé trước (ngày)</label>
                    <NumberStepper
                        min={1}
                        max={90}
                        value={formValues.booking?.advanceBookingDays || 30}
                        onValueChange={(value) => handleFormChange('booking.advanceBookingDays', value)}
                        className="w-full"
                    />
                </div>
            </div>

            <Separator className="my-6">
                <span className="text-sm text-muted-foreground px-2 bg-card">Chính sách hủy vé</span>
            </Separator>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.booking?.cancellationPolicy?.enableCancellation || false}
                        onCheckedChange={(checked) => handleFormChange('booking.cancellationPolicy.enableCancellation', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Cho phép hủy vé</label>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hạn hủy (giờ trước chiếu)</label>
                    <NumberStepper
                        min={1}
                        max={24}
                        value={formValues.booking?.cancellationPolicy?.cancellationDeadlineHours || 24}
                        onValueChange={(value) => handleFormChange('booking.cancellationPolicy.cancellationDeadlineHours', value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">% hoàn tiền</label>
                    <div className="relative">
                        <NumberStepper
                            min={0}
                            max={100}
                            value={formValues.booking?.cancellationPolicy?.refundPercentage || 100}
                            onValueChange={(value) => handleFormChange('booking.cancellationPolicy.refundPercentage', value)}
                            className="w-full pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                </div>
            </div>

            <Separator className="my-6">
                <span className="text-sm text-muted-foreground px-2 bg-card">Phương thức thanh toán</span>
            </Separator>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức được kích hoạt</label>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={formValues.booking?.payment?.enabledMethods?.includes('momo') || false}
                            onCheckedChange={(checked) => {
                                const methods = formValues.booking?.payment?.enabledMethods || [];
                                if (checked) {
                                    handleFormChange('booking.payment.enabledMethods', [...methods, 'momo']);
                                } else {
                                    handleFormChange('booking.payment.enabledMethods', methods.filter(m => m !== 'momo'));
                                }
                            }}
                        />
                        <label className="text-sm text-gray-700">MoMo</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={formValues.booking?.payment?.enabledMethods?.includes('vnpay') || false}
                            onCheckedChange={(checked) => {
                                const methods = formValues.booking?.payment?.enabledMethods || [];
                                if (checked) {
                                    handleFormChange('booking.payment.enabledMethods', [...methods, 'vnpay']);
                                } else {
                                    handleFormChange('booking.payment.enabledMethods', methods.filter(m => m !== 'vnpay'));
                                }
                            }}
                        />
                        <label className="text-sm text-gray-700">VNPay</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={formValues.booking?.payment?.enabledMethods?.includes('banking') || false}
                            onCheckedChange={(checked) => {
                                const methods = formValues.booking?.payment?.enabledMethods || [];
                                if (checked) {
                                    handleFormChange('booking.payment.enabledMethods', [...methods, 'banking']);
                                } else {
                                    handleFormChange('booking.payment.enabledMethods', methods.filter(m => m !== 'banking'));
                                }
                            }}
                        />
                        <label className="text-sm text-gray-700">Chuyển khoản</label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={formValues.booking?.payment?.enabledMethods?.includes('cash') || false}
                            onCheckedChange={(checked) => {
                                const methods = formValues.booking?.payment?.enabledMethods || [];
                                if (checked) {
                                    handleFormChange('booking.payment.enabledMethods', [...methods, 'cash']);
                                } else {
                                    handleFormChange('booking.payment.enabledMethods', methods.filter(m => m !== 'cash'));
                                }
                            }}
                        />
                        <label className="text-sm text-gray-700">Tiền mặt</label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức mặc định</label>
                    <Select
                        value={formValues.booking?.payment?.defaultMethod || 'vnpay'}
                        onValueChange={(value) => handleFormChange('booking.payment.defaultMethod', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn phương thức" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="momo">MoMo</SelectItem>
                            <SelectItem value="vnpay">VNPay</SelectItem>
                            <SelectItem value="banking">Chuyển khoản</SelectItem>
                            <SelectItem value="cash">Tiền mặt</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.booking?.payment?.autoRefundEnabled || false}
                        onCheckedChange={(checked) => handleFormChange('booking.payment.autoRefundEnabled', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Tự động hoàn tiền</label>
                </div>
            </div>
        </Card>
    );

    const systemSection = (
        <Card className="mb-6 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-indigo-600" />
                Cài đặt hệ thống
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.system?.maintenanceMode || false}
                        onCheckedChange={(checked) => handleFormChange('system.maintenanceMode', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Chế độ bảo trì</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.system?.enableRegistration !== false}
                        onCheckedChange={(checked) => handleFormChange('system.enableRegistration', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Đăng ký tài khoản mới</label>
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thông báo bảo trì</label>
                <Textarea
                    rows={3}
                    value={formValues.system?.maintenanceMessage || ''}
                    onChange={(e) => handleFormChange('system.maintenanceMessage', e.target.value)}
                    placeholder="Nhập thông báo bảo trì"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.system?.enableGuestBooking || false}
                        onCheckedChange={(checked) => handleFormChange('system.enableGuestBooking', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Đặt vé không cần đăng ký</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.system?.enableReviews !== false}
                        onCheckedChange={(checked) => handleFormChange('system.enableReviews', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Đánh giá phim</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.system?.enableRatings !== false}
                        onCheckedChange={(checked) => handleFormChange('system.enableRatings', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Xếp hạng phim</label>
                </div>
            </div>

            <Separator className="my-6">
                <span className="text-sm text-muted-foreground px-2 bg-card">Cài đặt định dạng</span>
            </Separator>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
                    <Select
                        value={formValues.system?.timezone || 'Asia/Ho_Chi_Minh'}
                        onValueChange={(value) => handleFormChange('system.timezone', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn múi giờ" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                            <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                            <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng ngày</label>
                    <Select
                        value={formValues.system?.dateFormat || 'DD/MM/YYYY'}
                        onValueChange={(value) => handleFormChange('system.dateFormat', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn định dạng" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiền tệ</label>
                    <Select
                        value={formValues.system?.currency || 'VND'}
                        onValueChange={(value) => handleFormChange('system.currency', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn tiền tệ" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                            <SelectItem value="VND">VND (Việt Nam Đồng)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </Card>
    );

    const cinemaSection = (
        <Card className="mb-6 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-600" />
                Cài đặt rạp chiếu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ mở cửa mặc định</label>
                    <Input
                        type="time"
                        value={formValues.cinema?.defaultOpenTime || '08:00'}
                        onChange={(e) => handleFormChange('cinema.defaultOpenTime', e.target.value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giờ đóng cửa mặc định</label>
                    <Input
                        type="time"
                        value={formValues.cinema?.defaultCloseTime || '23:00'}
                        onChange={(e) => handleFormChange('cinema.defaultCloseTime', e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian dọn dẹp (phút)</label>
                    <NumberStepper
                        min={15}
                        max={60}
                        value={formValues.cinema?.cleaningTimeBetweenShows || 30}
                        onValueChange={(value) => handleFormChange('cinema.cleaningTimeBetweenShows', value)}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số suất chiếu tối đa/ngày</label>
                    <NumberStepper
                        min={4}
                        max={20}
                        value={formValues.cinema?.maxShowsPerDay || 10}
                        onValueChange={(value) => handleFormChange('cinema.maxShowsPerDay', value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.cinema?.enableOnlineSeating !== false}
                        onCheckedChange={(checked) => handleFormChange('cinema.enableOnlineSeating', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Chọn chỗ ngồi online</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={formValues.cinema?.enableFoodOrdering !== false}
                        onCheckedChange={(checked) => handleFormChange('cinema.enableFoodOrdering', checked)}
                    />
                    <label className="text-sm font-medium text-gray-700">Đặt đồ ăn online</label>
                </div>
            </div>
        </Card>
    );

    const tabItems = [
        {
            key: 'pricing',
            label: (
                <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Giá vé
                </span>
            ),
            children: pricingSection
        },
        {
            key: 'company',
            label: (
                <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Công ty
                </span>
            ),
            children: companySection
        },
        {
            key: 'booking',
            label: (
                <span className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Đặt vé
                </span>
            ),
            children: bookingSection
        },
        {
            key: 'system',
            label: (
                <span className="flex items-center gap-2">
                    <SettingsIcon className="h-4 w-4" />
                    Hệ thống
                </span>
            ),
            children: systemSection
        },
        {
            key: 'cinema',
            label: (
                <span className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Rạp chiếu
                </span>
            ),
            children: cinemaSection
        }
    ];

    if (loading) {
        return (
            <div className="p-6 bg-background min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

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
                        title: 'Cài đặt',
                        icon: <SettingsIcon className="h-4 w-4" />
                    }
                ]}
            />

            <div className="flex justify-between items-center mb-6 p-4 bg-card rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <SettingsIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    Cài đặt hệ thống
                </h2>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <Alert className="mr-2">
                            <Info className="h-4 w-4" />
                            <span>Có thay đổi chưa lưu</span>
                        </Alert>
                    )}
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges}
                    >
                        <RotateCw className="h-4 w-4 mr-2" />
                        Khôi phục
                    </Button>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={handleSave}
                        disabled={!hasChanges || saveLoading}
                    >
                        {saveLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Lưu cài đặt
                    </Button>
                </div>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                items={tabItems}
                className="bg-card rounded-lg shadow-md overflow-hidden p-4"
            />

            <div className="text-center p-4 bg-card rounded-lg shadow-md mt-6">
                <p className="text-sm text-muted-foreground">
                    Cập nhật lần cuối: {settings.lastUpdated ? dayjs(settings.lastUpdated).format('DD/MM/YYYY HH:mm') : 'Chưa có'}
                    {settings.updatedBy && ` bởi ${settings.updatedBy}`}
                </p>
            </div>
        </div>
    );
};

export default Settings;
