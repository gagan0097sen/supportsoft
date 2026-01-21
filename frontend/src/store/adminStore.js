import { create } from 'zustand';
import adminService from '../services/adminService';

export const useAdminStore = create((set) => ({
  plans: [],
  subscriptions: [],
  stats: null,
  expiringSubscriptions: [],
  usersWithSubscriptions: [],
  loading: false,
  error: null,

  // Plans
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getAllPlans();
      set({ plans: data.data || data });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch plans';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  getPlanById: async (id) => {
    try {
      return await adminService.getPlanById(id);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch plan';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  createPlan: async (planData) => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.createPlan(planData);
      set((state) => ({
        plans: [...state.plans, data.data || data],
      }));
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create plan';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  updatePlan: async (id, planData) => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.updatePlan(id, planData);
      set((state) => ({
        plans: state.plans.map((p) => (p._id === id ? data.data || data : p)),
      }));
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update plan';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  deletePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      await adminService.deletePlan(id);
      set((state) => ({
        plans: state.plans.filter((p) => p._id !== id),
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete plan';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Subscriptions
  fetchSubscriptions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getAllSubscriptions();
      set({ subscriptions: data.data || data });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subscriptions';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const data = await adminService.getSubscriptionStats();
      set({ stats: data.data || data });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch stats';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  fetchExpiringSubscriptions: async () => {
    try {
      const data = await adminService.getExpiringSubscriptions();
      set({ expiringSubscriptions: data.data || data });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch expiring subscriptions';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  sendExpiryNotification: async (subscriptionId) => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.sendExpiryNotification(subscriptionId);
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send notification';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  // Users
  fetchUsersWithSubscriptions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getAllUsersWithSubscriptions();
      set({ usersWithSubscriptions: data.data || data });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch users';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ loading }),
}));
