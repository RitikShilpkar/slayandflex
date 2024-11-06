
import mongoose from 'mongoose';
import Order from '../models/Order'; 
const fixOrders = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your_database_name');

    const ordersToFix = await Order.find({ isPaid: false, isDelivered: true });

    for (const order of ordersToFix) {
      order.isDelivered = false;
      order.deliveredAt = undefined;
      await order.save();
      console.log(`Fixed order ${order._id}`);
    }

    console.log('Data correction completed.');
    process.exit();
  } catch (error) {
    console.error('Error correcting data:', error);
    process.exit(1);
  }
};

fixOrders();
