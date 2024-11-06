import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Plan {
  name: string;
  plan: string;
  price: number;
  services: string[];
  durationDays: number;
}

interface PromotionState {
  plans: Plan[];
  currentPlan: Plan | null;
  loading: boolean;
  error: string | null;
}

const initialState: PromotionState = {
  plans: [],
  currentPlan: null,
  loading: false,
  error: null,
};

// Async thunk to fetch plans
export const fetchPlans = createAsyncThunk(
  'promotions/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/subscriptions/plans');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch plans');
    }
  }
);

// Async thunk to subscribe to a plan
export const subscribePlan = createAsyncThunk(
  'promotions/subscribePlan',
  async (planName: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/subscriptions/plans/subscribe', { plan: planName });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Failed to subscribe to plan');
    }
  }
);

// Async thunk to cancel the current plan
export const cancelPlan = createAsyncThunk(
  'promotions/cancelPlan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/subscriptions/plans/cancel');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Failed to cancel plan');
    }
  }
);

// Async thunk to fetch the user's current plan
export const fetchCurrentPlan = createAsyncThunk(
  'promotions/fetchCurrentPlan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/subscriptions/my');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch current plan');
    }
  }
);

const promotionSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Subscribe to plan
      .addCase(subscribePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(subscribePlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(subscribePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Cancel plan
      .addCase(cancelPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPlan.fulfilled, (state) => {
        state.loading = false;
        state.currentPlan = null;
      })
      .addCase(cancelPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch current plan
      .addCase(fetchCurrentPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload;
      })
      .addCase(fetchCurrentPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default promotionSlice.reducer;
