import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import mongoose from 'mongoose';

// @desc    Update product stock
// @route   PUT /api/inventory/:productId
// @access  Private/Admin
export const updateProductStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.productId;
    const { countInStock } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Invalid product ID');
    }

    // Validate countInStock
    if (countInStock === undefined || typeof countInStock !== 'number') {
      res.status(400);
      throw new Error('countInStock must be a number');
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    product.countInStock = countInStock;
    await product.save();

    res.status(200).json({ message: 'Product stock updated', product });
  } catch (error) {
    next(error);
  }
};
