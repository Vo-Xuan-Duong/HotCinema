import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle2, Wifi, Coffee, Car, Flame, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Tag } from '../../../components/ui/tag';
import { Empty } from '../../../components/ui/empty';
import ContentLoader from '../../../components/Loading/ContentLoader';
import useNotification from '../../../hooks/useNotification';
import cinemaService from '../../../services/cinemaService';
import showtimeService from '../../../services/showtimeService';

const CinemaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const upcomingDates = showtimeService.getUpcomingDates(7);
    setDates(upcomingDates);
    setActiveDate(upcomingDates[0]?.value);
  }, []);

  useEffect(() => {
    if (id) {
      fetchCinemaDetail();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeDate) {
      setPage(0);
      setMovies([]);
      setShowtimesLoading(true);
      fetchShowtimes(0).finally(() => setShowtimesLoading(false));
    }
  }, [id, activeDate]);

  const fetchCinemaDetail = async () => {
    setLoading(true);
    try {
      const response = await cinemaService.getCinemaById(id);
      const data = response.data || response;
      setCinema(data);
    } catch (error) {
      console.error('Error fetching cinema detail:', error);
      notification.error('Không thể tải thông tin rạp!');
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async (pageNum = 0) => {
    try {
      const response = await showtimeService.getShowtimesByDateAndCinema(activeDate, id, {
        page: pageNum,
        size: 5
      });
      const showtimesData = response.data?.content || response.data || response;
      const totalPagesFromApi = response.data?.totalPages || 1;
      const currentPage = response.data?.number || 0;

      const moviesArray = [];

      if (Array.isArray(showtimesData)) {
        showtimesData.forEach(movieData => {
          const allShowtimes = [];

          if (Array.isArray(movieData.formats)) {
            movieData.formats.forEach(format => {
              if (Array.isArray(format.showtimes)) {
                format.showtimes.forEach(showtime => {
                  allShowtimes.push({
                    id: showtime.showtimeId,
                    time: showtime.startTime,
                    roomName: showtime.roomName || 'Phòng',
                    screeningFormat: format.formatType,
                    status: showtime.status,
                    price: showtime.price
                  });
                });
              }
            });
          }

          allShowtimes.sort((a, b) => a.time.localeCompare(b.time));

          moviesArray.push({
            id: movieData.movieId,
            title: movieData.movieTitle,
            genre: 'Phim',
            duration: 'N/A',
            ageRating: movieData.formats?.[0]?.formatType || '2D',
            poster: movieData.posterPath || 'https://via.placeholder.com/200x280/333/fff?text=Movie',
            showtimes: allShowtimes
          });
        });
      }

      if (pageNum === 0) {
        setMovies(moviesArray);
      } else {
        setMovies(prev => [...prev, ...moviesArray]);
      }

      setPage(currentPage);
      setTotalPages(totalPagesFromApi);
      setHasMore(currentPage < totalPagesFromApi - 1);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      notification.error('Không thể tải lịch chiếu!');
      if (pageNum === 0) {
        setMovies([]);
      }
    }
  };

  const handleLoadMore = () => {
    if (!showtimesLoading && hasMore) {
      setShowtimesLoading(true);
      fetchShowtimes(page + 1).finally(() => setShowtimesLoading(false));
    }
  };

  const cinemaImages = [
    'https://via.placeholder.com/400x250/1a1a1a/ffffff?text=Cinema+Lobby',
    'https://via.placeholder.com/400x250/8B0000/ffffff?text=Theater+Room',
    'https://via.placeholder.com/400x250/FFA500/ffffff?text=Concession+Stand',
    'https://via.placeholder.com/400x250/2F4F4F/ffffff?text=Seating+Area'
  ];

  const amenities = [
    { icon: <Wifi className="h-5 w-5" />, label: 'Phòng VIP', color: '#722ed1' },
    { icon: <Flame className="h-5 w-5" />, label: 'Quầy ăn uống', color: '#fa541c' },
    { icon: <Coffee className="h-5 w-5" />, label: 'Chỗ đậu xe', color: '#13c2c2' },
    { icon: <Car className="h-5 w-5" />, label: 'Wifi miễn phí', color: '#1890ff' }
  ];

  if (loading) {
    return <ContentLoader message="Đang tải thông tin rạp..." />;
  }

  if (!cinema) {
    return (
      <div className="min-h-screen bg-white pb-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <Empty
            description={
              <span className="text-lg text-gray-600">
                Không tìm thấy thông tin rạp chiếu
              </span>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-16 mt-14">
      <div className="bg-white py-5 px-6 relative">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-2">
          <Button
            variant="outline"
            className="absolute top-5 right-6"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cinema.address || '')}`, '_blank')}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Chỉ đường
          </Button>
          <h1 className="text-gray-900 text-2xl font-bold m-0 mb-2 tracking-tight leading-tight">
            {cinema.name || 'CGV Vincom Center'}
          </h1>
          <p className="text-gray-600 text-sm flex items-center gap-1.5 m-0 font-normal">
            <MapPin className="text-primary text-sm" />
            {cinema.address || 'Tầng 5, Vincom Center, 72 Lê Thánh Tôn, P. Bến Nghé, Quận 1, TPHCM'}
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
          {cinemaImages.map((img, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
              <img src={img} alt={`Cinema ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Phim đang chiếu</h2>
              <div className="flex flex-wrap gap-2">
                {dates.slice(0, 6).map((date) => (
                  <Button
                    key={date.value}
                    variant={activeDate === date.value ? "default" : "outline"}
                    onClick={() => setActiveDate(date.value)}
                    className={activeDate === date.value ? "bg-primary text-white" : ""}
                  >
                    {date.isToday ? 'Hôm nay' : date.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {showtimesLoading && movies.length === 0 ? (
                <div className="text-center py-10">
                  <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                  <p className="mt-4 text-gray-600">Đang tải lịch chiếu...</p>
                </div>
              ) : movies.length > 0 ? (
                movies.map(movie => (
                  <div key={movie.id} className="bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow duration-300">
                    <div className="relative flex-shrink-0">
                      <img src={movie.poster} alt={movie.title} className="w-24 h-32 object-cover rounded-lg" />
                      <span className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                        {movie.ageRating}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/movies/${movie.id}`)}
                        >
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <span>{movie.genre}</span>
                          <span>•</span>
                          <span>{movie.duration}</span>
                        </div>
                        <Tag className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                          {movie.ageRating}
                        </Tag>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {movie.showtimes.map((showtime) => (
                          <Button
                            key={showtime.id}
                            variant="outline"
                            className="border-2 border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                            onClick={() => navigate(`/booking/${showtime.id}`)}
                          >
                            {showtime.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Empty description="Không có lịch chiếu cho ngày này" />
              )}

              {hasMore && !showtimesLoading && movies.length > 0 && (
                <div className="text-center mt-6">
                  <Button variant="outline" onClick={handleLoadMore}>
                    Xem thêm
                  </Button>
                </div>
              )}

              {showtimesLoading && movies.length > 0 && (
                <div className="text-center py-5">
                  <Loader2 className="w-6 h-6 text-primary mx-auto animate-spin" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tiện ích rạp</h2>
              <div className="grid grid-cols-2 gap-4">
                {amenities.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2" style={{ color: item.color }}>
                    <div className="text-2xl">{item.icon}</div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white rounded-lg shadow-md overflow-hidden h-64">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                className="border-0"
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(cinema.address || 'Vincom Center, Ho Chi Minh City')}`}
                allowFullScreen
                title="Cinema Location"
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaDetail;
