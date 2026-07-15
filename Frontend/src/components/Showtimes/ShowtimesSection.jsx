import React, { useState, useEffect } from 'react';
// Migrated to Tailwind CSS
import SeatsModal from '@/components/Seats/SeatsModal';
import seatData from '@/data/seatData.json';
import Loading from '@/components/Loading';

const mockSeats = seatData.seats;

const icons = {
  calendar: <span className="icon">📅</span>,
  clock: <span className="icon">🕐</span>,
  cinema: <span className="icon">🎬</span>,
  imax: <span className="icon">🎭</span>,
  normal: <span className="icon">🎪</span>,
  location: <span className="icon">📍</span>,
  ticket: <span className="icon">🎫</span>,
  time: <span className="icon">⏰</span>
};

const ShowtimesSection = ({ showtimes }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [hoveredTime, setHoveredTime] = useState(null);
  const [expandedCinema, setExpandedCinema] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showtimes || showtimes.length === 0) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 600); // giả lập loading
    return () => clearTimeout(timer);
  }, [showtimes]);

  if (!showtimes || showtimes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden mt-4 text-white">
        <div className="px-6 py-6 pb-4 border-b border-white/10">
          <h2 className="text-3xl font-bold m-0 mb-2 flex items-center gap-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent md:text-2xl sm:text-xl">
            {icons.calendar} Lịch chiếu
          </h2>
        </div>
        <div className="text-center py-12 px-8 text-gray-400">
          <div className="text-5xl mb-4 opacity-50">🎬</div>
          <h3 className="text-xl m-0 mb-2 text-white">Chưa có lịch chiếu</h3>
          <p className="m-0 text-sm leading-relaxed">Lịch chiếu cho phim này sẽ được cập nhật sớm nhất</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading text="Đang tải lịch chiếu..." />;
  }

  const handleTimeClick = (dayIdx, cinemaIdx, roomIdx, time) => {
    setSelectedShowtime({
      dayIdx,
      cinemaIdx,
      roomIdx,
      time,
      date: showtimes[dayIdx].date,
      cinema: showtimes[dayIdx].cinemas[cinemaIdx].name,
      room: showtimes[dayIdx].cinemas[cinemaIdx].rooms[roomIdx].name
    });
    setSelectedSeats([]);
    setIsSeatsModalOpen(true);
  };

  const handleSelectSeat = (seatId) => {
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleCloseModal = () => {
    setIsSeatsModalOpen(false);
  };

  const formatTime = (time) => {
    return time;
  };

  // const getRoomIcon = (type) => {
  //   return type === 'imax' ? icons.imax : icons.normal;
  // };

  const getRoomColor = (type) => {
    return type === 'imax' ? 'imax' : 'normal';
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden mt-4 text-white">
      <div className="px-6 py-6 pb-4 border-b border-white/10 md:px-6 sm:px-4">
        <h2 className="text-3xl font-bold m-0 mb-2 flex items-center gap-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent md:text-2xl sm:text-xl">
          {icons.calendar} Lịch chiếu
        </h2>
        <div className="text-gray-400 text-sm m-0">
          Chọn ngày và suất chiếu phù hợp với bạn
        </div>
      </div>

      <div className="flex gap-2 px-6 py-4 bg-white/5 border-b border-white/10 overflow-x-auto scrollbar-hide md:px-6 sm:px-4 sm:py-3 sm:gap-1">
        {showtimes.map((day, dayIdx) => (
          <button
            key={dayIdx}
            className={`bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white cursor-pointer transition-all duration-300 relative min-w-[120px] text-center backdrop-blur-[10px] hover:bg-white/15 hover:border-white/30 hover:-translate-y-0.5 md:min-w-[100px] md:px-4 md:py-3 sm:min-w-[80px] sm:px-3 sm:py-2 ${selectedDay === dayIdx ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 shadow-[0_4px_15px_rgba(102,126,234,0.3)]' : ''}`}
            onClick={() => { 
              setSelectedDay(dayIdx); 
              setSelectedShowtime(null); 
              setIsSeatsModalOpen(false); 
            }}
          >
            <div className="font-semibold text-sm mb-1 md:text-xs">{day.dayName}</div>
            <div className="text-xs text-white/80 md:text-[11px]">{day.date}</div>
            {selectedDay === dayIdx && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-indigo-500 rounded-sm"></div>}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-6 sm:p-4">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4 md:flex-col md:items-start md:gap-2">
            <h3 className="text-2xl font-semibold m-0 text-white md:text-xl sm:text-lg">{showtimes[selectedDay].dayName}</h3>
            <div className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-[20px] text-sm font-medium">{showtimes[selectedDay].date}</div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {showtimes[selectedDay].cinemas.map((cinema, cinemaIdx) => (
            <div className="bg-white/5 rounded-xl p-4 backdrop-blur-[10px] border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20 hover:-translate-y-0.5 sm:p-3" key={cinemaIdx}>
              <div className="flex items-center gap-4 pb-4 border-b border-white/10 cursor-pointer select-none transition-colors duration-200 hover:bg-indigo-500/8 md:flex-col md:items-start md:gap-2" onClick={() => setExpandedCinema(expandedCinema === cinemaIdx ? null : cinemaIdx)}>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold m-0 mb-1 text-white md:text-lg">{cinema.name}</h4>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-xl">{cinema.rooms.length} phòng chiếu</span>
                  </div>
                </div>
              </div>

              {expandedCinema === cinemaIdx && (
                <div className="flex flex-col mt-4 gap-4 animate-[fadeInRooms_0.3s]">
                  {cinema.rooms.map((room, roomIdx) => (
                    <div className="bg-white/3 rounded-lg p-4 border border-white/5" key={roomIdx}>
                      <div className={`flex items-center gap-3 mb-4 p-3 rounded-md transition-all duration-300 ${room.type === 'imax' ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30' : 'bg-gradient-to-br from-indigo-500/10 to-purple-600/10 border border-indigo-500/30'}`}>
                        <div className="flex gap-1">
                          <span className="font-semibold text-white text-sm">{room.name}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-wide">
                            {room.type === 'imax' ? 'IMAX' : 'Phòng thường'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 md:grid-cols-[repeat(auto-fill,minmax(80px,1fr))] md:gap-2 sm:grid-cols-[repeat(auto-fill,minmax(70px,1fr))] sm:gap-2">
                        {room.times.map((time, timeIdx) => (
                          <button
                            key={timeIdx}
                            className={`flex flex-col items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-3 py-4 text-white cursor-pointer transition-all duration-300 backdrop-blur-[10px] hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 hover:border-indigo-500 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(102,126,234,0.3)] md:px-2 md:py-3 sm:px-1 sm:py-2 ${hoveredTime === `${cinemaIdx}-${roomIdx}-${timeIdx}` ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 -translate-y-0.5 shadow-[0_4px_15px_rgba(102,126,234,0.3)]' : ''}`}
                            onClick={() => handleTimeClick(selectedDay, cinemaIdx, roomIdx, time)}
                            onMouseEnter={() => setHoveredTime(`${cinemaIdx}-${roomIdx}-${timeIdx}`)}
                            onMouseLeave={() => setHoveredTime(null)}
                          >
                            <span className="text-base opacity-80">{icons.time}</span>
                            <span className="font-semibold text-sm md:text-xs sm:text-[11px]">{formatTime(time)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SeatsModal
        isOpen={isSeatsModalOpen}
        onClose={handleCloseModal}
        seats={mockSeats}
        selectedSeats={selectedSeats}
        onSelectSeat={handleSelectSeat}
        showtimeInfo={selectedShowtime}
      />
    </div>
  );
};

export default ShowtimesSection; 