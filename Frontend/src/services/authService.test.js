import { describe, expect, it } from 'vitest';
import { normalizeUserProfile } from './authService';

const base64Url = (value) => window.btoa(JSON.stringify(value))
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

const tokenFor = (claims) => `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(claims)}.signature`;

describe('authService profile normalization', () => {
  it('keeps roles from JWT when UserResponse has no roles field', () => {
    const token = tokenFor({
      sub: '11111111-1111-4111-8111-111111111111',
      email: 'admin@example.com',
      roles: ['ADMIN'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const user = normalizeUserProfile({
      id: '11111111-1111-4111-8111-111111111111',
      email: 'admin@example.com',
      fullName: 'Admin User',
      phone: '0900000000',
      dateOfBirth: '1990-01-01',
      avatarUrl: '/avatar.png',
    }, token);

    expect(user.roles).toEqual(['ADMIN']);
    expect(user.role).toBe('ADMIN');
    expect(user.fullName).toBe('Admin User');
  });

  it('provides UI aliases for backend profile fields', () => {
    const user = normalizeUserProfile({
      id: 'user-1',
      phone: '0912345678',
      dateOfBirth: '2001-02-03',
      avatarUrl: '/avatar.png',
    }, null);

    expect(user.phoneNumber).toBe('0912345678');
    expect(user.birthDate).toBe('2001-02-03');
    expect(user.avatar).toBe('/avatar.png');
  });
});
