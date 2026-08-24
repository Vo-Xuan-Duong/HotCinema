const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

const ENVELOPE_METADATA_KEYS = new Set([
  'status',
  'statusCode',
  'code',
  'message',
  'success',
  'timestamp',
  'errors',
]);

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const isApiEnvelope = (value) => {
  if (!isObject(value) || !hasOwn(value, 'data')) return false;
  const keys = Object.keys(value);
  return keys.length === 1 || keys.some((key) => ENVELOPE_METADATA_KEYS.has(key));
};

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizePageShape = (data) => {
  if (!isObject(data)) return {};

  // Backend PageResponse<T> uses { items, pagination } while several frontend
  // screens consume the conventional Spring page aliases. Normalize once here
  // so services/components do not need backend-specific branching.
  if (Array.isArray(data.items) && isObject(data.pagination)) {
    const pagination = data.pagination;
    const page = toFiniteNumber(pagination.page, 0);
    const size = toFiniteNumber(pagination.pageSize, data.items.length);
    const totalElements = toFiniteNumber(pagination.totalItems, data.items.length);
    const totalPages = toFiniteNumber(pagination.totalPages, totalElements > 0 && size > 0 ? Math.ceil(totalElements / size) : 0);

    return {
      ...data,
      content: data.items,
      number: page,
      size,
      totalElements,
      total: totalElements,
      totalPages,
      first: pagination.hasPrevious === undefined ? page === 0 : !pagination.hasPrevious,
      last: pagination.hasNext === undefined ? page + 1 >= totalPages : !pagination.hasNext,
      hasNext: Boolean(pagination.hasNext),
      hasPrevious: Boolean(pagination.hasPrevious),
    };
  }

  return data;
};

/**
 * Normalize the application response envelope after apiClient has already
 * removed the Axios response wrapper. Nested ResponseData envelopes are
 * supported, while domain objects that merely contain a `data` field remain intact.
 */
export const unwrapApiData = (response) => {
  let value = response;
  let depth = 0;

  while (isApiEnvelope(value) && depth < 3) {
    value = value.data;
    depth += 1;
  }

  return value;
};

export const unwrapApiArray = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const unwrapApiPage = (response) => normalizePageShape(unwrapApiData(response));
