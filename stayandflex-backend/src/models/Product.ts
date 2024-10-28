import { Schema, model, Document, Types, Query } from 'mongoose';
import User, { IUser } from './User'; // Adjust the import based on your project structure

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  averageRating: number;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  countInStock: number;
}



interface IReview {
  user: Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new Schema<IProduct>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    countInStock: { type: Number, required: true, default: 0 },

  },
  { timestamps: true }
);

productSchema.index({ name: 'text' });

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ averageRating: 1 });

// Middleware to remove the product from all users' wishlists when deleted
productSchema.pre('deleteOne', { document: false, query: true }, async function (next: any) {
    try {
      const query = this as Query<any, any>;
      const productId = query.getFilter()['_id'];
  
      if (productId) {
        await User.updateMany({}, { $pull: { wishlist: productId } });
        console.log(`Product ${productId} removed from all wishlists.`);
      }
  
      next();
    } catch (error) {
      console.error('Error in pre deleteOne middleware:', error);
      next(error);
    }
  });


export default model<IProduct>('Product', productSchema);
