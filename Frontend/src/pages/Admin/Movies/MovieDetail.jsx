import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/ui/star-rating';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import {
    ArrowLeft,
    Edit,
    Trash2,
    PlayCircle,
    Calendar,
    Clock,
    Star,
    Image as ImageIcon,
    Users,
    Home,
    Globe,
    FileText,
    Loader2,
    Film
} from 'lucide-react';
import dayjs from 'dayjs';
import movieService from '@/services/movieService';
import useNotification from '@/hooks/useNotification';

// Helper function to extract YouTube video ID
const getYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

// Helper function to get embed URL
const getEmbedUrl = (url) => {
    if (!url) return '';

    // YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = getYouTubeId(url);
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
    }

    // Vimeo URLs
    if (url.includes('vimeo.com')) {
        const vimeoId = url.match(/vimeo.com\/(\d+)/)?.[1];
        if (vimeoId) {
            return `https://player.vimeo.com/video/${vimeoId}`;
        }
    }

    // If already an embed URL, return as is
    if (url.includes('embed') || url.includes('player.vimeo.com')) {
        return url;
    }

    return '';
};

const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTrailerModal, setShowTrailerModal] = useState(false);

    useEffect(() => {
        loadMovieDetail();
    }, [id]);

    const loadMovieDetail = async () => {
        setLoading(true);
        try {
            const movieData = await movieService.getMovieById(id);
            if (movieData) {
                setMovie(movieData);
            } else {
                notification.error('KhÃ´ng tÃ¬m tháº¥y phim');
                navigate('/admin/movies');
            }
        } catch (error) {
            console.error('Error loading movie detail:', error);
            notification.error('Lá»—i khi táº£i thÃ´ng tin phim');
            navigate('/admin/movies');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMovie = () => {
        navigate(`/admin/movies/${movie.id}/edit`);
    };

    const handleDeleteMovie = async () => {
        try {
            await movieService.deleteMovie(movie.id);
            notification.success('XÃ³a phim thÃ nh cÃ´ng!');
            navigate('/admin/movies');
        } catch (error) {
            console.error('Error deleting movie:', error);
            notification.error(error.response?.data?.message || 'Lá»—i khi xÃ³a phim');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
        );
    }

    if (!movie) {
        return (
            <Alert
                variant="destructive"
                title="KhÃ´ng tÃ¬m tháº¥y phim"
                description="Phim báº¡n Ä‘ang tÃ¬m kiáº¿m khÃ´ng tá»“n táº¡i hoáº·c Ä‘Ã£ bá»‹ xÃ³a."
                action={
                    <Button onClick={() => navigate('/admin/movies')}>
                        Quay láº¡i danh sÃ¡ch
                    </Button>
                }
            />
        );
    }

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <Breadcrumb
                className="mb-6"
                items={[
                    {
                        title: 'Dashboard',
                        icon: <Home className="h-4 w-4" />,
                        href: '/admin/dashboard'
                    },
                    {
                        title: 'Quáº£n lÃ½ phim',
                        icon: <Film className="h-4 w-4" />,
                        href: '/admin/movies'
                    },
                    {
                        title: movie ? `Chi tiáº¿t: ${movie.title}` : 'Chi tiáº¿t phim'
                    }
                ]}
            />

            {/* Header */}
            <Card className="mb-6 rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="m-0 mb-1 text-gray-800 text-2xl font-bold">
                                {movie.title}
                            </h2>
                            {movie.originalTitle && movie.originalTitle !== movie.title && (
                                <p className="text-sm text-gray-500">
                                    {movie.originalTitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {/* <div className="flex items-center gap-2">
                        <Button
                            onClick={handleEditMovie}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Sá»­a
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a phim nÃ y?')) {
                                    handleDeleteMovie();
                                }
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            XÃ³a
                        </Button>
                    </div> */}
                </div>
            </Card>

            {/* Movie Info */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Column - Poster */}
                <div className="md:col-span-1">
                    <Card className="rounded-xl shadow-md border border-gray-200">
                        <img
                            src={movie.posterUrl || movie.posterPath || movie.poster || "data:image/png;base64,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"}
                            alt={movie.title}
                            className="w-full rounded-lg"
                        />
                    </Card>
                </div>

                {/* Right Column - Info */}
                <div className="md:col-span-3">
                    <Card className="rounded-xl shadow-md border border-gray-200">
                        <div className="border-b border-gray-200 px-5 py-4 mb-0">
                            <h3 className="text-base font-semibold m-0">ThÃ´ng tin phim</h3>
                        </div>
                        <div className="p-5">
                            <DetailList columns={2}>
                                <DetailItem label={<span className="flex items-center gap-1"><Star className="h-4 w-4" /> ÄÃ¡nh giÃ¡</span>}>
                                    <div className="flex items-center gap-2">
                                        <StarRating readOnly value={(movie.averageRating || movie.voteAverage || 0) / 2} precision={0.5} />
                                        <span className="font-bold text-base text-blue-600">
                                            {(movie.averageRating || movie.voteAverage || 0).toFixed(1)}/10
                                        </span>
                                    </div>
                                </DetailItem>
                                <DetailItem label={<span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> NgÃ y phÃ¡t hÃ nh</span>}>
                                    {movie.releaseDate ? dayjs(movie.releaseDate).format('DD/MM/YYYY') : '-'}
                                </DetailItem>
                                <DetailItem label={<span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Thá»i lÆ°á»£ng</span>}>
                                    {movie.durationMinutes || movie.durationFormatted || movie.runtime || movie.duration || 0} {movie.durationFormatted ? '' : 'phÃºt'}
                                </DetailItem>
                                <DetailItem label="Tráº¡ng thÃ¡i">
                                    {(() => {
                                        const statusMap = {
                                            'NOW_SHOWING': { text: 'Äang chiáº¿u', color: 'green' },
                                            'COMING_SOON': { text: 'Sáº¯p chiáº¿u', color: 'orange' },
                                            'ENDED': { text: 'ÄÃ£ káº¿t thÃºc', color: 'gray' }
                                        };
                                        const status = movie.status || (movie.isActive ? 'NOW_SHOWING' : 'COMING_SOON');
                                        const statusInfo = statusMap[status] || { text: status || 'N/A', color: 'gray' };
                                        return <StatusBadge tone={statusInfo.color}>{statusInfo.text}</StatusBadge>;
                                    })()}
                                </DetailItem>
                                {movie.rating && (
                                    <DetailItem label="PhÃ¢n loáº¡i">
                                        <StatusBadge tone="purple">{movie.rating}</StatusBadge>
                                    </DetailItem>
                                )}
                                {movie.language && (
                                    <DetailItem label={<span className="flex items-center gap-1"><Globe className="h-4 w-4" /> NgÃ´n ngá»¯</span>}>
                                        {movie.language}
                                    </DetailItem>
                                )}
                                {movie.subtitle && (
                                    <DetailItem label="Phá»¥ Ä‘á»">
                                        {movie.subtitle}
                                    </DetailItem>
                                )}
                                <DetailItem label={<span className="flex items-center gap-1"><Users className="h-4 w-4" /> Äáº¡o diá»…n</span>}>
                                    {movie.director || '-'}
                                </DetailItem>
                                {movie.actors && Array.isArray(movie.actors) && movie.actors.length > 0 && (
                                    <DetailItem label="Diá»…n viÃªn" wide>
                                        <div className="flex flex-wrap gap-2">
                                            {movie.actors.map((actor, index) => (
                                                <StatusBadge key={index} tone="cyan">{typeof actor === 'string' ? actor : actor.name}</StatusBadge>
                                            ))}
                                        </div>
                                    </DetailItem>
                                )}
                                <DetailItem label="Thá»ƒ loáº¡i" wide>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(movie.genres)
                                            ? movie.genres.map((genre, index) => (
                                                <StatusBadge key={index} tone="blue">{genre.name || genre}</StatusBadge>
                                            ))
                                            : movie.genre?.split(', ').map((genre, index) => (
                                                <StatusBadge key={index} tone="blue">{genre}</StatusBadge>
                                            ))
                                        }
                                    </div>
                                </DetailItem>
                                {(movie.trailerUrl || movie.trailer) && (
                                    <DetailItem label={<span className="flex items-center gap-1"><PlayCircle className="h-4 w-4" /> Trailer</span>} wide>
                                        <Button
                                            onClick={() => setShowTrailerModal(true)}
                                        >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Xem trailer
                                        </Button>
                                    </DetailItem>
                                )}
                            </DetailList>

                            {(movie.description || movie.overview) && (
                                <>
                                    <Separator className="my-4" />
                                    <div>
                                        <h5 className="flex items-center gap-2 font-semibold mb-2">
                                            <FileText className="h-4 w-4" /> MÃ´ táº£
                                        </h5>
                                        <p className="mt-2 mb-0 whitespace-pre-wrap text-gray-700">
                                            {movie.description || movie.overview}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Backdrop Image */}
            {(movie.backdropUrl || movie.backdropPath || movie.backgroundImage) && (
                <Card className="mt-6 rounded-xl shadow-md border border-gray-200">
                    <div className="border-b border-gray-200 px-5 py-4 mb-0">
                        <h3 className="text-base font-semibold m-0">HÃ¬nh ná»n</h3>
                    </div>
                    <div className="p-5">
                        <img
                            src={movie.backdropUrl || movie.backdropPath || movie.backgroundImage || "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b3YjNhwhFN9+JKMfBzosgQuAIu4FLRsQm3E7RZrNLRIsNFNkuWqB3sJJWlHfIeXPnzM3MO2z/5u77jdU6M8V9//e9n6GkqbLU4sOHDx/m5/Xr1w/+/bBpL4H/l5PO9vR3O78dT81Qp92b5pPz0+8T6/N+8/9/+fVn7t7bf/63/0/n9m4/vd34+u+XB9zd3d3/df7vf++7/z8xEACBgwkgBLAHBBoJIAQwCAReCCAEL7b1sgkBhAB2gEAjAYTgxbYWVe+lhQBCsKW+dHIDEALaDjk/fH749PLs2bNHj958nz579uz5pz5+/Pihn3/y5Mn8+vXrB9/3v41d2Q4QcCaAEJxJbj9g/7b/5cuX8z1wNr59l9aVBBCCKx0/7hG5dv+e+9qd/xJACOD3IABgT1qVpwkT+wf47bdvBMrr1cPq5v+Q1nTNTgj9ybt373bffE9P98/rN2+O+5YNNfLt27f7gX969VfO/zGGlzdu3Pjdvnr4nP7mHz9/+VLe7Xl9yvPl+ZNHj/7Y7dt9fu+lXQg9JP0N+cvzH95/9dXvvsE/CeE/Dz99+qn92vO6Pc/zF7c+/a5p++n3ypK3tSz+5z9fhKCFm9HpkuJuDQIIwRrmXpVGggihka3ndAgBIYBAgABCAANAoJEAQmiE6zmdR8UcwBVDQAhXGNqxRxAC2AECCCEAS0CgkQBCaITrOd3D/vYTt74Y4+P/fu9hU89rEoLnfau1QggNO6B+1eKr18+afpVCQ9meTh8++7LbcBfqt9m76+3Lhgts9CbY7a47Rqnq+SHYzKqcGEK7LBEC7ZRLFACBWQK6iboMhKALr38hQlBPBysWQNDFkkYI/kLCZ4S2D6/1v33byNczOkLA5oIAQgApQaBNACE0cvWcziNhq8dCCNvbYP73fH8h3/v43kft7UmEsL3d3J6JELa3ATeiwdAQQrcFCKEbBydYSQAhrOyGq+tOACF0I7n6CbZU8J7S9l5KCGF7O3AjGgwNIXQbgxC6kXAiBBSCQAAgBBAKAggBDAKBRgIIoRGu53R8wD5rj0K4JOz9CKE7SYTQjeTeAp4/4LY+e/HZ9tCvP9V/K6VDFW+/5cC/cCUWWe8hBGe6COGGw+m7s3BfdQihuOOFvEMIFyJvOwwhtPPtPRshdCe6/wCE0M/2ZmdCCDdj33w1CECAED6gAFQhQGYJhHCaH+/enWazPgQRwvrOvjKE4Kx2YGP1hxDO/kAIF8Jd0+EIwfnDqlv9IYR6xkMqHUKofDjVvwtF9xMdICFsF0UQJ1CCELaTw57kCOGGP0KofsDs/hBCPeO1lY5XtWvj1k5HCP1sERrO/xMhhMwFEELmZnp+9gWEcK6YZfmgK8tgYhFCrDgShJCo3IUfFSEgBBA4JYAQEAIINBJACNp+VWMH8n9Ur/PvZFkuWYAQlnOjJSCAEMAAEGgkgBAa4XpOR0heDhrvr6Jnb7J8BNQNEaKWKzpKz94gBMdlgxAccc47FCE4kzx3OERB3VoQQh1X50qEgBAQAggECCAEMAAEGgkghEa4ntMREtuq4e+H2FYdGzn1jfCyFpbEhPjACyGw6QhCIDOEsB9yFcKa/5H89PXl/wQX3fzjRxC8x9fRV++LmVz9lUPyW14wJMrWrVdVCL+n2PY1+x9I6RfCtauNnr81jw6f6a8iHJ+b8W9I6f8OFfNdMO1mfRhCx+sKHy+MsFcdl8lMEoIzOYQAhH42G9+8P37E29c37x56/rqx7s1K9OhXkLzHJyT8z1bLOjV93nXPn78jhPnRFxBP0vv8Bs5Bb8/3tz8/2H5+WNqWrdf9ZzO9dZAQfN3qUv1dEU7vYH3rjRbqQxGtfr0H1g7LdxC7KXz79L3e1L78M6OXuM7tq1W9dhP3z0PdgE3qd3yDzxfdz4hR7t7fd4+CMP9O+9fPPtlqRQ8HrPP39hBCGPOJDTrL8PCCqrdvPR6gZPqKwWZ5x5mAm2NvjKkBhFCDtVRdxm8hfZ6KEPrZbncmQtju9vY9GiG087VeQBsACGAQCCCmr8n6vvsG98GcQAIhJFJZFsElFQJJ1JZlNhACywgREAqE4KYBJyH4fhP1H1vOz1vOJwYlm7qH8JJJ3gohX7O1J+/aeqe99/FWCNX6JvyKQNJQFJkN2AhCyCy/05+dEJxBru1whKCNj+t0hOAKc2WHIwQ3jI57EiF45GfVkwRACAAEAmoIXKr5w8pPEgghzPJ6e2Mxm2C3HXJKAiGk5J72syNEhAACpwQQAkJAoJEAQmiE6zmdR8K2YzxHbdxoY4w2pxJACJgEAo0EEEIjXM/pPCKmjOT+KlrKz6m/yYfF5LlNMwP9BbSsOT9XeWe6e9iXiEFfQ6c7CkI4PVEK6nOTfbKe17e1PelCfgf0rAAhOK+AMzqE4Izz3OEQgqJFBYv60IQQiw9CAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFAAAFA/AkJQyFeQcqSMUDdm/LlP/TcfRBN3FhgAAAAAElFTkSuQmCC"}
                            alt={`${movie.title} background`}
                            className="w-full rounded-lg"
                        />
                    </div>
                </Card>
            )}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
                <Card className="mt-6 rounded-xl shadow-md border border-gray-200">
                    <div className="border-b border-gray-200 px-5 py-4 mb-0">
                        <h3 className="text-base font-semibold m-0">Diá»…n viÃªn</h3>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {movie.cast.map((actor, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <img
                                        src={actor.avatar || "data:image/png;base64,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"}
                                        alt={actor.name}
                                        className="w-full h-[200px] object-cover rounded-t-lg"
                                    />
                                    <div className="p-3">
                                        <h4 className="font-semibold text-sm mb-1">{actor.name}</h4>
                                        <p className="text-xs text-gray-500">{actor.character || 'Diá»…n viÃªn'}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Trailer Modal */}
            <ResponsiveDialog
                heading={<span className="flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Xem Trailer</span>}
                open={showTrailerModal}
                onClose={() => setShowTrailerModal(false)}
                actions={null}
                maxWidth={800}
                centered
            >
                {(movie?.trailerUrl || movie?.trailer) && getEmbedUrl(movie.trailerUrl || movie.trailer) && (
                    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                        <iframe
                            className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
                            src={getEmbedUrl(movie.trailerUrl || movie.trailer)}
                            title="Movie Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}
            </ResponsiveDialog>
        </div>
    );
};

export default MovieDetail;
