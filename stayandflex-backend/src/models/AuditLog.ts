import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  admin: Types.ObjectId;
  action: string;
  order: Types.ObjectId;
  timestamp: Date;
  details?: any;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default model<IAuditLog>('AuditLog', auditLogSchema);
