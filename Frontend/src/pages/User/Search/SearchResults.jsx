import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import ContentLoader from '@/components/Loading/ContentLoader';
import movieService from '@/services/movieService';
import cinemaService from '@/services/cinemaService';
import MovieCard from '@/components/MovieCard/MovieCard';

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
    const [results, setResults] = useState({
        movies: [],
        cinemas: [],
        total: 0
    });

    useEffect(() => {
        const query = searchParams.get('q');
        const type = searchParams.get('type') || 'all';
        if (query) {
            setSearchQuery(query);
            setSearchType(type);
            performSearch(query, type);
        }
    }, [searchParams]);

    const performSearch = async (query, type) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const [moviesResponse, allCinemas] = await Promise.all([
                movieService.listPage(),
                cinemaService.getAllCinemas()
            ]);

            const allMovies = Array.isArray(moviesResponse)
                ? moviesResponse
                : (moviesResponse?.content || []);

            let movieResults = [];
            let cinemaResults = [];

            if (type === 'all' || type === 'movies') {
                movieResults = allMovies.filter(movie =>
                    movie.title.toLowerCase().includes(query.toLowerCase()) ||
                    movie.genre?.toLowerCase().includes(query.toLowerCase()) ||
                    movie.director?.toLowerCase().includes(query.toLowerCase()) ||
                    (movie.cast && movie.cast.some(actor =>
                        actor.toLowerCase().includes(query.toLowerCase())
                    ))
                );
            }

            if (type === 'all' || type === 'cinemas') {
                cinemaResults = allCinemas.filter(cinema =>
                    cinema.name.toLowerCase().includes(query.toLowerCase()) ||
                    cinema.address?.toLowerCase().includes(query.toLowerCase()) ||
                    cinema.district?.toLowerCase().includes(query.toLowerCase())
                );
            }

            setResults({
                movies: movieResults,
                cinemas: cinemaResults,
                total: movieResults.length + cinemaResults.length
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        if (!value.trim()) return;
        setSearchParams({ q: value, type: searchType });
    };

    const handleTypeChange = (newType) => {
        setSearchType(newType);
        if (searchQuery) {
            setSearchParams({ q: searchQuery, type: newType });
        }
    };

    const handleMovieClick = (movieId) => {
        navigate(`/movies/${movieId}`);
    };

    const handleCinemaClick = (cinemaId) => {
        navigate(`/cinemas/${cinemaId}`);
    };

    return (
        <div className="p-6 min-h-[calc(100vh-140px)] bg-background">
            <div className="max-w-[1200px] mx-auto">
                <div className="bg-card p-6 rounded-lg shadow-md mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm phim, rạp chiếu..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                                className="pl-10 h-10 rounded-lg"
                            />
                        </div>
                        <Select
                            value={searchType}
                            onValueChange={handleTypeChange}
                        >
                            <option value="all">Tất cả</option>
                            <option value="movies">Phim</option>
                            <option value="cinemas">Rạp chiếu</option>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <ContentLoader message="Đang tìm kiếm..." />
                ) : (
                    <div className="bg-card p-6 rounded-lg shadow-md">
                        {searchQuery && (
                            <div className="mb-6 pb-4 border-b border-border">
                                <h3 className="text-foreground text-xl font-bold mb-2">
                                    Kết quả tìm kiếm cho "{searchQuery}"
                                </h3>
                                <p className="text-muted-foreground">
                                    Tìm thấy {results.total} kết quả
                                </p>
                            </div>
                        )}

                        {results.total === 0 && searchQuery ? (
                            <Empty description="Không tìm thấy kết quả nào" />
                        ) : (
                            <>
                                {results.movies.length > 0 && (
                                    <div className="mb-8 last:mb-0">
                                        <h4 className="text-foreground text-lg font-bold mb-4">
                                            Phim ({results.movies.length})
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {results.movies.map(movie => (
                                                <MovieCard
                                                    key={movie.id}
                                                    movie={movie}
                                                    onClick={() => handleMovieClick(movie.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.cinemas.length > 0 && (
                                    <div className="mb-8 last:mb-0">
                                        <h4 className="text-foreground text-lg font-bold mb-4">
                                            Rạp chiếu ({results.cinemas.length})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {results.cinemas.map(cinema => (
                                                <Card
                                                    key={cinema.id}
                                                    className="h-full rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                                                    onClick={() => handleCinemaClick(cinema.id)}
                                                >
                                                    <div className="p-4">
                                                        <h5 className="text-primary text-lg font-semibold mb-2">{cinema.name}</h5>
                                                        <div className="text-muted-foreground space-y-1 text-sm">
                                                            <div>{cinema.address}</div>
                                                            <div>{cinema.district}</div>
                                                            <div>
                                                                {cinema.rooms?.length || 0} phòng chiếu
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
