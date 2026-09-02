import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { useNotification } from '@/hooks/useNotification';
import peopleService from '@/services/peopleService';

const IMAGE_PLACEHOLDER = '/brand-placeholder.svg';

const extractFirstValue = (obj, keys, fallback = '') => {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return fallback;
};

const toImageUrl = (value, fallback = IMAGE_PLACEHOLDER) => {
  if (!value) return fallback;
  const imagePath = String(value).trim();
  if (!imagePath) return fallback;
  if (/^(https?:|data:|blob:)/.test(imagePath)) return imagePath;
  if (imagePath.startsWith('//')) return `https:${imagePath}`;
  if (imagePath.startsWith('/')) return `https://image.tmdb.org/t/p/w500${imagePath}`;
  return imagePath;
};

const normalizeDate = (dateInput) => {
  if (!dateInput) return 'Đang cập nhật';
  if (typeof dateInput === 'object' && dateInput.year && dateInput.month && dateInput.day) {
    return `${String(dateInput.day).padStart(2, '0')}/${String(dateInput.month).padStart(2, '0')}/${dateInput.year}`;
  }
  const parsed = new Date(dateInput);
  return Number.isNaN(parsed.getTime()) ? String(dateInput) : parsed.toLocaleDateString('vi-VN');
};

const normalizeRoleText = (value) => (
  value
    ? String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    : ''
);

const getPersonType = (person) => {
  const combined = [
    person?.type,
    person?.profession,
    person?.job,
    person?.department,
    person?.role,
    person?.personType,
    person?.person?.type,
    person?.person?.job,
    person?.person?.department,
    person?.person?.role,
  ].filter(Boolean).map(normalizeRoleText).join(' ');

  if (combined.includes('director') || combined.includes('dao dien')) return 'DIRECTOR';
  if (combined.includes('actor') || combined.includes('cast') || combined.includes('dien vien')) return 'ACTOR';
  return 'PERSON';
};

const dedupeMovies = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const id = extractFirstValue(item, ['movieId', 'id']);
    const title = extractFirstValue(item, ['title', 'movieTitle', 'name'], 'Đang cập nhật');
    const uniqueKey = id ? `id:${id}` : `name:${title}`;
    if (map.has(uniqueKey)) return;
    map.set(uniqueKey, {
      id,
      title,
      poster: toImageUrl(extractFirstValue(item, ['posterUrl', 'posterPath', 'poster', 'thumbnail'])),
      releaseDate: normalizeDate(extractFirstValue(item, ['releaseDate', 'premiereDate', 'publishDate', 'date'])),
      role: extractFirstValue(item, ['role', 'character', 'department', 'job'], ''),
    });
  });
  return Array.from(map.values());
};

const normalizeFilmography = (person) => {
  const containers = [
    person?.movies,
    person?.filmography,
    person?.knownFor,
    person?.movieCredits,
    person?.participatedMovies,
    person?.credits,
    person?.credits?.cast,
    person?.credits?.crew,
  ];
  const flattened = containers.flatMap((entry) => {
    if (Array.isArray(entry)) return entry;
    if (Array.isArray(entry?.content)) return entry.content;
    if (Array.isArray(entry?.items)) return entry.items;
    if (entry && typeof entry === 'object' && (entry.title || entry.movieTitle || entry.name)) return [entry];
    return [];
  }).filter(Boolean);
  return dedupeMovies(flattened);
};

const normalizeRelatedPosts = (person) => [
  person?.relatedPosts,
  person?.relatedArticles,
  person?.news,
].flatMap((entry) => {
  if (Array.isArray(entry)) return entry;
  if (Array.isArray(entry?.content)) return entry.content;
  if (entry && typeof entry === 'object') return [entry];
  return [];
}).filter(Boolean).map((item) => ({
  id: extractFirstValue(item, ['id', 'slug'], ''),
  title: extractFirstValue(item, ['title', 'headline', 'name'], 'Bài viết đang cập nhật'),
  excerpt: extractFirstValue(item, ['excerpt', 'summary', 'description'], ''),
  link: extractFirstValue(item, ['link', 'url'], ''),
})).slice(0, 5);

const SafeImage = ({ src, alt, className }) => (
  <img
    src={src || IMAGE_PLACEHOLDER}
    alt={alt}
    className={className}
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = IMAGE_PLACEHOLDER;
    }}
  />
);

