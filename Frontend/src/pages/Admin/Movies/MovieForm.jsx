import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Film, Image as ImageIcon, Loader2, Play, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import movieService from '@/services/movieService';
import genreService from '@/services/genreService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  title: '',
  originalTitle: '',
  description: '',
  durationMinutes: 120,
  releaseDate: '',
  language: '',
  subtitle: '',
  rating: '',
  posterUrl: '',
  backdropUrl: '',
  trailerUrl: '',
  director: '',
  actors: '',
  genres: [],
  status: 'NOW_SHOWING',
};

const classificationOptions = [
  ['G', 'G - Mọi lứa tuổi'],
  ['PG', 'PG - Có hướng dẫn của phụ huynh'],
  ['PG13', 'PG-13 - Không khuyến khích dưới 13 tuổi'],
  ['R', 'R - Hạn chế dưới 17 tuổi'],
  ['NC17', 'NC-17 - Từ 17 tuổi trở lên'],
];

const statusOptions = [
  ['NOW_SHOWING', 'Đang chiếu'],
  ['COMING_SOON', 'Sắp chiếu'],
  ['ENDED', 'Đã kết thúc'],
];

const getYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match?.[1]?.length === 11 ? match[1] : '';
};

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : '';
  }
  if (url.includes('vimeo.com')) {
    const id = url.match(/vimeo.com\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : '';
  }
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  return '';
};

