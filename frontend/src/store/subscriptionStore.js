import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useSubscriptionStore = create((set) => ({
  plans: [],
  subscriptions: [],
  mySubscription: null,
  subscriptionHistory: [],
  loading: false,
  error: null,

  // Get all plans
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/plans`);
      set({ plans: response.data.plans || response.data.data || [], loading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch plans';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Admin: Get all subscriptions
  fetchSubscriptions: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_BASE_URL}/admin/subscriptions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ subscriptions: response.data.data || response.data, loading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subscriptions';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Get plan by ID
  getPlanById: async (planId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/plans/${planId}`);
      return response.data.plan || response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch plan';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  // Create subscription (user)
  createSubscription: async (planId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Creating subscription for plan ID:', planId);
      const response = await axios.post(
        `${API_BASE_URL}/subscriptions/create`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set({ mySubscription: response.data.subscription, loading: false });
      return response.data.subscription;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Admin: Create subscription for user
  createSubscriptionForUser: async (subscriptionData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        `${API_BASE_URL}/admin/subscriptions`,
        subscriptionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        subscriptions: [...state.subscriptions, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Admin: Update subscription
  updateSubscription: async (subscriptionId, subscriptionData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_BASE_URL}/admin/subscriptions/${subscriptionId}`,
        subscriptionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        subscriptions: state.subscriptions.map((s) =>
          s._id === subscriptionId ? response.data.data : s
        ),
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Admin: Delete subscription
  deleteSubscription: async (subscriptionId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(
        `${API_BASE_URL}/admin/subscriptions/${subscriptionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        subscriptions: state.subscriptions.filter((s) => s._id !== subscriptionId),
        loading: false,
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Get my subscription

  fetchMySubscription: async () => {
    set({ loading: true, error: null });
    try {
      const data = await subscriptionService.getMySubscription();
      set({ mySubscription: data.data || data, loading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Get subscription by ID
  getSubscriptionById: async (subscriptionId) => {
    try {
      const data = await subscriptionService.getSubscriptionById(subscriptionId);
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch subscription';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  // Upgrade subscription
  upgradeSubscription: async (newPlanId) => {
    set({ loading: true, error: null });
    try {
      const data = await subscriptionService.upgradeSubscription(newPlanId);
      set({ mySubscription: data.data || data, loading: false });
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upgrade subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    set({ loading: true, error: null });
    try {
      const data = await subscriptionService.cancelSubscription(subscriptionId);
      set({ mySubscription: null, loading: false });
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Reactivate subscription
  reactivateSubscription: async (subscriptionId) => {
    set({ loading: true, error: null });
    try {
      const data = await subscriptionService.reactivateSubscription(subscriptionId);
      set({ mySubscription: data.data || data, loading: false });
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reactivate subscription';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Get subscription history
  fetchSubscriptionHistory: async () => {
    set({ loading: true, error: null });
    try {
      const data = await subscriptionService.getSubscriptionHistory();
      set({ subscriptionHistory: data.data || data, loading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch history';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Check subscription status
  checkStatus: async () => {
    try {
      const data = await subscriptionService.checkSubscriptionStatus();
      return data.data || data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to check status';
      set({ error: errorMsg });
      throw new Error(errorMsg);
    }
  },

  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ loading }),
}));
