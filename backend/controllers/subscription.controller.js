import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import emailService from '../services/email.service.js';
import mongoose from 'mongoose';

export const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ active: true });

    res.json({
      message: 'Plans retrieved successfully',
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({
      message: 'Plan retrieved successfully',
      plan
    });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// export const createSubscription = async (req, res) => {
//   try {
//     const { planId } = req.body;
//     console.log('Creating subscription for plan ID:', planId,req.user._id, req.body);

//     // Validate plan exists
//     const plan = await Plan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({ message: 'Plan not found' });
//     }

//     // Check if user already has active subscription
//     const existingSubscription = await Subscription.findOne({
//       userId: req.user._id,
//       status: 'active'
//     });
//     if (existingSubscription) {
//       return res.status(409).json({ message: 'User already has an active subscription' });
//     }

//     // Create subscription with proper endDate calculation based on plan duration
//     const startDate = new Date();
//     const endDate = new Date(startDate.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000);
    
//     const subscription = new Subscription({
//       userId: req.user._id,
//       planId: plan._id,
//       planName: plan.name,
//       planPrice: plan.price,
//       status: 'active',
//       startDate,
//       endDate,
//       userEmail: req.user.email,
//       currentPeriodStart: startDate,
//       currentPeriodEnd: endDate,
//       nextBillingDate: endDate
//     });

//     await subscription.save();

//     // Update user's subscription reference
//     await User.findByIdAndUpdate(
//       req.user._id,
//       { subscription: subscription._id }
//     );

//     res.status(201).json({
//       message: 'Subscription created successfully',
//       subscription
//     });
//   } catch (error) {
//     console.error('Create subscription error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };


export const createSubscription = async (req, res) => {
  try {
    console.log('RAW BODY:', req.body);

    // ✅ Extract correct planId
    const planId =
      typeof req.body.planId === 'object'
        ? req.body.planId.planId
        : req.body.planId;

    // ✅ Validate planId
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res.status(400).json({
        message: 'Invalid planId. Expected Mongo ObjectId string.'
      });
    }

    console.log('Using planId:', planId);

    // ✅ Validate plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    const userId = req.user._id.toString();

    // ✅ Check existing subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: 'active'
    });

    if (existingSubscription) {
      return res.status(409).json({
        message: 'User already has an active subscription'
      });
    }

    // ✅ Dates
    const startDate = new Date();
    const endDate = new Date(
      startDate.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000
    );

    const subscription = new Subscription({
      userId,
      planId: plan._id,
      planName: plan.name,
      planPrice: plan.price,
      status: 'active',
      startDate,
      endDate,
      userEmail: req.user.email,
      currentPeriodStart: startDate,
      currentPeriodEnd: endDate,
      nextBillingDate: endDate
    });

    await subscription.save();

    await User.findByIdAndUpdate(userId, {
      subscription: subscription._id
    });

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id })
      .populate('planId');

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    res.json({
      message: 'Subscription retrieved successfully',
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findById(subscriptionId)
      .populate('userId')
      .populate('planId');

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user is owner or admin
    if (subscription.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({
      message: 'Subscription retrieved successfully',
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const upgradeSubscription = async (req, res) => {
  try {
    const { planId } = req.body;

    // Validate plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Find current subscription
    const subscription = await Subscription.findOne({ userId: req.user._id });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Check if new plan is different
    if (subscription.planId.toString() === planId) {
      return res.status(400).json({ message: 'Cannot upgrade to same plan' });
    }

    // Update subscription
    subscription.planId = plan._id;
    subscription.planName = plan.name;
    subscription.planPrice = plan.price;
    subscription.updatedAt = new Date();

    await subscription.save();

    res.json({
      message: 'Subscription upgraded successfully',
      subscription
    });
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediate } = req.body;

    const subscription = await Subscription.findById(subscriptionId).populate('userId');
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if user is owner
    if (subscription.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // If immediate is true, cancel instantly; otherwise mark for cancellation at period end
    if (immediate) {
      subscription.status = 'cancelled';
      subscription.cancelAtPeriodEnd = false;
      subscription.cancelledAt = new Date();
    } else {
      subscription.cancelAtPeriodEnd = true;
    }

    subscription.updatedAt = new Date();
    await subscription.save();

    // Remove subscription reference from user if immediate
    if (immediate) {
      await User.findByIdAndUpdate(req.user._id, { subscription: null });
      
      // Send cancellation email
      await emailService.sendCancellationConfirmation(
        subscription.userId.email,
        subscription.userId.name,
        subscription.planName
      );
    }

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const reactivateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id }).populate('planId');

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Check if already active
    if (subscription.status === 'active' && !subscription.cancelAtPeriodEnd) {
      return res.status(400).json({ message: 'Subscription is already active' });
    }

    // Get plan duration
    const plan = subscription.planId;
    const newEndDate = new Date(Date.now() + plan.durationInDays * 24 * 60 * 60 * 1000);

    // Reactivate subscription
    subscription.status = 'active';
    subscription.cancelAtPeriodEnd = false;
    subscription.endDate = newEndDate;
    subscription.currentPeriodEnd = newEndDate;
    subscription.nextBillingDate = newEndDate;
    subscription.updatedAt = new Date();

    await subscription.save();

    // Update user subscription reference
    await User.findByIdAndUpdate(req.user._id, { subscription: subscription._id });

    res.json({
      message: 'Subscription reactivated successfully',
      subscription
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSubscriptionHistory = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id })
      .populate('planId')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Subscription history retrieved successfully',
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error('Get subscription history error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkSubscriptionStatus = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).populate('planId');

    if (!subscription) {
      return res.json({
        message: 'No active subscription',
        isActive: false,
        subscription: null
      });
    }

    // Check if subscription has expired
    if (new Date() > subscription.currentPeriodEnd) {
      subscription.status = 'expired';
      await subscription.save();

      return res.json({
        message: 'Subscription has expired',
        isActive: false,
        subscription
      });
    }

    res.json({
      message: 'Subscription is active',
      isActive: true,
      subscription
    });
  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
