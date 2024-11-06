import mongoose, { Schema, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  price: number;
  services: string[];
  durationDays: number;
}

const PlanSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  services: [{ type: String }],
  durationDays: { type: Number, required: true },
});

export default mongoose.model<IPlan>('Plan', PlanSchema);
