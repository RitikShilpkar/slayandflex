import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: string;
  services: string[];
  price: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const SubscriptionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, required: true },
  services: [{ type: String }],
  price: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
