import { describe, expect, it } from 'vitest';
import { isPublicCinema, normalizeCinema, toCinemaPayload } from './cinemaService';

describe('cinemaService adapters', () => {
  it('builds the exact CinemaCreate/Update request shape', () => {
    expect(toCinemaPayload({
      id: 'ignored',
      code: ' hc01 ',
      name: ' HotCinema Central ',
      address: ' 1 Main Street ',
      ward: 'Ward 1',
      district: 'District 1',
      cityName: 'Hồ Chí Minh',
      latitude: '10.123',
      longitude: '106.456',
      phone: '0900000000',
      email: 'central@example.com',
      description: 'Cinema',
      imageUrl: '/logo.png',
      status: 'active',
      createdAt: 'ignored',
    })).toEqual({
      code: 'HC01',
      name: 'HotCinema Central',
      address: '1 Main Street',
      ward: 'Ward 1',
      district: 'District 1',
      city: 'Hồ Chí Minh',
      latitude: 10.123,
      longitude: 106.456,
      phone: '0900000000',
      email: 'central@example.com',
      description: 'Cinema',
      logoUrl: '/logo.png',
      status: 'ACTIVE',
    });
  });

  it('normalizes backend city/logo aliases and public visibility', () => {
    const cinema = normalizeCinema({ city: 'Đà Nẵng', logoUrl: '/logo.png', status: 'ACTIVE' });
    expect(cinema.cityName).toBe('Đà Nẵng');
    expect(cinema.imageUrl).toBe('/logo.png');
    expect(isPublicCinema(cinema)).toBe(true);
    expect(isPublicCinema({ status: 'MAINTENANCE' })).toBe(false);
  });
});
