import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import mealsSlice from './slices/mealsSlice';
import menusSlice from './slices/menusSlice';
import ordersSlice from './slices/ordersSlice';
import notificationsSlice from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    meals: mealsSlice,
    menus: menusSlice,
    orders: ordersSlice,
    notifications: notificationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
