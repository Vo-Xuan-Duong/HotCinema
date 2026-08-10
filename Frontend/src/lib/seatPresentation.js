export const SEAT_TYPE_LABELS = {
  normal: 'Thường',
  vip: 'VIP',
  couple: 'Đôi',
  sweetbox: 'Sweetbox',
};

export const SEAT_STATUS_LABELS = {
  available: 'Còn trống',
  held: 'Đang giữ',
  booked: 'Đã đặt',
  unavailable: 'Không khả dụng',
  maintenance: 'Bảo trì',
  blocked: 'Bị chặn',
};

export const normalizeSeatType = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  const typeMap = {
    REGULAR: 'normal',
    NORMAL: 'normal',
    STANDARD: 'normal',
    VIP: 'vip',
    COUPLE: 'couple',
    SWEETBOX: 'sweetbox',
    SWEET_BOX: 'sweetbox',
  };
  return typeMap[normalized] || 'normal';
};

export const normalizeSeatStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  const statusMap = {
    AVAILABLE: 'available',
    HELD: 'held',
    HOLD: 'held',
    RESERVED: 'held',
    BOOKED: 'booked',
    UNAVAILABLE: 'unavailable',
    MAINTENANCE: 'maintenance',
    BLOCKED: 'blocked',
  };
  return statusMap[normalized] || 'available';
};

export const toApiSeatType = (value) => {
  const normalized = normalizeSeatType(value);
  return {
    normal: 'REGULAR',
    vip: 'VIP',
    couple: 'COUPLE',
    sweetbox: 'SWEETBOX',
  }[normalized];
};

export const toApiSeatStatus = (value) => {
  const normalized = normalizeSeatStatus(value);
  return {
    available: 'AVAILABLE',
    held: 'HELD',
    booked: 'BOOKED',
    unavailable: 'UNAVAILABLE',
    maintenance: 'MAINTENANCE',
    blocked: 'BLOCKED',
  }[normalized];
};

export const getSeatTypeLabel = (value) => SEAT_TYPE_LABELS[normalizeSeatType(value)] || SEAT_TYPE_LABELS.normal;
export const getSeatStatusLabel = (value) => SEAT_STATUS_LABELS[normalizeSeatStatus(value)] || SEAT_STATUS_LABELS.available;

export const getSeatVisualClass = (seat, { selected = false } = {}) => {
  if (selected) return 'bg-primary text-primary-foreground';

  const status = normalizeSeatStatus(seat?.status || seat?.seatStatus);
  if (status === 'booked') return 'seat-booked';
  if (status === 'held') return 'seat-held';
  if (['unavailable', 'maintenance', 'blocked'].includes(status)) return 'seat-disabled';

  const type = normalizeSeatType(seat?.type || seat?.seatType);
  return {
    normal: 'seat-normal',
    vip: 'seat-vip',
    couple: 'seat-couple',
    sweetbox: 'seat-sweetbox',
  }[type] || 'seat-normal';
};

export const isSeatUnavailable = (seat) => {
  const status = normalizeSeatStatus(seat?.status || seat?.seatStatus);
  return ['booked', 'unavailable', 'maintenance', 'blocked'].includes(status);
};
