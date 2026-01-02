import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockMovies = [
  { id: 1, title: 'Avengers: Endgame' },
  { id: 2, title: 'Spider-Man: No Way Home' },
  { id: 3, title: 'The Batman' },
  { id: 4, title: 'Black Panther: Wakanda Forever' }
];
const mockCinemas = [
  { id: 1, name: 'CGV Vincom Đồng Khởi' },
  { id: 2, name: 'Lotte Cinema Gò Vấp' },
  { id: 3, name: 'BHD Star Bitexco' }
];
const mockShowtimes = [
  { id: 1, time: '10:00' },
  { id: 2, time: '13:30' },
  { id: 3, time: '16:00' },
  { id: 4, time: '19:00' }
];
const mockSeats = Array.from({ length: 30 }, (_, i) => ({ code: `A${i + 1}`, booked: false }));

const Booking = () => {
  const [step, setStep] = useState(1);
  const [movie, setMovie] = useState('');
  const [cinema, setCinema] = useState('');
  const [showtime, setShowtime] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const navigate = useNavigate();

  const handleSeatClick = (code) => {
    setSelectedSeats(seats => seats.includes(code)
      ? seats.filter(s => s !== code)
      : [...seats, code]
    );
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleBooking = (e) => {
    e.preventDefault();
    // Giả lập đặt vé thành công
    navigate('/booking/confirm', {
      state: {
        movie: mockMovies.find(m => m.id === Number(movie)),
        cinema: mockCinemas.find(c => c.id === Number(cinema)),
        showtime: mockShowtimes.find(s => s.id === Number(showtime)),
        seats: selectedSeats
      }
    });
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-red-500 text-3xl mb-8 text-center font-bold">Đặt vé xem phim</h2>
        <form className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-lg mx-auto flex flex-col gap-8" onSubmit={handleBooking}>
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold mb-2 text-purple-600">Chọn phim:</label>
              <select 
                value={movie} 
                onChange={e => setMovie(e.target.value)} 
                required
                className="py-2.5 px-4 border border-gray-300 rounded-lg text-base w-full mb-5 bg-white text-gray-900"
              >
                <option value="">-- Chọn phim --</option>
                {mockMovies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={!movie}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-500 hover:-translate-y-0.5"
              >
                Tiếp tục
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold mb-2 text-purple-600">Chọn rạp:</label>
              <select 
                value={cinema} 
                onChange={e => setCinema(e.target.value)} 
                required
                className="py-2.5 px-4 border border-gray-300 rounded-lg text-base w-full mb-5 bg-white text-gray-900"
              >
                <option value="">-- Chọn rạp --</option>
                {mockCinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="bg-gray-200 text-gray-700 rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-300"
                >
                  Quay lại
                </button>
                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={!cinema}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-500 hover:-translate-y-0.5"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold mb-2 text-purple-600">Chọn suất chiếu:</label>
              <select 
                value={showtime} 
                onChange={e => setShowtime(e.target.value)} 
                required
                className="py-2.5 px-4 border border-gray-300 rounded-lg text-base w-full mb-5 bg-white text-gray-900"
              >
                <option value="">-- Chọn suất chiếu --</option>
                {mockShowtimes.map(s => <option key={s.id} value={s.id}>{s.time}</option>)}
              </select>
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="bg-gray-200 text-gray-700 rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-300"
                >
                  Quay lại
                </button>
                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={!showtime}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-500 hover:-translate-y-0.5"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <label className="font-semibold mb-2 text-purple-600">Chọn ghế:</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {mockSeats.map(seat => (
                  <button
                    type="button"
                    key={seat.code}
                    className={`rounded-md py-2 px-3.5 text-base font-medium cursor-pointer transition-all duration-200 ${
                      selectedSeats.includes(seat.code)
                        ? 'bg-red-500 text-white border-2 border-red-500'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 hover:bg-gray-100'
                    } ${
                      seat.booked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleSeatClick(seat.code)}
                    disabled={seat.booked}
                  >
                    {seat.code}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 justify-end">
                <button 
                  type="button" 
                  onClick={handlePrev}
                  className="bg-gray-200 text-gray-700 rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-300"
                >
                  Quay lại
                </button>
                <button 
                  type="submit" 
                  disabled={selectedSeats.length === 0}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg py-2.5 px-6 text-base font-semibold cursor-pointer transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed hover:from-purple-600 hover:to-indigo-500 hover:-translate-y-0.5"
                >
                  Xác nhận đặt vé
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Booking; 