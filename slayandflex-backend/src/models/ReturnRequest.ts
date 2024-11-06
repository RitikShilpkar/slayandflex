import { Schema, model, Document, Types } from 'mongoose';

interface IReturnRequest {
  order: Types.ObjectId;
  user: Types.ObjectId;
  orderItem: {
    product: Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
  };
  reason: string;
  status: string; 
  refundAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReturnRequestDocument extends Document {
  order: Types.ObjectId;
  user: Types.ObjectId;
  orderItem: {
    product: Types.ObjectId;
    name: string;
    image: string;
    price: number;
    quantity: number;
  };
  reason: string;
  status: string;
  refundAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const returnRequestSchema = new Schema<IReturnRequestDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItem: {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Refunded'], default: 'Pending' },
    refundAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model<IReturnRequestDocument>('ReturnRequest', returnRequestSchema);
