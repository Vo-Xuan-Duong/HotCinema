import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import peopleService from '@/services/peopleService';
import { useNotification } from '@/hooks/useNotification';

const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=0f2747&color=ffffff&name=Actor';
const POSTER_PLACEHOLDER = 'https://placehold.co/180x270/0f2747/f4f7fb?text=No+Poster';

const extractFirstValue = (obj, keys, fallback = '') => {
    if (!obj || typeof obj !== 'object') return fallback;

    for (const key of keys) {
        const value = obj[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
            return value;
        }
    }

    return fallback;
};

const toImageUrl = (value, fallback) => {
    if (!value) return fallback;

    const imagePath = String(value).trim();

    if (!imagePath) return fallback;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
        return imagePath;
    }
    if (imagePath.startsWith('//')) {
        return `https:${imagePath}`;
    }

    if (imagePath.startsWith('/')) {
        return `https://image.tmdb.org/t/p/w500${imagePath}`;
    }

    return imagePath;
};

const normalizeDate = (dateInput) => {
    if (!dateInput) return 'TBA';

    if (typeof dateInput === 'string') {
        const parsed = new Date(dateInput);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('vi-VN');
        }
        return dateInput;
    }

    if (typeof dateInput === 'object' && dateInput.year && dateInput.month && dateInput.day) {
        return `${String(dateInput.day).padStart(2, '0')}/${String(dateInput.month).padStart(2, '0')}/${dateInput.year}`;
    }

    return 'TBA';
};

