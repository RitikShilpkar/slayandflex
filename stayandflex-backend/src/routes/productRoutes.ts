import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';
import { addProductReview } from '../controllers/reviewController';
import { check } from 'express-validator';



const router = Router();

router
  .route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('admin'), createProduct);

router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('admin'), updateProduct)
  .delete(protect, authorizeRoles('admin'), deleteProduct);

  router.post(
    '/:id/reviews',
    protect,
    [
      check('rating', 'Rating is required and must be a number between 1 and 5')
        .isInt({ min: 1, max: 5 }),
      check('comment', 'Comment is required').not().isEmpty(),
    ],
    addProductReview
  );

export default router;
