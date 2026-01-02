import React from 'react';
// Migrated to Tailwind CSS

const SeatsGrid = ({ seats, selectedSeats = [], onSelect }) => {
  const maxCols = seats.reduce((max, seat) => seat.number > max ? seat.number : max, 0);
  return (
    <div className="grid gap-2 justify-center my-6" style={{ gridTemplateColumns: `repeat(${maxCols}, 36px)` }}>
      {seats.map(seat => {
        const isSelected = selectedSeats.includes(seat.id);
        const label = seat.label || `${seat.row}${seat.number}`;
        const baseClasses = "w-9 h-9 rounded-md border-[1.5px] font-bold cursor-pointer transition-all duration-200 p-1";
        const statusClasses = seat.status === 'booked' 
          ? 'bg-gray-700 border-gray-500 text-white cursor-not-allowed' 
          : seat.type === 'vip' 
            ? 'bg-red-600 border-red-500 text-white' 
            : seat.type === 'couple'
              ? 'bg-purple-500 border-purple-700 text-white w-[76px] col-span-2 justify-self-center'
              : 'bg-purple-900 border-purple-800 text-white';
        const selectedClass = isSelected ? '!bg-green-500 !border-green-600 text-white' : '';
        
        return (
          <button
            key={seat.id}
            className={`${baseClasses} ${statusClasses} ${selectedClass}`}
            disabled={seat.status === 'booked'}
            onClick={() => onSelect && onSelect(seat.id)}
            title={label}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default SeatsGrid; 