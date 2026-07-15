/**
 * Chuẩn hóa một giá trị role (string hoặc object từ API) thành chuỗi so khớp.
 */
export function normalizeRoleValue(role) {
  if (role == null) return '';
  if (typeof role === 'string') return role.trim().toLowerCase().replace(/^role_/i, '');
  if (typeof role === 'object') {
    const raw =
      role.name ??
      role.roleName ??
      role.authority ??
      role.code ??
      role.role ??
      role.label;
    if (typeof raw === 'string') return raw.trim().toLowerCase().replace(/^role_/i, '');
  }
  return '';
}

function isAdminNormalized(normalized) {
  if (!normalized) return false;
  return (
    normalized === 'admin' ||
    normalized === 'administrator' ||
    normalized === 'superadmin'
  );
}

/**
 * Quyền vào khu /admin — đồng bộ Header và RequireAdminRoute.
 * Hỗ trợ user.role (string), user.roles[] (string hoặc { name } như UserResponse backend).
 */
export function userHasAdminAccess(user) {
  if (!user) return false;

  if (isAdminNormalized(normalizeRoleValue(user.role))) return true;

  if (Array.isArray(user.roles)) {
    return user.roles.some((r) => isAdminNormalized(normalizeRoleValue(r)));
  }

  return false;
}
