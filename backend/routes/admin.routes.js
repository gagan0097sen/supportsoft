import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getAllSubscriptions,
  getSubscriptionStats,
  getAllUsersWithSubscriptions,
  getExpiringSubscriptions,
  sendExpiryNotification,
  getSubscriptionById,
  createSubscriptionForUser,
  updateSubscription,
  deleteSubscription,
  getAllUsers,
  deleteUsers
} from '../controllers/admin.controller.js';

const router = express.Router();

// ===================== PLAN ROUTES =====================
router.get('/plans', getAllPlans);
router.get('/plans/:id', getPlanById);
router.post('/plans', authenticate, authorize('admin'), createPlan);
router.put('/plans/:id', authenticate, authorize('admin'), updatePlan);
router.delete('/plans/:id', authenticate, authorize('admin'), deletePlan);

// ===================== SUBSCRIPTION ROUTES =====================
router.get('/subscriptions', authenticate, authorize('admin'), getAllSubscriptions);
router.post('/subscriptions', authenticate, authorize('admin'), createSubscriptionForUser);
router.get('/subscriptions/stats', authenticate, authorize('admin'), getSubscriptionStats);
router.get('/subscriptions/expiring', authenticate, authorize('admin'), getExpiringSubscriptions);
router.get('/subscriptions/:id', authenticate, authorize('admin'), getSubscriptionById);
router.put('/subscriptions/:id', authenticate, authorize('admin'), updateSubscription);
router.delete('/subscriptions/:id', authenticate, authorize('admin'), deleteSubscription);
router.post('/subscriptions/:subscriptionId/notify', authenticate, authorize('admin'), sendExpiryNotification);

// ===================== USER ROUTES =====================
router.get('/users/subscriptions', authenticate, authorize('admin'), getAllUsersWithSubscriptions);
  router.get('/all-users', authenticate, authorize('admin'), getAllUsers);
  router.delete('/users/:id', authenticate, authorize('admin'), deleteUsers);

export default router;
