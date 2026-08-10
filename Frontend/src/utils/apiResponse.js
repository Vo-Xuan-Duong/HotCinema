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
  return [];
};

export const unwrapApiPage = (response) => {
  const data = unwrapApiData(response);
  return isObject(data) ? data : {};
};
