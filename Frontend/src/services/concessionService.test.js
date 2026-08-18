import { describe, expect, it } from 'vitest';
import {
  joinConcession,
  normalizeCategory,
  normalizeInventory,
  normalizeProduct,
  toInventoryPayload,
  toProductPayload,
} from './concessionService';

describe('concessionService backend adapters', () => {
  it('normalizes backend product, category and cinema inventory', () => {
    const category = normalizeCategory({ id: 'cat-1', code: 'food', name: 'Đồ ăn' });
    const product = normalizeProduct({
      id: 'product-1',
      categoryId: 'cat-1',
      code: 'popcorn',
      name: 'Bắp rang',
      imageUrl: 'https://example.com/popcorn.png',
      status: 'ACTIVE',
    });
    const inventory = normalizeInventory({
      id: 'inventory-1',
      cinemaId: 'cinema-1',
      productId: 'product-1',
      price: '75000',
      stockQuantity: 12,
      isAvailable: true,
    });

    const joined = joinConcession(product, inventory, category);
    expect(joined.categoryCode).toBe('FOOD');
    expect(joined.price).toBe(75000);
    expect(joined.stock).toBe(12);
    expect(joined.cinemaProductId).toBe('inventory-1');
    expect(joined.isAvailable).toBe(true);
  });

  it('does not expose an inactive catalog product as sellable', () => {
    const joined = joinConcession(
      { id: 'p', code: 'P', name: 'Product', status: 'INACTIVE' },
      { id: 'cp', cinemaId: 'c', productId: 'p', price: 1, stockQuantity: 2, isAvailable: true },
      null,
    );
    expect(joined.isAvailable).toBe(false);
  });

  it('builds separate catalog and cinema inventory payloads', () => {
    const input = {
      cinemaId: 'cinema-1',
      categoryId: 'category-1',
      code: ' combo one ',
      name: ' Combo 1 ',
      description: ' Mô tả ',
      imageUrl: ' https://example.com/combo.png ',
      status: 'active',
      price: '99000',
      stock: '5',
      isAvailable: true,
    };

    expect(toProductPayload(input)).toEqual({
      categoryId: 'category-1',
      code: 'COMBO ONE',
      name: 'Combo 1',
      description: 'Mô tả',
      imageUrl: 'https://example.com/combo.png',
      status: 'ACTIVE',
    });
    expect(toInventoryPayload('product-1', input)).toEqual({
      cinemaId: 'cinema-1',
      productId: 'product-1',
      price: 99000,
      stockQuantity: 5,
      isAvailable: true,
    });
  });
});
