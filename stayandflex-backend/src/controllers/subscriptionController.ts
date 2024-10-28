import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { Types } from 'mongoose';

// Mock data for plans (In a real application, consider storing this in the database)
const plans = [
  {
    plan: 'basic',
    price: 100,
    services: ['Service A', 'Service B'],
    durationDays: 30, // Subscription duration in days
  },
  {
    plan: 'gold',
    price: 200,
    services: ['Service A', 'Service B', 'Service C'],
    durationDays: 90,
  },
  {
    plan: 'premium',
    price: 300,
    services: ['Service A', 'Service B', 'Service C', 'Service D'],
    durationDays: 180,
  },
];

// @desc    Get available subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
export const getPlans = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions
// @access  Private/Brand Owner
export const subscribeToPlan = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { plan } = req.body;

    // Validate plan
    const selectedPlan = plans.find((p) => p.plan === plan);
    if (!selectedPlan) {
      res.status(400);
      throw new Error('Invalid subscription plan');
    }

    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + selectedPlan.durationDays);

    // Create subscription
    const subscription = new Subscription({
      user: req.user?._id,
      plan: selectedPlan.plan,
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

// @desc    Get current user's subscriptions
// @route   GET /api/subscriptions/my
// @access  Private/Brand Owner
export const getMySubscriptions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user?._id });
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a subscription
// @route   PUT /api/subscriptions/:id/cancel
// @access  Private/Brand Owner
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
    });

    if (!subscription) {
      res.status(404);
      throw new Error('Subscription not found');
    }

    if (!subscription.isActive) {
      res.status(400);
      throw new Error('Subscription is already inactive');
    }

    subscription.isActive = false;
    await subscription.save();

    res.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    next(error);
  }
};
