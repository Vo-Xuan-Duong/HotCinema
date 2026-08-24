import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Image as ImageIcon, Loader2, MapPin, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import cinemaService from '@/services/cinemaService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  code: '',
  name: '',
  status: 'ACTIVE',
  address: '',
  ward: '',
  district: '',
  city: '',
  latitude: '',
  longitude: '',
  phone: '',
  email: '',
  description: '',
  logoUrl: '',
};

const Field = ({ label, required = false, hint, children }) => (
  <label className="block space-y-2 text-sm font-medium">
    <span>{label}{required && <span className="ml-1 text-destructive">*</span>}</span>
    {children}
    {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
  </label>
);

const CinemaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const notification = useNotification();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [cinemaLoading, setCinemaLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    setCinemaLoading(true);

    cinemaService.getCinemaById(id)
      .then((cinema) => {
        if (!active) return;
        setForm({
          code: cinema?.code || '',
          name: cinema?.name || '',
          status: cinema?.status || 'ACTIVE',
          address: cinema?.address || '',
          ward: cinema?.ward || '',
          district: cinema?.district || '',
          city: cinema?.city || '',
          latitude: cinema?.latitude == null ? '' : String(cinema.latitude),
          longitude: cinema?.longitude == null ? '' : String(cinema.longitude),
          phone: cinema?.phone || '',
          email: cinema?.email || '',
          description: cinema?.description || '',
          logoUrl: cinema?.logoUrl || '',
        });
      })
      .catch((error) => {
        console.error('Error loading cinema:', error);
        if (active) {
          notification.error(error?.message || 'Không thể tải thông tin rạp');
          navigate('/admin/cinemas');
        }
      })
      .finally(() => active && setCinemaLoading(false));

    return () => { active = false; };
  }, [id, isEditMode, navigate, notification]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const requiredTextFields = [
      ['code', 'mã rạp'],
      ['name', 'tên rạp'],
      ['address', 'địa chỉ'],
      ['ward', 'phường/xã'],
      ['district', 'quận/huyện'],
      ['city', 'tỉnh/thành phố'],
      ['phone', 'số điện thoại'],
      ['email', 'email'],
      ['description', 'mô tả'],
      ['logoUrl', 'URL logo/hình ảnh'],
    ];

    const missing = requiredTextFields.find(([key]) => !String(form[key] || '').trim());
    if (missing) return `Vui lòng nhập ${missing[1]}`;

    if (!/^[A-Z0-9_-]{2,50}$/i.test(form.code.trim())) {
      return 'Mã rạp chỉ nên gồm chữ, số, dấu gạch ngang hoặc gạch dưới';
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Email không hợp lệ';

    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return 'Vĩ độ phải nằm trong khoảng -90 đến 90';
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return 'Kinh độ phải nằm trong khoảng -180 đến 180';
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      address: form.address.trim(),
      ward: form.ward.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      phone: form.phone.trim(),
      email: form.email.trim(),
      description: form.description.trim(),
      logoUrl: form.logoUrl.trim(),
      status: form.status,
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await cinemaService.updateCinema(id, payload);
        notification.success('Cập nhật rạp thành công');
      } else {
        await cinemaService.createCinema(payload);
        notification.success('Thêm rạp mới thành công');
      }
      navigate('/admin/cinemas');
    } catch (error) {
      console.error('Error saving cinema:', error);
      notification.error(error?.response?.data?.message || error?.message || `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} rạp`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEditMode ? 'Chỉnh sửa rạp' : 'Thêm rạp mới'}
        description={isEditMode ? 'Cập nhật thông tin vận hành và liên hệ của rạp.' : 'Thêm một rạp chiếu phim mới vào HotCinema.'}
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Rạp chiếu', href: '/admin/cinemas' },
          { title: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/admin/cinemas')}><ArrowLeft className="h-4 w-4" />Quay lại</Button>}
      />

      {cinemaLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />Đang tải thông tin rạp...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-4 w-4 text-muted-foreground" />Thông tin rạp</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Mã rạp" required hint="Ví dụ: HC-ND-01">
                    <Input value={form.code} onChange={(event) => setField('code', event.target.value.toUpperCase())} maxLength={50} placeholder="HC-ND-01" />
                  </Field>
                  <Field label="Tên rạp" required>
                    <Input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="HotCinema Nguyễn Du" />
                  </Field>
                </div>

                <Field label="Trạng thái" required>
                  <Select value={form.status} onValueChange={(value) => setField('status', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                      <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Mô tả" required hint="Tiện ích, vị trí hoặc thông tin bổ sung về rạp">
                  <Textarea rows={5} value={form.description} onChange={(event) => setField('description', event.target.value)} />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-4 w-4 text-muted-foreground" />Địa chỉ và tọa độ</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <Field label="Địa chỉ" required><Textarea rows={2} value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Số nhà, tên đường" /></Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Phường/Xã" required><Input value={form.ward} onChange={(event) => setField('ward', event.target.value)} /></Field>
                  <Field label="Quận/Huyện" required><Input value={form.district} onChange={(event) => setField('district', event.target.value)} /></Field>
                  <Field label="Tỉnh/Thành phố" required><Input value={form.city} onChange={(event) => setField('city', event.target.value)} placeholder="TP. Hồ Chí Minh" /></Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Vĩ độ" required><Input type="number" step="any" min="-90" max="90" value={form.latitude} onChange={(event) => setField('latitude', event.target.value)} placeholder="10.7769" /></Field>
                  <Field label="Kinh độ" required><Input type="number" step="any" min="-180" max="180" value={form.longitude} onChange={(event) => setField('longitude', event.target.value)} placeholder="106.7009" /></Field>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Liên hệ</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Field label="Số điện thoại" required><Input value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="028..." /></Field>
                <Field label="Email" required><Input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="cinema@hotcinema.vn" /></Field>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/cinemas')}>Hủy</Button>
              <Button type="submit" disabled={saving || cinemaLoading}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Thêm rạp'}
              </Button>
            </div>
          </div>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader><CardTitle className="text-base">Logo / hình ảnh rạp</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="URL hình ảnh" required hint="Backend lưu tại trường logoUrl">
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.logoUrl} onChange={(event) => setField('logoUrl', event.target.value)} className="pl-9" placeholder="https://..." />
                  </div>
                </Field>
                <img src={form.logoUrl || '/brand-placeholder.svg'} alt="Cinema preview" className="aspect-video w-full rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
              </CardContent>
            </Card>
          </aside>
        </form>
      )}
    </div>
  );
};

export default CinemaForm;
