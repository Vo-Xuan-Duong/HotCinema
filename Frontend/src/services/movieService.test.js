import { describe, expect, it } from 'vitest';
import { filterAndSortMovieRows, toMoviePayload } from './movieService';

describe('movieService adapters', () => {
  it('builds the exact MovieCreate/Update request shape', () => {
    const payload = toMoviePayload({
      id: 'ignored',
      title: ' Movie ',
      originalTitle: ' Original ',
      slug: 'movie',
      description: ' Description ',
      durationMinutes: '120',
      releaseDate: '2026-08-18T00:00:00Z',
      endDate: '2026-09-18T00:00:00Z',
      ageRating: 't16',
      originalLanguage: 'VI',
      director: 'Director',
      actors: 'Actor A, Actor B',
      country: 'VN',
      productionCompany: 'Studio',
      poster: '/poster.jpg',
      backdropUrl: '/banner.jpg',
      trailer: 'https://example.com/trailer',
      status: 'now_showing',
      createdAt: 'ignored',
    });

    expect(payload).toEqual({
      title: 'Movie',
      originalTitle: 'Original',
      slug: 'movie',
      description: 'Description',
      durationMinutes: 120,
      releaseDate: '2026-08-18',
      endDate: '2026-09-18',
      ageRating: 'T16',
      originalLanguage: 'VI',
      director: 'Director',
      actors: 'Actor A, Actor B',
      country: 'VN',
      productionCompany: 'Studio',
      posterUrl: '/poster.jpg',
      bannerUrl: '/banner.jpg',
      trailerUrl: 'https://example.com/trailer',
      status: 'NOW_SHOWING',
    });
  });

  it('excludes draft and hidden movies from public filtering', () => {
    const rows = filterAndSortMovieRows([
      { id: 1, title: 'Public', status: 'NOW_SHOWING', releaseDate: '2026-08-01' },
      { id: 2, title: 'Draft', status: 'DRAFT', releaseDate: '2026-08-01' },
      { id: 3, title: 'Hidden', status: 'HIDDEN', releaseDate: '2026-08-01' },
      { id: 4, title: 'Soon', status: 'COMING_SOON', releaseDate: '2027-01-01' },
    ], { sort: 'title,asc' }, { publicOnly: true });

    expect(rows.map((movie) => movie.title)).toEqual(['Public', 'Soon']);
  });

  it('applies keyword, status, year and sort in CRUD fallback', () => {
    const rows = filterAndSortMovieRows([
      { title: 'Beta', director: 'Nguyen', status: 'NOW_SHOWING', releaseDate: '2026-06-01' },
      { title: 'Alpha', director: 'Nguyen', status: 'NOW_SHOWING', releaseDate: '2026-01-01' },
      { title: 'Other', director: 'Tran', status: 'NOW_SHOWING', releaseDate: '2026-01-01' },
    ], {
      keyword: 'nguyen',
      status: 'NOW_SHOWING',
      releaseYear: 2026,
      sort: 'title,asc',
    });

    expect(rows.map((movie) => movie.title)).toEqual(['Alpha', 'Beta']);
  });
});
