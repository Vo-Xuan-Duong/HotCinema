import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Search, MapPin, Target, Calendar, Clock, Film, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import ContentLoader from '@/components/Loading/ContentLoader';
import useNotification from '@/hooks/useNotification';
import cinemaService from '@/services/cinemaService';
import regionService from '@/services/regionService';
import showtimeService from '@/services/showtimeService';

dayjs.locale('vi');

const Schedule = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedCity, setSelectedCity] = useState(null); 
    const [selectedCinemaId, setSelectedCinemaId] = useState(null);

    const [cities, setCities] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [availableDates] = useState(getNext7Days());
    const [cinemaSearchText, setCinemaSearchText] = useState('');

    const [cinemaPage, setCinemaPage] = useState(0);
    const [cinemaPageSize] = useState(20);
    const [totalCinemas, setTotalCinemas] = useState(0);
    const [showtimePage, setShowtimePage] = useState(0);
    const [totalShowtimes, setTotalShowtimes] = useState(0);

    function getNext7Days() {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = dayjs().add(i, 'day');
            dates.push({
                date: date.format('DD/M'),
                day: date.format('ddd').toUpperCase(),
                dayNumber: date.format('DD'),
                month: date.format('MM'),
                fullDate: date,
                isToday: i === 0
            });
        }
        return dates;
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const regionsData = await regionService.getRegionsAllNoPage();
            const regionsArray = Array.isArray(regionsData) ? regionsData :
                (regionsData?.data ? regionsData.data :
                    (regionsData?.content ? regionsData.content : []));

            setCities(regionsArray);

            if (regionsArray && regionsArray.length > 0) {
                const defaultRegion = regionsArray.find(r => r.name?.includes('Hồ Chí Minh') || r.slug === 'ho-chi-minh') || regionsArray[0];
                setSelectedCity(defaultRegion.slug || defaultRegion.id);
                await loadCinemasForCity(defaultRegion.slug || defaultRegion.id);
            } else {
                notification.warning('Không có dữ liệu khu vực.');
            }
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCity) {
            loadCinemasForCity(selectedCity);
        }
    }, [selectedCity]);

    const loadCinemasForCity = async (regionSlug, page = 0) => {
        try {
            const cinemasData = await cinemaService.getCinemasByRegion(regionSlug, { page, size: cinemaPageSize });
            let cinemasArray;
            let totalItems = 0;

            if (Array.isArray(cinemasData)) {
                cinemasArray = cinemasData;
                totalItems = cinemasData.length;
            } else if (cinemasData?.data?.content) {
                cinemasArray = cinemasData.data.content;
                totalItems = cinemasData.data.totalElements || cinemasData.data.total || 0;
            } else if (cinemasData?.data) {
                cinemasArray = Array.isArray(cinemasData.data) ? cinemasData.data : [];
                totalItems = cinemasArray.length;
            } else if (cinemasData?.content) {
                cinemasArray = cinemasData.content;
                totalItems = cinemasData.totalElements || cinemasData.total || cinemasArray.length;
            } else {
                cinemasArray = [];
            }

            setTotalCinemas(totalItems);
            setCinemaPage(page);
            setCinemas(cinemasArray);

            if (page === 0 && cinemasArray && cinemasArray.length > 0) {
                setSelectedCinemaId(cinemasArray[0].id);
                await loadShowtimes(cinemasArray[0].id, selectedDate.format('YYYY-MM-DD'));
            } else if (page === 0) {
                setSelectedCinemaId(null);
                setShowtimes([]);
            } else {
                if (selectedCinemaId && !cinemasArray.find(c => c.id === selectedCinemaId)) {
                    if (cinemasArray.length > 0) {
                        setSelectedCinemaId(cinemasArray[0].id);
                        await loadShowtimes(cinemasArray[0].id, selectedDate.format('YYYY-MM-DD'));
                    } else {
                        setSelectedCinemaId(null);
                        setShowtimes([]);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading cinemas:', error);
            if (page === 0) {
                setCinemas([]);
                setSelectedCinemaId(null);
                setShowtimes([]);
            }
        }
    };

    useEffect(() => {
        if (selectedCinemaId && selectedDate) {
            setShowtimePage(0);
            loadShowtimes(selectedCinemaId, selectedDate.format('YYYY-MM-DD'), 0);
        }
    }, [selectedCinemaId, selectedDate]);

    const loadShowtimes = async (cinemaId, date, page = 0) => {
        try {
            const showtimesData = await showtimeService.getShowtimesByDateAndCinema(date, cinemaId, { page, size: 20 });
            let showtimesArray;
            let totalItems = 0;

            if (Array.isArray(showtimesData)) {
                showtimesArray = showtimesData;
                totalItems = showtimesData.length;
            } else if (showtimesData?.data?.content) {
                showtimesArray = showtimesData.data.content;
                totalItems = showtimesData.data.totalElements || showtimesData.data.total || 0;
            } else if (showtimesData?.data) {
                showtimesArray = Array.isArray(showtimesData.data) ? showtimesData.data : [];
                totalItems = showtimesArray.length;
            } else if (showtimesData?.content) {
                showtimesArray = showtimesData.content;
                totalItems = showtimesData.totalElements || showtimesData.total || showtimesArray.length;
            } else {
                showtimesArray = [];
            }

            setTotalShowtimes(totalItems);
            setShowtimePage(page);

            const transformedShowtimes = showtimesArray.map(item => {
                const allShowtimes = [];
                if (item.formats && Array.isArray(item.formats)) {
                    item.formats.forEach(format => {
                        if (format.showtimes && Array.isArray(format.showtimes)) {
                            format.showtimes.forEach(showtime => {
                                allShowtimes.push({
                                    id: showtime.showtimeId,
                                    startTime: showtime.startTime,
                                    endTime: showtime.endTime,
                                    roomId: showtime.roomId,
                                    roomName: showtime.roomName,
                                    price: showtime.price,
                                    status: showtime.status,
                                    formatType: format.formatType
                                });
                            });
                        }
                    });
                }

                return {
                    movie: {
                        id: item.movieId,
                        title: item.movieTitle,
                        posterUrl: item.posterUrl || item.poster || item.moviePoster,
                        duration: item.duration || item.movieDuration,
                        genre: item.genre || item.movieGenre
                    },
                    showtimes: allShowtimes
                };
            });

            setShowtimes(transformedShowtimes);
        } catch (error) {
            console.error('Error loading showtimes:', error);
            if (page === 0) {
                setShowtimes([]);
            }
        }
    };

    const handleCityChange = (regionSlug) => {
        setSelectedCity(regionSlug);
        setSelectedCinemaId(null);
        setShowtimes([]);
        setCinemaPage(0);
        setCinemaSearchText(''); 
    };

    const handleCinemaSelect = (cinemaId) => {
        setSelectedCinemaId(cinemaId);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleBooking = (movieId, showtimeId, showtime) => {
        navigate(`/booking/seats/${showtimeId}`, {
            state: {
                movieId,
                showtimeId,
                cinemaId: selectedCinemaId,
                date: selectedDate.format('YYYY-MM-DD'),
                time: showtime.startTime
            }
        });
    };

    const selectedCinema = Array.isArray(cinemas) ? cinemas.find(c => c.id === selectedCinemaId) : null;

    const filteredCinemas = useMemo(() => {
        if (!cinemaSearchText.trim()) return cinemas;
        const searchLower = cinemaSearchText.toLowerCase().trim();
        return cinemas.filter(cinema =>
            cinema.name?.toLowerCase().includes(searchLower) ||
            cinema.address?.toLowerCase().includes(searchLower)
        );
    }, [cinemas, cinemaSearchText]);

    if (loading) {
        return <ContentLoader message="Đang tải lịch chiếu..." />;
    }

    return (
        <div className="min-h-screen bg-background relative overflow-x-hidden">
            {/* Cinematic Background */}
            <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-primary/10 via-background to-background z-0 pointer-events-none"></div>
            <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[150px] mix-blend-screen animate-pulse pointer-events-none z-0"></div>
            <div className="absolute top-[10%] -right-[10%] w-[50vw] h-[50vw] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000 pointer-events-none z-0"></div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-20 pt-28 relative z-10">
                {/* Hero Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/80 to-primary">
                        LỊCH CHIẾU PHIM
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Chọn rạp và suất chiếu yêu thích để tận hưởng không gian điện ảnh tuyệt đỉnh
                    </p>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left Column: Location & Cinemas (Modern Horizontal/Vertical Flow) */}
                    <div className="w-full xl:w-[400px] flex flex-col gap-6 flex-shrink-0">
                        {/* Filter Glass Panel */}
                        <div className="bg-card/30 backdrop-blur-3xl border border-white/10 dark:border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground relative z-10">
                                <MapPin className="text-primary w-5 h-5" />
                                Khu Vực
                            </h3>
                            <Select value={selectedCity || ''} onValueChange={handleCityChange}>
                                <SelectTrigger className="w-full h-12 bg-background/50 border-white/10 rounded-xl text-md focus:ring-primary relative z-10">
                                    <SelectValue placeholder="Chọn khu vực" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-white/10">
                                    {Array.isArray(cities) && cities.map(region => (
                                        <SelectItem key={region.id} value={region.slug || region.id.toString()}>
                                            {region.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="mt-6 relative z-10">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Tìm rạp chiếu phim..."
                                        value={cinemaSearchText}
                                        onChange={(e) => setCinemaSearchText(e.target.value)}
                                        className="pl-12 h-12 rounded-xl bg-background/50 border-white/10 focus-visible:ring-primary transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Cinema List Modern Grid */}
                        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-xl flex flex-col h-[500px] xl:h-[calc(100vh-350px)]">
                            <h3 className="text-lg font-bold mb-4 px-2 flex items-center gap-2">
                                <Film className="w-5 h-5 text-primary" />
                                Danh Sách Rạp
                            </h3>
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
                                {!Array.isArray(cinemas) || cinemas.length === 0 ? (
                                    <div className="py-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <AlertCircle className="w-8 h-8 opacity-50" />
                                        <p>Không có rạp nào</p>
                                    </div>
                                ) : filteredCinemas.length === 0 ? (
                                    <div className="py-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                                        <Search className="w-8 h-8 opacity-50" />
                                        <p>Không tìm thấy rạp phù hợp</p>
                                    </div>
                                ) : (
                                    filteredCinemas.map(cinema => (
                                        <div
                                            key={cinema.id}
                                            className={`group relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 border ${selectedCinemaId === cinema.id
                                                ? 'bg-gradient-to-br from-primary/20 to-red-900/40 border-primary/50 shadow-[0_0_20px_rgba(229,9,20,0.15)]'
                                                : 'bg-background/40 border-white/5 hover:bg-white/5 hover:border-white/10'
                                                }`}
                                            onClick={() => handleCinemaSelect(cinema.id)}
                                        >
                                            {selectedCinemaId === cinema.id && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_rgba(229,9,20,0.8)]"></div>
                                            )}
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 className={`font-bold text-base truncate transition-colors ${selectedCinemaId === cinema.id ? 'text-primary' : 'text-foreground group-hover:text-primary/80'}`}>
                                                        {cinema.name}
                                                    </h4>
                                                    {cinema.address && (
                                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                                            {cinema.address}
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${selectedCinemaId === cinema.id ? 'text-primary translate-x-1' : 'text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {totalCinemas > cinemaPageSize && (
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-center">
                                    <Pagination
                                        page={cinemaPage + 1}
                                        totalItems={totalCinemas}
                                        itemsPerPage={cinemaPageSize}
                                        onPageChange={(page) => {
                                            loadCinemasForCity(selectedCity, page - 1);
                                            const cinemaList = document.querySelector('.custom-scrollbar');
                                            if (cinemaList) cinemaList.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        allowPageSizeChange={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dates & Showtimes */}
                    <div className="flex-1 flex flex-col gap-6 min-w-0">
                        {/* Dates Selector - Premium Horizontal Scroll */}
                        <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-3xl p-4 shadow-xl">
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-bold">Chọn Ngày</h3>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                                {Array.isArray(availableDates) && availableDates.map((d, idx) => {
                                    const isSelected = selectedDate.format('DD/MM') === d.fullDate.format('DD/MM');
                                    return (
                                        <div
                                            key={idx}
                                            className={`min-w-[80px] sm:min-w-[100px] h-24 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 flex-shrink-0 relative overflow-hidden group ${isSelected
                                                ? 'bg-gradient-to-br from-primary to-red-600 shadow-[0_10px_25px_rgba(229,9,20,0.3)] border-none transform -translate-y-1'
                                                : 'bg-background/60 border border-white/10 hover:border-primary/50 hover:bg-primary/5'
                                                }`}
                                            onClick={() => handleDateChange(d.fullDate)}
                                        >
                                            {/* Glow effect on hover */}
                                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                                            
                                            <span className={`text-sm font-medium z-10 ${isSelected ? 'text-white/90' : 'text-muted-foreground'}`}>
                                                {d.month}
                                            </span>
                                            <span className={`text-3xl font-black z-10 tracking-tighter ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                {d.dayNumber}
                                            </span>
                                            <span className={`text-xs uppercase font-bold z-10 tracking-widest mt-1 ${isSelected ? 'text-white/90' : 'text-muted-foreground group-hover:text-primary'}`}>
                                                {d.isToday ? 'HÔM NAY' : d.fullDate.format('dd')}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cinema Info Header */}
                        {selectedCinema && (
                            <div className="flex items-center justify-between gap-4 bg-primary/5 border border-primary/20 rounded-2xl p-5 backdrop-blur-md">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-1">{selectedCinema.name}</h2>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {selectedCinema.address || 'Đang cập nhật'}
                                    </p>
                                </div>
                                <Button
                                    variant="default"
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCinema.address || '')}`, '_blank')}
                                    className="hidden sm:flex rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                                >
                                    Chỉ Đường
                                </Button>
                            </div>
                        )}

                        {/* Showtimes List */}
                        <div className="flex flex-col gap-5">
                            {showtimes.length === 0 ? (
                                <div className="bg-card/20 backdrop-blur-xl border border-white/5 rounded-3xl py-20 px-5 flex flex-col items-center justify-center text-center">
                                    <div className="w-24 h-24 bg-background/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
                                        <Film className="w-10 h-10 text-muted-foreground opacity-50" />
                                    </div>
                                    <h4 className="text-2xl font-bold mb-2">Hôm nay chưa có suất chiếu</h4>
                                    <p className="text-muted-foreground max-w-sm">Vui lòng chọn ngày khác hoặc thử tìm rạp khác trong khu vực của bạn.</p>
                                </div>
                            ) : (
                                Array.isArray(showtimes) && showtimes.map((item, index) => {
                                    const movie = item.movie;
                                    if (!movie) return null;

                                    return (
                                        <div
                                            key={movie.id || index}
                                            className="group bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:border-white/20 flex flex-col sm:flex-row relative"
                                        >
                                            {/* Movie Poster Image (Absolute blurred background) */}
                                            <div 
                                                className="absolute inset-0 z-0 opacity-10 blur-3xl scale-110 transition-opacity duration-500 group-hover:opacity-20"
                                                style={{ backgroundImage: `url(${movie.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                            />

                                            {/* Movie Poster */}
                                            <div className="sm:w-[220px] shrink-0 relative z-10 overflow-hidden bg-black">
                                                <div className="aspect-[2/3] w-full relative">
                                                    <img
                                                        src={movie.posterUrl || '/brand-placeholder.svg'}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                </div>
                                            </div>

                                            {/* Movie Info & Showtimes */}
                                            <div className="flex-1 p-6 sm:p-8 flex flex-col relative z-10">
                                                <div className="mb-6">
                                                    <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                                                        {movie.title}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-medium">
                                                        <span className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border border-white/5">
                                                            <Clock className="w-4 h-4 text-primary" />
                                                            {movie.duration || '120 phút'}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 bg-background/50 px-3 py-1 rounded-full border border-white/5">
                                                            <Film className="w-4 h-4 text-primary" />
                                                            {movie.genre || 'Phim rạp'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <div className="text-sm font-semibold mb-3 text-white/80 uppercase tracking-wider flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                        Suất Chiếu
                                                    </div>
                                                    <div className="flex gap-3 flex-wrap">
                                                        {Array.isArray(item.showtimes) && item.showtimes.map((showtime, idx) => (
                                                            <button
                                                                key={showtime.id || idx}
                                                                className="relative overflow-hidden bg-background/80 backdrop-blur-md border border-white/10 text-foreground px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(229,9,20,0.2)] hover:border-primary/50 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                                                                onClick={() => handleBooking(movie.id, showtime.id, showtime)}
                                                                disabled={showtime.status === 'CANCELLED' || showtime.status === 'SOLD_OUT'}
                                                            >
                                                                {/* Button Hover Gradient */}
                                                                <div className="absolute inset-0 bg-gradient-to-br from-primary to-red-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 z-0"></div>
                                                                
                                                                <div className="relative z-10 flex flex-col items-center">
                                                                    <span className="text-lg font-bold group-hover/btn:text-white transition-colors">
                                                                        {showtime.startTime?.substring(0, 5) || '--:--'}
                                                                    </span>
                                                                    {showtime.formatType && (
                                                                        <span className="text-[10px] font-black tracking-widest text-primary group-hover/btn:text-white/80 transition-colors mt-0.5">
                                                                            {showtime.formatType}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {totalShowtimes > 20 && (
                            <div className="flex justify-center items-center mt-8 pb-5">
                                <Pagination
                                    page={showtimePage + 1}
                                    totalItems={totalShowtimes}
                                    itemsPerPage={20}
                                    onPageChange={(page) => loadShowtimes(selectedCinemaId, selectedDate.format('YYYY-MM-DD'), page - 1)}
                                    allowPageSizeChange={false}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
