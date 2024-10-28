// src/models/Order.ts

import { Schema, model, Document, Types } from 'mongoose';

interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface IShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

interface IPaymentResult {
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

interface ITrackingInfo {
  carrier: string; // e.g., "FedEx", "UPS", "DHL"
  trackingNumber: string;
  status: string; // e.g., "Shipped", "In Transit", "Delivered"
  estimatedDelivery?: Date;
  trackingUrl?: string;
}

interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: string;
  paymentResult?: IPaymentResult;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isShipped: boolean;
  shippedAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  isCancelled: boolean;
  cancelledAt?: Date;
  trackingInfo?: ITrackingInfo; // New Field
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
  },
  { _id: false }
);

const paymentResultSchema = new Schema<IPaymentResult>(
  {
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
  },
  { _id: false }
);

const trackingInfoSchema = new Schema<ITrackingInfo>(
  {
    carrier: { type: String, required: true },
    trackingNumber: { type: String, required: true },
    status: { type: String, required: true },
    estimatedDelivery: { type: Date },
    trackingUrl: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: { type: String, required: true },
    paymentResult: paymentResultSchema,
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isShipped: { type: Boolean, required: true, default: false },
    shippedAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    isCancelled: { type: Boolean, required: true, default: false },
    cancelledAt: { type: Date, default: null },
    trackingInfo: { type: trackingInfoSchema }, // New Field
  },
  { timestamps: true }
);

export default model<IOrder>('Order', orderSchema);
