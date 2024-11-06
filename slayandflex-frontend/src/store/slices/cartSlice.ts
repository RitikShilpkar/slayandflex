import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from './productSlice';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
   addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalAmount += action.payload.price * action.payload.quantity;
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((item) => item._id === productId);
      if (item) {
        item.quantity += quantity;
        state.totalAmount += item.price * quantity;

        if (item.quantity <= 0) {
          // Remove item if quantity is zero or less
          state.items = state.items.filter((item) => item._id !== productId);
        }
      }
    },
    removeItemFromCart: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      console.log({
        payload: action.payload, productId
      });
      
      const item = state.items.find((item) => item._id === productId);
      if (item) {
        state.totalAmount -= item.price * item.quantity;
        state.items = state.items.filter((item) => item._id !== productId);
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
