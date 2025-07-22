import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = '/api';

// Async thunks for meal operations
export const fetchMealsByCaterer = createAsyncThunk(
  'meals/fetchMealsByCaterer',
  async ({ catererId, category, available }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (available !== undefined) params.append('available', available);

      const response = await fetch(`${API_BASE}/meals/caterer/${catererId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: 'Network error',
        message: 'Failed to fetch meals'
      });
    }
  }
);

export const fetchMealById = createAsyncThunk(
  'meals/fetchMealById',
  async (mealId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/meals/${mealId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: 'Network error',
        message: 'Failed to fetch meal'
      });
    }
  }
);

export const createMeal = createAsyncThunk(
  'meals/createMeal',
  async (mealData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(mealData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: 'Network error',
        message: 'Failed to create meal'
      });
    }
  }
);

export const updateMeal = createAsyncThunk(
  'meals/updateMeal',
  async ({ mealId, mealData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/meals/${mealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(mealData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        error: 'Network error',
        message: 'Failed to update meal'
      });
    }
  }
);

export const deleteMeal = createAsyncThunk(
  'meals/deleteMeal',
  async (mealId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/meals/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data);
      }

      return { mealId, ...data };
    } catch (error) {
      return rejectWithValue({
        error: 'Network error',
        message: 'Failed to delete meal'
      });
    }
  }
);

// Initial state
const initialState = {
  meals: [],
  currentMeal: null,
  categories: [],
  isLoading: false,
  error: null,
};

// Meals slice
const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMeal: (state) => {
      state.currentMeal = null;
    },
    setMeals: (state, action) => {
      state.meals = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch meals by caterer
      .addCase(fetchMealsByCaterer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealsByCaterer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meals = action.payload.mealOptions;
        state.error = null;
      })
      .addCase(fetchMealsByCaterer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch meal by ID
      .addCase(fetchMealById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMealById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMeal = action.payload.mealOption;
        state.error = null;
      })
      .addCase(fetchMealById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create meal
      .addCase(createMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meals.push(action.payload.mealOption);
        state.error = null;
      })
      .addCase(createMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update meal
      .addCase(updateMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.meals.findIndex(meal => meal.id === action.payload.mealOption.id);
        if (index !== -1) {
          state.meals[index] = action.payload.mealOption;
        }
        if (state.currentMeal && state.currentMeal.id === action.payload.mealOption.id) {
          state.currentMeal = action.payload.mealOption;
        }
        state.error = null;
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete meal
      .addCase(deleteMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meals = state.meals.filter(meal => meal.id !== action.payload.mealId);
        if (state.currentMeal && state.currentMeal.id === action.payload.mealId) {
          state.currentMeal = null;
        }
        state.error = null;
      })
      .addCase(deleteMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Action creators
export const { clearError, clearCurrentMeal, setMeals } = mealsSlice.actions;

// Selectors
export const selectMeals = (state) => state.meals;
export const selectMealsList = (state) => state.meals.meals;
export const selectCurrentMeal = (state) => state.meals.currentMeal;
export const selectMealsLoading = (state) => state.meals.isLoading;
export const selectMealsError = (state) => state.meals.error;

export default mealsSlice.reducer;
