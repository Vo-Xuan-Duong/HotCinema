import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import cinemaService from '@/services/cinemaService';
import useNotification from '@/hooks/useNotification';
import { unwrapApiData } from '@/utils/apiResponse';

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

const normalizeStatus = (value) => {
  const status = String(value || 'ACTIVE').toUpperCase();
  return ['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(status) ? status : 'ACTIVE';
};

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
      .then((response) => {
        if (!active) return;
        const cinema = unwrapApiData(response) || {};
        setForm({
          code: cinema.code || '',
          name: cinema.name || '',
          status: normalizeStatus(cinema.status),
          address: cinema.address || '',
          ward: cinema.ward || '',
          district: cinema.district || '',
          city: cinema.city || cinema.cityName || '',
          latitude: cinema.latitude ?? '',
          longitude: cinema.longitude ?? '',
          phone: cinema.phone || '',
          email: cinema.email || '',
          description: cinema.description || '',
          logoUrl: cinema.logoUrl || cinema.imageUrl || cinema.image || '',
        });
      })
      .catch((error) => {
        if (active) {
          notification.error(error?.message || 'Không thể tải thông tin rạp.');
          navigate('/admin/cinemas');
        }
      })
      .finally(() => active && setCinemaLoading(false));
    return () => { active = false; };
  }, [id, isEditMode, navigate, notification]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const required = ['code', 'name', 'address', 'ward', 'district', 'city', 'phone', 'email', 'description', 'logoUrl'];
    const missing = required.find((key) => !String(form[key] || '').trim());
    if (missing) return 'Vui lòng nhập đầy đủ các trường bắt buộc.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Email rạp không hợp lệ.';
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return 'Vĩ độ phải nằm trong khoảng -90 đến 90.';
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return 'Kinh độ phải nằm trong khoảng -180 đến 180.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) return notification.error(validationError);

    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      status: normalizeStatus(form.status),
      address: form.address.trim(),
      ward: form.ward.trim(),
      district: form.district.trim(),
      city: form.city.trim(),
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      description: form.description.trim(),
      logoUrl: form.logoUrl.trim(),
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await cinemaService.updateCinema(id, payload);
        notification.success('Cập nhật rạp thành công.');
      } else {
        await cinemaService.createCinema(payload);
        notification.success('Thêm rạp mới thành công.');
      }
      navigate('/admin/cinemas');
    } catch (error) {
      notification.error(error?.message || `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} rạp.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEditMode ? 'Chỉnh sửa rạp' : 'Thêm rạp mới'}
        description="Dữ liệu form bám theo domain Cinema của backend để có thể lưu trực tiếp, không phụ thuộc mock region/city ID."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Rạp chiếu', href: '/admin/cinemas' },
          { title: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/admin/cinemas')}><ArrowLeft className="h-4 w-4" />Quay lại</Button>}
      />

      {cinemaLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải thông tin rạp...</div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-4 w-4 text-muted-foreground" />Thông tin rạp</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Mã rạp" required><Input value={form.code} onChange={(event) => setField('code', event.target.value)} placeholder="HC-NGUYENDU" /></Field>
                <Field label="Tên rạp" required><Input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="HotCinema Nguyễn Du" /></Field>
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

              <Field label="Địa chỉ" required><Textarea rows={2} value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Số nhà, tên đường" /></Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Phường/Xã" required><Input value={form.ward} onChange={(event) => setField('ward', event.target.value)} /></Field>
                <Field label="Quận/Huyện" required><Input value={form.district} onChange={(event) => setField('district', event.target.value)} /></Field>
                <Field label="Tỉnh/Thành phố" required><Input value={form.city} onChange={(event) => setField('city', event.target.value)} /></Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Vĩ độ" required><Input type="number" step="any" min="-90" max="90" value={form.latitude} onChange={(event) => setField('latitude', event.target.value)} placeholder="10.7769" /></Field>
                <Field label="Kinh độ" required><Input type="number" step="any" min="-180" max="180" value={form.longitude} onChange={(event) => setField('longitude', event.target.value)} placeholder="106.7009" /></Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Số điện thoại" required><Input value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="028..." /></Field>
                <Field label="Email" required><Input type="email" value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="cinema@hotcinema.vn" /></Field>
              </div>

              <Field label="Mô tả" required><Textarea rows={5} value={form.description} onChange={(event) => setField('description', event.target.value)} /></Field>
              <Field label="Logo URL" required hint="URL công khai tới logo/hình đại diện của rạp">
                <div className="relative"><ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={form.logoUrl} onChange={(event) => setField('logoUrl', event.target.value)} className="pl-9" placeholder="https://..." /></div>
              </Field>

              <div className="flex justify-end gap-2 border-t pt-5">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/cinemas')}>Hủy</Button>
                <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Thêm rạp'}</Button>
              </div>
            </CardContent>
          </Card>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader><CardTitle className="text-base">Xem trước</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <img src={form.logoUrl || '/brand-placeholder.svg'} alt="Cinema preview" className="aspect-video w-full rounded-md border bg-muted object-contain p-4" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                <div>
                  <p className="font-semibold">{form.name || 'Tên rạp'}</p>
                  <p className="text-sm text-muted-foreground">{[form.address, form.district, form.city].filter(Boolean).join(', ') || 'Địa chỉ rạp'}</p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </form>
      )}
    </div>
  );
};

export default CinemaForm;
