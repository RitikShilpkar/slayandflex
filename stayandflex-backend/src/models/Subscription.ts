import { Schema, model, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  user: Types.ObjectId;
  plan: 'basic' | 'gold' | 'premium';
  services: string[];
  price: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['basic', 'gold', 'premium'],
      required: true,
    },
    services: [{ type: String }],
    price: { type: Number, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Subscription = model<ISubscription>('Subscription', subscriptionSchema);
export default Subscription;
