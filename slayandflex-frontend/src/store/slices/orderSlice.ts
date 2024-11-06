// src/store/slices/orderSlice.ts

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: any; // Replace with proper type if available
  paymentMethod: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

// Async thunk to fetch user orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/orders/myorders');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Add any synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle pending state
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Handle fulfilled state
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      // Handle rejected state
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;
