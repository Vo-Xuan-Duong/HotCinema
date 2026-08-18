import { describe, expect, it } from 'vitest';
import { normalizeAssignment, toAssignmentPayload } from './employeeCinemaService';

describe('employeeCinemaService backend adapters', () => {
  it('normalizes ids, position and active state', () => {
    expect(normalizeAssignment({
      id: 'assignment-1',
      userId: 'user-1',
      cinemaId: 'cinema-1',
      position: 'manager',
      isActive: true,
    })).toMatchObject({
      id: 'assignment-1',
      userId: 'user-1',
      cinemaId: 'cinema-1',
      position: 'MANAGER',
      isActive: true,
    });
  });

  it('builds the exact EmployeeCinema request shape', () => {
    expect(toAssignmentPayload({
      userId: 'user-1',
      cinemaId: 'cinema-1',
      position: 'staff',
      isActive: false,
      assignedAt: '2026-08-18T02:00:00.000Z',
      endedAt: '2027-08-18T02:00:00.000Z',
    })).toEqual({
      userId: 'user-1',
      cinemaId: 'cinema-1',
      position: 'STAFF',
      isActive: false,
      assignedAt: '2026-08-18T02:00:00.000Z',
      endedAt: '2027-08-18T02:00:00.000Z',
    });
  });
});