const normalizeRoleText = (value) => {
    if (!value) return '';
    return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const getPersonType = (person) => {
    const roleCandidates = [
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
    ];

    const combined = roleCandidates
        .filter(Boolean)
        .map(normalizeRoleText)
        .join(' ');

    if (combined.includes('director') || combined.includes('dao dien')) {
        return 'DIRECTOR';
    }

    if (combined.includes('actor') || combined.includes('cast') || combined.includes('dien vien')) {
        return 'ACTOR';
    }

    return 'PERSON';
};

const dedupeMovies = (items) => {
    const map = new Map();

    items.forEach((item) => {
        const id = extractFirstValue(item, ['movieId', 'id']);
        const title = extractFirstValue(item, ['title', 'movieTitle', 'name'], 'Đang cập nhật');
        const poster = toImageUrl(
            extractFirstValue(item, ['posterUrl', 'posterPath', 'poster', 'thumbnail']),
            POSTER_PLACEHOLDER
        );
        const releaseDate = normalizeDate(extractFirstValue(item, ['releaseDate', 'premiereDate', 'publishDate', 'date']));
        const role = extractFirstValue(item, ['role', 'character', 'department', 'job'], 'Actor');

        const uniqueKey = id ? `id:${id}` : `name:${title}`;
        if (!map.has(uniqueKey)) {
            map.set(uniqueKey, {
                id,
                title,
                poster,
                releaseDate,
                role,
            });
        }
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

    const flattened = containers
        .flatMap((entry) => {
            if (Array.isArray(entry)) return entry;
            if (Array.isArray(entry?.content)) return entry.content;
            if (Array.isArray(entry?.items)) return entry.items;
            if (entry && typeof entry === 'object' && (entry.title || entry.movieTitle || entry.name)) return [entry];
            return [];
        })
        .filter(Boolean);

    return dedupeMovies(flattened);
};

const normalizeRelatedPosts = (person) => {
    const candidates = [
        person?.relatedPosts,
        person?.relatedArticles,
        person?.news,
    ];

    const flattened = candidates
        .flatMap((entry) => {
            if (Array.isArray(entry)) return entry;
            if (Array.isArray(entry?.content)) return entry.content;
            if (entry && typeof entry === 'object') return [entry];
            return [];
        })
        .filter(Boolean)
        .map((item) => ({
            id: extractFirstValue(item, ['id', 'slug'], ''),
            title: extractFirstValue(item, ['title', 'headline', 'name'], 'Bài viết đang cập nhật'),
            excerpt: extractFirstValue(item, ['excerpt', 'summary', 'description'], ''),
            link: extractFirstValue(item, ['link', 'url'], ''),
        }));

    return flattened.slice(0, 5);
};

const PeopleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error: notifyError } = useNotification();

    const [loading, setLoading] = useState(true);
    const [person, setPerson] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPeopleDetail = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);

            try {
                const response = await peopleService.getPeopleById(id);

                if (!isMounted) return;

                const payload = response?.data || response;
                setPerson(payload || null);
            } catch (error) {
                if (!isMounted) return;
                console.error('Error fetching people detail:', error);
                notifyError('Không thể tải thông tin nhân sự.');
                setPerson(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchPeopleDetail();

        return () => {
            isMounted = false;
        };
    }, [id, notifyError]);

    const personName = useMemo(
        () => extractFirstValue(person, ['name', 'fullName', 'personName'], 'Thông tin nhân sự'),
        [person]
    );

    const personType = useMemo(() => getPersonType(person), [person]);

    const personLabel = useMemo(() => {
        if (personType === 'DIRECTOR') return 'đạo diễn';
        if (personType === 'ACTOR') return 'diễn viên';
        return 'nhân sự';
    }, [personType]);

    const personBio = useMemo(
        () => extractFirstValue(person, ['biography', 'description', 'overview', 'about'], 'Thông tin tiểu sử đang được cập nhật.'),
        [person]
    );

    const avatarUrl = useMemo(
        () => toImageUrl(extractFirstValue(person, ['profileImage', 'avatarUrl', 'imageUrl', 'photo', 'avatar', 'profilePath']), AVATAR_PLACEHOLDER),
        [person]
    );

    const filmography = useMemo(() => normalizeFilmography(person), [person]);
    const relatedPosts = useMemo(() => normalizeRelatedPosts(person), [person]);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-background text-foreground pt-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Đang tải thông tin {personLabel}...</p>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-background text-foreground pt-16 flex flex-col items-center justify-center gap-3">
                <h2 className="text-xl font-semibold">Không tìm thấy thông tin {personLabel}</h2>
                <Button
                    type="button"
                    onClick={() => navigate('/movies')}
                >
                    Quay lại danh sách phim
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pt-14 sm:pt-16">
            <section className="bg-card text-card-foreground border-b border-border">
                <div className="w-[94%] max-w-[1220px] mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] md:gap-7 gap-4 items-start py-6 sm:py-8">
                    <div className="w-[150px] h-[220px] sm:w-[210px] sm:h-[306px] rounded-lg overflow-hidden border border-border shadow-md bg-muted">
                        <img src={avatarUrl} alt={personName} className="w-full h-full object-cover" />
                    </div>

                    <div className="max-w-[760px] pt-0.5">
                        <h1 className="m-0 mb-3 text-foreground text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                            {personName}
                        </h1>
                        <p className="m-0 text-muted-foreground text-sm sm:text-base leading-relaxed">
                            {personBio}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-6 sm:py-8 min-h-[300px]">
                <div className="w-[94%] max-w-[1220px] mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">Phim tham gia</h2>
                    <div className="flex flex-wrap justify-start gap-4 sm:gap-5">
                        {filmography.length > 0 ? (
                            filmography.map((movie, index) => (
                                <article className="w-[calc(50%-8px)] min-w-[140px] sm:min-w-0 sm:w-[160px]" key={`${movie.id || movie.title}-${index}`}>
                                    {movie.id ? (
                                        <Link
                                            to={`/movies/${movie.id}`}
                                            className="block w-full rounded-lg overflow-hidden border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                                        >
                                            <img src={movie.poster} alt={movie.title} className="block w-full aspect-[2/3] object-cover bg-muted" />
                                        </Link>
                                    ) : (
                                        <div className="block w-full rounded-lg overflow-hidden border border-border bg-card shadow-sm">
                                            <img src={movie.poster} alt={movie.title} className="block w-full aspect-[2/3] object-cover bg-muted" />
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <h3 className="m-0 text-sm font-medium text-foreground line-clamp-2 leading-tight" title={movie.title}>{movie.title}</h3>
                                        <p className="m-0 mt-1 text-xs text-muted-foreground">{movie.releaseDate}</p>
                                        <p className="m-0 mt-0.5 text-xs text-muted-foreground/80 capitalize">
                                            {movie.role || (personType === 'DIRECTOR' ? 'Đạo diễn' : 'Diễn viên')}
                                        </p>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="text-muted-foreground text-sm mt-2">Chưa có dữ liệu phim tham gia.</div>
                        )}
                    </div>
                </div>
            </section>

            <section className="pb-8 sm:pb-10 border-t border-border pt-6">
                <div className="w-[94%] max-w-[1220px] mx-auto">
                    <div className="bg-card border border-border rounded-xl min-h-[154px] p-4 sm:p-6 w-full max-w-[930px]">
                        <h2 className="m-0 text-lg sm:text-xl font-semibold leading-tight text-card-foreground">Bài viết liên quan</h2>

                        {relatedPosts.length > 0 ? (
                            <div className="mt-4 grid gap-3">
                                {relatedPosts.map((post, index) => (
                                    <article className="bg-muted/40 border border-border rounded-lg px-3.5 py-3" key={`${post.id || post.title}-${index}`}>
                                        {post.link ? (
                                            <a href={post.link} target="_blank" rel="noreferrer" className="m-0 text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors">{post.title}</a>
                                        ) : (
                                            <p className="m-0 text-sm sm:text-base font-medium text-foreground">{post.title}</p>
                                        )}

                                        {post.excerpt ? <p className="m-0 mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p> : null}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="m-0 mt-2 text-xs sm:text-sm text-muted-foreground">Nội dung bài viết liên quan đang được cập nhật.</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PeopleDetail;
