import apiClient from './api';

const subscriptionService = {
  // Plans
  getAllPlans: async () => {
    const response = await apiClient.get('/subscriptions/plans');
    return response.data;
  },

  getPlanById: async (planId) => {
    const response = await apiClient.get(`/subscriptions/plans/${planId}`);
    return response.data;
  },

  // User Subscriptions
  createSubscription: async (planId) => {
    const response = await apiClient.post('/subscriptions/create', { planId });
    return response.data;
  },

  getMySubscription: async () => {
    const response = await apiClient.get('/subscriptions/my');
    return response.data;
  },

  getSubscriptionById: async (subscriptionId) => {
    const response = await apiClient.get(`/subscriptions/${subscriptionId}`);
    return response.data;
  },

  upgradeSubscription: async (newPlanId) => {
    const response = await apiClient.put('/subscriptions/upgrade', { newPlanId });
    return response.data;
  },

  cancelSubscription: async (subscriptionId) => {
    const response = await apiClient.post(`/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  },

  reactivateSubscription: async (subscriptionId) => {
    const response = await apiClient.post('/subscriptions/reactivate', {
      subscriptionId,
    });
    return response.data;
  },

  getSubscriptionHistory: async () => {
    const response = await apiClient.get('/subscriptions/history');
    return response.data;
  },

  checkSubscriptionStatus: async () => {
    const response = await apiClient.get('/subscriptions/status/check');
    return response.data;
  },
};

export default subscriptionService;
