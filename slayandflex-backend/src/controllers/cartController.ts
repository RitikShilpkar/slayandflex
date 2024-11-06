import { Request, Response, NextFunction } from 'express';
import Cart, { ICart, ICartItem } from '../models/Cart';
import Product from '../models/Product';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import mongoose from 'mongoose';
import User from '../models/User';

const ObjectId = mongoose.Types.ObjectId;

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
export const addToCart = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?._id;
      const { productId, quantity } = req.body;
  
      // Validate productId and quantity
      if (!productId || !quantity) {
        res.status(400);
        throw new Error('Product ID and quantity are required');
      }
  
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error('Invalid product ID');
      }
  
      if (quantity < 1) {
        res.status(400);
        throw new Error('Quantity must be at least 1');
      }
  
      const product = await Product.findById(productId);
  
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
  
      if (product.countInStock < quantity) {
        res.status(400);
        throw new Error('Not enough stock available');
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
  
      const cartItemIndex = user.cart.findIndex(
        (item) => item.product.toString() === productId
      );
  
      if (cartItemIndex > -1) {
        // Item exists in cart, update quantity
        user.cart[cartItemIndex].quantity += quantity;
      } else {
        // Item does not exist in cart, add new
        const newCartItem: any = {
          product: productId,
          quantity,
        };
        user.cart.push(newCartItem);
      }
  
      await user.save();
  
      res.status(200).json({ message: 'Item added to cart', cart: user.cart });
    } catch (error) {
      next(error);
    }
  };

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
export const getCartItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      res.json({ items: [] });
    } else {
      res.json(cart);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItemQuantity = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quantity } = req.body;
    const userId = req.user?._id;
    const productId = req.params.productId;

    if (!ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (i: any) => i.product.toString() === productId
    );

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Remove item if quantity is zero or less
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      res.json(cart);
    } else {
      res.status(404);
      throw new Error('Item not found in cart');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
export const removeFromCart = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?._id;
      const { productId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error('Invalid product ID');
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
  
      const initialCartLength = user.cart.length;
      user.cart = user.cart.filter(
        (item) => item.product.toString() !== productId
      );
  
      if (user.cart.length === initialCartLength) {
        res.status(404);
        throw new Error('Product not found in cart');
      }
  
      await user.save();
  
      res.status(200).json({ message: 'Item removed from cart', cart: user.cart });
    } catch (error) {
      next(error);
    }
  };
  

/**
 * @desc    Clear user's cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?._id;
  
      const user = await User.findById(userId);
  
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
  
      user.cart = [];
      await user.save();
  
      res.status(200).json({ message: 'Cart cleared', cart: user.cart });
    } catch (error) {
      next(error);
    }
  };
  


/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?._id;
  
      const user = await User.findById(userId).populate('cart.product');
  
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
  
      res.status(200).json({ cart: user.cart });
    } catch (error) {
      next(error);
    }
  };
  