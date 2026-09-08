export const ADMIN_ONLY_PATHS = ['/dashboard', '/settings', '/customers', '/rates', '/beds', '/reservations'];
export const ADMIN_SHARED_PATHS = ['/branches', '/rooms'];
export const ADMIN_PATHS = [...ADMIN_ONLY_PATHS, ...ADMIN_SHARED_PATHS];

export function isAdminPanelPath(path, isAdmin = false) {
  if (ADMIN_ONLY_PATHS.includes(path)) {
    return true;
  }

  return isAdmin && ADMIN_SHARED_PATHS.includes(path);
}

export function getAdminSection(path) {
  if (path === '/dashboard') return 'dashboard';
  if (path === '/branches') return 'branches';
  if (path === '/rates') return 'rates';
  if (path === '/rooms') return 'rooms';
  if (path === '/beds') return 'beds';
  if (path === '/customers') return 'customers';
  if (path === '/reservations') return 'reservations';
  return 'settings';
}
