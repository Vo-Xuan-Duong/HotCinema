import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Search, MapPin, Target } from 'lucide-react';
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
    const [selectedCity, setSelectedCity] = useState(null); // LÆ°u slug cá»§a region
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
                const defaultRegion = regionsArray.find(r => r.name?.includes('Há»“ ChÃ­ Minh') || r.slug === 'ho-chi-minh') || regionsArray[0];
                // Sá»­ dá»¥ng slug thay vÃ¬ id
                setSelectedCity(defaultRegion.slug || defaultRegion.id);
                await loadCinemasForCity(defaultRegion.slug || defaultRegion.id);
            } else {
                notification.warning('KhÃ´ng cÃ³ dá»¯ liá»‡u khu vá»±c. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i backend.');
            }

        } catch (error) {
            console.error('Error loading initial data:', error);
            notification.error(`KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u: ${error.message}`);
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
            const cinemasData = await cinemaService.getCinemasByRegion(regionSlug, {
                page,
                size: cinemaPageSize
            });

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

            // Chá»‰ tá»± Ä‘á»™ng chá»n ráº¡p Ä‘áº§u tiÃªn khi á»Ÿ trang Ä‘áº§u tiÃªn
            if (page === 0 && cinemasArray && cinemasArray.length > 0) {
                setSelectedCinemaId(cinemasArray[0].id);
                await loadShowtimes(cinemasArray[0].id, selectedDate.format('YYYY-MM-DD'));
            } else if (page === 0) {
                setSelectedCinemaId(null);
                setShowtimes([]);
            } else {
                // Khi Ä‘á»•i trang, khÃ´ng tá»± Ä‘á»™ng chá»n ráº¡p má»›i
                // Giá»¯ nguyÃªn selectedCinemaId náº¿u ráº¡p Ä‘Ã³ váº«n cÃ²n trong danh sÃ¡ch
                if (selectedCinemaId && !cinemasArray.find(c => c.id === selectedCinemaId)) {
                    // Náº¿u ráº¡p Ä‘Ã£ chá»n khÃ´ng cÃ²n trong trang má»›i, chá»n ráº¡p Ä‘áº§u tiÃªn
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
            notification.error(`KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ráº¡p: ${error.message}`);
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
            const showtimesData = await showtimeService.getShowtimesByDateAndCinema(date, cinemaId, {
                page,
                size: 20
            });

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
        setCinemaSearchText(''); // Reset search khi Ä‘á»•i khu vá»±c
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
        if (!cinemaSearchText.trim()) {
            return cinemas;
        }
        const searchLower = cinemaSearchText.toLowerCase().trim();
        return cinemas.filter(cinema =>
            cinema.name?.toLowerCase().includes(searchLower) ||
            cinema.address?.toLowerCase().includes(searchLower)
        );
    }, [cinemas, cinemaSearchText]);

    if (loading) {
        return <ContentLoader message="Äang táº£i lá»‹ch chiáº¿u..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-6 overflow-x-hidden">
            <div className="max-w-[1200px] mx-auto px-6 mb-16 pt-16">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 md:p-9">
                    <h2 className="text-center text-3xl font-bold mb-5 text-gray-900">
                        Lá»‹ch chiáº¿u phim
                    </h2>

                    <Card className="mb-6 rounded-xl shadow-md border border-gray-200">
                        <div className="flex justify-between items-center flex-wrap gap-5 p-4">
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold text-gray-700 flex items-center">
                                        <MapPin className="mr-1.5 h-4 w-4" />
                                        ThÃ nh phá»‘
                                    </p>
                                    <Select
                                        value={selectedCity || ''}
                                        onValueChange={handleCityChange}
                                    >
                                        <SelectTrigger className="w-[250px]">
                                            <SelectValue placeholder="Chá»n khu vá»±c" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.isArray(cities) && cities.map(region => (
                                                <SelectItem key={region.id} value={region.slug || region.id.toString()}>
                                                    {region.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (navigator.geolocation) {
                                            navigator.geolocation.getCurrentPosition(
                                                (position) => {
                                                    notification.success('ÄÃ£ láº¥y vá»‹ trÃ­ cá»§a báº¡n');
                                                },
                                                (error) => {
                                                    notification.warning('KhÃ´ng thá»ƒ láº¥y vá»‹ trÃ­. Vui lÃ²ng cho phÃ©p truy cáº­p vá»‹ trÃ­.');
                                                }
                                            );
                                        } else {
                                            notification.error('TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ geolocation');
                                        }
                                    }}
                                    className="h-10 flex items-center gap-1.5 rounded-lg"
                                >
                                    <Target className="h-4 w-4" />
                                    Gáº§n báº¡n
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="flex gap-6 items-start flex-col lg:flex-row">
                        <Card className="w-full lg:w-80 rounded-xl shadow-md border border-gray-200 flex flex-col min-h-[600px]">
                            <div className="mb-4 p-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="TÃ¬m theo tÃªn ráº¡p ..."
                                        value={cinemaSearchText}
                                        onChange={(e) => setCinemaSearchText(e.target.value)}
                                        className="pl-10 h-10 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-4 pb-4">
                                {!Array.isArray(cinemas) || cinemas.length === 0 ? (
                                    <div className="py-10 text-center text-gray-500">
                                        <p>KhÃ´ng cÃ³ ráº¡p nÃ o</p>
                                    </div>
                                ) : filteredCinemas.length === 0 ? (
                                    <div className="py-10 text-center text-gray-500">
                                        <p>KhÃ´ng tÃ¬m tháº¥y ráº¡p phÃ¹ há»£p</p>
                                    </div>
                                ) : (
                                    filteredCinemas.map(cinema => (
                                        <div
                                            key={cinema.id}
                                            className={`flex justify-between items-center p-3 text-sm rounded-lg cursor-pointer transition-all duration-300 mb-2 border ${selectedCinemaId === cinema.id
                                                ? 'bg-gradient-to-r from-primary to-red-700 text-white border-primary shadow-lg font-semibold'
                                                : 'bg-gray-50 text-gray-900 border-transparent hover:bg-gray-100 hover:translate-x-1 hover:border-gray-200 hover:shadow-md'
                                                }`}
                                            onClick={() => handleCinemaSelect(cinema.id)}
                                        >
                                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                                <span className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap leading-tight">
                                                    {cinema.name}
                                                </span>
                                                {cinema.address && (
                                                    <span className={`text-xs overflow-hidden text-ellipsis whitespace-nowrap leading-tight ${selectedCinemaId === cinema.id ? 'text-white/85' : 'text-gray-500'
                                                        }`}>
                                                        {cinema.address}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`ml-2 text-xl ${selectedCinemaId === cinema.id ? 'opacity-100' : 'opacity-40'
                                                }`}>â€º</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            {totalCinemas > cinemaPageSize && (
                                <div className="mt-3 pt-3 border-t border-gray-200 text-center px-4 pb-4">
                                    <Pagination
                                        page={cinemaPage + 1}
                                        totalItems={totalCinemas}
                                        itemsPerPage={cinemaPageSize}
                                        onPageChange={(page) => {
                                            loadCinemasForCity(selectedCity, page - 1);
                                            // Scroll to top of cinema list
                                            const cinemaList = document.querySelector('.flex-1.overflow-y-auto');
                                            if (cinemaList) {
                                                cinemaList.scrollTo({ top: 0, behavior: 'smooth' });
                                            }
                                        }}
                                        allowPageSizeChange={false}
                                        showTotal={(total, range) =>
                                            `${range[0]}-${range[1]} / ${total} ráº¡p`
                                        }
                                    />
                                </div>
                            )}
                        </Card>

                        <Card className="flex-1 min-w-0 rounded-xl shadow-md border border-gray-200">
                            <div className="p-5">
                                {selectedCinema && (
                                    <Card className="mb-5 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center gap-3 flex-wrap p-4">
                                            <div className="flex-1 flex flex-col gap-2">
                                                <h4 className="m-0 font-bold text-gray-900 text-lg">
                                                    {selectedCinema.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <MapPin className="mr-1 h-4 w-4" />
                                                    {selectedCinema.address || 'Äá»‹a chá»‰ Ä‘ang cáº­p nháº­t'}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCinema.address || '')}`, '_blank')}
                                                className="h-auto flex items-center gap-1.5 rounded-lg"
                                            >
                                                <MapPin className="h-4 w-4 mr-1" />
                                                Báº£n Ä‘á»“
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                <div className="flex gap-2.5 overflow-x-auto pb-4 mb-3 border-b-2 border-gray-200">
                                    {Array.isArray(availableDates) && availableDates.map((d, idx) => {
                                        const isSelected = selectedDate.format('DD/MM') === d.fullDate.format('DD/MM');
                                        return (
                                            <div
                                                key={idx}
                                                className={`min-w-[60px] rounded-lg p-2 text-center cursor-pointer transition-all duration-300 text-sm leading-tight flex-shrink-0 ${isSelected
                                                    ? 'bg-gradient-to-br from-primary to-red-700 border-2 border-primary shadow-lg transform -translate-y-0.5 text-white'
                                                    : 'bg-gray-50 border border-gray-200 text-gray-900 hover:border-primary hover:bg-primary/5 hover:-translate-y-0.5'
                                                    }`}
                                                onClick={() => handleDateChange(d.fullDate)}
                                            >
                                                <div className={`text-lg font-bold leading-none mb-1 ${isSelected ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                    {d.dayNumber}
                                                </div>
                                                <div className={`text-xs uppercase font-semibold ${isSelected ? 'text-white font-bold' : 'text-gray-500'
                                                    }`}>
                                                    {d.isToday ? 'HÃ´m nay' : d.fullDate.format('dd')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex flex-col gap-0">
                                    {showtimes.length === 0 ? (
                                        <Card className="my-5 rounded-xl text-center border border-gray-200">
                                            <div className="py-10 px-5 flex flex-col items-center justify-center gap-2">
                                                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                                                <h4 className="text-gray-500 text-lg font-semibold">KhÃ´ng cÃ³ suáº¥t chiáº¿u</h4>
                                                <p className="text-gray-400">Vui lÃ²ng chá»n ngÃ y khÃ¡c hoáº·c ráº¡p khÃ¡c</p>
                                            </div>
                                        </Card>
                                    ) : (
                                        Array.isArray(showtimes) && showtimes.map((item, index) => {
                                            const movie = item.movie;
                                            if (!movie) return null;

                                            return (
                                                <div
                                                    key={movie.id || index}
                                                    className="flex gap-5 p-4 rounded-xl mb-4 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                                >
                                                    <div className="w-[140px] h-[200px] rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                                                        <img
                                                            src={movie.posterUrl || 'https://via.placeholder.com/150x220?text=No+Image'}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover block transition-transform duration-300 hover:scale-105"
                                                        />
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-4 min-w-0">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="text-xl font-bold text-gray-900 leading-tight m-0">
                                                                {movie.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 font-medium leading-relaxed">
                                                                {movie.duration || '120 phÃºt'} â€¢ {movie.genre || 'Phim'}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2.5 flex-wrap">
                                                            {Array.isArray(item.showtimes) && item.showtimes.map((showtime, idx) => (
                                                                <button
                                                                    key={showtime.id || idx}
                                                                    className="bg-white border-2 border-primary text-primary px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg min-w-[75px] text-center flex flex-col items-center justify-center gap-0.5 relative overflow-hidden font-semibold hover:bg-gradient-to-br hover:from-primary hover:to-red-700 hover:text-white hover:-translate-y-1 hover:border-primary active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    onClick={() => handleBooking(
                                                                        movie.id,
                                                                        showtime.id,
                                                                        showtime
                                                                    )}
                                                                    disabled={showtime.status === 'CANCELLED' || showtime.status === 'SOLD_OUT'}
                                                                    title={`${showtime.roomName || 'PhÃ²ng chiáº¿u'} - ${showtime.formatType || '2D'} - ${showtime.price?.toLocaleString('vi-VN') || '0'}Ä‘`}
                                                                >
                                                                    <div className="text-sm font-bold leading-tight">
                                                                        {showtime.startTime?.substring(0, 5) || '--:--'}
                                                                    </div>
                                                                    {showtime.formatType && (
                                                                        <div className="text-[9px] font-medium opacity-75 leading-tight">
                                                                            {showtime.formatType}
                                                                        </div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {totalShowtimes > 20 && (
                                    <div className="flex justify-center items-center mt-8 pb-5 border-t border-gray-200 pt-6">
                                        <Pagination
                                            page={showtimePage + 1}
                                            totalItems={totalShowtimes}
                                            itemsPerPage={20}
                                            onPageChange={(page) => {
                                                loadShowtimes(selectedCinemaId, selectedDate.format('YYYY-MM-DD'), page - 1);
                                            }}
                                            allowPageSizeChange={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
