import { useCallback, useEffect, useState } from 'react';
import { Building2, DollarSign, Info, Loader2, RotateCcw, Save, Settings as SettingsIcon, ShoppingCart, Video } from 'lucide-react';
import dayjs from 'dayjs';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import settingsService from '@/services/settingsService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_SETTINGS = {
  pricing: {
    basePrice: 0,
    weekendSurcharge: 0,
    holidaySurcharge: 0,
    vipSurcharge: 0,
    premiumSurcharge: 0,
    coupleSurcharge: 0,
    childDiscount: 0,
    studentDiscount: 0,
    seniorDiscount: 0,
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
    youtube: '',
  },
  booking: {
    maxSeatsPerBooking: 10,
    holdSeatDuration: 15,
    advanceBookingDays: 30,
    cancellationPolicy: {
      enableCancellation: false,
      cancellationDeadlineHours: 24,
      refundPercentage: 100,
    },
    payment: {
      enabledMethods: [],
      defaultMethod: 'vnpay',
      autoRefundEnabled: false,
    },
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
    currency: 'VND',
  },
  cinema: {
    defaultOpenTime: '08:00',
    defaultCloseTime: '23:00',
    cleaningTimeBetweenShows: 30,
    maxShowsPerDay: 10,
    enableOnlineSeating: true,
    enableFoodOrdering: true,
  },
};

const deepMerge = (base, incoming) => {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return base;
  return Object.entries(incoming).reduce((result, [key, value]) => {
    if (
      value
      && typeof value === 'object'
      && !Array.isArray(value)
      && result[key]
      && typeof result[key] === 'object'
      && !Array.isArray(result[key])
    ) {
      return { ...result, [key]: deepMerge(result[key], value) };
    }
    return { ...result, [key]: value };
  }, { ...base });
};

const setAtPath = (source, path, value) => {
  const keys = path.split('.');
  const next = { ...source };
  let cursor = next;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      cursor[key] = value;
      return;
    }
    cursor[key] = { ...(cursor[key] || {}) };
    cursor = cursor[key];
  });

  return next;
};

