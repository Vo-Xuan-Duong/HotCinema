import { describe, expect, it } from 'vitest';
import { filterAndSortAdminBookings } from './bookingService';

describe('bookingService admin fallback filters', () => {
  const rows = [
    {
      id: '1',
      bookingCode: 'BK-B',
      customerName: 'Bình',
      customerEmail: 'binh@example.com',
      status: 'PENDING',
      movieId: 'movie-2',
      movieTitle: 'Beta',
      cinemaId: 'cinema-1',
      cinemaName: 'Central',
      createdAt: '2026-08-18T02:00:00Z',
    },
    {
      id: '2',
      bookingCode: 'BK-A',
      customerName: 'An',
      customerEmail: 'an@example.com',
      status: 'CONFIRMED',
      movieId: 'movie-1',
      movieTitle: 'Alpha',
      cinemaId: 'cinema-2',
      cinemaName: 'West',
      createdAt: '2026-08-18T03:00:00Z',
    },
  ];

  it('filters by enriched movie/cinema/status fields', () => {
    expect(filterAndSortAdminBookings(rows, { movieId: 'movie-1' }).map((item) => item.id)).toEqual(['2']);
    expect(filterAndSortAdminBookings(rows, { cinemaId: 'cinema-1' }).map((item) => item.id)).toEqual(['1']);
    expect(filterAndSortAdminBookings(rows, { status: 'CONFIRMED' }).map((item) => item.id)).toEqual(['2']);
  });

  it('searches customer, booking, movie and cinema text', () => {
    expect(filterAndSortAdminBookings(rows, { keyword: 'an@example.com' }).map((item) => item.id)).toEqual(['2']);
    expect(filterAndSortAdminBookings(rows, { keyword: 'central' }).map((item) => item.id)).toEqual(['1']);
  });

  it('sorts by createdAt descending', () => {
    expect(filterAndSortAdminBookings(rows, { sort: 'createdAt,desc' }).map((item) => item.id)).toEqual(['2', '1']);
  });
});
