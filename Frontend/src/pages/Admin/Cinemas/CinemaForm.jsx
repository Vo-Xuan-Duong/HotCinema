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
import regionService from '@/services/regionService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  name: '',
  status: 'active',
  cityId: '',
  address: '',
  description: '',
  image: '',
};

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;
const unwrapList = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
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
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [cinemaLoading, setCinemaLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    regionService.getRegionsAllNoPage()
      .then((response) => {
        if (active) setRegions(unwrapList(response));
      })
      .catch((error) => {
        console.error('Error loading regions:', error);
        if (active) notification.error('Không thể tải danh sách khu vực');
      })
      .finally(() => active && setRegionsLoading(false));
    return () => { active = false; };
  }, [notification]);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    setCinemaLoading(true);
    cinemaService.getCinemaById(id)
      .then((response) => {
        if (!active) return;
        const cinema = unwrapData(response) || {};
        setForm({
          name: cinema.name || '',
          status: cinema.status || 'active',
          cityId: String(cinema.cityId ?? cinema.city?.id ?? cinema.regionId ?? cinema.region?.id ?? ''),
          address: cinema.address || '',
          description: cinema.description || '',
          image: cinema.image || cinema.imageUrl || '',
        });
      })
      .catch((error) => {
        console.error('Error loading cinema:', error);
        if (active) {
          notification.error('Không thể tải thông tin rạp');
          navigate('/admin/cinemas');
        }
      })
      .finally(() => active && setCinemaLoading(false));
    return () => { active = false; };
  }, [id, isEditMode, navigate, notification]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    if (!form.name.trim()) return 'Vui lòng nhập tên rạp';
    if (!form.cityId) return 'Vui lòng chọn khu vực';
    if (!form.address.trim()) return 'Vui lòng nhập địa chỉ';
    if (!Number.isFinite(Number(form.cityId))) return 'Khu vực không hợp lệ';
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
      name: form.name.trim(),
      status: form.status,
      cityId: Number(form.cityId),
      address: form.address.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
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
      notification.error(error?.response?.data?.message || `Không thể ${isEditMode ? 'cập nhật' : 'thêm'} rạp`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEditMode ? 'Chỉnh sửa rạp' : 'Thêm rạp mới'}
        description={isEditMode ? 'Cập nhật thông tin và trạng thái hoạt động của rạp.' : 'Thêm một rạp chiếu phim mới vào HotCinema.'}
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
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-4 w-4 text-muted-foreground" />Thông tin rạp</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên rạp" required><Input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="HotCinema Nguyễn Du" /></Field>
                <Field label="Trạng thái" required>
                  <Select value={form.status} onValueChange={(value) => setField('status', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field label="Khu vực" required>
                <Select value={form.cityId || undefined} onValueChange={(value) => setField('cityId', value)} disabled={regionsLoading || regions.length === 0}>
                  <SelectTrigger><SelectValue placeholder={regionsLoading ? 'Đang tải khu vực...' : 'Chọn khu vực'} /></SelectTrigger>
                  <SelectContent>{regions.map((region) => <SelectItem key={region.id} value={String(region.id)}>{region.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>

              <Field label="Địa chỉ" required><Textarea rows={3} value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Địa chỉ chi tiết của rạp" /></Field>
              <Field label="Mô tả" hint="Tiện ích, vị trí hoặc thông tin bổ sung về rạp"><Textarea rows={5} value={form.description} onChange={(event) => setField('description', event.target.value)} /></Field>
              <Field label="URL hình ảnh" hint="Sử dụng URL ảnh công khai"><div className="relative"><ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={form.image} onChange={(event) => setField('image', event.target.value)} className="pl-9" placeholder="https://..." /></div></Field>

              <div className="flex justify-end gap-2 border-t pt-5">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/cinemas')}>Hủy</Button>
                <Button type="submit" disabled={saving || cinemaLoading}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Thêm rạp'}</Button>
              </div>
            </CardContent>
          </Card>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader><CardTitle className="text-base">Xem trước hình ảnh</CardTitle></CardHeader>
              <CardContent>
                <img src={form.image || '/brand-placeholder.svg'} alt="Cinema preview" className="aspect-video w-full rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                {!form.image && <p className="mt-3 text-center text-xs text-muted-foreground">Nhập URL hình ảnh để xem trước.</p>}
              </CardContent>
            </Card>
          </aside>
        </form>
      )}
    </div>
  );
};

export default CinemaForm;
