import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const usePlanStore = create((set) => ({
  plans: [],
  loading: false,
  error: null,

  // Fetch all plans
  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/plans`);
      set({ plans: response.data.data || response.data.plans || [], loading: false });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch plans';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Create plan
  createPlan: async (planData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Creating plan with data:', planData);
      const response = await axios.post(
        `${API_BASE_URL}/admin/plans`,
        planData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        plans: [...state.plans, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create plan';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Update plan
  updatePlan: async (planId, planData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Updating plan ID:', planId, 'with data:', planData);
      const response = await axios.put(
        `${API_BASE_URL}/admin/plans/${planId}`,
        planData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        plans: state.plans.map((p) =>
          p._id === planId ? response.data.data : p
        ),
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update plan';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Delete plan
  deletePlan: async (planId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Deleting plan ID:', planId);
      await axios.delete(
        `${API_BASE_URL}/admin/plans/${planId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      set((state) => ({
        plans: state.plans.filter((p) => p._id !== planId),
        loading: false,
      }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete plan';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
