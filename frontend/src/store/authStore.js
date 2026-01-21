import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  // Initialize auth from token
  initAuth: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const user = await authService.getProfile();
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Auth init error:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      set({ loading: false });
    }
  },

  // Register
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register({
        name,
        email,
        password,
      });
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, error: null });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(email, password);
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, error: null });
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, isAuthenticated: false });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, error: null });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await authService.updateProfile(userData);
      set({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Update failed';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.changePassword(oldPassword, newPassword);
      return result;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Password change failed';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set loading
  setLoading: (loading) => set({ loading }),
}));
