import { describe, expect, it } from 'vitest';
import {
  groupShowtimesByCinema,
  groupShowtimesByMovie,
  normalizeJoinedShowtimeSeat,
  normalizeShowtimeFormat,
  normalizeShowtimeStatus,
  toMockShowtimePayload,
  toShowtimePayload,
} from './showtimeService';

describe('showtimeService backend adapters', () => {
  it('maps legacy format and status values to backend enums', () => {
    expect(normalizeShowtimeFormat('TWO_D')).toBe('FORMAT_2D');
    expect(normalizeShowtimeFormat('FOUR_DX')).toBe('FORMAT_4DX');
    expect(normalizeShowtimeStatus('AVAILABLE')).toBe('OPEN');
    expect(normalizeShowtimeStatus('COMPLETED')).toBe('FINISHED');
  });

  it('builds UUID-safe backend showtime payloads', () => {
    const result = toShowtimePayload({
      movieId: '11111111-1111-4111-8111-111111111111',
      auditoriumId: '22222222-2222-4222-8222-222222222222',
      startTime: '2026-08-18T19:00:00+07:00',
      endTime: '2026-08-18T21:00:00+07:00',
      language: 'VI',
      subtitle: 'EN',
      format: 'TWO_D',
      basePrice: '120000',
      bookingOpenAt: '2026-08-17T08:00:00+07:00',
      bookingCloseAt: '2026-08-18T18:45:00+07:00',
      status: 'AVAILABLE',
    });

    expect(result.movieId).toBe('11111111-1111-4111-8111-111111111111');
    expect(result.auditoriumId).toBe('22222222-2222-4222-8222-222222222222');
    expect(result.format).toBe('FORMAT_2D');
    expect(result.status).toBe('OPEN');
    expect(result.basePrice).toBe(120000);
    expect(result.startTime).toContain('2026-08-18T12:00:00');
  });

  it('adapts backend-shaped data back to the legacy mock contract', () => {
    const result = toMockShowtimePayload({
      movieId: 1,
      cinemaId: 2,
      auditoriumId: 3,
      startTime: '2026-08-18T19:00:00+07:00',
      endTime: '2026-08-18T21:00:00+07:00',
      subtitle: 'VI',
      format: 'FORMAT_3D',
      basePrice: 90000,
      status: 'SCHEDULED',
    });

    expect(result.roomId).toBe(3);
    expect(result.theaterId).toBe(3);
    expect(result.format).toBe('THREE_D');
    expect(result.status).toBe('UPCOMING');
    expect(result.showDate).toBeTruthy();
    expect(result.startTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('joins ShowtimeSeat with physical Seat and SeatType metadata', () => {
    const result = normalizeJoinedShowtimeSeat(
      {
        id: 'showtime-seat-1',
        seatId: 'seat-1',
        price: 150000,
        status: 'AVAILABLE',
        heldByUserId: null,
        version: 4,
      },
      {
        id: 'seat-1',
        auditoriumId: 'auditorium-1',
        seatTypeId: 'type-1',
        rowLabel: 'C',
        seatNumber: 7,
        displayName: 'C7',
        xPosition: 7,
        yPosition: 3,
        status: 'ACTIVE',
      },
      { id: 'type-1', code: 'VIP', name: 'VIP' },
    );

    expect(result.id).toBe('showtime-seat-1');
    expect(result.physicalSeatId).toBe('seat-1');
    expect(result.name).toBe('C7');
    expect(result.rowLabel).toBe('C');
    expect(result.col).toBe(7);
    expect(result.seatType).toBe('VIP');
    expect(result.status).toBe('AVAILABLE');
  });

  it('prevents disabled physical seats from appearing available', () => {
    const result = normalizeJoinedShowtimeSeat(
      { id: 'ss', seatId: 's', status: 'AVAILABLE' },
      { id: 's', rowLabel: 'A', seatNumber: 1, status: 'DISABLED' },
      { code: 'REGULAR' },
    );
    expect(result.status).toBe('BLOCKED');
  });

  it('groups real showtimes by cinema for movie detail', () => {
    const page = groupShowtimesByCinema([
      {
        id: 'showtime-1',
        cinemaId: 'cinema-1',
        cinemaName: 'HotCinema Central',
        cinemaAddress: '1 Main Street',
        cityName: 'Hồ Chí Minh',
        cinema: { id: 'cinema-1', status: 'ACTIVE' },
        auditoriumId: 'room-1',
        roomName: 'Room 1',
        startTime: '2026-08-18T19:00:00+07:00',
        endTime: '2026-08-18T21:00:00+07:00',
        format: 'FORMAT_2D',
        basePrice: 120000,
        status: 'OPEN',
      },
      {
        id: 'showtime-2',
        cinemaId: 'cinema-1',
        cinemaName: 'HotCinema Central',
        cinema: { id: 'cinema-1', status: 'ACTIVE' },
        auditoriumId: 'room-2',
        startTime: '2026-08-18T21:30:00+07:00',
        format: 'IMAX',
        basePrice: 180000,
        status: 'SCHEDULED',
      },
    ], { page: 0, size: 5 });

    expect(page.totalElements).toBe(1);
    expect(page.content[0].cinemaId).toBe('cinema-1');
    expect(page.content[0].formats).toHaveLength(2);
    expect(page.content[0].formats[0].showtimes[0].showtimeId).toBe('showtime-1');
  });

  it('groups real showtimes by movie for cinema detail and excludes hidden movies', () => {
    const page = groupShowtimesByMovie([
      {
        id: 'showtime-1',
        movieId: 'movie-1',
        movieTitle: 'Public Movie',
        moviePoster: '/poster.jpg',
        movie: { id: 'movie-1', status: 'NOW_SHOWING' },
        startTime: '2026-08-18T19:00:00+07:00',
        format: 'FORMAT_2D',
        status: 'OPEN',
      },
      {
        id: 'showtime-hidden',
        movieId: 'movie-hidden',
        movieTitle: 'Hidden Movie',
        movie: { id: 'movie-hidden', status: 'HIDDEN' },
        startTime: '2026-08-18T20:00:00+07:00',
        format: 'FORMAT_2D',
        status: 'OPEN',
      },
    ], { page: 0, size: 5 });

    expect(page.totalElements).toBe(1);
    expect(page.content[0].movieId).toBe('movie-1');
    expect(page.content[0].formats[0].showtimes[0].status).toBe('OPEN');
  });
});
