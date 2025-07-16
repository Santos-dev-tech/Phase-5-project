import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";

const initialState = {
  user: null,
  meals: [],
  todaysMenu: [],
  orders: [],
  totalRevenue: 0,
  loading: false,
  notifications: [],
};

const appReducer = (state, action) => {
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
          ? { ...order, status: action.payload.status }
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

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Mock API calls
  const actions = {
    login: async (email, password) => {
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

    register: async (userData) => {
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

    placeOrder: async (mealId) => {
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

    placeOrderWithPayment: async (mealId, paymentData) => {
      if (!state.user) return;
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        // Place the order with payment data
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: state.user.id,
            customerName: state.user.name,
            mealId,
            paymentData: {
              phoneNumber: paymentData.phoneNumber,
              amount:
                paymentData.amount ||
                state.todaysMenu.find((m) => m.id === mealId)?.price,
              checkoutRequestId: paymentData.checkoutRequestId,
              mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
            },
            paymentStatus: paymentData.mpesaReceiptNumber
              ? "completed"
              : "pending",
          }),
        });

        const orderData = await orderResponse.json();
        if (orderData.success) {
          dispatch({ type: "ADD_ORDER", payload: orderData.data });
          if (paymentData.mpesaReceiptNumber) {
            toast.success("Order placed and payment confirmed!");
          } else {
            toast.success("Order placed! Payment confirmation pending...");
          }
        } else {
          toast.error(orderData.message || "Order failed");
        }
      } catch (error) {
        toast.error("Order failed");
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },

    updateOrderStatus: async (orderId, status) => {
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

    addMeal: async (mealData) => {
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

    deleteMeal: async (mealId) => {
      try {
        dispatch({ type: "DELETE_MEAL", payload: mealId });
        toast.success("Meal deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete meal");
      }
    },

    loadTodaysMenu: async () => {
      try {
        console.log("🔄 Loading today's menu...");
        const response = await fetch("/api/menu/today");
        console.log("📡 Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📋 Menu data received:", data);

        if (data.success) {
          dispatch({ type: "SET_TODAYS_MENU", payload: data.data });
          console.log("✅ Today's menu loaded successfully");
        } else {
          console.error("❌ Menu API returned success: false", data);
        }
      } catch (error) {
        console.error("❌ Failed to load today's menu:", error.message);
        console.error("🔍 Full error:", error);
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
