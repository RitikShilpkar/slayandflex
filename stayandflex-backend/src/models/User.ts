import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

interface INotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "admin" | "brand";
  addresses?: Address[];
  matchPassword(enteredPassword: string): Promise<boolean>;
  wishlist: Types.ObjectId[];
  cart: ICartItem[];
  notificationPreferences: INotificationPreferences;
}

export interface Address {
  _id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;
}

const addressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const notificationPreferencesSchema = new Schema<INotificationPreferences>(
  {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true },
  },
  { _id: false }
);

const cartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    phone: { type: String },
    role: {
      type: String,
      enum: ["customer", "admin", "brand"],
      default: "customer",
    },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    cart: [cartItemSchema],
    notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model<IUser>("User", userSchema);
export default User;
