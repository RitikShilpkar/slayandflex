import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../models/Plan';

dotenv.config();

const plans = [
  {
    name: 'basic',
    price: 100,
    services: ['Service A', 'Service B'],
    durationDays: 30,
  },
  {
    name: 'gold',
    price: 200,
    services: ['Service A', 'Service B', 'Service C'],
    durationDays: 90,
  },
  {
    name: 'premium',
    price: 300,
    services: ['Service A', 'Service B', 'Service C', 'Service D'],
    durationDays: 180,
  },
];

mongoose
  .connect(process.env.MONGO_URI || '')
  .then(async () => {
    console.log('Connected to MongoDB');
    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log('Plans seeded successfully');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  });
