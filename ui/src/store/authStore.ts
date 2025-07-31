import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loginUser,
  registerUser,
  logout as logoutService,
  verifyTokenService,
} from '../services/authService';
import { RegisterFormData, LoginFormData } from '../types/forms';

interface User {
  username: string;
  email?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginUser: (data: LoginFormData) => Promise<void>;
  registerUser: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      loginUser: async (data) => {
        try {
          const response = await loginUser(data);
          set({
            user: {
              username: data.username,
              token: response.token,
            },
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Login failed in store:', error);
          throw error;
        }
      },

      registerUser: async (data) => {
        try {
          const response = await registerUser(data);
          set({
            user: {
              username: data.username,
              email: data.email,
              token: response.token,
            },
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Register failed in store:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await logoutService();
        } catch (error) {
          console.warn('Logout request failed:', error);
        }
        set({ user: null, isAuthenticated: false });
      },

      verifyToken: async () => {
        try {
          const result = await verifyTokenService();

          if (result.success) {
            const { username, email, token } = result.data;
            set({
              user: { username, email, token },
              isAuthenticated: true,
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage', // persisted in localStorage
    }
  )
);
