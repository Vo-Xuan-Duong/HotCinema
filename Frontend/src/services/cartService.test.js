/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import cartService from './cartService';

describe('cartService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('lưu, cập nhật và xóa sản phẩm theo id', () => {
    cartService.add({ id: 1, name: 'Bắp rang', quantity: 1 });
    cartService.add({ id: 1, name: 'Bắp rang', quantity: 2 });
    cartService.add({ id: 2, name: 'Nước ngọt', quantity: 1 });

    expect(cartService.list()).toEqual([
      { id: 1, name: 'Bắp rang', quantity: 2 },
      { id: 2, name: 'Nước ngọt', quantity: 1 },
    ]);

    cartService.remove(1);
    expect(cartService.list()).toEqual([{ id: 2, name: 'Nước ngọt', quantity: 1 }]);
  });

  it('phát sự kiện khi giỏ hàng thay đổi', () => {
    const listener = vi.fn();
    window.addEventListener('hotcinema:cart-change', listener);
    cartService.clear();
    expect(listener).toHaveBeenCalledOnce();
    window.removeEventListener('hotcinema:cart-change', listener);
  });
});
