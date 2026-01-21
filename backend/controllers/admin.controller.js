import Plan from '../models/Plan.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import emailService from '../services/email.service.js';

// ===================== PLAN CONTROLLERS =====================

/**
 * Get all plans with filters and sorting
 */
export const getAllPlans = async (req, res) => {
  try {
    const { name, minPrice, maxPrice, status, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter object
    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (status) filter.active = status === 'active';

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    const plans = await Plan.find(filter).sort(sortObj);

    res.json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single plan by ID
 */
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create new plan (Admin only)
 */
// export const createPlan = async (req, res) => {
//   try {
//     const { name, description, price, duration, features } = req.body;
//     console.log('Creating plan with data:', req.body);
//     // Validation
//     if (!name || !description || price === undefined || !duration) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Name, description, price, and duration are required' 
//       });
//     }

//     const durationInDays = (() => {
//       const { value, unit } = duration;
//       switch (unit) {
//         case 'days': return value;
//         case 'months': return value * 30;
//         case 'years': return value * 365;
//         default: return value;
//       } 
//     })();

//     const plan = new Plan({
//       name,
//       description,
//       price,
//       duration,
//       durationInDays,
//       features: features || [],
//       createdBy: req.user._id
//     });
//     console.log('Saving plan:', plan);
//     await plan.save();
//     console.log('Plan created successfully:');
//     // Send email notification to all users about new plan
//     const emailResult = await emailService.sendNewPlanAnnouncement(name, description, price, features || []);
// console.log('Email notification result:', emailResult);
//     res.status(201).json({
//       success: true,
//       message: 'Plan created successfully and announcement sent to all users',
//       data: plan
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({ success: false, message: 'Plan name already exists' });
//     }
//     console.error('Create plan error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const createPlan = async (req, res) => {
  try {
    const { name, description, price, duration, features } = req.body;

    console.log('Creating plan with data:', req.body);

    // Basic validation
    if (
      !name ||
      !description ||
      price === undefined ||
      !duration ||
      !duration.value
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and duration are required'
      });
    }

    const plan = new Plan({
      name,
      description,
      price,
      duration, // { value, unit }
      features: features || [],
      createdBy: req.user._id
    });

    console.log('Saving plan:', plan);
    await plan.save();

    // Send email notification
    const emailResult = await emailService.sendNewPlanAnnouncement(
      name,
      description,
      price,
      features || []
    );

    console.log('Email notification result:', emailResult);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully and announcement sent to all users',
      data: plan
    });
  } catch (error) {
    console.error('Create plan error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Plan name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/**
 * Update plan (Admin only)
 */
export const updatePlan = async (req, res) => {
  try {
    const { name, description, price, duration, features, active } = req.body;

    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (name) plan.name = name;
    if (description) plan.description = description;
    if (price !== undefined) plan.price = price;
    if (duration) plan.duration = duration;
    if (features) plan.features = features;
    if (active !== undefined) plan.active = active;

    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Plan name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete plan (Admin only)
 */
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Cancel all subscriptions for this plan
    await Subscription.updateMany(
      { planId: req.params.id, status: 'active' },
      { status: 'cancelled', cancelledAt: new Date() }
    );

    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== SUBSCRIPTION CONTROLLERS =====================

/**
 * Get all subscriptions with filters (Admin only)
 */
export const getAllSubscriptions = async (req, res) => {
  try {
    const { status, planId, userId, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (planId) filter.planId = planId;
    if (userId) filter.userId = userId;

    // Build sort
    const sortObj = {};
    sortObj[sortBy] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscriptions = await Subscription.find(filter)
      .populate('userId', 'name email')
      .populate('planId', 'name price')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(filter);

    res.json({
      success: true,
      data: subscriptions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get subscription statistics (Admin only)
 */
export const getSubscriptionStats = async (req, res) => {
  try {
    const stats = {
      totalSubscriptions: await Subscription.countDocuments(),
      activeSubscriptions: await Subscription.countDocuments({ status: 'active' }),
      expiredSubscriptions: await Subscription.countDocuments({ status: 'expired' }),
      cancelledSubscriptions: await Subscription.countDocuments({ status: 'cancelled' }),
      totalUsers: await User.countDocuments({ role: 'user' }),
      totalRevenue: 0
    };

    // Calculate total revenue
    const revenue = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$planPrice' } } }
    ]);

    stats.totalRevenue = revenue[0]?.total || 0;

    // Get subscriptions by plan
    const byPlan = await Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$planName', count: { $sum: 1 } } }
    ]);

    stats.subscriptionsByPlan = byPlan;

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get users with their subscriptions (Admin only)
 */
export const getAllUsersWithSubscriptions = async (req, res) => {
  try {
    const { status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;

    const filter = { role: 'user' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .populate({
        path: 'subscription',
        match: status ? { status } : {},
        populate: { path: 'planId', select: 'name price' }
      })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get subscriptions expiring soon (for notifications)
 */
export const getExpiringSubscriptions = async (req, res) => {
  try {
    const daysUntilExpiry = 3;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + daysUntilExpiry * 24 * 60 * 60 * 1000);

    const subscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lte: expiryDate, $gte: now },
      expiryNotificationSent: false
    })
      .populate('userId', 'firstName lastName email')
      .populate('planId', 'name');

    res.json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Manually send expiry notification
 */
export const sendExpiryNotification = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        expiryNotificationSent: true,
        notificationSentAt: new Date()
      },
      { new: true }
    ).populate('userId', 'firstName lastName email').populate('planId', 'name');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as sent',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('planId');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create subscription for user (Admin only)
 */
export const createSubscriptionForUser = async (req, res) => {
  try {
    const { userId, planId, startDate } = req.body;

    // Validate required fields
    if (!userId || !planId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Plan ID are required' 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: 'active'
    });
    if (existingSubscription) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already has an active subscription' 
      });
    }

    // Create subscription
    const subscription = new Subscription({
      userId,
      planId: plan._id,
      planName: plan.name,
      planPrice: plan.price,
      status: 'active',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: startDate 
        ? new Date(new Date(startDate).getTime() + plan.durationInDays * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + plan.durationInDays * 24 * 60 * 60 * 1000),
      userEmail: user.email
    });

    await subscription.save();

    // Update user subscription reference
    await User.findByIdAndUpdate(userId, { subscription: subscription._id });

    // Send confirmation email
    await emailService.sendSubscriptionConfirmation(
      user.email,
      user.name,
      plan.name,
      plan.price,
      subscription.endDate
    );

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update subscription (Admin only)
 */
export const updateSubscription = async (req, res) => {
  try {
    const { planId, status, endDate } = req.body;
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Update plan if provided
    if (planId) {
      const plan = await Plan.findById(planId);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }
      subscription.planId = plan._id;
      subscription.planName = plan.name;
      subscription.planPrice = plan.price;
    }

    // Update status if provided
    if (status) {
      subscription.status = status;
    }

    // Update end date if provided
    if (endDate) {
      subscription.endDate = new Date(endDate);
    }

    subscription.updatedAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete subscription (Admin only)
 */
export const deleteSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByIdAndDelete(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Remove subscription reference from user
    await User.findByIdAndUpdate(
      subscription.userId,
      { subscription: null }
    );

    res.json({ 
      success: true, 
      message: 'Subscription deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');  
    console.log('Fetched users:', users);
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Deleting user with ID:', userId);
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    } 
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


