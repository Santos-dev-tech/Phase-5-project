import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dailyMenus: [],
  currentMenu: null,
  isLoading: false,
  error: null,
};

const menusSlice = createSlice({
  name: "menus",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMenus: (state, action) => {
      state.dailyMenus = action.payload;
    },
    setCurrentMenu: (state, action) => {
      state.currentMenu = action.payload;
    },
  },
});

export const { clearError, setMenus, setCurrentMenu } = menusSlice.actions;
export default menusSlice.reducer;
