import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Store, MapPin, Clock, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Avatar } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';

const CinemaSchedule = () => {
    const { cinemaId } = useParams();
    const [selectedDate, setSelectedDate] = useState('16/8');

    const cinema = {
        id: 1,
        name: 'Äá»“ng Da',
        fullName: 'DDC Äá»“ng Da',
        address: '890 Tráº§n HÆ°ng Äáº¡o, Quáº­n 5, Tp. Há»“ ChÃ­ Minh',
        city: 'Tp. Há»“ ChÃ­ Minh',
        chain: 'Äá»“ng Da Cinema',
        logoText: 'DDC',
        color: '#ff6b35',
        bgColor: '#fff5f2',
        description: 'Lá»‹ch chiáº¿u phim Äá»“ng Da - Lá»‹ch chiáº¿u ráº¡p toÃ n quá»‘c Ä‘áº§y Ä‘á»§ & tiá»‡n lá»£i nháº¥t táº¡i Moveek. Ráº¡p Äá»“ng Da lÃ  1 trong nhá»¯ng cá»¥m ráº¡p lÃ¢u Ä‘á»i nháº¥t cá»§a SÃ i GÃ²n. Hiá»‡n Äá»“ng Da Ä‘Ã£ Ä‘Æ°á»£c nÃ¢ng cáº¥p vá»›i tÃªn gá»i má»›i DDcinema vá»›i mong muá»‘n mang Ä‘áº¿n nhá»¯ng tráº£i nghiá»‡m Ä‘iá»‡n áº£nh tá»‘t hÆ¡n vá»›i giÃ¡ vÃ© ráº¥t cáº¡nh tranh.'
    };

    const weekDates = [
        { date: '16/8', day: 'Th 7', isSelected: true },
        { date: '17/8', day: 'CN', isSelected: false },
        { date: '18/8', day: 'Th 2', isSelected: false },
        { date: '19/8', day: 'Th 3', isSelected: false },
        { date: '20/8', day: 'Th 4', isSelected: false },
        { date: '21/8', day: 'Th 5', isSelected: false }
    ];

    const movies = [
        {
            id: 1,
            title: 'Thanh GÆ°Æ¡m Diá»‡t Quá»·: VÃ´ Háº¡n ThÃ nh',
            englishTitle: 'Demon Slayer - Kimetsu no Yaiba - The Movie: Infinity Castle',
            rating: 'T16',
            duration: '2h35\'',
            genres: ['Action', 'Thriller', 'Animation', 'Fantasy'],
            subtitle: '2D Phá»¥ Äá» Viá»‡t',
            poster: 'https://via.placeholder.com/150x200/ff6b35/ffffff?text=DEMON+SLAYER',
            showtimes: [
                { time: '09:10', price: '65K', room: 'PhÃ²ng 1' },
                { time: '10:05', price: '65K', room: 'PhÃ²ng 2' },
                { time: '11:10', price: '65K', room: 'PhÃ²ng 1' },
                { time: '12:00', price: '65K', room: 'PhÃ²ng 3' },
                { time: '12:55', price: '65K', room: 'PhÃ²ng 2' },
                { time: '14:00', price: '65K', room: 'PhÃ²ng 1' },
                { time: '14:50', price: '65K', room: 'PhÃ²ng 4' },
                { time: '15:45', price: '65K', room: 'PhÃ²ng 2' },
                { time: '16:50', price: '65K', room: 'PhÃ²ng 3' },
                { time: '17:40', price: '75K', room: 'PhÃ²ng 1' },
                { time: '18:35', price: '75K', room: 'PhÃ²ng 2' },
                { time: '19:40', price: '75K', room: 'PhÃ²ng 4' },
                { time: '20:30', price: '75K', room: 'PhÃ²ng 3' },
                { time: '21:25', price: '75K', room: 'PhÃ²ng 1' }
            ]
        },
        {
            id: 2,
            title: 'Mang Máº¹ Äi Bá»™',
            englishTitle: 'Leaving Mom',
            rating: 'K',
            duration: '1h52\'',
            genres: ['Drama', 'Family'],
            subtitle: '2D Phá»¥ Äá» Anh',
            poster: 'https://via.placeholder.com/150x200/52c41a/ffffff?text=LEAVING+MOM',
            showtimes: [
                { time: '11:50', price: '65K', room: 'PhÃ²ng 5' },
                { time: '15:50', price: '65K', room: 'PhÃ²ng 5' },
                { time: '19:50', price: '75K', room: 'PhÃ²ng 5' },
                { time: '21:55', price: '75K', room: 'PhÃ²ng 5' }
            ]
        },
    ];

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const getRatingColor = (rating) => {
        switch (rating) {
            case 'K': return 'green';
            case 'T13': return 'orange';
            case 'T16': return 'orange';
            case 'T18': return 'red';
            default: return 'blue';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white py-4 border-b border-gray-200">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    <Breadcrumb
                        items={[
                            {
                                title: (
                                    <>
                                        <Home className="h-4 w-4 inline mr-1" />
                                        Trang chá»§
                                    </>
                                ),
                                href: '/'
                            },
                            {
                                title: (
                                    <>
                                        <Store className="h-4 w-4 inline mr-1" />
                                        Ráº¡p chiáº¿u
                                    </>
                                ),
                                href: '/cinemas'
                            },
                            {
                                title: cinema.name
                            }
                        ]}
                    />
                </div>
            </div>

            <div className="bg-white py-8 border-b border-gray-200">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    <div className="flex gap-6 items-start flex-wrap">
                        <Avatar className="w-20 h-20 bg-primary text-white text-2xl font-bold">
                            {cinema.logoText}
                        </Avatar>
                        <div className="flex-1">
                            <h2 className="text-gray-900 mb-3 text-2xl font-bold">
                                {cinema.name}
                            </h2>
                            <div className="flex flex-wrap gap-3 items-center">
                                <StatusBadge tone="blue">{cinema.chain}</StatusBadge>
                                <span className="text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> {cinema.address}
                                </span>
                                <span className="text-gray-600 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" /> {cinema.city}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-700 mt-4 mb-0">
                        {cinema.description}
                    </p>
                </div>
            </div>

            <div className="bg-white py-6 border-b border-gray-200">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    <div className="flex gap-3 flex-wrap">
                        {weekDates.map((dateItem) => (
                            <Button
                                key={dateItem.date}
                                variant={selectedDate === dateItem.date ? "default" : "outline"}
                                onClick={() => handleDateSelect(dateItem.date)}
                                className={selectedDate === dateItem.date ? "bg-primary" : ""}
                            >
                                <div className="flex flex-col items-center">
                                    <div className="text-base font-semibold">{dateItem.date}</div>
                                    <div className="text-xs">{dateItem.day}</div>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
                <Alert
                    message="Nháº­n vÃ o suáº¥t chiáº¿u Ä‘á»ƒ tiáº¿n hÃ nh mua vÃ©"
                    type="warning"
                    showIcon
                    className="mb-6 rounded-lg"
                />

                <div className="bg-blue-50 p-4 rounded-lg mb-6 border-2 border-blue-500">
                    <p className="text-blue-600 font-semibold">
                        ðŸŽ¬ Äang hiá»ƒn thá»‹ {movies.length} phim cho ngÃ y {selectedDate}
                    </p>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-8">
                <div className="space-y-6">
                    {movies.map((movie) => (
                        <Card
                            key={movie.id}
                            className="bg-white rounded-xl shadow-md border border-gray-200"
                        >
                            <div className="flex gap-6 flex-col md:flex-row">
                                <div className="flex-shrink-0">
                                    <img
                                        width={120}
                                        height={160}
                                        src={movie.poster}
                                        alt={movie.title}
                                        className="rounded-lg"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <h4 className="text-gray-900 mb-2 text-lg font-bold">
                                            {movie.title}
                                        </h4>
                                        <div className="mb-3">
                                            <p className="text-gray-500 text-sm block mb-2">
                                                {movie.englishTitle}
                                            </p>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <StatusBadge tone={getRatingColor(movie.rating)}>
                                                    {movie.rating}
                                                </StatusBadge>
                                                <span className="text-gray-500 text-sm">{movie.duration}</span>
                                                <Button variant="link" size="sm" className="p-0 h-auto">
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Trailer
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <p className="text-gray-500 text-sm">{movie.genres.join(', ')}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{movie.subtitle}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {movie.showtimes.map((showtime, index) => (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="h-auto py-2 px-4 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                                                title={`${showtime.room} - ${showtime.time} - ${showtime.price}`}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div className="font-semibold text-base">{showtime.time}</div>
                                                    <div className="text-xs">{showtime.price}</div>
                                                    <div className="text-xs opacity-75">{showtime.room}</div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CinemaSchedule;
