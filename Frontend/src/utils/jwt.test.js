import { describe, expect, it } from 'vitest';
import { decodeJwtPayload, isJwtExpired, userFromAccessToken } from './jwt';

const tokenFor = (payload) => {
  const encoded = window.btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${encoded}.signature`;
};

describe('jwt helpers', () => {
  it('decodes base64url payloads', () => {
    const token = tokenFor({ sub: 'abc', email: 'user@example.com' });
    expect(decodeJwtPayload(token)).toMatchObject({ sub: 'abc', email: 'user@example.com' });
  });

  it('builds a frontend user from token-only backend auth responses', () => {
    const token = tokenFor({
      sub: '7d6ef681-b437-4dc6-91e2-18ba98f32d13',
      email: 'admin@hotcinema.vn',
      roles: ['ADMIN', 'ROLE_STAFF'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(userFromAccessToken(token)).toEqual(expect.objectContaining({
      id: '7d6ef681-b437-4dc6-91e2-18ba98f32d13',
      email: 'admin@hotcinema.vn',
      roles: ['ADMIN', 'STAFF'],
      role: 'ADMIN',
    }));
    expect(isJwtExpired(token)).toBe(false);
  });

  it('rejects malformed or expired tokens', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
    expect(isJwtExpired(tokenFor({ exp: 1 }))).toBe(true);
  });
});
