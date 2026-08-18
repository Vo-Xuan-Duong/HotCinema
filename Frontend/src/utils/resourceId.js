const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Normalize API identifiers without coercing UUIDs to numbers.
 * Numeric mock identifiers are kept as numbers for backwards compatibility,
 * while real backend UUIDs remain strings end-to-end.
 */
export const normalizeResourceId = (value) => {
  if (value == null) return null;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalized = String(value).trim();
  if (!normalized) return null;
  if (UUID_PATTERN.test(normalized)) return normalized;

  if (/^\d+$/.test(normalized)) {
    const numeric = Number(normalized);
    return Number.isSafeInteger(numeric) ? numeric : normalized;
  }

  return normalized;
};

export const normalizeResourceIds = (values) => (
  [...new Set((Array.isArray(values) ? values : [values])
    .map(normalizeResourceId)
    .filter((value) => value != null))]
);

export const sameResourceId = (left, right) => {
  const a = normalizeResourceId(left);
  const b = normalizeResourceId(right);
  return a != null && b != null && String(a) === String(b);
};

export const isUuid = (value) => UUID_PATTERN.test(String(value || '').trim());
