import { Schema, model, Document, Types } from 'mongoose';

interface INotification {
  user: Types.ObjectId;
  type: string; // e.g., "order_confirmation", "payment_received", etc.
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface INotificationDocument extends Document {
  user: Types.ObjectId;
  type: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema: any = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

export default model<INotificationDocument>('Notification', notificationSchema);
