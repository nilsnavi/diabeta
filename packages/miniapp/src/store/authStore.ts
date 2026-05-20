import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  legalStatus: {
    acceptedTermsAt: string | null;
    acceptedPrivacyAt: string | null;
    acceptedHealthDataConsentAt: string | null;
  } | null;
  setAuth: (token: string, user: User) => void;
  setLegalStatus: (status: AuthState['legalStatus']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      legalStatus: null,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      setLegalStatus: (status) => set({ legalStatus: status }),
      logout: () => set({ token: null, user: null, isAuthenticated: false, legalStatus: null }),
    }),
    { name: 'diabeta-auth' },
  ),
);
