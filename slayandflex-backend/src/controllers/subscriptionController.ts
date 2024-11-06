import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

// @desc    Get available subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions
// @access  Private/User
export const subscribeToPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { plan: planName } = req.body;

    // Validate plan
    const selectedPlan = await Plan.findOne({ name: planName });
    if (!selectedPlan) {
      res.status(400);
      throw new Error('Invalid subscription plan');
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user?._id,
      isActive: true,
    });

    if (existingSubscription) {
      res.status(400);
      throw new Error('You already have an active subscription');
    }

    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + selectedPlan.durationDays);

    // Create subscription
    const subscription = new Subscription({
      user: req.user?._id,
      plan: selectedPlan.name,
      services: selectedPlan.services,
      price: selectedPlan.price,
      startDate,
      endDate,
      isActive: true,
    });

    const createdSubscription = await subscription.save();

    res.status(201).json(createdSubscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Change subscription plan
// @route   PUT /api/subscriptions/:id/change
// @access  Private/User
export const changeSubscriptionPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscriptionId = req.params.id;
    const { planName } = req.body;

    // Validate plan
    const newPlan = await Plan.findOne({ name: planName });
    if (!newPlan) {
      res.status(400);
      throw new Error('Invalid subscription plan');
    }

    // Find existing subscription
    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user?._id,
      isActive: true,
    });

    if (!subscription) {
      res.status(404);
      throw new Error('Active subscription not found');
    }

    // Update subscription
    subscription.plan = newPlan.name;
    subscription.services = newPlan.services;
    subscription.price = newPlan.price;
    subscription.endDate = new Date(subscription.startDate);
    subscription.endDate.setDate(subscription.startDate.getDate() + newPlan.durationDays);

    await subscription.save();

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's active subscription
// @route   GET /api/subscriptions/my
// @access  Private/User
export const getMySubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user?._id,
      isActive: true,
    });

    res.json(subscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private/User
export const cancelSubscription = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscriptionId = req.params.id;

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      user: req.user?._id,
      isActive: true,
    });

    if (!subscription) {
      res.status(404);
      throw new Error('Active subscription not found');
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    next(error);
  }
};



// @desc    Add a new subscription plan
// @route   POST /api/subscriptions/plans
// @access  Private/Admin
export const addPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, price, services, durationDays } = req.body;

    // Validate input
    if (!name || !price || !services || !durationDays) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }

    // Check if a plan with the same name already exists
    const existingPlan = await Plan.findOne({ name });
    if (existingPlan) {
      res.status(400);
      throw new Error('A plan with this name already exists');
    }

    // Create new plan
    const plan = new Plan({
      name,
      price,
      services,
      durationDays,
    });

    const createdPlan = await plan.save();

    res.status(201).json({
      message: 'Plan added successfully',
      plan: createdPlan,
    });
  } catch (error) {
    next(error);
  }
};
