import apiClient from './api';

const adminService = {
  // Plans Management
  getAllPlans: async () => {
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await apiClient.get(`/admin/plans/${id}`);
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await apiClient.post('/admin/plans', planData);
    return response.data;
  },

  updatePlan: async (id, planData) => {
    const response = await apiClient.put(`/admin/plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await apiClient.delete(`/admin/plans/${id}`);
    return response.data;
  },

  // Subscriptions Management
  getAllSubscriptions: async () => {
    const response = await apiClient.get('/admin/subscriptions');
    return response.data;
  },

  getSubscriptionStats: async () => {
    const response = await apiClient.get('/admin/subscriptions/stats');
    return response.data;
  },

  getExpiringSubscriptions: async () => {
    const response = await apiClient.get('/admin/subscriptions/expiring');
    return response.data;
  },

  getSubscriptionById: async (id) => {
    const response = await apiClient.get(`/admin/subscriptions/${id}`);
    return response.data;
  },

  sendExpiryNotification: async (subscriptionId) => {
    const response = await apiClient.post(
      `/admin/subscriptions/${subscriptionId}/notify`
    );
    return response.data;
  },

  // Users Management
  getAllUsersWithSubscriptions: async () => {
    const response = await apiClient.get('/admin/users/subscriptions');
    return response.data;
  },
};

export default adminService;
