import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import User from "../models/User";
import Product from "../models/Product";
import mongoose from "mongoose";

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const productId: any = req.params.productId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error('Invalid product ID');
      }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      res.status(400);
      throw new Error("Product is already in your wishlist");
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({ message: "Product added to wishlist" });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;
    const productId: any = req.params.productId;


    if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error('Invalid product ID');
      }

    // Get user
    const user = await User.findById(userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      res.status(400);
      throw new Error("Product is not in your wishlist");
    }

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );
    await user.save();

    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (error) {
    next(error);
  }
};


// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?._id;
  
      // Get user with populated wishlist
      const user = await User.findById(userId).populate('wishlist');
  
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
  
      res.status(200).json(user.wishlist);
    } catch (error) {
      next(error);
    }
  };
  