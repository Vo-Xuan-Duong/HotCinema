import { describe, expect, it } from 'vitest';
import { toRolePayload } from './roleService';

describe('roleService adapter', () => {
  it('builds the exact RoleCreate/Update request shape', () => {
    expect(toRolePayload({
      id: 'ignored',
      code: ' cinema_manager ',
      name: ' Quản lý rạp ',
      description: ' Quản lý vận hành ',
      permissions: ['ignored'],
      createdAt: 'ignored',
    })).toEqual({
      code: 'CINEMA_MANAGER',
      name: 'Quản lý rạp',
      description: 'Quản lý vận hành',
    });
  });
});
