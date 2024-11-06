import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  orders: any;
  // Add other user properties if needed
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk for logging in
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log({response});
      console.log({response: response.data.token});
      
      if (typeof window !== 'undefined' && response.data.token) {
        console.log({aa: response.data.token});
        
         window.document.cookie = response.data.token
      }
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Login failed');
    }
  }
);

// Async thunk for registering
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      console.log({response: response.data.token});
      
      if (typeof window !== 'undefined' && response.data.token) {
        console.log({aa: response.data.token});
        
         window.document.cookie = response.data.token
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Registration failed');
    }
  }
);

// Async thunk for fetching user data
export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/auth/user');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch user');
    }
  }
);

// Async thunk for logging out
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/api/auth/logout');
      return;
    } catch (error: any) {
      return rejectWithValue(error.response.data.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      // Handle login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        console.log({user: action.payload});
        
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetch user
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      // Handle logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
