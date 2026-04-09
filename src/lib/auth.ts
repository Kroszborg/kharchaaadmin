'use client';

const TOKEN_KEY = 'kh_access_token';
const REFRESH_KEY = 'kh_refresh_token';

export const auth = {
  setTokens(access: string, refresh: string) {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  },
  getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isLoggedIn(): boolean {
    return !!auth.getToken();
  },
};
