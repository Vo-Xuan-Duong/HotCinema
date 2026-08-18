import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const MOCK_BASE = '/concessions';

const contentOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const normalizeCategory = (category = {}) => ({
  ...category,
  id: normalizeResourceId(category.id),
  code: String(category.code || '').trim().toUpperCase(),
  name: String(category.name || category.code || '').trim(),
});

const normalizeProduct = (product = {}) => ({
  ...product,
  id: normalizeResourceId(product.id),
  categoryId: normalizeResourceId(product.categoryId),
  code: String(product.code || '').trim().toUpperCase(),
  name: String(product.name || '').trim(),
  description: String(product.description || '').trim(),
  imageUrl: product.imageUrl || product.image || '',
  status: String(product.status || 'ACTIVE').trim().toUpperCase(),
});

const normalizeInventory = (inventory = {}) => ({
  ...inventory,
  id: normalizeResourceId(inventory.id),
  cinemaId: normalizeResourceId(inventory.cinemaId),
  productId: normalizeResourceId(inventory.productId),
  price: Number(inventory.price || 0),
  stockQuantity: Number(inventory.stockQuantity ?? inventory.stock ?? 0),
  isAvailable: Boolean(inventory.isAvailable),
});

const joinConcession = (product, inventory, category) => {
  const normalizedProduct = normalizeProduct(product);
  const normalizedInventory = inventory ? normalizeInventory(inventory) : null;
  const normalizedCategory = category ? normalizeCategory(category) : null;

  return {
    ...normalizedProduct,
    id: normalizedProduct.id,
    productId: normalizedProduct.id,
    cinemaProductId: normalizedInventory?.id || null,
    cinemaId: normalizedInventory?.cinemaId || null,
    categoryId: normalizedProduct.categoryId,
    category: normalizedCategory?.code || normalizedCategory?.name || '',
    categoryCode: normalizedCategory?.code || '',
    categoryName: normalizedCategory?.name || '',
    image: normalizedProduct.imageUrl,
    price: normalizedInventory?.price ?? null,
    stock: normalizedInventory?.stockQuantity ?? 0,
    stockQuantity: normalizedInventory?.stockQuantity ?? 0,
    isAvailable: Boolean(normalizedInventory?.isAvailable && normalizedProduct.status === 'ACTIVE'),
    assignedToCinema: Boolean(normalizedInventory),
  };
};

const toProductPayload = (payload = {}) => ({
  categoryId: normalizeResourceId(payload.categoryId),
  code: String(payload.code || '').trim().toUpperCase(),
  name: String(payload.name || '').trim(),
  description: String(payload.description || '').trim(),
  imageUrl: String(payload.imageUrl || payload.image || '').trim(),
  status: String(payload.status || 'ACTIVE').trim().toUpperCase(),
});

const toInventoryPayload = (productId, payload = {}) => ({
  cinemaId: normalizeResourceId(payload.cinemaId),
  productId: normalizeResourceId(productId),
  price: Number(payload.price),
  stockQuantity: Number(payload.stockQuantity ?? payload.stock ?? 0),
  isAvailable: Boolean(payload.isAvailable),
});

