import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Star, Play, ShoppingCart, Share2, Calendar, Clock, User, MapPin, Zap, Flame, Trophy, Home, ChevronRight, ChevronDown, X, CheckCircle2, Users, Tag as TagIcon, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Empty } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Tooltip } from '@/components/ui/tooltip';
import { Avatar } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { Progress } from '@/components/ui/progress';
import { Metric } from '@/components/ui/metric';
import { useTheme } from '@/context/ThemeContext';
import useNotification from '@/hooks/useNotification';
import movieService from '@/services/movieService';
import showtimeService from '@/services/showtimeService';
import regionService from '@/services/regionService';
import LocationSelectModal from '@/components/LocationSelectModal';
import CommentsSection from '@/components/Comments/CommentsSection';
import dayjs from 'dayjs';
// import './MovieDetail.css'; // Commented out for Tailwind demo - uncomment if needed


const MovieDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const notification = useNotification();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [selectedCity, setSelectedCity] = useState('Tp. Há»“ ChÃ­ Minh');
    const [selectedCityId, setSelectedCityId] = useState(null);
    const [cities, setCities] = useState([]);
    const scheduleTabRef = useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [expandedCinema, setExpandedCinema] = useState(null);
    const [selectedChain, setSelectedChain] = useState('bhd');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [seatModalVisible, setSeatModalVisible] = useState(false);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [bookingInfo, setBookingInfo] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [expandedLocation, setExpandedLocation] = useState(null);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [trailerModalVisible, setTrailerModalVisible] = useState(false);
    const [regions, setRegions] = useState([]);
    const [selectedRegionId, setSelectedRegionId] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [nowShowingMovies, setNowShowingMovies] = useState([]);
    const [loadingNowShowing, setLoadingNowShowing] = useState(false);
    const [nowShowingPage, setNowShowingPage] = useState(0);
    const [hasMoreNowShowing, setHasMoreNowShowing] = useState(false);
    const [loadingMoreNowShowing, setLoadingMoreNowShowing] = useState(false);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(false);
    const [upcomingPage, setUpcomingPage] = useState(0);
    const [hasMoreUpcoming, setHasMoreUpcoming] = useState(false);
    const [loadingMoreUpcoming, setLoadingMoreUpcoming] = useState(false);

    // Helper function to check if movie is active (NOW_SHOWING)
    const isMovieActive = (movie) => {
        if (!movie) return false;
        return movie.status === 'NOW_SHOWING' || movie.isActive === true;
    };

    // Fetch regions from API
    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const regionsData = await regionService.getAllRegions();
                console.log('Regions data from API:', regionsData);

                // Handle if API returns array directly or wrapped in object
                const regionsArray = Array.isArray(regionsData.data) ? regionsData.data : (regionsData.content || []);
                console.log('Processed regions array:', regionsArray);

                setRegions(regionsArray);

                // Set default region (Ho Chi Minh Region)
                const defaultRegion = regionsArray.find(region =>
                    region.name && (region.name.includes('Há»“ ChÃ­ Minh') || region.name.includes('Ho Chi Minh')) ||
                    region.slug === 'ho-chi-minh'
                );
                if (defaultRegion) {
                    setSelectedRegionId(defaultRegion.id);
                    setSelectedRegion(defaultRegion.slug || defaultRegion.name);
                } else if (regionsArray.length > 0) {
                    setSelectedRegionId(regionsArray[0].id);
                    setSelectedRegion(regionsArray[0].slug || regionsArray[0].name);
                }
            } catch (error) {
                console.error('Error fetching regions:', error);
                notification.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch khu vá»±c');
            }
        };

        fetchRegions();
    }, []);

    // Use regions as cities (since regions contain city information)
    useEffect(() => {
        if (regions.length > 0) {
            // Convert regions to cities format for LocationSelectModal
            const citiesFromRegions = regions.map(region => ({
                id: region.id,
                name: region.name
            }));
            setCities(citiesFromRegions);

            // Set default city if not already set
            if (!selectedCityId && citiesFromRegions.length > 0) {
                const defaultCity = citiesFromRegions.find(c =>
                    c.name && (c.name.includes('Há»“ ChÃ­ Minh') || c.name.includes('Ho Chi Minh'))
                ) || citiesFromRegions[0];
                if (defaultCity) {
                    setSelectedCity(defaultCity.name);
                    setSelectedCityId(defaultCity.id);
                }
            }
        }
    }, [regions]);

    // Fetch movie data from API
    useEffect(() => {
        const fetchMovie = async () => {
            setLoading(true);
            try {
                const movieData = await movieService.getMovieById(id);
                if (movieData) {
                    console.log('Fetched movie data:', movieData);
                    setMovie(movieData);
                } else {
                    notification.error('KhÃ´ng tÃ¬m tháº¥y phim!');
                    navigate('/movies');
                }
            } catch (error) {
                console.error('Error fetching movie:', error);
                notification.error('CÃ³ lá»—i xáº£y ra khi táº£i thÃ´ng tin phim!');
                navigate('/movies');
            } finally {
                setLoading(false);
            }
        };

        fetchMovie();
    }, [id, navigate]);

    // Helper function to process movie data
    const processMovieData = (moviesData) => {
        return moviesData
            .filter(m => m.id !== movie?.id) // Exclude current movie
            .map((m) => {
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

                return {
                    ...m,
                    poster: m.posterUrl || m.posterPath || '/vite.svg',
                    releaseDate: formattedReleaseDate,
                    averageRating: m.averageRating ? parseFloat(m.averageRating) : 0,
                    durationFormatted: m.durationFormatted || (m.durationMinutes ? `${m.durationMinutes}p` : ''),
                };
            });
    };

    // Fetch now showing movies
    useEffect(() => {
        const fetchNowShowingMovies = async () => {
            setLoadingNowShowing(true);
            setNowShowingPage(0);
            try {
                const params = {
                    page: 0,
                    size: 7,
                    status: 'NOW_SHOWING',
                    sort: 'createdAt,desc'
                };
                const response = await movieService.searchPage(params);
                const actualData = response?.data || response;
                let moviesData = [];

                if (Array.isArray(actualData)) {
                    moviesData = actualData;
                    setHasMoreNowShowing(false); // Can't determine pagination from array
                } else if (actualData?.content) {
                    moviesData = actualData.content;
                    const totalPages = actualData.totalPages || 0;
                    const currentPageNum = actualData.number || 0;
                    setHasMoreNowShowing(currentPageNum + 1 < totalPages);
                }

                const processed = processMovieData(moviesData);
                setNowShowingMovies(processed);
            } catch (error) {
                console.error('Error fetching now showing movies:', error);
            } finally {
                setLoadingNowShowing(false);
            }
        };

        fetchNowShowingMovies();
    }, [movie?.id]);

    // Fetch upcoming movies
    useEffect(() => {
        const fetchUpcomingMovies = async () => {
            setLoadingUpcoming(true);
            setUpcomingPage(0);
            try {
                const params = {
                    page: 0,
                    size: 7,
                    sort: 'releaseDate,asc'
                };
                const response = await movieService.getComingSoonPage(params);
                const actualData = response?.data || response;
                let moviesData = [];

                if (Array.isArray(actualData)) {
                    moviesData = actualData;
                    setHasMoreUpcoming(false);
                } else if (actualData?.content) {
                    moviesData = actualData.content;
                    const totalPages = actualData.totalPages || 0;
                    const currentPageNum = actualData.number || 0;
                    setHasMoreUpcoming(currentPageNum + 1 < totalPages);
                }

                const processed = processMovieData(moviesData);
                setUpcomingMovies(processed);
            } catch (error) {
                console.error('Error fetching upcoming movies:', error);
            } finally {
                setLoadingUpcoming(false);
            }
        };

        fetchUpcomingMovies();
    }, [movie?.id]);

    // Load more now showing movies
    const loadMoreNowShowing = async () => {
        if (!hasMoreNowShowing || loadingMoreNowShowing) return;

        setLoadingMoreNowShowing(true);
        try {
            const nextPage = nowShowingPage + 1;
            const params = {
                page: nextPage,
                size: 6,
                status: 'NOW_SHOWING',
                sort: 'createdAt,desc'
            };
            const response = await movieService.searchPage(params);
            const actualData = response?.data || response;
            let moviesData = [];

            if (Array.isArray(actualData)) {
                moviesData = actualData;
            } else if (actualData?.content) {
                moviesData = actualData.content;
                const totalPages = actualData.totalPages || 0;
                setHasMoreNowShowing(nextPage + 1 < totalPages);
            }

            const processed = processMovieData(moviesData);
            setNowShowingMovies(prev => [...prev, ...processed]);
            setNowShowingPage(nextPage);
        } catch (error) {
            console.error('Error loading more now showing movies:', error);
            notification.error('KhÃ´ng thá»ƒ táº£i thÃªm phim');
        } finally {
            setLoadingMoreNowShowing(false);
        }
    };

    // Load more upcoming movies
    const loadMoreUpcoming = async () => {
        if (!hasMoreUpcoming || loadingMoreUpcoming) return;

        setLoadingMoreUpcoming(true);
        try {
            const nextPage = upcomingPage + 1;
            const params = {
                page: nextPage,
                size: 6,
                sort: 'releaseDate,asc'
            };
            const response = await movieService.getComingSoonPage(params);
            const actualData = response?.data || response;
            let moviesData = [];

            if (Array.isArray(actualData)) {
                moviesData = actualData;
            } else if (actualData?.content) {
                moviesData = actualData.content;
                const totalPages = actualData.totalPages || 0;
                setHasMoreUpcoming(nextPage + 1 < totalPages);
            }

            const processed = processMovieData(moviesData);
            setUpcomingMovies(prev => [...prev, ...processed]);
            setUpcomingPage(nextPage);
        } catch (error) {
            console.error('Error loading more upcoming movies:', error);
            notification.error('KhÃ´ng thá»ƒ táº£i thÃªm phim');
        } finally {
            setLoadingMoreUpcoming(false);
        }
    };

    // Parse query param ?tab=schedule or hash #schedule to scroll to schedule section
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabParam = params.get('tab') || (location.hash ? location.hash.replace('#', '') : null);
        if (tabParam === 'schedule' && isMovieActive(movie)) {
            // scroll after render
            setTimeout(() => {
                if (scheduleTabRef.current) {
                    scheduleTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 200);
        }
    }, [location.search, location.hash, movie?.status]);

    // Handle wheel zoom
    const handleWheel = useCallback((e) => {
        // Check if mouse is over seat-container-wrapper or seat grid
        const seatContainer = e.target.closest('.seat-container-wrapper, .seat-grid, .cinema-seat-area');
        if (seatContainer) {
            e.preventDefault();
            e.stopPropagation();

            // More sensitive zoom with smaller increments for smooth experience
            const delta = e.deltaY > 0 ? -0.05 : 0.05; // Smaller increments for smoother zoom
            const newZoom = Math.min(3, Math.max(0.3, zoomLevel + delta)); // Wider zoom range
            setZoomLevel(newZoom);
        }
    }, [zoomLevel]);

    // Add wheel event listener when seat modal is open
    useEffect(() => {
        if (seatModalVisible) {
            document.addEventListener('wheel', handleWheel, { passive: false });

            return () => {
                document.removeEventListener('wheel', handleWheel);
            };
        }
    }, [seatModalVisible, handleWheel]);


    const handleToggleLocation = (locId) => {
        setExpandedLocation(prev => (prev === locId ? null : locId));
    };

    // Utility: format selected date index -> yyyy-mm-dd (avoid timezone issues)
    const getSelectedDateISO = () => {
        const base = new Date();
        const offset = selectedDate ?? 0; // if null assume first (today)
        // Use local date to avoid timezone issues
        const year = base.getFullYear();
        const month = base.getMonth();
        const day = base.getDate() + offset;
        const d = new Date(year, month, day);
        // Format as YYYY-MM-DD using local timezone, not UTC
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        return `${yearStr}-${monthStr}-${dayStr}`;
    };

    // Effect to derive chains & locations from showtimes (must be before early return)
    useEffect(() => {
        if (!movie) return; // wait until movie loaded

        const fetchSchedulesAndCinemas = async () => {
            try {
                const dateISO = getSelectedDateISO();

                // Use new API to get cinemas with showtimes for this movie and date
                const params = {
                    page: 0,
                    size: 5
                };

                // Add cityId filter if a city is selected (not "Gáº§n báº¡n")
                if (selectedCityId && selectedCity !== 'Gáº§n báº¡n') {
                    params.cityId = selectedCityId;
                }

                // Handle "Gáº§n báº¡n" with geolocation
                if (selectedCity === 'Gáº§n báº¡n' && userLocation) {
                    params.latitude = userLocation.latitude;
                    params.longitude = userLocation.longitude;
                    // Remove cityId when using location-based search
                    delete params.cityId;
                }

                console.log('Calling API with params:', { movieId: movie.id, date: dateISO, params });

                const response = await showtimeService.getCinemaShowtimesByMovieAndDate(
                    movie.id,
                    dateISO,
                    params
                );

                console.log('API response:', response);

                // Handle response structure - try both possible formats
                const responseData = response?.data || response;
                const cinemasWithShowtimes = responseData?.content || [];
                console.log('Cinemas with showtimes:', cinemasWithShowtimes);

                // Extract pagination info
                const totalPagesFromApi = responseData?.totalPages || 0;
                const currentPageFromApi = responseData?.number || 0;
                setTotalPages(totalPagesFromApi);
                setCurrentPage(currentPageFromApi);
                setHasMore(currentPageFromApi + 1 < totalPagesFromApi);

                // Build cinema map from the new response structure
                const cinemasMap = {};
                cinemasWithShowtimes.forEach(cinemaData => {
                    // New structure: cinemaId, cinemaName, address, formats[]
                    if (!cinemaData.cinemaId) return;

                    // Flatten all showtimes from all formats
                    const allShowtimes = [];
                    if (cinemaData.formats && Array.isArray(cinemaData.formats)) {
                        cinemaData.formats.forEach(format => {
                            if (format.showtimes && Array.isArray(format.showtimes)) {
                                format.showtimes.forEach(st => {
                                    // Format time from API (could be ISO string, HH:mm:ss, or HH:mm)
                                    const formatTime = (timeStr) => {
                                        if (!timeStr) return '';
                                        // If already in HH:mm format, return as is
                                        if (/^\d{2}:\d{2}$/.test(timeStr)) {
                                            return timeStr;
                                        }
                                        // If in HH:mm:ss format, extract HH:mm
                                        if (/^\d{2}:\d{2}:\d{2}/.test(timeStr)) {
                                            return timeStr.substring(0, 5);
                                        }
                                        // If ISO string or other format, parse with dayjs
                                        try {
                                            const parsed = dayjs(timeStr);
                                            if (parsed.isValid()) {
                                                return parsed.format('HH:mm');
                                            }
                                        } catch (e) {
                                            console.warn('Error parsing time:', timeStr, e);
                                        }
                                        // Fallback: return as is
                                        return timeStr;
                                    };

                                    allShowtimes.push({
                                        id: st.showtimeId,
                                        time: formatTime(st.startTime),
                                        endTime: formatTime(st.endTime),
                                        roomId: st.roomId,
                                        roomName: st.roomName,
                                        price: st.price,
                                        status: st.status,
                                        formatType: format.formatType,
                                        cinemaId: cinemaData.cinemaId
                                    });
                                });
                            }
                        });
                    }

                    cinemasMap[cinemaData.cinemaId] = {
                        cinema: {
                            id: cinemaData.cinemaId,
                            name: cinemaData.cinemaName,
                            address: cinemaData.address,
                            cityId: cinemaData.cityId,
                            cityName: cinemaData.cityName,
                            latitude: cinemaData.latitude,
                            longitude: cinemaData.longitude,
                            distance: cinemaData.distance
                        },
                        showtimes: allShowtimes
                    };
                });

                const cinemaEntries = Object.values(cinemasMap);

                // Set locations directly without chain grouping
                const newLocations = cinemaEntries.map(entry => ({
                    id: 'cinema-' + entry.cinema.id,
                    cinemaId: entry.cinema.id,
                    name: entry.cinema.name,
                    address: entry.cinema.address,
                    map: '#',
                    showtimes: entry.showtimes
                }));

                // If page 0, replace; otherwise append
                if (params.page === 0) {
                    setLocations(newLocations);
                } else {
                    setLocations(prev => [...prev, ...newLocations]);
                }
            } catch (error) {
                console.error('Error fetching schedules and cinemas:', error);
                notification.error('KhÃ´ng thá»ƒ táº£i lá»‹ch chiáº¿u');
            }
        };

        // Reset page when filters change
        setCurrentPage(0);
        fetchSchedulesAndCinemas();
    }, [movie, selectedDate, selectedCityId]);

    // Auto-expand first cinema location when locations are loaded
    useEffect(() => {
        if (locations.length > 0 && expandedLocation === null) {
            const firstLocationWithShowtimes = locations.find(loc => loc.showtimes && loc.showtimes.length > 0);
            if (firstLocationWithShowtimes) {
                setExpandedLocation(firstLocationWithShowtimes.id);
            }
        }
    }, [locations]);

    const loadMoreCinemas = async () => {
        if (!hasMore || loadingMore || !movie) return;

        setLoadingMore(true);
        try {
            const dateISO = getSelectedDateISO();
            const nextPage = currentPage + 1;

            const params = {
                page: nextPage,
                size: 5
            };

            if (selectedCityId && selectedCity !== 'Gáº§n báº¡n') {
                params.cityId = selectedCityId;
            }

            if (selectedCity === 'Gáº§n báº¡n' && userLocation) {
                params.latitude = userLocation.latitude;
                params.longitude = userLocation.longitude;
                delete params.cityId;
            }

            const response = await showtimeService.getCinemaShowtimesByMovieAndDate(
                movie.id,
                dateISO,
                params
            );

            const responseData = response?.data || response;
            const cinemasWithShowtimes = responseData?.content || [];

            // Build cinema map
            const cinemasMap = {};
            cinemasWithShowtimes.forEach(cinemaData => {
                if (!cinemaData.cinemaId) return;

                const allShowtimes = [];
                if (cinemaData.formats && Array.isArray(cinemaData.formats)) {
                    cinemaData.formats.forEach(format => {
                        if (format.showtimes && Array.isArray(format.showtimes)) {
                            format.showtimes.forEach(st => {
                                allShowtimes.push({
                                    id: st.showtimeId,
                                    time: st.startTime,
                                    endTime: st.endTime,
                                    roomId: st.roomId,
                                    roomName: st.roomName,
                                    price: st.price,
                                    status: st.status,
                                    formatType: format.formatType,
                                    cinemaId: cinemaData.cinemaId
                                });
                            });
                        }
                    });
                }

                cinemasMap[cinemaData.cinemaId] = {
                    cinema: {
                        id: cinemaData.cinemaId,
                        name: cinemaData.cinemaName,
                        address: cinemaData.address,
                        cityId: cinemaData.cityId,
                        cityName: cinemaData.cityName,
                        latitude: cinemaData.latitude,
                        longitude: cinemaData.longitude,
                        distance: cinemaData.distance
                    },
                    showtimes: allShowtimes
                };
            });

            const cinemaEntries = Object.values(cinemasMap);
            const newLocations = cinemaEntries.map(entry => ({
                id: 'cinema-' + entry.cinema.id,
                cinemaId: entry.cinema.id,
                name: entry.cinema.name,
                address: entry.cinema.address,
                map: '#',
                showtimes: entry.showtimes
            }));

            setLocations(prev => [...prev, ...newLocations]);
            setCurrentPage(nextPage);
            setHasMore(nextPage + 1 < responseData?.totalPages);
        } catch (error) {
            console.error('Error loading more cinemas:', error);
            notification.error('KhÃ´ng thá»ƒ táº£i thÃªm ráº¡p');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleFavorite = () => {
        setIsFavorite(!isFavorite);
        notification.success(isFavorite ? 'ÄÃ£ bá» yÃªu thÃ­ch' : 'ÄÃ£ thÃªm vÃ o yÃªu thÃ­ch');
    };

    const handleBuyTicket = () => {
        if (scheduleTabRef.current) {
            scheduleTabRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: movie.title,
                text: movie.description,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            notification.success('ÄÃ£ sao chÃ©p link phim!');
        }
    };

    const handleRating = (value) => {
        setUserRating(value);
        notification.success(`Báº¡n Ä‘Ã£ Ä‘Ã¡nh giÃ¡ ${value} sao!`);
    };

    const handleCinemaClick = (cinemaIndex) => {
        setExpandedCinema(expandedCinema === cinemaIndex ? null : cinemaIndex);
        setSelectedLocation(null);
    };

    const handleLocationClick = (location) => {
        setSelectedLocation(location);
        notification.info(`ÄÃ£ chá»n ráº¡p: ${location}`);
    };

    const handleDateClick = (dateInfo, index) => {
        setSelectedDate(index);
        notification.info(`ÄÃ£ chá»n ngÃ y: ${dateInfo.date} ${dateInfo.day}`);
    };

    const handleShowtimeClick = (time, location) => {
        setSelectedShowtime({ time, location });
        setSeatModalVisible(true);
    };

    const handleSeatClick = (seatId) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(id => id !== seatId);
            } else {
                return [...prev, seatId];
            }
        });
    };

    const handleConfirmBooking = () => {
        if (selectedSeats.length === 0) {
            notification.warning('Vui lÃ²ng chá»n Ã­t nháº¥t má»™t gháº¿!');
            return;
        }

        // Táº¡o thÃ´ng tin booking
        const booking = {
            movieTitle: movie.title,
            showtime: selectedShowtime,
            seats: selectedSeats,
            cinema: selectedShowtime?.location || 'Beta Quang Trung',
            date: '28/09/2025',
            room: 'P1',
            format: '2D Phá»¥ Ä‘á»',
            totalAmount: selectedSeats.length * 50000,
            bookingId: 'C18'
        };

        setBookingInfo(booking);
        // Giá»¯ modal chá»n gháº¿ váº«n má»Ÿ theo yÃªu cáº§u UX má»›i
        setPaymentModalVisible(true);
    };

    const handlePaymentComplete = () => {
        notification.success(`Äáº·t vÃ© thÃ nh cÃ´ng! Gháº¿: ${selectedSeats.join(', ')}`);
        setPaymentModalVisible(false);
        setSelectedSeats([]);
        setBookingInfo(null);
    };

    // Component SeatLayout
    const SeatLayout = () => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L'];
        const seatsPerRow = 10;

        const seatStatuses = {
            available: 'available',
            occupied: 'occupied',
            selected: 'selected',
            vip: 'vip'
        };

        // Seat layout matching the new image exactly
        const occupiedSeats = ['G7', 'H7', 'H6']; // Gray seats (ÄÃ£ Ä‘áº·t)
        const selectedSeats_demo = ['K8', 'K7', 'K4']; // Pink seats (Gháº¿ báº¡n chá»n)
        const vipSeats = ['D', 'E', 'F', 'G', 'H', 'J', 'L']; // Red seats (Gháº¿ VIP)
        const regularSeats = ['A', 'B', 'C']; // Purple seats (Gháº¿ thÆ°á»ng)

        const getSeatStatus = (rowIndex, seatIndex) => {
            const seatId = `${rows[rowIndex]}${seatIndex + 1}`;
            if (selectedSeats.includes(seatId) || selectedSeats_demo.includes(seatId)) return seatStatuses.selected;
            if (occupiedSeats.includes(seatId)) return seatStatuses.occupied;
            if (vipSeats.includes(rows[rowIndex])) return seatStatuses.vip;
            return seatStatuses.available;
        };

        const getSeatPrice = (status) => {
            switch (status) {
                case 'vip': return 200000;
                default: return 150000;
            }
        };

        return (
            <div className="text-center p-5">
                {/* Cinema Screen */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-10 rounded-t-2xl mb-8 flex items-center justify-center shadow-lg relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 rounded-t-2xl"></div>
                    <div className="text-white font-bold text-base tracking-widest z-10">MÃ€N HÃŒNH</div>
                </div>

                {/* Draggable Seat Container */}
                <div className="overflow-auto max-h-[500px] p-4">
                    <div
                        className="flex flex-col items-center gap-1"
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'center center',
                            cursor: 'grab'
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            const startX = e.clientX;
                            const startY = e.clientY;
                            const container = e.currentTarget;
                            const initialTransform = container.style.transform;

                            const handleMouseMove = (moveEvent) => {
                                const deltaX = moveEvent.clientX - startX;
                                const deltaY = moveEvent.clientY - startY;
                                container.style.transform = `${initialTransform} translate(${deltaX}px, ${deltaY}px)`;
                                container.style.cursor = 'grabbing';
                            };

                            const handleMouseUp = () => {
                                container.style.cursor = 'grab';
                                document.removeEventListener('mousemove', handleMouseMove);
                                document.removeEventListener('mouseup', handleMouseUp);
                            };

                            document.addEventListener('mousemove', handleMouseMove);
                            document.addEventListener('mouseup', handleMouseUp);
                        }}
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            const startX = touch.clientX;
                            const startY = touch.clientY;
                            const container = e.currentTarget;
                            const initialTransform = container.style.transform;

                            const handleTouchMove = (moveEvent) => {
                                moveEvent.preventDefault();
                                const touch = moveEvent.touches[0];
                                const deltaX = touch.clientX - startX;
                                const deltaY = touch.clientY - startY;
                                container.style.transform = `${initialTransform} translate(${deltaX}px, ${deltaY}px)`;
                            };

                            const handleTouchEnd = () => {
                                document.removeEventListener('touchmove', handleTouchMove);
                                document.removeEventListener('touchend', handleTouchEnd);
                            };

                            document.addEventListener('touchmove', handleTouchMove, { passive: false });
                            document.addEventListener('touchend', handleTouchEnd);
                        }}
                    >
                        {rows.map((row, rowIndex) => (
                            <div key={row} className="flex items-center gap-1 mb-1">
                                <div className="w-6 text-center text-sm font-semibold text-gray-600 mr-2">{row}</div>
                                {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                                    const seatId = `${row}${seatIndex + 1}`;
                                    const status = getSeatStatus(rowIndex, seatIndex);

                                    const statusClasses = {
                                        available: 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-500 cursor-pointer',
                                        occupied: 'bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed',
                                        selected: 'bg-pink-200 border-pink-400 text-pink-700 hover:bg-pink-300 cursor-pointer',
                                        vip: 'bg-yellow-100 border-yellow-400 text-yellow-700 hover:bg-yellow-200 cursor-pointer'
                                    };

                                    return (
                                        <div
                                            key={seatId}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-medium border-2 transition-all ${statusClasses[status] || statusClasses.available}`}
                                            onClick={() => {
                                                if (status !== seatStatuses.occupied) {
                                                    handleSeatClick(seatId);
                                                }
                                            }}
                                        >
                                            {seatIndex + 1}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col justify-center py-5 border-t border-gray-200 mt-5">
                    <div className="flex justify-center flex-wrap gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2 border-gray-400 bg-gray-300"></div>
                            <span className="text-sm text-gray-700">ÄÃ£ Ä‘áº·t</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2 border-pink-400 bg-pink-200"></div>
                            <span className="text-sm text-gray-700">Gháº¿ báº¡n chá»n</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2 border-green-300 bg-green-100"></div>
                            <span className="text-sm text-gray-700">Gháº¿ thÆ°á»ng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2 border-blue-300 bg-blue-100"></div>
                            <span className="text-sm text-gray-700">VÃ¹ng trung tÃ¢m</span>
                        </div>
                    </div>
                    <div className="flex justify-center mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded border-2 border-yellow-400 bg-yellow-200"></div>
                            <span className="text-sm text-gray-700">Gháº¿ VIP</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-xs text-gray-500">Xem chi tiáº¿t hÃ¬nh áº£nh vÃ  thÃ´ng tin gháº¿</span>
                    </div>
                </div>
            </div>
        );
    };

    if (loading || !movie) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
                <Card className="rounded-lg shadow-lg">
                    <div className="text-center p-12">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-gray-600" />
                        <p className="mt-4 block text-gray-600">Äang táº£i thÃ´ng tin phim...</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className=" min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 pt-16">
            {/* Hero Banner Section - Tailwind Demo */}
            <div className="relative min-h-[40vh] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${movie.backdropUrl || movie.backdropPath || movie.posterUrl || movie.posterPath})` }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40 "></div>
                <div className="relative z-10 py-12 max-w-[1200px] mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                        {/* Left - Movie Poster */}
                        <div className="lg:col-span-4">
                            <div className="text-center animate-fade-in-left">
                                <img
                                    src={movie.posterUrl || movie.posterPath || movie.poster}
                                    alt={movie.title}
                                    className="w-full max-w-[320px] aspect-[2/3] h-auto rounded-lg shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl object-cover bg-gray-900 mx-auto"
                                />
                            </div>
                        </div>

                        {/* Center - Movie Information */}
                        <div className="lg:col-span-5">
                            <div className="animate-fade-in-up text-white">
                                {/* Title */}
                                <h1 className="text-red-500 mb-2 text-3xl md:text-4xl lg:text-5xl font-bold">
                                    {movie.title}
                                </h1>

                                <p className="text-gray-300 text-lg block mb-2">
                                    {movie.originalTitle || ""}
                                </p>

                                {/* Genres as Text */}
                                {movie.genres && movie.genres.length > 0 && (
                                    <p className="text-gray-400 text-sm block mb-4">
                                        {movie.genres.map((genre, index) =>
                                            typeof genre === 'string' ? genre : genre?.name || 'HÃ nh Ä‘á»™ng'
                                        ).join(', ')}
                                    </p>
                                )}

                                {/* Synopsis in Hero Banner */}
                                <div className="mt-6">
                                    <p className="text-gray-200 text-base leading-relaxed">
                                        {movie.description || movie.overview || 'Ná»™i dung phim Ä‘ang Ä‘Æ°á»£c cáº­p nháº­t...'}
                                    </p>
                                </div>

                                {/* Movie Stats */}
                                <div className="mt-6 flex flex-wrap gap-6">
                                    {movie.averageRating && (
                                        <div className="flex flex-col">
                                            <span className="text-gray-400 text-xs mb-1">HÃ i lÃ²ng</span>
                                            <span className="text-white text-lg font-semibold">{Math.round(movie.averageRating * 10)}%</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs mb-1">Khá»Ÿi chiáº¿u</span>
                                        <span className="text-white text-lg font-semibold">
                                            {(() => {
                                                if (!movie.releaseDate) return 'Äang cáº­p nháº­t';
                                                if (typeof movie.releaseDate === 'string') {
                                                    const date = new Date(movie.releaseDate);
                                                    if (!isNaN(date.getTime())) {
                                                        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                                                    }
                                                    return movie.releaseDate;
                                                }
                                                if (movie.releaseDate.year && movie.releaseDate.month && movie.releaseDate.day) {
                                                    return `${String(movie.releaseDate.day).padStart(2, '0')}/${String(movie.releaseDate.month).padStart(2, '0')}/${movie.releaseDate.year}`;
                                                }
                                                return 'Äang cáº­p nháº­t';
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs mb-1">Thá»i lÆ°á»£ng</span>
                                        <span className="text-white text-lg font-semibold">
                                            {movie.durationMinutes ? `${movie.durationMinutes} phÃºt` :
                                                movie.durationFormatted || 'Äang cáº­p nháº­t'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400 text-xs mb-1">Giá»›i háº¡n tuá»•i</span>
                                        <span className="text-white text-lg font-semibold">{movie.rating || 'PG-13'}</span>
                                    </div>
                                </div>

                                {/* Action Buttons Row - Moved below stats */}
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {(movie.trailerUrl || movie.trailer) && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-10 px-6 rounded-md bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-white/50"
                                            onClick={() => setTrailerModalVisible(true)}
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Trailer
                                        </Button>
                                    )}
                                    {isMovieActive(movie) && (
                                        <Button
                                            className="h-10 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white"
                                            onClick={handleBuyTicket}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Mua vÃ©
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right - Cast & Crew */}
                        <div className="lg:col-span-3">
                            <div className="space-y-4">
                                {/* Director */}
                                {movie.director && (
                                    <div>
                                        <span className="text-gray-400 text-sm block mb-1">Äáº¡o diá»…n:</span>
                                        <span className="text-red-400 text-base font-medium">{movie.director}</span>
                                    </div>
                                )}

                                {/* Actors */}
                                {movie.actors && movie.actors.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 text-sm block mb-1">Diá»…n viÃªn:</span>
                                        <span className="text-red-400 text-base font-medium">
                                            {movie.actors.join(', ')}
                                        </span>
                                    </div>
                                )}

                                {/* Fallback for old cast structure */}
                                {(!movie.actors || movie.actors.length === 0) && movie.cast && movie.cast.length > 0 && (
                                    <div>
                                        <span className="text-gray-400 text-sm block mb-1">Diá»…n viÃªn:</span>
                                        <span className="text-red-400 text-base font-medium">
                                            {movie.cast.map(actor => typeof actor === 'string' ? actor : actor.name).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {/* Producer - if available */}
                                {movie.producer && (
                                    <div>
                                        <span className="text-gray-400 text-sm block mb-1">NhÃ  sáº£n xuáº¥t:</span>
                                        <span className="text-red-400 text-base font-medium">
                                            {Array.isArray(movie.producer) ? movie.producer.join(', ') : movie.producer}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section - No Tabs */}
            <div className="max-w-[1200px] mx-auto py-12 px-4">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left Column - Schedule, Cast & Rating */}
                        <div className="md:col-span-8">
                            <div>
                                {/* Schedule Section */}
                                {isMovieActive(movie) && (
                                    <Card className="mb-6 rounded-lg shadow-md p-6" ref={scheduleTabRef}>
                                        <h4 className="mb-4 text-xl flex items-center gap-2">
                                            <span>ðŸ“…</span>
                                            Lá»‹ch chiáº¿u
                                        </h4>
                                        {/* Filters Inline (Refactored) */}
                                        <div className="mb-6">
                                            <div className="space-y-4">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>ThÃ nh phá»‘</span>
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="h-9 px-4 rounded-md border-gray-300 hover:border-blue-500"
                                                            onClick={() => setLocationModalOpen(true)}
                                                        >
                                                            <MapPin className="h-4 w-4 mr-2" />
                                                            <span>{selectedCity || 'Chá»n thÃ nh phá»‘'}</span>
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="h-9 px-4 rounded-md border-gray-300 hover:border-blue-500"
                                                            onClick={() => {
                                                                setSelectedCity('Gáº§n báº¡n');
                                                                setSelectedCityId(null);

                                                                // Get user's current location
                                                                if (navigator.geolocation) {
                                                                    navigator.geolocation.getCurrentPosition(
                                                                        (position) => {
                                                                            setUserLocation({
                                                                                latitude: position.coords.latitude,
                                                                                longitude: position.coords.longitude
                                                                            });
                                                                            notification.success('ÄÃ£ láº¥y vá»‹ trÃ­ cá»§a báº¡n');
                                                                        },
                                                                        (error) => {
                                                                            console.error('Error getting location:', error);
                                                                            notification.warning('KhÃ´ng thá»ƒ láº¥y vá»‹ trÃ­. Vui lÃ²ng cho phÃ©p truy cáº­p vá»‹ trÃ­.');
                                                                        }
                                                                    );
                                                                } else {
                                                                    notification.error('TrÃ¬nh duyá»‡t khÃ´ng há»— trá»£ geolocation');
                                                                }
                                                            }}
                                                        >
                                                            <Target className="h-4 w-4 mr-2" />
                                                            <span>Gáº§n báº¡n</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-3">
                                                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-primary" />
                                                        <span>Chá»n ngÃ y chiáº¿u</span>
                                                    </span>
                                                    <div className="overflow-x-auto pb-2 scrollbar-hide">
                                                        <div className="flex gap-2.5 min-w-max">
                                                            {(() => {
                                                                const dates = [];
                                                                const today = new Date();
                                                                const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

                                                                for (let i = 0; i < 7; i++) {
                                                                    const date = new Date(today);
                                                                    date.setDate(today.getDate() + i);

                                                                    const day = date.getDate();
                                                                    const month = date.getMonth() + 1;
                                                                    const dayOfWeek = daysOfWeek[date.getDay()];

                                                                    dates.push({
                                                                        date: `${day}/${month}`,
                                                                        day: i === 0 ? 'HÃ´m nay' : dayOfWeek,
                                                                        active: i === 0
                                                                    });
                                                                }

                                                                return dates.map((item, index) => {
                                                                    const isActive = selectedDate === index || (selectedDate === null && item.active);
                                                                    return (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            className={`rounded-lg border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${isActive
                                                                                ? 'min-w-[70px] p-3 border-primary bg-gradient-to-br from-primary via-red-600 to-orange-500 text-white shadow-lg shadow-primary/30'
                                                                                : 'min-w-[70px] p-3 border-gray-200 bg-white text-gray-700 hover:border-primary/60 hover:bg-primary/5 hover:shadow-sm'
                                                                                }`}
                                                                            onClick={() => handleDateClick(item, index)}
                                                                        >
                                                                            <div className={`font-semibold mb-0.5 ${isActive ? 'text-[11px] text-white/90' : 'text-[10px] text-gray-500'}`}>
                                                                                {item.day}
                                                                            </div>
                                                                            <div className={`font-bold ${isActive ? 'text-base text-white' : 'text-sm text-gray-900'}`}>
                                                                                {item.date}
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cinema Locations List */}
                                        <div className="space-y-3">
                                            {(() => {
                                                if (!locations.length) {
                                                    return (
                                                        <div className="py-8">
                                                            <Empty
                                                                description="KhÃ´ng cÃ³ lá»‹ch chiáº¿u cho ngÃ y Ä‘Ã£ chá»n"
                                                            />
                                                        </div>
                                                    );
                                                }
                                                return locations.map(loc => {
                                                    const isExpanded = expandedLocation === loc.id || (loc.id === 'bhd-lvv' && expandedLocation === null);
                                                    const hasShowtimes = loc.showtimes && loc.showtimes.length > 0;
                                                    return (
                                                        <div key={loc.id} className={`border border-gray-200 rounded-lg overflow-hidden transition-all ${isExpanded && hasShowtimes ? 'shadow-md' : ''}`}>
                                                            <div
                                                                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${hasShowtimes ? '' : 'opacity-60'}`}
                                                                onClick={() => hasShowtimes && handleToggleLocation(loc.id)}
                                                            >
                                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${loc.id.startsWith('cgv') ? 'bg-red-600' : 'bg-purple-600'
                                                                    }`}>
                                                                    {loc.id.startsWith('cgv') ? 'CGV' : <Star className="h-6 w-6 fill-white" />}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="mb-1 text-base font-semibold">{loc.name}</h5>
                                                                    <p className="text-sm text-gray-600">
                                                                        {loc.address}
                                                                    </p>
                                                                </div>
                                                                <div className="text-gray-400">
                                                                    {hasShowtimes ? (
                                                                        isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />
                                                                    ) : (
                                                                        <ChevronRight className="h-5 w-5 opacity-30" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {hasShowtimes && isExpanded && (
                                                                <div className="px-4 pb-4 bg-gray-50">
                                                                    {(() => {
                                                                        // Group showtimes by format type
                                                                        const showtimesByFormat = {};
                                                                        loc.showtimes.forEach(showtime => {
                                                                            const format = showtime.formatType || '2D Phá»¥ Ä‘á»';
                                                                            if (!showtimesByFormat[format]) {
                                                                                showtimesByFormat[format] = [];
                                                                            }
                                                                            showtimesByFormat[format].push(showtime);
                                                                        });

                                                                        return Object.entries(showtimesByFormat).map(([format, showtimes]) => (
                                                                            <div key={format} className="mb-4">
                                                                                <div className="mb-2">
                                                                                    <span className="font-semibold text-gray-700">{format}</span>
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {showtimes.map(showtime => (
                                                                                        <Button
                                                                                            key={showtime.id}
                                                                                            variant="outline"
                                                                                            className="h-9 px-4 rounded-md border-gray-300 hover:border-blue-500 hover:text-blue-600"
                                                                                            onClick={() => navigate(`/booking/seats/${showtime.id}`)}
                                                                                        >
                                                                                            {showtime.time}
                                                                                        </Button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ));
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}

                                            {/* Load More Button */}
                                            {hasMore && (
                                                <div className="py-4 text-center">
                                                    <Button
                                                        variant="link"
                                                        onClick={loadMoreCinemas}
                                                        disabled={loadingMore}
                                                        className="text-base"
                                                    >
                                                        {loadingMore ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Äang táº£i...
                                                            </>
                                                        ) : 'Xem thÃªm'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                )}


                                {/* Trailer Section - Only show if trailer exists */}
                                {(movie.trailerUrl || movie.trailer) && (
                                    <Card className="mt-12 rounded-lg shadow-md p-6">
                                        <h4 className="mb-4 text-xl flex items-center gap-2">
                                            <span>ðŸŽ¥</span>
                                            Trailer chÃ­nh thá»©c
                                        </h4>
                                        <div>
                                            <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                                                <iframe
                                                    className="absolute top-0 left-0 w-full h-full"
                                                    src={`https://www.youtube.com/embed/${getYouTubeId(movie.trailerUrl || movie.trailer)}`}
                                                    title="Movie Trailer"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            </div>
                                            <div className="mt-3 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="h-9 px-4 rounded-md"
                                                    onClick={() => setTrailerModalVisible(true)}
                                                >
                                                    <Play className="h-4 w-4 mr-2" />
                                                    Xem toÃ n mÃ n hÃ¬nh
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 px-4 rounded-md"
                                                    onClick={handleShare}
                                                >
                                                    <Share2 className="h-4 w-4 mr-2" />
                                                    Chia sáº»
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Rating Section - Using CommentsSection Component */}
                                {isMovieActive(movie) && (
                                    <div style={{ marginTop: '48px', width: '100%', overflow: 'hidden' }}>
                                        <CommentsSection movieId={movie.id} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Additional Info */}
                        <div className="md:col-span-4">
                            <div>
                                {/* Now Showing Movies */}
                                <Card className="rounded-lg shadow-md p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="mb-0 text-xl flex items-center gap-2">
                                            <span>ðŸŽ¬</span>
                                            Äang chiáº¿u
                                        </h4>
                                    </div>
                                    {loadingNowShowing ? (
                                        <div className="text-center py-10">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-600" />
                                            <p className="text-gray-500">Äang táº£i phim...</p>
                                        </div>
                                    ) : nowShowingMovies.length > 0 ? (
                                        <>
                                            <div className="space-y-2.5">
                                                {nowShowingMovies.map((m) => (
                                                    <Card
                                                        key={m.id}
                                                        className="rounded-lg shadow-sm hover:shadow-md transition-shadow border-0 cursor-pointer"
                                                        onClick={() => navigate(`/movies/${m.id}`)}
                                                    >
                                                        <div className="flex gap-3 p-2.5">
                                                            {/* Left: Poster */}
                                                            <div
                                                                className="relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden cursor-pointer group"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/movies/${m.id}`);
                                                                }}
                                                            >
                                                                <img
                                                                    src={m.poster}
                                                                    alt={m.title}
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                                />
                                                                <div className="absolute top-1 right-1 bg-yellow-400 text-yellow-900 px-1 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
                                                                    <Star className="h-2 w-2 fill-yellow-900 text-yellow-900" />
                                                                    <span>{m.averageRating?.toFixed(1) || '0.0'}</span>
                                                                </div>
                                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                    <Play className="text-white text-lg" />
                                                                </div>
                                                            </div>

                                                            {/* Right: Content */}
                                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                                <div>
                                                                    <h6 className="text-sm font-semibold mb-1.5 block cursor-pointer hover:text-primary transition-colors line-clamp-2">
                                                                        {m.title}
                                                                    </h6>
                                                                    <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                                                                        {m.genres && m.genres.length > 0 && (
                                                                            <StatusBadge className="m-0 text-[10px] px-1.5 py-0.5">
                                                                                {typeof m.genres[0] === 'string' ? m.genres[0] : m.genres[0]?.name || ''}
                                                                            </StatusBadge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                                        {m.durationFormatted && (
                                                                            <span className="text-[10px] flex items-center gap-1">
                                                                                <Clock className="h-3 w-3" />
                                                                                {m.durationFormatted}
                                                                            </span>
                                                                        )}
                                                                        {m.releaseDate && (
                                                                            <span className="text-[10px] flex items-center gap-1">
                                                                                <Calendar className="h-3 w-3" />
                                                                                {m.releaseDate}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>

                                            {/* Load More Button */}
                                            {hasMoreNowShowing && (
                                                <div className="mt-5 text-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={loadMoreNowShowing}
                                                        disabled={loadingMoreNowShowing}
                                                        className="h-9 px-4"
                                                    >
                                                        {loadingMoreNowShowing ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Äang táº£i...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="h-4 w-4 mr-2" />
                                                                Xem thÃªm phim
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Empty
                                                description={<p className="text-gray-500">KhÃ´ng cÃ³ phim Ä‘ang chiáº¿u</p>}
                                            />
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Cinema Style Seat Selection Modal */}
            <ResponsiveDialog
                open={seatModalVisible}
                onClose={() => setSeatModalVisible(false)}
                maxWidth="85vw"
                className="cinema-seat-modal-compact"
                actions={null}
            >
                <div className="cinema-modal-content">
                    {/* Header with Back Button */}
                    <div className="cinema-modal-header flex items-center gap-4 p-4 border-b">
                        <Button
                            variant="ghost"
                            onClick={() => setSeatModalVisible(false)}
                            className="back-button"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                        <h3 className="modal-title text-lg font-semibold">Mua vÃ© xem phim</h3>
                    </div>

                    {/* Main Seat Layout Area */}
                    <div className="cinema-seat-area">
                        <SeatLayout />
                    </div>

                    {/* Bottom Panel with Movie Info and Seat Summary */}
                    <div className="cinema-bottom-panel">
                        <div className="movie-info-bar">
                            <div className="movie-tag">
                                <span className="tag-label">CB</span>
                                <span className="movie-title">{movie.title}</span>
                            </div>
                            <div className="showtime-info-bottom">
                                <span>16:30 ~ 18:34 â€¢ HÃ´m nay, 28/09 â€¢ PhÃ²ng chiáº¿u Cine & Suite 9 â€¢ 2D Phá»¥ Ä‘á»</span>
                            </div>
                        </div>

                        <div className="seat-summary">
                            <div className="seat-info">
                                <span className="seat-label">Chá»— ngá»“i</span>
                                <div className="selected-seats-display">
                                    {selectedSeats.length > 0 ? (
                                        selectedSeats.map((seat, index) => (
                                            <span key={index} className="seat-badge">
                                                {seat}
                                                <button
                                                    className="remove-seat"
                                                    onClick={() => handleSeatClick(seat)}
                                                >
                                                    Ã—
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="no-seat-selected">ChÆ°a chá»n gháº¿</span>
                                    )}
                                </div>
                            </div>

                            <div className="price-info">
                                <span className="price-label">Táº¡m tÃ­nh</span>
                                <span className="price-value">
                                    {selectedSeats.length > 0
                                        ? `${selectedSeats.reduce((total, seat) => {
                                            const price = seat.startsWith('D') || seat.startsWith('E') || seat.startsWith('F') ||
                                                seat.startsWith('G') || seat.startsWith('H') || seat.startsWith('J') ||
                                                seat.startsWith('L') ? 200000 : 150000;
                                            return total + price;
                                        }, 0).toLocaleString('vi-VN')}Ä‘`
                                        : '0Ä‘'
                                    }
                                </span>
                            </div>

                            <Button
                                className="buy-ticket-btn"
                                onClick={handleConfirmBooking}
                                disabled={selectedSeats.length === 0}
                            >
                                Mua vÃ©
                            </Button>
                        </div>
                    </div>
                </div>
            </ResponsiveDialog>

            {/* Payment Modal */}
            <ResponsiveDialog
                open={paymentModalVisible}
                onClose={() => setPaymentModalVisible(false)}
                maxWidth={800}
                actions={null}
                className="payment-modal"
            >
                <div className="payment-container">
                    {/* Left Side - Booking Details */}
                    <div className="booking-details">
                        <div className="booking-header-simple">
                            <StatusBadge className="booking-id-yellow">C13</StatusBadge>
                            <h4 className="booking-title-simple text-lg font-semibold">Mua Äá»“</h4>
                        </div>

                        <div className="booking-form">
                            <div className="form-row">
                                <div className="form-section">
                                    <span className="form-label text-xs font-semibold uppercase">THá»œI GIAN</span>
                                    <span className="form-value">14:00 ~ 16:04</span>
                                </div>
                                <div className="form-section">
                                    <span className="form-label text-xs font-semibold uppercase">NGÃ€Y CHIáº¾U</span>
                                    <span className="form-value">28/09/2025</span>
                                </div>
                            </div>

                            <div className="form-section">
                                <span className="form-label text-xs font-semibold uppercase">Ráº P</span>
                                <span className="form-value">CGV HÃ¹ng VÆ°Æ¡ng Plaza</span>
                                <span className="form-address text-sm text-gray-600">
                                    Táº§ng 7 | HÃ¹ng VÆ°Æ¡ng Plaza 126 HÃ¹ng VÆ°Æ¡ng Quáº­n 5 Tp. Há»“ ChÃ­ Minh
                                </span>
                            </div>

                            <div className="form-row">
                                <div className="form-section">
                                    <span className="form-label text-xs font-semibold uppercase">PHÃ’NG CHIáº¾U</span>
                                    <span className="form-value">Cine & Suite 9</span>
                                </div>
                                <div className="form-section">
                                    <span className="form-label text-xs font-semibold uppercase">Äá»ŠNH Dáº NG</span>
                                    <span className="form-value">2D Phá»¥ Ä‘á»</span>
                                </div>
                            </div>

                            <div className="seat-section-form">
                                <span className="form-label text-xs font-semibold uppercase">GHáº¾</span>
                                <div className="seat-price-row">
                                    <span className="form-value">E5</span>
                                    <span className="seat-price-form">141.500Ä‘</span>
                                </div>
                            </div>

                            <div className="total-section-form">
                                <div className="total-row-form">
                                    <span className="total-label-form">Táº¡m tÃ­nh</span>
                                    <span className="total-amount-form">141.500Ä‘</span>
                                </div>
                                <p className="payment-note-form text-xs text-gray-500">
                                    Æ¯u Ä‘Ã£i (náº¿u cÃ³) sáº½ Ä‘Æ°á»£c Ã¡p dá»¥ng á»Ÿ bÆ°á»›c thanh toÃ¡n.
                                </p>
                            </div>
                        </div>
                    </div>                    {/* Right Side - QR Payment */}
                    <div className="qr-payment-section">
                        <div className="qr-header">
                            <div className="payment-method-header">
                                <div className="momo-brand">
                                    <div className="momo-logo-header">
                                        <span className="momo-logo-circle">M</span>
                                        <div className="momo-brand-text">
                                            <span className="momo-title">MoMo</span>
                                            <span className="momo-subtitle">VÃ­ Ä‘iá»‡n tá»­ sá»‘ 1 Viá»‡t Nam</span>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="qr-title text-lg font-semibold">
                                    QuÃ©t mÃ£ QR báº±ng MoMo Ä‘á»ƒ thanh toÃ¡n
                                </h4>
                            </div>
                        </div>

                        <div className="qr-section">
                            <div className="qr-code-container">
                                <div className="qr-frame">
                                    <div className="frame-corner top-left"></div>
                                    <div className="frame-corner top-right"></div>
                                    <div className="frame-corner bottom-left"></div>
                                    <div className="frame-corner bottom-right"></div>

                                    <div className="qr-code">
                                        <svg maxWidth="200" height="200" viewBox="0 0 200 200" className="qr-pattern">
                                            {/* Corner detection patterns */}
                                            <rect x="15" y="15" maxWidth="50" height="50" fill="#000" />
                                            <rect x="20" y="20" maxWidth="40" height="40" fill="#fff" />
                                            <rect x="30" y="30" maxWidth="20" height="20" fill="#000" />

                                            <rect x="135" y="15" maxWidth="50" height="50" fill="#000" />
                                            <rect x="140" y="20" maxWidth="40" height="40" fill="#fff" />
                                            <rect x="150" y="30" maxWidth="20" height="20" fill="#000" />

                                            <rect x="15" y="135" maxWidth="50" height="50" fill="#000" />
                                            <rect x="20" y="140" maxWidth="40" height="40" fill="#fff" />
                                            <rect x="30" y="150" maxWidth="20" height="20" fill="#000" />

                                            {/* Dense QR pattern */}
                                            {Array.from({ length: 600 }, (_, i) => {
                                                const x = 15 + (i % 25) * 7;
                                                const y = 15 + Math.floor(i / 25) * 7;

                                                // Skip corner areas and center
                                                if ((x < 70 && y < 70) ||
                                                    (x > 130 && y < 70) ||
                                                    (x < 70 && y > 130) ||
                                                    (x > 85 && x < 115 && y > 85 && y < 115)) {
                                                    return null;
                                                }

                                                const shouldFill = (x + y + i) % 3 !== 0;
                                                return shouldFill ? (
                                                    <rect key={`dot-${i}`} x={x} y={y} maxWidth="5" height="5" fill="#000" />
                                                ) : null;
                                            })}
                                        </svg>

                                        <div className="momo-center-logo-real">
                                            <div className="momo-logo-bg">
                                                <span className="momo-text">mo</span>
                                                <span className="momo-text">mo</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="qr-instructions-simple">
                                <p className="qr-instruction-text-simple text-sm text-gray-600 text-center">
                                    Sá»­ dá»¥ng App MoMo hoáº·c<br />
                                    á»©ng dá»¥ng Camera há»— trá»£ QR code Ä‘á»ƒ quÃ©t mÃ£.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </ResponsiveDialog>

            {/* Location Select Modal */}
            <LocationSelectModal
                open={locationModalOpen}
                value={selectedCity}
                cities={cities}
                onClose={() => setLocationModalOpen(false)}
                onSelect={(city) => {
                    setSelectedCity(city.name);
                    setSelectedCityId(city.id);
                    setLocationModalOpen(false);
                }}
            />

            {/* Trailer Modal */}
            <ResponsiveDialog
                heading={
                    <div className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        <span>Trailer - {movie?.title}</span>
                    </div>
                }
                open={trailerModalVisible}
                onClose={() => setTrailerModalVisible(false)}
                actions={null}
                maxWidth={900}
            >
                {(movie?.trailerUrl || movie?.trailer) && (
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                            src={`https://www.youtube.com/embed/${getYouTubeId(movie.trailerUrl || movie.trailer)}?autoplay=1`}
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

// Helper function to extract YouTube video ID
const getYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
};

export default MovieDetail;
