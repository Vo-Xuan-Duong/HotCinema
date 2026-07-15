import React from 'react';
import ReactDOM from 'react-dom';
import SeatsGrid from '@/components/Seats/SeatsGrid';
// Migrated to Tailwind CSS

const seatLegend = [
  { className: 'seat-booked', label: 'Đã đặt' },
  { className: 'seat-selected', label: 'Ghế bạn chọn' },
  { className: 'seat-available', label: 'Ghế thường' },
  { className: 'seat-vip', label: 'Ghế VIP' },
  { className: 'seat-couple', label: 'Ghế đôi' },
];

const SeatsModal = ({ isOpen, onClose, seats, selectedSeats, onSelectSeat, showtimeInfo }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl px-10 py-8 pb-6 min-w-[350px] max-w-[95vw] shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <button className="bg-transparent border-0 text-white text-3xl cursor-pointer ml-4" onClick={onClose}>&times;</button>
          <h2 className="text-white text-xl font-semibold m-0">Mua vé xem phim</h2>
        </div>
        <div className="text-center font-bold text-white mb-5 tracking-wider">MÀN HÌNH</div>
        <SeatsGrid seats={seats} selectedSeats={selectedSeats} onSelect={onSelectSeat} />
        <div className="flex gap-5 mt-5 mb-2 text-white text-sm">
          {seatLegend.map(item => (
            <span key={item.className} className="inline-block px-3 py-1 rounded-xl bg-gray-700 font-medium">{item.label}</span>
          ))}
        </div>
        <div className="mt-5 text-white">
          <div className="mb-2">
            <b>{showtimeInfo?.cinema}</b> | {showtimeInfo?.room} | {showtimeInfo?.date} {showtimeInfo?.time}
          </div>
          <div className="mb-4">
            Chỗ ngồi: <b>{selectedSeats.map(id => seats.find(s => s.id === id)?.label).filter(Boolean).join(', ') || 'Chưa chọn'}</b>
          </div>
          <div className="text-right mt-5">
            <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 rounded-[24px] px-9 py-3 text-lg font-semibold cursor-pointer shadow-[0_2px_12px_rgba(102,126,234,0.13)] transition-all duration-[180ms] hover:shadow-[0_4px_16px_rgba(102,126,234,0.3)] disabled:bg-gray-600 disabled:cursor-not-allowed" disabled={selectedSeats.length === 0}>Mua vé</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SeatsModal; 