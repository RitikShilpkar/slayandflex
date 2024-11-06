import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Order } from './orderSlice';

interface OrderDetailsState {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderDetailsState = {
  order: null,
  loading: false,
  error: null,
};

export const fetchOrderDetails = createAsyncThunk(
  'orderDetails/fetchOrderDetails',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
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

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {
    // Add any synchronous reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.order = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.order = null;
      });
  },
});

export default orderDetailsSlice.reducer;
