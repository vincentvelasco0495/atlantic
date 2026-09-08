import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      isAuthenticated: () => Boolean(get().token),
      isAdmin: () => get().user?.role === 1,
      isCustomer: () => get().user?.role === 2,
    }),
    {
      name: 'atlantic-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    },
  ),
);

export function migrateLegacyAuthStorage() {
  const { token, setAuth } = useAuthStore.getState();

  if (token) {
    return;
  }

  const legacyToken = localStorage.getItem('auth_token');
  const legacyUser = localStorage.getItem('auth_user');

  if (!legacyToken || !legacyUser) {
    return;
  }

  try {
    setAuth({
      token: legacyToken,
      user: JSON.parse(legacyUser),
    });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  } catch {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
