import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

const TOKEN_KEY = 'auth_token';

const useAuthStore = create((set) => ({
  token: null,
  user: null,
  setAuth: ({ token, user }) => {
    // update axios header and persist token
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // fire-and-forget persistence
      SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
    } else {
      delete api.defaults.headers.common['Authorization'];
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    }
    set({ token, user });
  },
  logout: () => {
    delete api.defaults.headers.common['Authorization'];
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({ token: null, user: null });
  }
}));

export async function initAuthFromStorage() {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      useAuthStore.getState().setAuth({ token, user: null });
    }
  } catch {}
}

export default useAuthStore;
