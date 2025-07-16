import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";

// Types
interface Meal {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  prepTime: string;
  category: string;
  available: boolean;
  image: string;
}

interface Order {
  id: number;
  customerId: number;
  customerName: string;
  mealId: number;
  meal: string;
  price: number;
  status: "preparing" | "ready" | "delivered";
  orderTime: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: "customer" | "admin";
  token: string;
}

interface AppState {
  user: User | null;
  meals: Meal[];
  todaysMenu: Meal[];
  orders: Order[];
  totalRevenue: number;
  loading: boolean;
  notifications: string[];
}

type AppAction =
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_MEALS"; payload: Meal[] }
  | { type: "SET_TODAYS_MENU"; payload: Meal[] }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "ADD_ORDER"; payload: Order }
  | {
      type: "UPDATE_ORDER_STATUS";
      payload: { orderId: number; status: string };
    }
  | { type: "ADD_MEAL"; payload: Meal }
  | { type: "DELETE_MEAL"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "ADD_NOTIFICATION"; payload: string }
  | { type: "CLEAR_NOTIFICATIONS" };

const initialState: AppState = {
  user: null,
  meals: [],
  todaysMenu: [],
  orders: [],
  totalRevenue: 0,
  loading: false,
  notifications: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_MEALS":
      return { ...state, meals: action.payload };
    case "SET_TODAYS_MENU":
      return { ...state, todaysMenu: action.payload };
    case "SET_ORDERS":
      const totalRevenue = action.payload.reduce(
        (sum, order) => sum + order.price,
        0,
      );
      return { ...state, orders: action.payload, totalRevenue };
    case "ADD_ORDER":
      const newOrders = [...state.orders, action.payload];
      const newRevenue = newOrders.reduce((sum, order) => sum + order.price, 0);
      return {
        ...state,
        orders: newOrders,
        totalRevenue: newRevenue,
        notifications: [
          ...state.notifications,
          `New order from ${action.payload.customerName}!`,
        ],
      };
    case "UPDATE_ORDER_STATUS":
      const updatedOrders = state.orders.map((order) =>
        order.id === action.payload.orderId
          ? { ...order, status: action.payload.status as any }
          : order,
      );
      return { ...state, orders: updatedOrders };
    case "ADD_MEAL":
      return { ...state, meals: [...state.meals, action.payload] };
    case "DELETE_MEAL":
      return {
        ...state,
        meals: state.meals.filter((meal) => meal.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, notifications: [] };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    placeOrder: (mealId: number) => Promise<void>;
    updateOrderStatus: (orderId: number, status: string) => Promise<void>;
    addMeal: (mealData: any) => Promise<void>;
    deleteMeal: (mealId: number) => Promise<void>;
    loadTodaysMenu: () => Promise<void>;
    loadOrders: () => Promise<void>;
    loadMeals: () => Promise<void>;
  };
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Mock API calls
  const actions = {
    login: async (email: string, password: string) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "SET_USER", payload: data.data });
          localStorage.setItem("user", JSON.stringify(data.data));
          toast.success("Login successful!");
        } else {
          toast.error(data.message || "Login failed");
        }
      } catch (error) {
        toast.error("Login failed");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },

    register: async (userData: any) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "SET_USER", payload: data.data });
          localStorage.setItem("user", JSON.stringify(data.data));
          toast.success("Registration successful!");
        } else {
          toast.error(data.message || "Registration failed");
        }
      } catch (error) {
        toast.error("Registration failed");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },

    logout: () => {
      dispatch({ type: "SET_USER", payload: null });
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
    },

    placeOrder: async (mealId: number) => {
      if (!state.user) return;
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: state.user.id,
            customerName: state.user.name,
            mealId,
          }),
        });
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "ADD_ORDER", payload: data.data });
          toast.success("Order placed successfully!");
        } else {
          toast.error(data.message || "Order failed");
        }
      } catch (error) {
        toast.error("Order failed");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },

    updateOrderStatus: async (orderId: number, status: string) => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        const data = await response.json();
        if (data.success) {
          dispatch({
            type: "UPDATE_ORDER_STATUS",
            payload: { orderId, status },
          });
          toast.success(`Order status updated to ${status}`);
        }
      } catch (error) {
        toast.error("Failed to update order status");
      }
    },

    addMeal: async (mealData: any) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mealData),
        });
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "ADD_MEAL", payload: data.data });
          toast.success("Meal added successfully!");
        } else {
          toast.error(data.message || "Failed to add meal");
        }
      } catch (error) {
        toast.error("Failed to add meal");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },

    deleteMeal: async (mealId: number) => {
      try {
        dispatch({ type: "DELETE_MEAL", payload: mealId });
        toast.success("Meal deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete meal");
      }
    },

    loadTodaysMenu: async () => {
      try {
        const response = await fetch("/api/menu/today");
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "SET_TODAYS_MENU", payload: data.data });
        }
      } catch (error) {
        console.error("Failed to load today's menu");
      }
    },

    loadOrders: async () => {
      try {
        const response = await fetch("/api/orders");
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "SET_ORDERS", payload: data.data });
        }
      } catch (error) {
        console.error("Failed to load orders");
      }
    },

    loadMeals: async () => {
      try {
        const response = await fetch("/api/meals");
        const data = await response.json();
        if (data.success) {
          dispatch({ type: "SET_MEALS", payload: data.data });
        }
      } catch (error) {
        console.error("Failed to load meals");
      }
    },
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch({ type: "SET_USER", payload: JSON.parse(storedUser) });
    }
  }, []);

  // Auto-refresh data every 30 seconds for real-time sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.user?.role === "admin") {
        actions.loadOrders();
      }
      actions.loadTodaysMenu();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.user]);

  // Show notifications
  useEffect(() => {
    if (state.notifications.length > 0 && state.user?.role === "admin") {
      state.notifications.forEach((notification) => {
        toast.info(notification);
      });
      dispatch({ type: "CLEAR_NOTIFICATIONS" });
    }
  }, [state.notifications, state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
