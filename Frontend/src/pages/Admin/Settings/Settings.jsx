import { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Info,
  Loader2,
  MonitorCog,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  ShoppingCart,
  Ticket,
} from 'lucide-react';
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
  company: {
    name: 'HotCinema',
    slogan: '',
    email: '',
    phone: '',
    website: '',
    address: '',
  },
  pricingPreview: {
    basePrice: 0,
    weekendSurcharge: 0,
    vipSurcharge: 0,
  },
  bookingPreview: {
    maxSeatsPerBooking: 10,
    holdSeatDurationMinutes: 15,
    advanceBookingDays: 30,
    defaultPaymentMethod: 'VNPAY',
  },
  display: {
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    currency: 'VND',
    defaultOpenTime: '08:00',
    defaultCloseTime: '23:00',
  },
  featurePreview: {
    maintenanceBanner: false,
    maintenanceMessage: '',
    showReviews: true,
    showFoodOrdering: true,
  },
};

const deepMerge = (base, incoming) => {
  if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) return { ...base };
  return Object.entries(base).reduce((result, [key, value]) => {
    const next = incoming[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(value, next);
    } else {
      result[key] = next ?? value;
    }
    return result;
  }, {});
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

const Field = ({ label, hint, children }) => (
  <label className="block space-y-2 text-sm font-medium">
    <span>{label}</span>
    {children}
    {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
  </label>
);

const ToggleRow = ({ label, description, checked, onCheckedChange }) => (
  <label className="flex items-start gap-3 rounded-md border p-3 text-sm">
    <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} className="mt-0.5" />
    <span>
      <span className="block font-medium">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
    </span>
  </label>
);

const Section = ({ title, description, icon: Icon, children }) => (
  <Card>
    <CardHeader>
      <div className="flex items-start gap-3">
        <div className="rounded-md border bg-muted/40 p-2"><Icon className="h-4 w-4 text-muted-foreground" /></div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-5">{children}</CardContent>
  </Card>
);

