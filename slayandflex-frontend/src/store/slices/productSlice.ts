import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Product {
  _id: string | null | undefined;
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

interface ProductState {
  products: Product[];
  productDetails: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  productDetails: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchAll', async () => {
  const response = await api.get('/api/products');
  return response.data.products;
});

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchBySlug',
  async (slug: string) => {
    const response = await api.get(`/api/products/${slug}`);
    return response.data;
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      // Fetch product by slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.productDetails = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.productDetails = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch product details';
      });
  },
});

export default productSlice.reducer;
