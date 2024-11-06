import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import productReducer from './slices/productSlice';
import promotionReducer from './slices/promotionSlice';
import orderReducer from './slices/orderSlice'; 
import orderDetailsReducer from './slices/orderDetailsSlice';



const rootReducer  = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer,
  promotions: promotionReducer,
  orders: orderReducer, 
  orderDetails: orderDetailsReducer,

});

const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage,
  whitelist: ['auth', 'cart'], // Persist auth and cart slices
};

const persistedReducer = persistReducer(persistConfig, rootReducer as any);

const store = configureStore({
  reducer: persistedReducer,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);

export default store;
