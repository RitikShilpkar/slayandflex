import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Product from '../models/Product';
import Order from '../models/Order';

export const addProductReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user?._id;

    // Check if product exists
    const product = await Product.findById(productId);

    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    
    // Check if user has purchased the product
    const hasPurchased = await Order.exists({
      user: userId,
      'orderItems.product': productId,
      isPaid: true,
    });

    if (!hasPurchased) {
      res.status(400);
      throw new Error('You must purchase the product before leaving a review');
    }

    // Check if user has already reviewed the product
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === (userId as string).toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('You have already reviewed this product');
    }

    // Create a new review
    const review = {
      user: userId,
      name: req.user?.name,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(review as any);

    // Update number of reviews and average rating
    product.numReviews = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    next(error);
  }
};