const Settings = () => {
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const [savedSettings, setSavedSettings] = useState(DEFAULT_SETTINGS);
  const [formValues, setFormValues] = useState(DEFAULT_SETTINGS);
  const [metadata, setMetadata] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await settingsService.get();
      const merged = deepMerge(DEFAULT_SETTINGS, stored || {});
      setSavedSettings(merged);
      setFormValues(merged);
      setMetadata(stored?._localMetadata || null);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading local admin settings:', error);
      setSavedSettings(DEFAULT_SETTINGS);
      setFormValues(DEFAULT_SETTINGS);
      notification.error('Không thể đọc cấu hình FE cục bộ');
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const update = (path, value) => {
    setFormValues((current) => setAtPath(current, path, value));
    setHasChanges(true);
  };

  const validate = () => {
    if (!formValues.company.name.trim()) return 'Tên thương hiệu không được để trống';
    if (Number(formValues.pricingPreview.basePrice) < 0) return 'Giá tham chiếu không được âm';
    if (Number(formValues.bookingPreview.maxSeatsPerBooking) < 1) return 'Số ghế tối đa phải lớn hơn 0';
    if (Number(formValues.bookingPreview.holdSeatDurationMinutes) < 1) return 'Thời gian giữ ghế phải lớn hơn 0';
    if (formValues.display.defaultOpenTime === formValues.display.defaultCloseTime) return 'Giờ mở và đóng cửa không thể giống nhau';
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const saved = await settingsService.update(formValues);
      const merged = deepMerge(DEFAULT_SETTINGS, saved);
      setSavedSettings(merged);
      setFormValues(merged);
      setMetadata(saved?._localMetadata || null);
      setHasChanges(false);
      notification.success('Đã lưu cấu hình FE trên trình duyệt này');
    } catch (error) {
      console.error('Error saving local admin settings:', error);
      notification.error(error?.message || 'Không thể lưu cấu hình FE');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormValues(savedSettings);
    setHasChanges(false);
    notification.info('Đã bỏ các thay đổi chưa lưu', 2500, true);
  };

  const handleResetStorage = async () => {
    if (!window.confirm('Xóa toàn bộ cấu hình FE cục bộ trên trình duyệt này?')) return;
    await settingsService.reset();
    setSavedSettings(DEFAULT_SETTINGS);
    setFormValues(DEFAULT_SETTINGS);
    setMetadata(null);
    setHasChanges(false);
    notification.success('Đã xóa cấu hình FE cục bộ');
  };

  if (loading) {
    return <div className="flex min-h-[45vh] items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang đọc cấu hình FE...</div>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cấu hình FE cục bộ"
        description="Cấu hình tham chiếu cho giao diện admin trên trình duyệt hiện tại; không phải server-side policy."
        breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Cấu hình FE' }]}
        actions={(
          <>
            <Button variant="outline" onClick={handleDiscard} disabled={!hasChanges || saving}><RotateCcw className="h-4 w-4" />Bỏ thay đổi</Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Lưu cục bộ</Button>
          </>
        )}
      />

      <Alert
        type="warning"
        showIcon
        message="Backend hiện chưa có SettingsController"
        description="Các giá trị ở trang này chỉ được lưu vào localStorage. Giá thật vẫn lấy từ Showtime/SeatType, checkout/payment/refund vẫn do backend quyết định, và maintenance/authorization không được FE tự thực thi như policy server."
      />

      {hasChanges && <Alert type="info" showIcon message="Có thay đổi chưa lưu" description="Các chỉnh sửa chỉ ảnh hưởng trình duyệt này sau khi bấm Lưu cục bộ." />}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 md:grid-cols-5">
          <TabsTrigger value="company"><Building2 className="mr-2 h-4 w-4" />Thương hiệu</TabsTrigger>
          <TabsTrigger value="pricing"><Ticket className="mr-2 h-4 w-4" />Giá tham chiếu</TabsTrigger>
          <TabsTrigger value="booking"><ShoppingCart className="mr-2 h-4 w-4" />Booking UI</TabsTrigger>
          <TabsTrigger value="display"><MonitorCog className="mr-2 h-4 w-4" />Hiển thị</TabsTrigger>
          <TabsTrigger value="features"><SettingsIcon className="mr-2 h-4 w-4" />Prototype</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Section title="Thông tin thương hiệu" description="Dữ liệu tham chiếu cho UI/prototype, không ghi vào backend." icon={Building2}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên thương hiệu"><Input value={formValues.company.name} onChange={(event) => update('company.name', event.target.value)} /></Field>
              <Field label="Slogan"><Input value={formValues.company.slogan} onChange={(event) => update('company.slogan', event.target.value)} /></Field>
              <Field label="Email"><Input type="email" value={formValues.company.email} onChange={(event) => update('company.email', event.target.value)} /></Field>
              <Field label="Điện thoại"><Input value={formValues.company.phone} onChange={(event) => update('company.phone', event.target.value)} /></Field>
              <Field label="Website"><Input value={formValues.company.website} onChange={(event) => update('company.website', event.target.value)} /></Field>
            </div>
            <Field label="Địa chỉ"><Textarea rows={3} value={formValues.company.address} onChange={(event) => update('company.address', event.target.value)} /></Field>
          </Section>
        </TabsContent>

        <TabsContent value="pricing">
          <Section title="Giá tham chiếu UI" description="Không thay thế Showtime.basePrice hoặc SeatType.priceModifier từ backend." icon={Ticket}>
            <Alert type="info" showIcon message="Chỉ dùng cho prototype" description="Luồng booking thật phải dùng giá server trả về; FE không được tính tổng tiền authoritative từ các giá trị này." />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Giá vé mặc định"><NumberStepper min={0} value={formValues.pricingPreview.basePrice} onValueChange={(value) => update('pricingPreview.basePrice', value ?? 0)} /></Field>
              <Field label="Phụ thu cuối tuần"><NumberStepper min={0} value={formValues.pricingPreview.weekendSurcharge} onValueChange={(value) => update('pricingPreview.weekendSurcharge', value ?? 0)} /></Field>
              <Field label="Phụ thu VIP"><NumberStepper min={0} value={formValues.pricingPreview.vipSurcharge} onValueChange={(value) => update('pricingPreview.vipSurcharge', value ?? 0)} /></Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="booking">
          <Section title="Booking UI defaults" description="Giới hạn hiển thị/UX tham chiếu; backend vẫn phải enforce seat hold và checkout." icon={ShoppingCart}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Ghế tối đa / booking"><NumberStepper min={1} max={20} value={formValues.bookingPreview.maxSeatsPerBooking} onValueChange={(value) => update('bookingPreview.maxSeatsPerBooking', value ?? 1)} /></Field>
              <Field label="Giữ ghế (phút)"><NumberStepper min={1} max={60} value={formValues.bookingPreview.holdSeatDurationMinutes} onValueChange={(value) => update('bookingPreview.holdSeatDurationMinutes', value ?? 1)} /></Field>
              <Field label="Đặt trước (ngày)"><NumberStepper min={1} max={365} value={formValues.bookingPreview.advanceBookingDays} onValueChange={(value) => update('bookingPreview.advanceBookingDays', value ?? 1)} /></Field>
            </div>
            <Field label="Phương thức thanh toán mặc định"><Select value={formValues.bookingPreview.defaultPaymentMethod} onValueChange={(value) => update('bookingPreview.defaultPaymentMethod', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VNPAY">VNPay</SelectItem><SelectItem value="MOMO">MoMo</SelectItem><SelectItem value="ZALOPAY">ZaloPay</SelectItem><SelectItem value="STRIPE">Stripe</SelectItem><SelectItem value="CASH">Tiền mặt</SelectItem></SelectContent></Select></Field>
          </Section>
        </TabsContent>

        <TabsContent value="display">
          <Section title="Hiển thị & locale" description="Cấu hình trình bày cục bộ của admin UI." icon={MonitorCog}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Timezone"><Select value={formValues.display.timezone} onValueChange={(value) => update('display.timezone', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem><SelectItem value="UTC">UTC</SelectItem></SelectContent></Select></Field>
              <Field label="Định dạng ngày"><Select value={formValues.display.dateFormat} onValueChange={(value) => update('display.dateFormat', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem><SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem></SelectContent></Select></Field>
              <Field label="Tiền tệ"><Select value={formValues.display.currency} onValueChange={(value) => update('display.currency', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="VND">VND</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Giờ mở cửa tham chiếu"><Input type="time" value={formValues.display.defaultOpenTime} onChange={(event) => update('display.defaultOpenTime', event.target.value)} /></Field>
              <Field label="Giờ đóng cửa tham chiếu"><Input type="time" value={formValues.display.defaultCloseTime} onChange={(event) => update('display.defaultCloseTime', event.target.value)} /></Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="features">
          <Section title="Prototype feature toggles" description="Không phải feature flags do backend enforce." icon={SettingsIcon}>
            <ToggleRow label="Banner bảo trì (preview)" description="Chỉ lưu trạng thái preview; không chặn API hoặc đăng nhập." checked={formValues.featurePreview.maintenanceBanner} onCheckedChange={(value) => update('featurePreview.maintenanceBanner', value)} />
            {formValues.featurePreview.maintenanceBanner && <Field label="Thông báo bảo trì"><Textarea rows={3} value={formValues.featurePreview.maintenanceMessage} onChange={(event) => update('featurePreview.maintenanceMessage', event.target.value)} /></Field>}
            <ToggleRow label="Hiển thị review trong prototype" description="Real backend hiện chưa có ReviewController; toggle này không tạo capability backend." checked={formValues.featurePreview.showReviews} onCheckedChange={(value) => update('featurePreview.showReviews', value)} />
            <ToggleRow label="Hiển thị food ordering trong prototype" description="Backend inventory tồn tại nhưng checkout vẫn cần command nghiệp vụ để thêm concession an toàn." checked={formValues.featurePreview.showFoodOrdering} onCheckedChange={(value) => update('featurePreview.showFoodOrdering', value)} />
          </Section>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0" /><span>Phạm vi lưu: <strong className="text-foreground">browser-local</strong>{metadata?.updatedAt ? ` · cập nhật ${new Date(metadata.updatedAt).toLocaleString('vi-VN')}` : ' · chưa có bản lưu'}</span></div>
          <Button type="button" variant="outline" size="sm" onClick={handleResetStorage}>Xóa cấu hình cục bộ</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