const Field = ({ label, required = false, hint, children }) => (
  <label className="block space-y-2 text-sm font-medium">
    <span>
      {label}
      {required && <span className="ml-1 text-destructive">*</span>}
    </span>
    {children}
    {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
  </label>
);

const ToggleRow = ({ label, description, checked, onCheckedChange }) => (
  <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
    <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} className="mt-0.5" />
    <span>
      <span className="block font-medium text-foreground">{label}</span>
      {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
    </span>
  </label>
);

const SettingSection = ({ title, description, icon: Icon, children }) => (
  <Card>
    <CardHeader>
      <div className="flex items-start gap-3">
        <div className="rounded-md border bg-muted/40 p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription className="mt-1">{description}</CardDescription>}
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-6">{children}</CardContent>
  </Card>
);

const paymentMethods = [
  ['momo', 'MoMo'],
  ['vnpay', 'VNPay'],
  ['banking', 'Chuyển khoản'],
  ['cash', 'Tiền mặt'],
];

const Settings = () => {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState({});
  const [formValues, setFormValues] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('pricing');
  const [hasChanges, setHasChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.get();
      const merged = deepMerge(DEFAULT_SETTINGS, data || {});
      setSettings(data || {});
      setFormValues(merged);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      notification.error('Không thể tải cài đặt hệ thống');
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const update = (path, value) => {
    setFormValues((current) => setAtPath(current, path, value));
    setHasChanges(true);
  };

  const togglePaymentMethod = (method, enabled) => {
    const currentMethods = formValues.booking.payment.enabledMethods || [];
    const nextMethods = enabled
      ? [...new Set([...currentMethods, method])]
      : currentMethods.filter((item) => item !== method);
    update('booking.payment.enabledMethods', nextMethods);

    if (!enabled && formValues.booking.payment.defaultMethod === method && nextMethods.length > 0) {
      update('booking.payment.defaultMethod', nextMethods[0]);
    }
  };

  const handleReset = () => {
    setFormValues(deepMerge(DEFAULT_SETTINGS, settings || {}));
    setHasChanges(false);
    notification.info('Đã khôi phục các thay đổi chưa lưu', 2500, true);
  };

  const validate = () => {
    if (!formValues.company.name.trim()) return 'Vui lòng nhập tên công ty';
    if (Number(formValues.pricing.basePrice) <= 0) return 'Giá vé cơ bản phải lớn hơn 0';
    const methods = formValues.booking.payment.enabledMethods || [];
    if (methods.length > 0 && !methods.includes(formValues.booking.payment.defaultMethod)) {
      return 'Phương thức thanh toán mặc định phải nằm trong danh sách đang kích hoạt';
    }
    if (formValues.cinema.defaultOpenTime === formValues.cinema.defaultCloseTime) {
      return 'Giờ mở cửa và đóng cửa không thể giống nhau';
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    try {
      setSaveLoading(true);
      const saved = await settingsService.update(formValues);
      const merged = deepMerge(DEFAULT_SETTINGS, saved || formValues);
      setSettings(saved || formValues);
      setFormValues(merged);
      setHasChanges(false);
      notification.success('Lưu cài đặt thành công');
    } catch (error) {
      console.error('Error saving settings:', error);
      notification.error(error?.response?.data?.message || 'Không thể lưu cài đặt hệ thống');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Đang tải cài đặt...
      </div>
    );
  }

  const lastUpdated = settings.lastUpdated || settings.updatedAt;
  const updatedBy = settings.updatedBy;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cài đặt hệ thống"
        description="Cấu hình giá vé, thông tin công ty, chính sách đặt vé và hành vi vận hành của HotCinema."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Cài đặt' },
        ]}
        actions={(
          <>
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges || saveLoading}>
              <RotateCcw className="h-4 w-4" />
              Khôi phục
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saveLoading}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu cài đặt
            </Button>
          </>
        )}
      />

      {hasChanges && (
        <Alert type="info" showIcon message="Có thay đổi chưa lưu" description="Khôi phục để bỏ các chỉnh sửa hoặc lưu để áp dụng cấu hình mới." />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-5">
          <TabsTrigger value="pricing"><DollarSign className="mr-2 h-4 w-4" />Giá vé</TabsTrigger>
          <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" />Công ty</TabsTrigger>
          <TabsTrigger value="booking"><ShoppingCart className="mr-2 h-4 w-4" />Đặt vé</TabsTrigger>
          <TabsTrigger value="system"><SettingsIcon className="mr-2 h-4 w-4" />Hệ thống</TabsTrigger>
          <TabsTrigger value="cinema"><Video className="mr-2 h-4 w-4" />Rạp chiếu</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing">
          <SettingSection title="Cài đặt giá vé" description="Giá cơ bản, phụ thu theo thời điểm/loại ghế và tỷ lệ giảm đặc biệt." icon={DollarSign}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Giá vé cơ bản" required><NumberStepper min={0} value={formValues.pricing.basePrice} onValueChange={(value) => update('pricing.basePrice', value ?? 0)} /></Field>
              <Field label="Phụ thu cuối tuần"><NumberStepper min={0} value={formValues.pricing.weekendSurcharge} onValueChange={(value) => update('pricing.weekendSurcharge', value ?? 0)} /></Field>
              <Field label="Phụ thu ngày lễ"><NumberStepper min={0} value={formValues.pricing.holidaySurcharge} onValueChange={(value) => update('pricing.holidaySurcharge', value ?? 0)} /></Field>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Phụ thu theo loại ghế</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Ghế VIP"><NumberStepper min={0} value={formValues.pricing.vipSurcharge} onValueChange={(value) => update('pricing.vipSurcharge', value ?? 0)} /></Field>
                <Field label="Ghế Premium"><NumberStepper min={0} value={formValues.pricing.premiumSurcharge} onValueChange={(value) => update('pricing.premiumSurcharge', value ?? 0)} /></Field>
                <Field label="Ghế đôi"><NumberStepper min={0} value={formValues.pricing.coupleSurcharge} onValueChange={(value) => update('pricing.coupleSurcharge', value ?? 0)} /></Field>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Chiết khấu đặc biệt (%)</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Trẻ em"><NumberStepper min={0} max={100} value={formValues.pricing.childDiscount} onValueChange={(value) => update('pricing.childDiscount', value ?? 0)} /></Field>
                <Field label="Học sinh / sinh viên"><NumberStepper min={0} max={100} value={formValues.pricing.studentDiscount} onValueChange={(value) => update('pricing.studentDiscount', value ?? 0)} /></Field>
                <Field label="Người cao tuổi"><NumberStepper min={0} max={100} value={formValues.pricing.seniorDiscount} onValueChange={(value) => update('pricing.seniorDiscount', value ?? 0)} /></Field>
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        <TabsContent value="company">
          <SettingSection title="Thông tin công ty" description="Thông tin thương hiệu và kênh liên hệ hiển thị cho khách hàng." icon={Building2}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên công ty" required><Input value={formValues.company.name} onChange={(event) => update('company.name', event.target.value)} placeholder="HotCinema" /></Field>
              <Field label="Slogan"><Input value={formValues.company.slogan} onChange={(event) => update('company.slogan', event.target.value)} placeholder="Trải nghiệm điện ảnh của bạn" /></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Email"><Input type="email" value={formValues.company.email} onChange={(event) => update('company.email', event.target.value)} placeholder="contact@hotcinema.vn" /></Field>
              <Field label="Số điện thoại"><Input value={formValues.company.phone} onChange={(event) => update('company.phone', event.target.value)} placeholder="0901234567" /></Field>
              <Field label="Website"><Input value={formValues.company.website} onChange={(event) => update('company.website', event.target.value)} placeholder="https://hotcinema.vn" /></Field>
            </div>
            <Field label="Địa chỉ"><Textarea rows={3} value={formValues.company.address} onChange={(event) => update('company.address', event.target.value)} placeholder="Địa chỉ công ty" /></Field>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Mạng xã hội</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Facebook"><Input value={formValues.company.facebook} onChange={(event) => update('company.facebook', event.target.value)} placeholder="https://facebook.com/..." /></Field>
                <Field label="Instagram"><Input value={formValues.company.instagram} onChange={(event) => update('company.instagram', event.target.value)} placeholder="https://instagram.com/..." /></Field>
                <Field label="YouTube"><Input value={formValues.company.youtube} onChange={(event) => update('company.youtube', event.target.value)} placeholder="https://youtube.com/..." /></Field>
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        <TabsContent value="booking">
          <div className="space-y-5">
            <SettingSection title="Cấu hình đặt vé" description="Giới hạn ghế, thời gian giữ chỗ và khoảng thời gian đặt trước." icon={ShoppingCart}>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Số ghế tối đa/lần"><NumberStepper min={1} max={20} value={formValues.booking.maxSeatsPerBooking} onValueChange={(value) => update('booking.maxSeatsPerBooking', value ?? 1)} /></Field>
                <Field label="Thời gian giữ chỗ (phút)"><NumberStepper min={5} max={60} value={formValues.booking.holdSeatDuration} onValueChange={(value) => update('booking.holdSeatDuration', value ?? 5)} /></Field>
                <Field label="Đặt trước tối đa (ngày)"><NumberStepper min={1} max={90} value={formValues.booking.advanceBookingDays} onValueChange={(value) => update('booking.advanceBookingDays', value ?? 1)} /></Field>
              </div>
            </SettingSection>

            <SettingSection title="Chính sách hủy vé" description="Điều kiện cho phép khách hủy và tỷ lệ hoàn tiền." icon={Info}>
              <ToggleRow label="Cho phép hủy vé" checked={formValues.booking.cancellationPolicy.enableCancellation} onCheckedChange={(checked) => update('booking.cancellationPolicy.enableCancellation', checked)} />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Hạn hủy (giờ trước chiếu)"><NumberStepper min={1} max={72} value={formValues.booking.cancellationPolicy.cancellationDeadlineHours} onValueChange={(value) => update('booking.cancellationPolicy.cancellationDeadlineHours', value ?? 1)} /></Field>
                <Field label="Tỷ lệ hoàn tiền (%)"><NumberStepper min={0} max={100} value={formValues.booking.cancellationPolicy.refundPercentage} onValueChange={(value) => update('booking.cancellationPolicy.refundPercentage', value ?? 0)} /></Field>
              </div>
            </SettingSection>

            <SettingSection title="Phương thức thanh toán" description="Các phương thức cho phép và phương thức mặc định khi thanh toán." icon={DollarSign}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {paymentMethods.map(([key, label]) => (
                  <ToggleRow
                    key={key}
                    label={label}
                    checked={formValues.booking.payment.enabledMethods.includes(key)}
                    onCheckedChange={(checked) => togglePaymentMethod(key, checked)}
                  />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Phương thức mặc định">
                  <Select value={formValues.booking.payment.defaultMethod} onValueChange={(value) => update('booking.payment.defaultMethod', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{paymentMethods.map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <ToggleRow label="Tự động hoàn tiền" description="Cho phép hệ thống tự xử lý hoàn tiền khi backend hỗ trợ điều kiện tương ứng." checked={formValues.booking.payment.autoRefundEnabled} onCheckedChange={(checked) => update('booking.payment.autoRefundEnabled', checked)} />
              </div>
            </SettingSection>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <SettingSection title="Cài đặt hệ thống" description="Kiểm soát các tính năng chung và định dạng hiển thị." icon={SettingsIcon}>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <ToggleRow label="Chế độ bảo trì" checked={formValues.system.maintenanceMode} onCheckedChange={(checked) => update('system.maintenanceMode', checked)} />
              <ToggleRow label="Cho phép đăng ký" checked={formValues.system.enableRegistration} onCheckedChange={(checked) => update('system.enableRegistration', checked)} />
              <ToggleRow label="Đặt vé không cần tài khoản" checked={formValues.system.enableGuestBooking} onCheckedChange={(checked) => update('system.enableGuestBooking', checked)} />
              <ToggleRow label="Bình luận / đánh giá" checked={formValues.system.enableReviews} onCheckedChange={(checked) => update('system.enableReviews', checked)} />
              <ToggleRow label="Xếp hạng phim" checked={formValues.system.enableRatings} onCheckedChange={(checked) => update('system.enableRatings', checked)} />
            </div>

            <Field label="Thông báo bảo trì"><Textarea rows={3} value={formValues.system.maintenanceMessage} onChange={(event) => update('system.maintenanceMessage', event.target.value)} placeholder="Thông báo hiển thị khi hệ thống bảo trì" /></Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Múi giờ">
                <Select value={formValues.system.timezone} onValueChange={(value) => update('system.timezone', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                    <SelectItem value="Asia/Singapore">Singapore (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Định dạng ngày">
                <Select value={formValues.system.dateFormat} onValueChange={(value) => update('system.dateFormat', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Tiền tệ">
                <Select value={formValues.system.currency} onValueChange={(value) => update('system.currency', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </SettingSection>
        </TabsContent>

        <TabsContent value="cinema">
          <SettingSection title="Cài đặt rạp chiếu" description="Giờ hoạt động mặc định và các tính năng vận hành tại rạp." icon={Video}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Giờ mở cửa mặc định"><Input type="time" value={formValues.cinema.defaultOpenTime} onChange={(event) => update('cinema.defaultOpenTime', event.target.value)} /></Field>
              <Field label="Giờ đóng cửa mặc định"><Input type="time" value={formValues.cinema.defaultCloseTime} onChange={(event) => update('cinema.defaultCloseTime', event.target.value)} /></Field>
              <Field label="Thời gian dọn dẹp (phút)"><NumberStepper min={0} max={120} value={formValues.cinema.cleaningTimeBetweenShows} onValueChange={(value) => update('cinema.cleaningTimeBetweenShows', value ?? 0)} /></Field>
              <Field label="Số suất tối đa/ngày"><NumberStepper min={1} max={30} value={formValues.cinema.maxShowsPerDay} onValueChange={(value) => update('cinema.maxShowsPerDay', value ?? 1)} /></Field>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <ToggleRow label="Chọn ghế online" checked={formValues.cinema.enableOnlineSeating} onCheckedChange={(checked) => update('cinema.enableOnlineSeating', checked)} />
              <ToggleRow label="Đặt đồ ăn online" checked={formValues.cinema.enableFoodOrdering} onCheckedChange={(checked) => update('cinema.enableFoodOrdering', checked)} />
            </div>
          </SettingSection>
        </TabsContent>
      </Tabs>

      {(lastUpdated || updatedBy) && (
        <p className="text-center text-xs text-muted-foreground">
          {lastUpdated ? `Cập nhật lần cuối: ${dayjs(lastUpdated).format('DD/MM/YYYY HH:mm')}` : ''}
          {updatedBy ? `${lastUpdated ? ' · ' : ''}Bởi ${updatedBy}` : ''}
        </p>
      )}
    </div>
  );
};

export default Settings;