const PeopleDetailSkeleton = () => (
  <div className="min-h-dvh bg-background pt-16 text-foreground">
    <div className="border-b border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[210px_1fr] lg:px-8">
        <Skeleton className="aspect-[2/3] w-full max-w-[210px] rounded-lg" />
        <div className="space-y-4 py-2">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </div>
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-7 w-40" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const PeopleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: notifyError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchPeopleDetail = async () => {
      if (!id) {
        setLoading(false);
        setLoadError('Không có mã nhân sự hợp lệ.');
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const response = await peopleService.getPeopleById(id);
        if (!active) return;
        const payload = response?.data || response;
        setPerson(payload || null);
        if (!payload) setLoadError('Không tìm thấy thông tin nhân sự.');
      } catch (error) {
        if (!active) return;
        console.error('Error fetching people detail:', error);
        const message = error?.response?.status === 404
          ? 'Không tìm thấy thông tin nhân sự.'
          : 'Không thể tải thông tin nhân sự. Vui lòng thử lại.';
        setPerson(null);
        setLoadError(message);
        notifyError(message);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPeopleDetail();
    return () => { active = false; };
  }, [id, notifyError, requestKey]);

  const personName = useMemo(
    () => extractFirstValue(person, ['name', 'fullName', 'personName'], 'Thông tin nhân sự'),
    [person]
  );
  const personType = useMemo(() => getPersonType(person), [person]);
  const personLabel = personType === 'DIRECTOR' ? 'Đạo diễn' : personType === 'ACTOR' ? 'Diễn viên' : 'Nhân sự';
  const personBio = useMemo(
    () => extractFirstValue(person, ['biography', 'description', 'overview', 'about'], 'Thông tin tiểu sử đang được cập nhật.'),
    [person]
  );
  const avatarUrl = useMemo(
    () => toImageUrl(extractFirstValue(person, ['profileImage', 'avatarUrl', 'imageUrl', 'photo', 'avatar', 'profilePath'])),
    [person]
  );
  const filmography = useMemo(() => normalizeFilmography(person), [person]);
  const relatedPosts = useMemo(() => normalizeRelatedPosts(person), [person]);

  if (loading) return <PeopleDetailSkeleton />;

  if (!person) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 pt-16 text-foreground">
        <Card className="w-full max-w-lg">
          <CardContent className="p-6">
            <Empty
              className="py-6"
              description={(
                <div className="space-y-4">
                  <p>{loadError || 'Không tìm thấy thông tin nhân sự.'}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button type="button" variant="outline" onClick={() => navigate('/movies')}>
                      <ArrowLeft className="h-4 w-4" />
                      Danh sách phim
                    </Button>
                    <Button type="button" onClick={() => setRequestKey((value) => value + 1)}>
                      <RefreshCw className="h-4 w-4" />
                      Thử lại
                    </Button>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background pt-16 text-foreground">
      <section className="border-b border-border bg-card text-card-foreground">
        <div className="mx-auto grid w-full max-w-7xl items-start gap-6 px-4 py-8 sm:px-6 md:grid-cols-[210px_1fr] lg:gap-8 lg:px-8">
          <div className="mx-auto w-full max-w-[210px] overflow-hidden rounded-lg border border-border bg-muted md:mx-0">
            <SafeImage src={avatarUrl} alt={personName} className="aspect-[2/3] w-full object-cover" />
          </div>
          <div className="max-w-3xl py-1">
            <StatusBadge tone="neutral">{personLabel}</StatusBadge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{personName}</h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{personBio}</p>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section aria-labelledby="filmography-title">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="filmography-title" className="text-xl font-semibold tracking-tight">Phim tham gia</h2>
            {filmography.length > 0 && <span className="text-sm text-muted-foreground">{filmography.length} phim</span>}
          </div>

          {filmography.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {filmography.map((movie, index) => (
                <article key={`${movie.id || movie.title}-${index}`} className="min-w-0">
                  {movie.id ? (
                    <Link
                      to={`/movies/${movie.id}`}
                      className="group block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <SafeImage src={movie.poster} alt={movie.title} className="aspect-[2/3] w-full bg-muted object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </Link>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-border bg-card">
                      <SafeImage src={movie.poster} alt={movie.title} className="aspect-[2/3] w-full bg-muted object-cover" />
                    </div>
                  )}
                  <div className="pt-2">
                    <h3 className="line-clamp-2 text-sm font-medium leading-tight" title={movie.title}>{movie.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{movie.releaseDate}</p>
                    <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground/80">
                      {movie.role || (personType === 'DIRECTOR' ? 'Đạo diễn' : 'Diễn viên')}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Card><Empty className="min-h-40" description="Chưa có dữ liệu phim tham gia." /></Card>
          )}
        </section>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-xl">Bài viết liên quan</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {relatedPosts.length > 0 ? (
              <div className="grid gap-3">
                {relatedPosts.map((post, index) => (
                  <article className="rounded-lg border border-border bg-muted/30 p-4" key={`${post.id || post.title}-${index}`}>
                    {post.link ? (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary sm:text-base"
                      >
                        {post.title}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Mở trong tab mới</span>
                      </a>
                    ) : (
                      <p className="text-sm font-medium sm:text-base">{post.title}</p>
                    )}
                    {post.excerpt && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{post.excerpt}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <Empty description="Nội dung bài viết liên quan đang được cập nhật." />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PeopleDetail;
