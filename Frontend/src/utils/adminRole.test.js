import { describe, expect, it } from 'vitest';
import { normalizeRoleValue, userHasAdminAccess } from './adminRole';

describe('adminRole', () => {
  it('chuẩn hóa role từ chuỗi và object', () => {
    expect(normalizeRoleValue(' ROLE_ADMIN ')).toBe('admin');
    expect(normalizeRoleValue({ authority: 'ROLE_SUPERADMIN' })).toBe('superadmin');
  });

  it('chỉ cấp quyền admin cho role được hỗ trợ', () => {
    expect(userHasAdminAccess({ roles: [{ name: 'ADMIN' }] })).toBe(true);
    expect(userHasAdminAccess({ role: 'administrator' })).toBe(true);
    expect(userHasAdminAccess({ roles: ['ROLE_USER'] })).toBe(false);
    expect(userHasAdminAccess(null)).toBe(false);
  });
});
