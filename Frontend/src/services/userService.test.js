import { describe, expect, it } from 'vitest';
import { buildUserUpdatePayload, normalizeUserStatus } from './userService';

describe('userService backend DTO helpers', () => {
  it('normalizes legacy inactive status to backend DISABLED', () => {
    expect(normalizeUserStatus('inactive')).toBe('DISABLED');
    expect(normalizeUserStatus('locked')).toBe('LOCKED');
    expect(normalizeUserStatus('active')).toBe('ACTIVE');
  });

  it('builds the complete UserUpdateRequest while preserving server fields', () => {
    const current = {
      email: 'customer@example.com',
      phone: '0900000000',
      fullName: 'Customer',
      dateOfBirth: '2000-01-02',
      gender: 'FEMALE',
      avatarUrl: 'https://example.com/avatar.png',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: false,
      lastLoginAt: '2026-08-18T01:00:00Z',
    };

    const result = buildUserUpdatePayload(current, {
      fullName: 'Customer Updated',
      phoneNumber: '0911111111',
      birthDate: '2000-03-04',
    });

    expect(result).toEqual({
      email: 'customer@example.com',
      phone: '0911111111',
      fullName: 'Customer Updated',
      dateOfBirth: '2000-03-04',
      gender: 'FEMALE',
      avatarUrl: 'https://example.com/avatar.png',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: false,
      lastLoginAt: '2026-08-18T01:00:00Z',
    });
  });

  it('rejects incomplete legacy users instead of inventing personal data', () => {
    expect(() => buildUserUpdatePayload({
      email: 'legacy@example.com',
      phone: '0900000000',
      fullName: 'Legacy User',
      status: 'ACTIVE',
    }, {})).toThrow(/dateOfBirth.*gender.*avatarUrl.*lastLoginAt/i);
  });
});
