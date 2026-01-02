import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InputNumber } from '../../../components/ui/input-number';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Separator } from '../../../components/ui/separator';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import { Checkbox } from '../../../components/ui/checkbox';
import { Tag } from '../../../components/ui/tag';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Home,
    Loader2,
    X,
    ChevronDown,
    Check,
    Film
} from 'lucide-react';
import movieService from '../../../services/movieService';
import genreService from '../../../services/genreService';
import { useNotification } from '../../../hooks/useNotification';

const MovieForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);
    const [loadingMovie, setLoadingMovie] = useState(false);
    const [genres, setGenres] = useState([]);
    const [movieData, setMovieData] = useState(null);
    const [previewPoster, setPreviewPoster] = useState(null);
    const [previewBackdrop, setPreviewBackdrop] = useState(null);
    const [previewTrailer, setPreviewTrailer] = useState(null);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [rating, setRating] = useState('');
    const [status, setStatus] = useState('NOW_SHOWING');
    const [genresPopoverOpen, setGenresPopoverOpen] = useState(false);

    const isEditMode = !!id;

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genresList = await genreService.getAllGenres();
                setGenres(genresList);
            } catch (error) {
                console.error('Error loading genres:', error);
            }
        };
        loadGenres();
    }, []);

    // Load movie data if in edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadMovie = async () => {
                try {
                    setLoadingMovie(true);
                    const movie = await movieService.getMovieById(id);

                    // Set preview images
                    if (movie.posterUrl) {
                        setPreviewPoster(movie.posterUrl);
                    }
                    if (movie.backdropUrl) {
                        setPreviewBackdrop(movie.backdropUrl);
                    }
                    if (movie.trailerUrl) {
                        setPreviewTrailer(movie.trailerUrl);
                    }

                    // Set selected genres
                    if (movie.genres && Array.isArray(movie.genres)) {
                        const genreIds = movie.genres.map(g => g.id || g);
                        setSelectedGenres(genreIds);
                    }

                    // Set form values
                    setRating(movie.rating || '');
                    setStatus(movie.status || 'NOW_SHOWING');

                    setMovieData(movie);
                } catch (error) {
                    console.error('Error loading movie:', error);
                    showNotification('error', 'Lỗi', 'Không thể tải thông tin phim');
                    navigate('/admin/movies');
                } finally {
                    setLoadingMovie(false);
                }
            };
            loadMovie();
        }
    }, [id, isEditMode, navigate, showNotification]);

    const handlePosterUrlChange = (e) => {
        const url = e.target.value;
        if (url && (url.startsWith('http') || url.startsWith('https'))) {
            setPreviewPoster(url);
        } else {
            setPreviewPoster(null);
        }
    };

    const handleBackdropUrlChange = (e) => {
        const url = e.target.value;
        if (url && (url.startsWith('http') || url.startsWith('https'))) {
            setPreviewBackdrop(url);
        } else {
            setPreviewBackdrop(null);
        }
    };

    const handleTrailerUrlChange = (e) => {
        const url = e.target.value;
        if (url && (url.startsWith('http') || url.startsWith('https'))) {
            setPreviewTrailer(url);
        } else {
            setPreviewTrailer(null);
        }
    };

    const handleGenreToggle = (genreId) => {
        setSelectedGenres(prev => {
            if (prev.includes(genreId)) {
                return prev.filter(id => id !== genreId);
            } else {
                return [...prev, genreId];
            }
        });
    };

    // Helper function to extract YouTube video ID
    const getYouTubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const formData = new FormData(e.target);
            const values = {
                title: formData.get('title'),
                originalTitle: formData.get('originalTitle'),
                description: formData.get('description'),
                durationMinutes: parseInt(formData.get('durationMinutes')) || 0,
                releaseDate: formData.get('releaseDate'),
                language: formData.get('language'),
                subtitle: formData.get('subtitle'),
                rating: rating,
                posterUrl: formData.get('posterUrl'),
                backdropUrl: formData.get('backdropUrl'),
                trailerUrl: formData.get('trailerUrl'),
                director: formData.get('director'),
                actors: formData.get('actors'),
                genres: selectedGenres,
                status: status
            };

            // Chuẩn bị data theo format MovieRequest
            const movieRequest = {
                title: values.title,
                originalTitle: values.originalTitle || values.title,
                description: values.description || '',
                durationMinutes: values.durationMinutes || 0,
                releaseDate: values.releaseDate || null,
                language: values.language || '',
                subtitle: values.subtitle || '',
                rating: values.rating || '',
                posterUrl: values.posterUrl || '',
                backdropUrl: values.backdropUrl || '',
                trailerUrl: values.trailerUrl || '',
                director: values.director || '',
                actors: values.actors && Array.isArray(values.actors)
                    ? values.actors
                    : (values.actors ? values.actors.split(',').map(a => a.trim()).filter(a => a) : []),
                genres: values.genres || [],
                status: values.status || 'NOW_SHOWING'
            };

            if (isEditMode) {
                await movieService.updateMovie(id, movieRequest);
                showNotification('success', 'Thành công', 'Cập nhật phim thành công!');
            } else {
                await movieService.createMovie(movieRequest);
                showNotification('success', 'Thành công', 'Thêm phim mới thành công!');
            }
            navigate('/admin/movies');
        } catch (error) {
            console.error('Error creating movie:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Lỗi khi tạo phim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative z-10">
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
                        title: 'Quản lý phim',
                        icon: <Film className="h-4 w-4" />,
                        href: '/admin/movies'
                    },
                    {
                        title: isEditMode ? `Chỉnh sửa phim : ${movieData?.title}` : 'Thêm phim mới'
                    }
                ]}
            />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin/movies')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="m-0 mb-2 text-gray-800 text-2xl font-bold">
                            {isEditMode ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}
                        </h2>
                        <p className="text-gray-500 text-sm">Thêm phim mới vào hệ thống</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Card className="rounded-xl shadow-md border border-gray-200 p-6">
                {loadingMovie ? (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Đang tải thông tin phim...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Main Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div>
                                    <h4 className="mb-4 text-lg font-semibold">Thông tin cơ bản</h4>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Tên Phim <span className="text-red-500">*</span></label>
                                    <Input
                                        name="title"
                                        placeholder="Nhập tên phim"
                                        defaultValue={movieData?.title || ''}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Tên Gốc</label>
                                    <p className="text-xs text-gray-500 mb-1">Tên phim gốc (nếu khác tên tiếng Việt)</p>
                                    <Input
                                        name="originalTitle"
                                        placeholder="Tên phim gốc"
                                        defaultValue={movieData?.originalTitle || ''}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Mô tả</label>
                                    <Textarea
                                        name="description"
                                        rows={4}
                                        placeholder="Nhập mô tả về phim"
                                        maxLength={1000}
                                        defaultValue={movieData?.description || ''}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Tối đa 1000 ký tự</p>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Thể Loại <span className="text-red-500">*</span></label>
                                    <p className="text-xs text-gray-500 mb-3">Chọn các thể loại của phim (có thể chọn nhiều)</p>

                                    {/* Genres Select Dropdown */}
                                    <Popover open={genresPopoverOpen} onOpenChange={setGenresPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between h-auto min-h-[40px] py-2"
                                            >
                                                <div className="flex flex-wrap gap-1.5 flex-1 text-left">
                                                    {selectedGenres.length === 0 ? (
                                                        <span className="text-gray-500">Chọn thể loại...</span>
                                                    ) : (
                                                        selectedGenres.map(genreId => {
                                                            const genre = genres.find(g => g.id === genreId);
                                                            if (!genre) return null;
                                                            return (
                                                                <Tag
                                                                    key={genreId}
                                                                    color="blue"
                                                                    className="text-xs px-2 py-0.5"
                                                                >
                                                                    {genre.name}
                                                                </Tag>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0" align="start">
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {genres.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm text-gray-500">Đang tải thể loại...</p>
                                                    </div>
                                                ) : (
                                                    <div className="p-1">
                                                        {genres.map(genre => {
                                                            const isSelected = selectedGenres.includes(genre.id);
                                                            return (
                                                                <label
                                                                    key={genre.id}
                                                                    className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onCheckedChange={() => handleGenreToggle(genre.id)}
                                                                        className="h-4 w-4"
                                                                    />
                                                                    <span className="text-sm flex-1 leading-tight">{genre.name}</span>
                                                                    {isSelected && (
                                                                        <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                                                    )}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>


                                    {selectedGenres.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                            <span>⚠️</span> Vui lòng chọn ít nhất một thể loại
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold">Ngày Phát Hành <span className="text-red-500">*</span></label>
                                        <Input
                                            name="releaseDate"
                                            type="date"
                                            defaultValue={movieData?.releaseDate ? movieData.releaseDate.split('T')[0] : ''}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Thời Lượng (phút) <span className="text-red-500">*</span></label>
                                        <InputNumber
                                            name="durationMinutes"
                                            min={1}
                                            placeholder="Ví dụ: 120"
                                            defaultValue={movieData?.durationMinutes || 0}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold">Ngôn Ngữ</label>
                                        <Input
                                            name="language"
                                            placeholder="Ví dụ: Tiếng Việt, English"
                                            defaultValue={movieData?.language || ''}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Phụ Đề</label>
                                        <Input
                                            name="subtitle"
                                            placeholder="Ví dụ: Tiếng Việt, English"
                                            defaultValue={movieData?.subtitle || ''}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-2 font-semibold">Phân Loại</label>
                                        <Select
                                            value={rating}
                                            onValueChange={setRating}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phân loại" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="G">G - Mọi lứa tuổi</SelectItem>
                                                <SelectItem value="PG">PG - Có sự hướng dẫn của phụ huynh</SelectItem>
                                                <SelectItem value="PG13">PG-13 - Không khuyến khích cho trẻ dưới 13 tuổi</SelectItem>
                                                <SelectItem value="R">R - Hạn chế cho trẻ dưới 17 tuổi</SelectItem>
                                                <SelectItem value="NC17">NC-17 - Chỉ dành cho người từ 17 tuổi trở lên</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-semibold">Đạo Diễn</label>
                                        <Input
                                            name="director"
                                            placeholder="Nhập tên đạo diễn"
                                            defaultValue={movieData?.director || ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Diễn Viên</label>
                                    <p className="text-xs text-gray-500 mb-1">Nhập tên các diễn viên phân cách bằng dấu phẩy</p>
                                    <Input
                                        name="actors"
                                        placeholder="Ví dụ: Diễn viên 1, Diễn viên 2, Diễn viên 3"
                                        defaultValue={movieData?.actors && Array.isArray(movieData.actors) ? movieData.actors.join(', ') : (movieData?.actors || '')}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Trạng Thái <span className="text-red-500">*</span></label>
                                    <Select
                                        value={status}
                                        onValueChange={setStatus}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NOW_SHOWING">Đang chiếu</SelectItem>
                                            <SelectItem value="COMING_SOON">Sắp chiếu</SelectItem>
                                            <SelectItem value="ENDED">Đã kết thúc</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                <div>
                                    <h4 className="mb-4 text-lg font-semibold">URLs</h4>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Poster URL</label>
                                    <p className="text-xs text-gray-500 mb-1">URL hình ảnh poster của phim</p>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            name="posterUrl"
                                            placeholder="Nhập URL hình ảnh poster"
                                            onChange={handlePosterUrlChange}
                                            className="pl-10"
                                            defaultValue={movieData?.posterUrl || ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Backdrop URL</label>
                                    <p className="text-xs text-gray-500 mb-1">URL hình nền của phim</p>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            name="backdropUrl"
                                            placeholder="Nhập URL hình nền"
                                            onChange={handleBackdropUrlChange}
                                            className="pl-10"
                                            defaultValue={movieData?.backdropUrl || ''}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 font-semibold">Trailer URL</label>
                                    <p className="text-xs text-gray-500 mb-1">URL video trailer (YouTube, Vimeo, etc.)</p>
                                    <Input
                                        name="trailerUrl"
                                        placeholder="Nhập URL trailer"
                                        onChange={handleTrailerUrlChange}
                                        defaultValue={movieData?.trailerUrl || ''}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Preview */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-4">
                                    <h4 className="mb-4 text-lg font-semibold">Xem trước</h4>

                                    {previewPoster && (
                                        <div className="mb-4">
                                            <p className="font-semibold text-sm mb-2">Poster:</p>
                                            <img
                                                src={previewPoster}
                                                alt="Poster preview"
                                                className="rounded-lg w-full max-h-[400px] object-cover"
                                                onError={(e) => {
                                                    e.target.src = "data:image/png;base64,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";
                                                }}
                                            />
                                        </div>
                                    )}

                                    {previewBackdrop && (
                                        <div className="mb-4">
                                            <p className="font-semibold text-sm mb-2">Backdrop:</p>
                                            <img
                                                src={previewBackdrop}
                                                alt="Backdrop preview"
                                                className="rounded-lg w-full max-h-[200px] object-cover"
                                                onError={(e) => {
                                                    e.target.src = "data:image/png;base64,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";
                                                }}
                                            />
                                        </div>
                                    )}

                                    {previewTrailer && getEmbedUrl(previewTrailer) && (
                                        <div className="mb-4">
                                            <p className="font-semibold text-sm mb-2">Trailer:</p>
                                            <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                                                <iframe
                                                    className="absolute top-0 left-0 w-full h-full border-none rounded-lg"
                                                    src={getEmbedUrl(previewTrailer)}
                                                    title="Trailer Preview"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!previewPoster && !previewBackdrop && !previewTrailer && (
                                        <div className="text-center py-8 text-gray-400">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                            <p className="text-sm text-gray-500">
                                                Nhập URL để xem trước
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator className="my-6" />

                        <div className="flex justify-end gap-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/movies')}
                                disabled={loading}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {isEditMode ? 'Cập Nhật' : 'Thêm Phim'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default MovieForm;
