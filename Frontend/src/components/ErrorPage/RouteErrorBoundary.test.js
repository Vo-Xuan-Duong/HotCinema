import { describe, expect, it } from 'vitest';
import { describeError } from './RouteErrorBoundary';

describe('RouteErrorBoundary describeError', () => {
  it('uses explicit application status and message', () => {
    expect(describeError({ status: 503, message: 'Service unavailable' })).toEqual({
      status: 503,
      title: 'Giao diện gặp lỗi',
      message: 'Service unavailable',
    });
  });

  it('falls back to a stable 500 response', () => {
    expect(describeError(new Error('Render failed'))).toEqual({
      status: 500,
      title: 'Giao diện gặp lỗi',
      message: 'Render failed',
    });
  });
});
