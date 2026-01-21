import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getAllPlans,
  getPlanById,
  createSubscription,
  getMySubscription,
  getSubscriptionById,
  upgradeSubscription,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionHistory,
  checkSubscriptionStatus
} from '../controllers/subscription.controller.js';

const router = express.Router();
router.get('/plans', asyncHandler(getAllPlans));
router.get('/plans/:planId', asyncHandler(getPlanById));

router.post('/create', authenticate, asyncHandler(createSubscription));
router.get('/my', authenticate, asyncHandler(getMySubscription));
router.get('/:subscriptionId', authenticate, asyncHandler(getSubscriptionById));
router.put('/upgrade', authenticate, asyncHandler(upgradeSubscription));
router.post('/:subscriptionId/cancel', authenticate, asyncHandler(cancelSubscription));
router.post('/reactivate', authenticate, asyncHandler(reactivateSubscription));
router.get('/history', authenticate, asyncHandler(getSubscriptionHistory));
router.get('/status/check', authenticate, asyncHandler(checkSubscriptionStatus));

export default router;
