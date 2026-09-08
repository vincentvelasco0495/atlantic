export const ROLE_ADMIN = 1;
export const ROLE_CUSTOMER = 2;

export function getPostLoginPath(user) {
  return user?.role === ROLE_ADMIN ? '/dashboard' : '/';
}
