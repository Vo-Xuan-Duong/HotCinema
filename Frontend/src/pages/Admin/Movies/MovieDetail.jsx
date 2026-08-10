import { useEffect, useState } from 'react';
import { Edit, Film, Loader2, Play, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import movieService from '@/services/movieService';
import useNotification from '@/hooks/useNotification';

const statusMeta = (status) => {
  if (status === 'NOW_SHOWING') return { label: 'Đang chiếu', tone: 'success' };
  if (status === 'COMING_SOON') return { label: 'Sắp chiếu', tone: 'warning' };
  if (status === 'ENDED') return { label: 'Đã kết thúc', tone: 'neutral' };
  return { label: status || 'Không rõ', tone: 'neutral' };
};

const formatReleaseDate = (value) => {
  if (!value) return 'Chưa có';
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
  }
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : String(value);
};

const getEmbedUrl = (url) => {
  if (!url) return '';
  const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&#/]+)/);
  if (youtube?.[1]) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  return '';
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    movieService.getMovieById(id)
      .then((result) => {
        if (active) setMovie(result || null);
      })
      .catch((error) => {
        console.error('Error loading movie detail:', error);
        if (active) notification.error('Không thể tải thông tin phim');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, notification]);

  const handleDelete = async () => {
    if (!movie || !window.confirm(`Xóa phim ${movie.title}? Hành động này không thể hoàn tác.`)) return;
    try {
      setDeleting(true);
      await movieService.deleteMovie(movie.id);
      notification.success('Đã xóa phim');
      navigate('/admin/movies');
    } catch (error) {
      console.error('Error deleting movie:', error);
      notification.error(error?.response?.data?.message || 'Không thể xóa phim');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải thông tin phim...</div>;
  }

  if (!movie) {
    return <Alert variant="destructive" showIcon message="Không tìm thấy phim" description="Phim không tồn tại hoặc đã bị xóa." action={<Button onClick={() => navigate('/admin/movies')}>Quay lại danh sách</Button>} />;
  }

  const status = statusMeta(movie.status);
  const rating = Number(movie.averageRating ?? movie.voteAverage ?? 0);
  const trailerEmbed = getEmbedUrl(movie.trailerUrl || movie.trailer || '');
  const genres = Array.isArray(movie.genres)
    ? movie.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean)
    : [];
  const actors = Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors || 'Chưa có';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={movie.title || 'Chi tiết phim'}
        description={movie.originalTitle && movie.originalTitle !== movie.title ? movie.originalTitle : 'Thông tin phim trong hệ thống HotCinema.'}
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Phim', href: '/admin/movies' },
          { title: 'Chi tiết' },
        ]}
        actions={(
          <>
            <Button variant="outline" onClick={() => navigate(`/admin/movies/${movie.id}/edit`)}><Edit className="h-4 w-4" />Chỉnh sửa</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Xóa phim</Button>
          </>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <img src={movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg'} alt={movie.title} className="aspect-[2/3] w-full object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
          </Card>
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap gap-2"><StatusBadge tone={status.tone}>{status.label}</StatusBadge>{movie.rating && <StatusBadge tone="warning">{movie.rating}</StatusBadge>}</div>
              {rating > 0 && <div className="space-y-1"><div className="flex items-center gap-2"><StarRating readOnly value={rating / 2} precision={0.5} /><span className="text-sm font-medium">{rating.toFixed(1)}/10</span></div></div>}
              {trailerEmbed && <Button variant="outline" className="w-full" onClick={() => setTrailerOpen(true)}><Play className="h-4 w-4" />Xem trailer</Button>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Film className="h-4 w-4 text-muted-foreground" />Thông tin phim</CardTitle></CardHeader>
            <CardContent>
              <DetailList columns={2}>
                <DetailItem label="Tên phim">{movie.title || 'Chưa có'}</DetailItem>
                <DetailItem label="Tên gốc">{movie.originalTitle || movie.title || 'Chưa có'}</DetailItem>
                <DetailItem label="Ngày phát hành">{formatReleaseDate(movie.releaseDate)}</DetailItem>
                <DetailItem label="Thời lượng">{movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.durationFormatted || 'Chưa có'}</DetailItem>
                <DetailItem label="Ngôn ngữ">{movie.language || 'Chưa có'}</DetailItem>
                <DetailItem label="Phụ đề">{movie.subtitle || 'Chưa có'}</DetailItem>
                <DetailItem label="Đạo diễn">{movie.director || 'Chưa có'}</DetailItem>
                <DetailItem label="Phân loại">{movie.rating || 'Chưa có'}</DetailItem>
                <DetailItem label="Thể loại" wide>{genres.length ? <div className="flex flex-wrap gap-2">{genres.map((genre) => <StatusBadge key={genre} tone="info">{genre}</StatusBadge>)}</div> : 'Chưa có'}</DetailItem>
                <DetailItem label="Diễn viên" wide>{actors}</DetailItem>
                <DetailItem label="Mô tả" wide>{movie.description || 'Chưa có mô tả'}</DetailItem>
              </DetailList>
            </CardContent>
          </Card>

          {movie.backdropUrl && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Backdrop</CardTitle></CardHeader>
              <CardContent><img src={movie.backdropUrl} alt={`Backdrop ${movie.title}`} className="aspect-video w-full rounded-md border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} /></CardContent>
            </Card>
          )}
        </div>
      </div>

      <ResponsiveDialog open={trailerOpen} onClose={() => setTrailerOpen(false)} heading={`Trailer · ${movie.title}`} maxWidth={960} actions={<Button variant="outline" onClick={() => setTrailerOpen(false)}>Đóng</Button>}>
        {trailerEmbed && <iframe src={trailerEmbed} title={`Trailer ${movie.title}`} className="aspect-video w-full rounded-md border" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
      </ResponsiveDialog>
    </div>
  );
};

export default MovieDetail;
