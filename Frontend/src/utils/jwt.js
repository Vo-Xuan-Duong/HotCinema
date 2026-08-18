const decodeBase64Url = (value) => {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = globalThis.atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) return null;

  try {
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch {
    return null;
  }
};

export const getJwtExpiryMs = (token) => {
  const payload = decodeJwtPayload(token);
  const exp = Number(payload?.exp);
  return Number.isFinite(exp) ? exp * 1000 : null;
};

export const isJwtExpired = (token, skewMs = 0) => {
  const expiry = getJwtExpiryMs(token);
  if (!expiry) return true;
  return expiry - Date.now() <= Math.max(0, Number(skewMs) || 0);
};

export const userFromAccessToken = (token) => {
  const claims = decodeJwtPayload(token);
  if (!claims) return null;

  const rawRoles = Array.isArray(claims.roles)
    ? claims.roles
    : claims.role
      ? [claims.role]
      : [];
  const roles = rawRoles
    .map((role) => typeof role === 'string' ? role.replace(/^ROLE_/i, '').toUpperCase() : role)
    .filter(Boolean);

  return {
    id: claims.sub || claims.userId || claims.id || null,
    email: claims.email || claims.preferred_username || null,
    fullName: claims.name || claims.fullName || claims.email || 'HotCinema User',
    roles,
    role: roles[0] || null,
  };
};