const Field = ({ label, required = false, hint, children }) => (
  <label className="block space-y-2 text-sm font-medium">
    <span>{label}{required && <span className="ml-1 text-destructive">*</span>}</span>
    {children}
    {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
  </label>
);

const normalizeMovie = (movie) => ({
  title: movie?.title || '',
  originalTitle: movie?.originalTitle || '',
  description: movie?.description || '',
  durationMinutes: Number(movie?.durationMinutes ?? movie?.duration ?? 120),
  releaseDate: movie?.releaseDate ? String(movie.releaseDate).split('T')[0] : '',
  language: movie?.language || '',
  subtitle: movie?.subtitle || '',
  rating: movie?.rating || '',
  posterUrl: movie?.posterUrl || '',
  backdropUrl: movie?.backdropUrl || '',
  trailerUrl: movie?.trailerUrl || '',
  director: movie?.director || '',
  actors: Array.isArray(movie?.actors) ? movie.actors.join(', ') : movie?.actors || '',
  genres: Array.isArray(movie?.genres) ? movie.genres.map((genre) => genre?.id ?? genre) : [],
  status: movie?.status || 'NOW_SHOWING',
});

const MovieForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const notification = useNotification();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [movieLoading, setMovieLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);

  useEffect(() => {
    let active = true;
    genreService.getAllGenres()
      .then((result) => {
        if (active) setGenres(Array.isArray(result) ? result : []);
      })
      .catch((error) => {
        console.error('Error loading genres:', error);
        if (active) notification.error('Không thể tải danh sách thể loại');
      })
      .finally(() => active && setGenresLoading(false));
    return () => { active = false; };
  }, [notification]);

  useEffect(() => {
    if (!isEditMode) return undefined;
    let active = true;
    setMovieLoading(true);
    movieService.getMovieById(id)
      .then((movie) => {
        if (active) setForm(normalizeMovie(movie));
      })
      .catch((error) => {
        console.error('Error loading movie:', error);
        if (active) {
          notification.error('Không thể tải thông tin phim');
          navigate('/admin/movies');
        }
      })
      .finally(() => active && setMovieLoading(false));
    return () => { active = false; };
  }, [id, isEditMode, navigate, notification]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const selectedGenreKeys = useMemo(() => new Set(form.genres.map((genreId) => String(genreId))), [form.genres]);

  const toggleGenre = (genreId, checked) => {
    setForm((current) => {
      const exists = current.genres.some((idValue) => String(idValue) === String(genreId));
      if (checked && !exists) return { ...current, genres: [...current.genres, genreId] };
      if (!checked && exists) return { ...current, genres: current.genres.filter((idValue) => String(idValue) !== String(genreId)) };
      return current;
    });
  };

  const validate = () => {
    if (!form.title.trim()) return 'Vui lòng nhập tên phim';
    if (!form.releaseDate) return 'Vui lòng chọn ngày phát hành';
    if (!Number.isFinite(Number(form.durationMinutes)) || Number(form.durationMinutes) <= 0) return 'Thời lượng phim phải lớn hơn 0';
    if (form.genres.length === 0) return 'Vui lòng chọn ít nhất một thể loại';
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
      title: form.title.trim(),
      originalTitle: form.originalTitle.trim() || form.title.trim(),
      description: form.description.trim(),
      durationMinutes: Number(form.durationMinutes),
      releaseDate: form.releaseDate || null,
      language: form.language.trim(),
      subtitle: form.subtitle.trim(),
      rating: form.rating || '',
      posterUrl: form.posterUrl.trim(),
      backdropUrl: form.backdropUrl.trim(),
      trailerUrl: form.trailerUrl.trim(),
      director: form.director.trim(),
      actors: form.actors.split(',').map((actor) => actor.trim()).filter(Boolean),
      genres: form.genres,
      status: form.status,
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await movieService.updateMovie(id, payload);
        notification.success('Cập nhật phim thành công');
      } else {
        await movieService.createMovie(payload);
        notification.success('Thêm phim mới thành công');
      }
      navigate('/admin/movies');
    } catch (error) {
      console.error('Error saving movie:', error);
      notification.error(error?.response?.data?.message || 'Không thể lưu phim');
    } finally {
      setSaving(false);
    }
  };

  const trailerEmbed = getEmbedUrl(form.trailerUrl);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isEditMode ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
        description={isEditMode ? 'Cập nhật thông tin phim và nội dung hiển thị.' : 'Thêm một bộ phim mới vào danh mục HotCinema.'}
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Phim', href: '/admin/movies' },
          { title: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/admin/movies')}><ArrowLeft className="h-4 w-4" />Quay lại</Button>}
      />

      {movieLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải thông tin phim...</div>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Thông tin cơ bản</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Tên phim" required><Input value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="Tên phim" /></Field>
                  <Field label="Tên gốc"><Input value={form.originalTitle} onChange={(event) => setField('originalTitle', event.target.value)} placeholder="Tên phim gốc" /></Field>
                </div>
                <Field label="Mô tả" hint="Tối đa 1000 ký tự"><Textarea rows={5} maxLength={1000} value={form.description} onChange={(event) => setField('description', event.target.value)} /></Field>

                <Field label="Thể loại" required hint="Có thể chọn nhiều thể loại">
                  <Popover open={genresOpen} onOpenChange={setGenresOpen}>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="outline" className="h-auto min-h-10 w-full justify-between py-2">
                        <span className="flex flex-wrap gap-1.5 text-left">
                          {form.genres.length === 0 ? <span className="text-muted-foreground">Chọn thể loại...</span> : form.genres.map((genreId) => {
                            const genre = genres.find((item) => String(item.id) === String(genreId));
                            return genre ? <StatusBadge key={String(genreId)} tone="info">{genre.name}</StatusBadge> : null;
                          })}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[min(32rem,calc(100vw-2rem))] p-2">
                      {genresLoading ? (
                        <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Đang tải thể loại...</div>
                      ) : genres.length === 0 ? (
                        <p className="p-4 text-center text-sm text-muted-foreground">Chưa có thể loại</p>
                      ) : (
                        <div className="max-h-64 space-y-1 overflow-y-auto">
                          {genres.map((genre) => {
                            const checked = selectedGenreKeys.has(String(genre.id));
                            return (
                              <label key={genre.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                                <Checkbox checked={checked} onCheckedChange={(value) => toggleGenre(genre.id, value === true)} />
                                <span className="flex-1 text-sm">{genre.name}</span>
                                {checked && <Check className="h-4 w-4 text-primary" />}
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </Field>

                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Ngày phát hành" required><Input type="date" value={form.releaseDate} onChange={(event) => setField('releaseDate', event.target.value)} /></Field>
                  <Field label="Thời lượng (phút)" required><NumberStepper min={1} value={form.durationMinutes} onValueChange={(value) => setField('durationMinutes', value)} /></Field>
                  <Field label="Phân loại"><Select value={form.rating || 'none'} onValueChange={(value) => setField('rating', value === 'none' ? '' : value)}><SelectTrigger><SelectValue placeholder="Chọn phân loại" /></SelectTrigger><SelectContent><SelectItem value="none">Chưa phân loại</SelectItem>{classificationOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Ngôn ngữ"><Input value={form.language} onChange={(event) => setField('language', event.target.value)} placeholder="Tiếng Việt, English..." /></Field>
                  <Field label="Phụ đề"><Input value={form.subtitle} onChange={(event) => setField('subtitle', event.target.value)} placeholder="Tiếng Việt, English..." /></Field>
                  <Field label="Đạo diễn"><Input value={form.director} onChange={(event) => setField('director', event.target.value)} /></Field>
                  <Field label="Trạng thái"><Select value={form.status} onValueChange={(value) => setField('status', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></Field>
                </div>
                <Field label="Diễn viên" hint="Phân cách nhiều diễn viên bằng dấu phẩy"><Input value={form.actors} onChange={(event) => setField('actors', event.target.value)} placeholder="Diễn viên 1, Diễn viên 2" /></Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Media URLs</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="Poster URL"><div className="relative"><ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={form.posterUrl} onChange={(event) => setField('posterUrl', event.target.value)} className="pl-9" placeholder="https://..." /></div></Field>
                <Field label="Backdrop URL"><div className="relative"><ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={form.backdropUrl} onChange={(event) => setField('backdropUrl', event.target.value)} className="pl-9" placeholder="https://..." /></div></Field>
                <Field label="Trailer URL" hint="Hỗ trợ YouTube/Vimeo để xem trước"><div className="relative"><Play className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={form.trailerUrl} onChange={(event) => setField('trailerUrl', event.target.value)} className="pl-9" placeholder="https://..." /></div></Field>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate('/admin/movies')}>Hủy</Button>
              <Button type="submit" disabled={saving || movieLoading}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Thêm phim'}</Button>
            </div>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <Card>
              <CardHeader><CardTitle className="text-base">Xem trước poster</CardTitle></CardHeader>
              <CardContent>
                <img src={form.posterUrl || '/brand-placeholder.svg'} alt="Poster preview" className="aspect-[2/3] w-full rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
              </CardContent>
            </Card>
            {form.backdropUrl && (
              <Card><CardHeader><CardTitle className="text-base">Backdrop</CardTitle></CardHeader><CardContent><img src={form.backdropUrl} alt="Backdrop preview" className="aspect-video w-full rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} /></CardContent></Card>
            )}
            {trailerEmbed && (
              <Card><CardHeader><CardTitle className="text-base">Trailer</CardTitle></CardHeader><CardContent><iframe src={trailerEmbed} title="Trailer preview" className="aspect-video w-full rounded-md border" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></CardContent></Card>
            )}
          </aside>
        </form>
      )}
    </div>
  );
};

export default MovieForm;