const concessionService = {
  async getCategories() {
    if (MOCK_API_ENABLED) {
      return [
        { id: 'food', code: 'FOOD', name: 'Đồ ăn' },
        { id: 'drink', code: 'DRINK', name: 'Đồ uống' },
        { id: 'combo', code: 'COMBO', name: 'Combo' },
      ];
    }

    const response = await apiClient.get(ENDPOINTS.PRODUCT_CATEGORIES, {
      params: { page: 0, size: 500 },
    });
    return contentOf(response).map(normalizeCategory);
  },

  async listCatalog() {
    if (MOCK_API_ENABLED) {
      return contentOf(await apiClient.get(MOCK_BASE, { params: { page: 0, size: 500 } }));
    }

    const response = await apiClient.get(ENDPOINTS.PRODUCTS, {
      params: { page: 0, size: 500 },
    });
    return contentOf(response).map(normalizeProduct);
  },

  async list(params = {}) {
    if (MOCK_API_ENABLED) {
      return contentOf(await apiClient.get(MOCK_BASE, { params }));
    }

    const cinemaId = normalizeResourceId(params.cinemaId);
    if (!cinemaId) return [];

    const [productsResponse, categoriesResponse, inventoryResponse] = await Promise.all([
      apiClient.get(ENDPOINTS.PRODUCTS, { params: { page: 0, size: 500 } }),
      apiClient.get(ENDPOINTS.PRODUCT_CATEGORIES, { params: { page: 0, size: 500 } }),
      apiClient.get(ENDPOINTS.CINEMA_PRODUCTS, { params: { page: 0, size: 1000 } }),
    ]);

    const products = contentOf(productsResponse).map(normalizeProduct);
    const categories = contentOf(categoriesResponse).map(normalizeCategory);
    const inventories = contentOf(inventoryResponse)
      .map(normalizeInventory)
      .filter((item) => sameResourceId(item.cinemaId, cinemaId));

    const productById = new Map(products.map((product) => [String(product.id), product]));
    const categoryById = new Map(categories.map((category) => [String(category.id), category]));

    return inventories
      .map((inventory) => {
        const product = productById.get(String(inventory.productId));
        if (!product) return null;
        return joinConcession(product, inventory, categoryById.get(String(product.categoryId)));
      })
      .filter(Boolean)
      .sort((left, right) => left.name.localeCompare(right.name, 'vi'));
  },

  async create(payload = {}) {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.post(MOCK_BASE, payload));
    }

    const productPayload = toProductPayload(payload);
    const product = normalizeProduct(unwrapApiData(
      await apiClient.post(ENDPOINTS.PRODUCTS, productPayload),
    ));

    try {
      const inventory = normalizeInventory(unwrapApiData(
        await apiClient.post(ENDPOINTS.CINEMA_PRODUCTS, toInventoryPayload(product.id, payload)),
      ));
      const category = (await this.getCategories())
        .find((item) => sameResourceId(item.id, product.categoryId));
      return joinConcession(product, inventory, category);
    } catch (error) {
      // Avoid leaving an orphan catalog item when inventory creation fails.
      try {
        await apiClient.delete(`${ENDPOINTS.PRODUCTS}/${product.id}`);
      } catch (_) {
        // Best-effort rollback only. Preserve the original inventory error.
      }
      throw error;
    }
  },

  async update(recordOrId, payload = {}) {
    if (MOCK_API_ENABLED) {
      const id = typeof recordOrId === 'object' ? recordOrId.id : recordOrId;
      return unwrapApiData(await apiClient.put(`${MOCK_BASE}/${normalizeResourceId(id)}`, payload));
    }

    const record = typeof recordOrId === 'object' ? recordOrId : { productId: recordOrId };
    const productId = normalizeResourceId(record.productId ?? record.id);
    if (!productId) throw new Error('Thiếu productId để cập nhật sản phẩm.');

    const product = normalizeProduct(unwrapApiData(
      await apiClient.put(`${ENDPOINTS.PRODUCTS}/${productId}`, toProductPayload(payload)),
    ));

    const inventoryPayload = toInventoryPayload(productId, payload);
    const cinemaProductId = normalizeResourceId(record.cinemaProductId ?? payload.cinemaProductId);
    const inventory = cinemaProductId
      ? normalizeInventory(unwrapApiData(await apiClient.put(
        `${ENDPOINTS.CINEMA_PRODUCTS}/${cinemaProductId}`,
        inventoryPayload,
      )))
      : normalizeInventory(unwrapApiData(await apiClient.post(
        ENDPOINTS.CINEMA_PRODUCTS,
        inventoryPayload,
      )));

    const category = (await this.getCategories())
      .find((item) => sameResourceId(item.id, product.categoryId));
    return joinConcession(product, inventory, category);
  },

  async removeFromCinema(recordOrId) {
    if (MOCK_API_ENABLED) {
      const id = typeof recordOrId === 'object' ? recordOrId.id : recordOrId;
      return apiClient.delete(`${MOCK_BASE}/${normalizeResourceId(id)}`);
    }

    const record = typeof recordOrId === 'object' ? recordOrId : { cinemaProductId: recordOrId };
    const cinemaProductId = normalizeResourceId(record.cinemaProductId ?? record.id);
    if (!cinemaProductId) throw new Error('Sản phẩm chưa có bản ghi inventory tại rạp này.');
    return apiClient.delete(`${ENDPOINTS.CINEMA_PRODUCTS}/${cinemaProductId}`);
  },

  async delete(id) {
    // Backwards-compatible alias: in real mode deletion removes only the
    // cinema-specific inventory record, never the global Product catalog row.
    return this.removeFromCinema(id);
  },

  async deleteProduct(productId) {
    if (MOCK_API_ENABLED) return apiClient.delete(`${MOCK_BASE}/${normalizeResourceId(productId)}`);
    return apiClient.delete(`${ENDPOINTS.PRODUCTS}/${normalizeResourceId(productId)}`);
  },
};

export {
  joinConcession,
  normalizeCategory,
  normalizeInventory,
  normalizeProduct,
  toInventoryPayload,
  toProductPayload,
};
export default concessionService;
