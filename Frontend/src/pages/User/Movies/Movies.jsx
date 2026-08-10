import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Play, Calendar, Clock, Star, Heart, Share2, Ticket, Filter, Grid, List, SortAsc, SortDesc, ArrowUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { StarRating } from '@/components/ui/star-rating';
import { Pagination } from '@/components/ui/pagination';
import { Empty } from '@/components/ui/empty';
import { Tooltip } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { BadgeRibbon } from '@/components/ui/badge-ribbon';
import { Badge } from '@/components/ui/badge-count';
import GlobalBackTop from '@/components/GlobalBackTop/GlobalBackTop';
import movieService from '@/services/movieService';
import genreService from '@/services/genreService';
import ContentLoader from '@/components/Loading/ContentLoader';

const Movies = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState(location.state?.defaultFilter || 'all');
    const [selectedYear, setSelectedYear] = useState('all');
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');
    const [viewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [totalMovies, setTotalMovies] = useState(0);
    const [likedMovies, setLikedMovies] = useState(new Set());
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const genreList = await genreService.getAllGenres();
                setGenres(genreList);
            } catch (error) {
                console.error('Failed to load genres:', error);
            }
        };
        loadGenres();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchText);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchText]);


    useEffect(() => {
        loadMovies();
    }, [currentPage, pageSize, sortBy, sortOrder, debouncedSearch, selectedGenre, selectedYear]);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 150);
        return () => clearTimeout(timer);
    }, [currentPage, pageSize]);


    useEffect(() => {
        if (debouncedSearch || selectedGenre !== 'all' || selectedStatus !== 'all' || selectedYear !== 'all') {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                loadMovies();
            }
        }
    }, [debouncedSearch, selectedGenre, selectedStatus, selectedYear]);

    const loadMovies = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage - 1,
                size: pageSize,
                sort: `${sortBy},${sortOrder}`
            };

            if (debouncedSearch) {
                params.keyword = debouncedSearch;
            }

            if (selectedGenre !== 'all') {
                params.genre = selectedGenre;
            }

            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            if (selectedYear !== 'all') {
                params.releaseYear = selectedYear;
            }

            const response = await movieService.searchPage(params);

            let data, total;
            const actualData = response?.data || response;

            if (Array.isArray(actualData)) {
                data = actualData;
                total = actualData.length;
            } else if (actualData?.content) {
                data = actualData.content;
                total = actualData.totalElements || actualData.total || actualData.content.length;
            } else {
                data = [];
                total = 0;
            }

            const processed = data.map((m, index) => {
                let formattedReleaseDate = '';
                if (m.releaseDate) {
                    if (typeof m.releaseDate === 'string') {
                        const date = new Date(m.releaseDate);
                        if (!isNaN(date.getTime())) {
                            formattedReleaseDate = date.toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                        } else {
                            formattedReleaseDate = m.releaseDate;
                        }
                    } else if (m.releaseDate.year && m.releaseDate.month && m.releaseDate.day) {
                        formattedReleaseDate = `${String(m.releaseDate.day).padStart(2, '0')}/${String(m.releaseDate.month).padStart(2, '0')}/${m.releaseDate.year}`;
                    }
                }

                let formattedDuration = '';
                if (m.durationFormatted) {
                    formattedDuration = m.durationFormatted;
                } else if (m.durationMinutes) {
                    formattedDuration = `${m.durationMinutes}p`;
                }

                return {
                    ...m,
                    id: m.id ?? m._id ?? index + 1,
                    poster: m.posterUrl || m.posterPath || '/brand-placeholder.svg',
                    backdrop: m.backdropUrl || m.backdropPath || m.poster || m.posterUrl || '/brand-placeholder.svg',
                    posterPath: m.posterUrl || m.posterPath,
                    backdropPath: m.backdropUrl || m.backdropPath,
                    averageRating: m.averageRating ? parseFloat(m.averageRating) : 0,
                    rating: m.rating || '',
                    overview: m.overview || m.description || '',
                    genre: m.genres || m.genre || [],
                    duration: m.durationMinutes || m.duration || m.runtime || null,
                    durationFormatted: formattedDuration,
                    releaseDate: formattedReleaseDate,
                    releaseDateRaw: m.releaseDate,
                    status: m.status,
                    popularity: m.popularity ?? 0,
                    views: m.views ?? 0,
                };
            });

            setFilteredMovies(processed);
            setTotalMovies(total);
        } catch (err) {
            console.error('Failed to fetch movies', err);
            setFilteredMovies([]);
            setTotalMovies(0);
        } finally {
            setLoading(false);
        }
    };

    const getMovieStatus = (movie) => {
        if (movie.status) {
            if (movie.status === 'COMING_SOON') return 'upcoming';
            if (movie.status === 'NOW_SHOWING') return 'now-showing';
            if (movie.status === 'ARCHIVED') return 'archived';
        }

        if (!movie.releaseDateRaw) return 'now-showing';

        let releaseYear;
        if (typeof movie.releaseDateRaw === 'string') {
            const date = new Date(movie.releaseDateRaw);
            releaseYear = !isNaN(date.getTime()) ? date.getFullYear() : null;
        } else if (movie.releaseDateRaw.year) {
            releaseYear = movie.releaseDateRaw.year;
        }

        if (!releaseYear) return 'now-showing';

        const currentYear = new Date().getFullYear();
        return releaseYear > currentYear ? 'upcoming' : 'now-showing';
    };


    const handleLike = (movieId, event) => {
        event.preventDefault();
        event.stopPropagation();
        const newLikedMovies = new Set(likedMovies);
        if (newLikedMovies.has(movieId)) {
            newLikedMovies.delete(movieId);
        } else {
            newLikedMovies.add(movieId);
        }
        setLikedMovies(newLikedMovies);
    };

    const handleShare = (movie, event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log('Sharing movie:', movie.title);
    };


    const resetFilters = () => {
        setSearchText('');
        setSelectedGenre('all');
        setSelectedStatus('all');
        setSelectedYear('all');
        setSortBy('createdAt');
        setSortOrder('desc');
    };

    const formatGenre = (genre) => {
        if (!genre) return 'Chưa phân loại';

        if (typeof genre === 'string') {
            const cleaned = genre.replace(/Phim\s+/g, '');
            const genres = cleaned.split(',').map(g => g.trim());
            return genres.length > 2 ? `${genres[0]}, ${genres[1]}...` : cleaned;
        }

        if (typeof genre === 'object' && genre.name) {
            const cleaned = genre.name.replace(/Phim\s+/g, '');
            return cleaned;
        }

        if (Array.isArray(genre)) {
            const cleanedGenres = genre
                .map(g => {
                    const name = typeof g === 'string' ? g : g?.name;
                    return name ? name.replace(/Phim\s+/g, '') : null;
                })
                .filter(Boolean);

            if (cleanedGenres.length === 0) return 'Chưa phân loại';
            if (cleanedGenres.length > 2) {
                return `${cleanedGenres[0]}, ${cleanedGenres[1]}...`;
            }
            return cleanedGenres.join(', ');
        }

        return 'Chưa phân loại';
    };

    const paginatedMovies = filteredMovies;

    const FilterSection = () => (
        <Card className="mb-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 dark:border-white/5 bg-card/40 backdrop-blur-2xl relative z-[10] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Tìm kiếm phim..." className="bg-background/50 border-white/10 h-10 rounded-xl focus-visible:ring-primary"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="pl-10 h-9"
                    />
                </div>
                <Select
                    value={selectedGenre}
                    onValueChange={setSelectedGenre}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Tất cả thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả thể loại</SelectItem>
                        {genres.map(genre => (
                            <SelectItem key={genre.id} value={genre.name}>
                                {genre.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Tất cả phim" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả phim</SelectItem>
                        <SelectItem value="NOW_SHOWING">Đang chiếu</SelectItem>
                        <SelectItem value="COMING_SOON">Sắp chiếu</SelectItem>
                        <SelectItem value="ARCHIVED">Đã chiếu</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                >
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Tất cả năm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả năm</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={resetFilters} className="h-9 w-full">
                    Đặt lại
                </Button>
            </div>
        </Card>
    );

    const MovieCard = ({ movie }) => {
        const status = getMovieStatus(movie);
        const statusText = status === 'upcoming' ? 'Sắp chiếu' : status === 'archived' ? 'Đã chiếu' : 'Đang chiếu';
        const statusColor = status === 'upcoming' ? 'blue' : status === 'archived' ? 'default' : 'volcano';

        return (
            <BadgeRibbon text={statusText} color={statusColor}>
                <Card className="group rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_15px_30px_rgba(229,9,20,0.15)] hover:-translate-y-2 hover:border-primary/50 cursor-pointer bg-card/40 backdrop-blur-md border border-white/10"
                    onClick={() => navigate(`/movies/${movie.id}`)}
                >
                    <div className="relative group overflow-hidden">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-[300px] object-cover transition-all duration-500 ease-out group-hover:scale-110 group-hover:brightness-75"
                        />
                        <div className="absolute top-3 left-3 bg-black/80 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md shadow-lg z-10 transition-all duration-300 group-hover:bg-black/90 group-hover:scale-110 group-hover:shadow-xl">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{movie.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                    </div>
                    <div className="p-2.5">
                        <Tooltip content={movie.title}>
                            <h3 className="text-base font-semibold transition-colors duration-300 group-hover:text-primary line-clamp-1 mb-2">
                                {movie.title}
                            </h3>
                        </Tooltip>
                        <div className="space-y-1.5">
                            <StatusBadge tone="blue" className="text-xs">
                                {formatGenre(movie.genre)}
                            </StatusBadge>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {movie.durationFormatted || (movie.duration ? `${movie.duration}p` : 'N/A')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {movie.releaseDate || 'N/A'}
                                </span>
                            </div>
                        </div>
                        <Separator className="my-2 group-hover:border-primary/30 transition-colors duration-300" />
                        <Button
                            className="w-full h-8 text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/movies/${movie.id}`);
                            }}
                        >
                            <Ticket className="h-3 w-3 mr-1" />
                            Đặt vé ngay
                        </Button>
                    </div>
                </Card>
            </BadgeRibbon>
        );
    };

    const ListMovieCard = ({ movie }) => (
        <Card className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_10px_20px_rgba(229,9,20,0.15)] hover:border-primary/30 cursor-pointer bg-card/40 backdrop-blur-xl border border-white/10"
            onClick={() => navigate(`/movies/${movie.id}`)}
        >
            <div className="p-5">
                <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 md:col-span-3 relative">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-[200px] object-cover rounded-lg"
                        />
                        <Badge
                            count={(() => {
                                const status = getMovieStatus(movie);
                                return status === 'upcoming' ? 'Sắp chiếu' : status === 'archived' ? 'Đã chiếu' : 'Đang chiếu';
                            })()}
                            className="absolute top-1 right-1"
                        />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <h4 className="text-lg font-bold mb-2">
                            {movie.title}
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                            <StatusBadge tone="blue">{formatGenre(movie.genre)}</StatusBadge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {movie.durationFormatted || (movie.duration ? `${movie.duration} phút` : 'N/A')}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {movie.releaseDate || 'N/A'}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-0">
                            {movie.overview}
                        </p>
                    </div>
                    <div className="col-span-12 md:col-span-3 flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold text-base">{movie.averageRating?.toFixed(1) || '0.0'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {movie.views?.toLocaleString()} lượt xem
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <Button
                                className="w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/movies/${movie.id}`);
                                }}
                            >
                                <Ticket className="h-3.5 w-3.5 mr-1" />
                                Đặt vé
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleLike(movie.id, e)}
                                >
                                    <Heart
                                        className="h-3.5 w-3.5"
                                        fill={likedMovies.has(movie.id) ? "#ff4d4f" : "none"}
                                        color={likedMovies.has(movie.id) ? "#ff4d4f" : undefined}
                                    />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => handleShare(movie, e)}
                                >
                                    <Share2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    if (loading) {
        return <ContentLoader message="Đang tải danh sách phim..." />;
    }

    return (
        <div className="bg-background relative min-h-screen pb-[60px] pt-16 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute top-[20%] right-[0%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-700"></div>
            </div>
            <div className="max-w-[1200px] mx-auto px-4 relative z-10">
                {/* Hero Title */}
                <div className="text-center mb-10 pt-8">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/80 to-primary">
                        PHIM ĐANG CHIẾU & SẮP CHIẾU
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Khám phá thế giới điện ảnh đa sắc màu với những bộ phim bom tấn mới nhất
                    </p>
                </div>
                <FilterSection />

                <div className="mt-6">
                    {filteredMovies.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {paginatedMovies.map((movie) => (
                                        <MovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {paginatedMovies.map((movie) => (
                                        <ListMovieCard key={movie.id} movie={movie} />
                                    ))}
                                </div>
                            )}

                            {filteredMovies.length > 0 && (
                                <div className="mt-5 flex justify-center items-center">
                                    <Pagination
                                        page={currentPage}
                                        itemsPerPage={pageSize}
                                        totalItems={totalMovies}
                                        onPageChange={(page) => setCurrentPage(page)}
                                        onPageSizeChange={(size) => {
                                            setPageSize(size);
                                            setCurrentPage(1);
                                        }}
                                        showSizeChanger
                                        pageSizeOptions={['15', '30', '45', '60']}
                                        showQuickJumper
                                        showTotal={(total, range) =>
                                            `${range[0]}-${range[1]} của ${total} phim`
                                        }
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <Empty
                            description={
                                <div className="flex flex-col items-center gap-3">
                                    <p>Không tìm thấy phim nào phù hợp</p>
                                    <Button onClick={resetFilters}>
                                        Đặt lại bộ lọc
                                    </Button>
                                </div>
                            }
                            className="py-12"
                        />
                    )}
                </div>
            </div>

            <GlobalBackTop />
        </div>
    );
};

export default Movies;
