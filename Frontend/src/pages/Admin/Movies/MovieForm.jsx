import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Film, Image as ImageIcon, Loader2, Play, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import movieService from '@/services/movieService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  title: '', originalTitle: '', slug: '', description: '', durationMinutes: 120,
  releaseDate: '', endDate: '', ageRating: 'P', originalLanguage: '', director: '', actors: '',
  country: '', productionCompany: '', posterUrl: '', bannerUrl: '', trailerUrl: '', status: 'DRAFT',
};

const ageRatings = [
  ['P', 'P - Phổ biến mọi độ tuổi'], ['K', 'K - Dưới 13 tuổi cần người giám hộ'],
  ['T13', 'T13 - Từ 13 tuổi'], ['T16', 'T16 - Từ 16 tuổi'], ['T18', 'T18 - Từ 18 tuổi'],
];
const statuses = [
  ['DRAFT', 'Bản nháp'], ['COMING_SOON', 'Sắp chiếu'], ['NOW_SHOWING', 'Đang chiếu'],
  ['ENDED', 'Đã kết thúc'], ['HIDDEN', 'Ẩn'],
];

const slugify = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const youtubeEmbed = (url) => {
  const match = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&#/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : '';
};

const Field = ({ label, required = false, hint, children }) => (
  <label className="block space-y-2 text-sm font-medium">
    <span>{label}{required && <span className="ml-1 text-destructive">*</span>}</span>
    {children}{hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
  </label>
);

const fromMovie = (movie = {}) => ({
  title: movie.title || '', originalTitle: movie.originalTitle || '', slug: movie.slug || '',
  description: movie.description || '', durationMinutes: Number(movie.durationMinutes || 120),
  releaseDate: String(movie.releaseDate || '').slice(0, 10), endDate: String(movie.endDate || '').slice(0, 10),
  ageRating: movie.ageRating || 'P', originalLanguage: movie.originalLanguage || '',
  director: movie.director || '', actors: movie.actors || '', country: movie.country || '',
  productionCompany: movie.productionCompany || '', posterUrl: movie.posterUrl || '',
  bannerUrl: movie.bannerUrl || '', trailerUrl: movie.trailerUrl || '', status: movie.status || 'DRAFT',
});

const MovieForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const notification = useNotification();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    setLoading(true);
    movieService.getMovieById(id)
      .then((movie) => active && setForm(fromMovie(movie)))
      .catch((error) => {
        if (active) { notification.error(error?.message || 'Không thể tải thông tin phim.'); navigate('/admin/movies'); }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, isEditMode, navigate, notification]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setTitle = (value) => setForm((current) => ({ ...current, title: value, slug: current.slug || slugify(value) }));

  const validate = () => {
    const required = ['title', 'originalTitle', 'slug', 'description', 'releaseDate', 'endDate', 'originalLanguage', 'director', 'actors', 'country', 'productionCompany', 'posterUrl', 'bannerUrl', 'trailerUrl'];
    if (required.some((key) => !String(form[key] || '').trim())) return 'Vui lòng nhập đầy đủ các trường bắt buộc.';
    if (Number(form.durationMinutes) <= 0) return 'Thời lượng phim phải lớn hơn 0.';
    if (form.releaseDate && form.endDate && form.endDate < form.releaseDate) return 'Ngày kết thúc phải sau hoặc bằng ngày phát hành.';
    return null;
  };

  const submit = async (event) => {
    event.preventDefault();
    const issue = validate();
    if (issue) return notification.error(issue);
    const payload = {
      title: form.title.trim(), originalTitle: form.originalTitle.trim(), slug: slugify(form.slug),
      description: form.description.trim(), durationMinutes: Number(form.durationMinutes),
      releaseDate: form.releaseDate, endDate: form.endDate, ageRating: form.ageRating,
      originalLanguage: form.originalLanguage.trim(), director: form.director.trim(), actors: form.actors.trim(),
      country: form.country.trim(), productionCompany: form.productionCompany.trim(), posterUrl: form.posterUrl.trim(),
      bannerUrl: form.bannerUrl.trim(), trailerUrl: form.trailerUrl.trim(), status: form.status,
    };
    try {
      setSaving(true);
      if (isEditMode) await movieService.updateMovie(id, payload); else await movieService.createMovie(payload);
      notification.success(isEditMode ? 'Cập nhật phim thành công.' : 'Thêm phim thành công.');
      navigate('/admin/movies');
    } catch (error) {
      notification.error(error?.message || 'Không thể lưu phim.');
    } finally { setSaving(false); }
  };

  const trailerEmbed = useMemo(() => youtubeEmbed(form.trailerUrl), [form.trailerUrl]);

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải phim...</div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'} description="Biểu mẫu bám trực tiếp Movie API của backend." breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Phim', href: '/admin/movies' }, { title: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' }]} actions={<Button variant="outline" onClick={() => navigate('/admin/movies')}><ArrowLeft className="h-4 w-4" />Quay lại</Button>} />
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Film className="h-4 w-4" />Thông tin phim</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2"><Field label="Tên phim" required><Input value={form.title} onChange={(e) => setTitle(e.target.value)} /></Field><Field label="Tên gốc" required><Input value={form.originalTitle} onChange={(e) => setField('originalTitle', e.target.value)} /></Field></div>
              <Field label="Slug" required hint="Định danh URL ổn định"><Input value={form.slug} onChange={(e) => setField('slug', e.target.value)} onBlur={() => setField('slug', slugify(form.slug || form.title))} /></Field>
              <Field label="Mô tả" required><Textarea rows={5} value={form.description} onChange={(e) => setField('description', e.target.value)} /></Field>
              <div className="grid gap-4 md:grid-cols-3"><Field label="Thời lượng" required><NumberStepper min={1} value={form.durationMinutes} onValueChange={(value) => setField('durationMinutes', value)} /></Field><Field label="Khởi chiếu" required><Input type="date" value={form.releaseDate} onChange={(e) => setField('releaseDate', e.target.value)} /></Field><Field label="Kết thúc" required><Input type="date" value={form.endDate} onChange={(e) => setField('endDate', e.target.value)} /></Field></div>
              <div className="grid gap-4 md:grid-cols-3"><Field label="Phân loại" required><Select value={form.ageRating} onValueChange={(v) => setField('ageRating', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ageRatings.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field><Field label="Ngôn ngữ gốc" required><Input value={form.originalLanguage} onChange={(e) => setField('originalLanguage', e.target.value)} /></Field><Field label="Trạng thái" required><Select value={form.status} onValueChange={(v) => setField('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></Field></div>
              <div className="grid gap-4 md:grid-cols-2"><Field label="Đạo diễn" required><Input value={form.director} onChange={(e) => setField('director', e.target.value)} /></Field><Field label="Quốc gia" required><Input value={form.country} onChange={(e) => setField('country', e.target.value)} /></Field></div>
              <Field label="Diễn viên" required hint="Chuỗi tên diễn viên, phân cách bằng dấu phẩy"><Input value={form.actors} onChange={(e) => setField('actors', e.target.value)} /></Field>
              <Field label="Hãng sản xuất" required><Input value={form.productionCompany} onChange={(e) => setField('productionCompany', e.target.value)} /></Field>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="text-lg">Media</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Poster URL" required><Input value={form.posterUrl} onChange={(e) => setField('posterUrl', e.target.value)} /></Field><Field label="Banner URL" required><Input value={form.bannerUrl} onChange={(e) => setField('bannerUrl', e.target.value)} /></Field><Field label="Trailer URL" required><Input value={form.trailerUrl} onChange={(e) => setField('trailerUrl', e.target.value)} /></Field></CardContent></Card>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => navigate('/admin/movies')}>Hủy</Button><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu...' : 'Lưu phim'}</Button></div>
        </div>
        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ImageIcon className="h-4 w-4" />Preview</CardTitle></CardHeader><CardContent className="space-y-3"><img src={form.posterUrl || '/brand-placeholder.svg'} alt="Poster preview" className="mx-auto aspect-[2/3] max-h-80 rounded-md border bg-muted object-cover" onError={(e) => { e.currentTarget.src = '/brand-placeholder.svg'; }} /><p className="font-semibold">{form.title || 'Tên phim'}</p><p className="text-sm text-muted-foreground">{form.originalTitle || 'Tên gốc'}</p></CardContent></Card>
          {trailerEmbed && <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Play className="h-4 w-4" />Trailer</CardTitle></CardHeader><CardContent><iframe src={trailerEmbed} title="Trailer preview" className="aspect-video w-full rounded-md border" allowFullScreen /></CardContent></Card>}
        </aside>
      </form>
    </div>
  );
};

export default MovieForm;
