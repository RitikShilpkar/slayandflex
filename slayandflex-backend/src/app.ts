import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./configs/db";
import authRoute from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";
import adminRoutes from "./routes/adminRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import orderRoutes from "./routes/orderRoutes";
import cartRoutes from "./routes/cartRoutes";
import productRoutes from "./routes/productRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import adminOrderRoutes from './routes/adminOrderRoutes';
import { apiLimiter } from './middlewares/rateLimiter';
import { auditLogger } from "./middlewares/auditLogger";
import inventoryRoutes from './routes/inventoryRoutes';
import notificationsRoutes from "./routes/notificationRoutes";
import returnRoutes from "./routes/returnRoutes";



dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'https://slayandflex.vercel.app/'], // Or '*', but it's better to specify your frontend's URL
  methods: 'GET,POST,PUT,DELETE',
}));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Apply rate limiting to all requests
app.use(apiLimiter);

app.use(auditLogger); // Apply audit logging to all requests


// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/products", productRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use('/api/orders/admin', adminOrderRoutes);

app.use('/api/inventory', inventoryRoutes);


app.use('api/notifications', notificationsRoutes)

app.use('api/returns', returnRoutes)



// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
