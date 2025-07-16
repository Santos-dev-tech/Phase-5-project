import React, { createContext, useContext, useReducer, useEffect } from "react";
import { toast } from "sonner";
import {
  auth,
  signInWithGoogle,
  logout as firebaseLogout,
  addOrder,
  addTransaction,
  subscribeToUserOrders,
} from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

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

    loginWithGoogle: async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const result = await signInWithGoogle();
        const user = result.user;
        const userData = {
          id: user.uid,
          name: user.displayName,
          email: user.email,
          role: "customer", // Default role for new users
          photoURL: user.photoURL,
        };
        dispatch({ type: "SET_USER", payload: userData });
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Google login successful!");
      } catch (error) {
        console.error("Google login failed:", error);
        toast.error("Google login failed");
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

    logout: async () => {
      try {
        await firebaseLogout();
        dispatch({ type: "SET_USER", payload: null });
        localStorage.removeItem("user");
        toast.success("Logged out successfully");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed");
      }
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
        const meal = state.todaysMenu.find((m) => m.id === mealId);
        const orderData = {
          customerId: state.user.id,
          customerName: state.user.name,
          mealId,
          mealName: meal?.name || "Unknown",
          price: meal?.price || 0,
          paymentData: {
            phoneNumber: paymentData.phoneNumber,
            amount: paymentData.amount || meal?.price,
            checkoutRequestId: paymentData.checkoutRequestId,
            mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
          },
          paymentStatus: paymentData.mpesaReceiptNumber
            ? "completed"
            : "pending",
          status: "pending",
        };

        // Save to Firebase
        const firebaseOrderId = await addOrder(orderData);

        // Also save transaction to Firebase
        if (paymentData.mpesaReceiptNumber) {
          await addTransaction({
            userId: state.user.id,
            orderId: firebaseOrderId,
            type: "mpesa_payment",
            amount: orderData.paymentData.amount,
            phoneNumber: paymentData.phoneNumber,
            mpesaReceiptNumber: paymentData.mpesaReceiptNumber,
            checkoutRequestId: paymentData.checkoutRequestId,
            status: "completed",
          });
        }

        // Also save to existing backend API
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        const backendData = await orderResponse.json();
        if (backendData.success) {
          dispatch({
            type: "ADD_ORDER",
            payload: { ...orderData, id: firebaseOrderId },
          });
          if (paymentData.mpesaReceiptNumber) {
            toast.success("Order placed and payment confirmed!");
          } else {
            toast.success("Order placed! Payment confirmation pending...");
          }
        } else {
          toast.error(backendData.message || "Order failed");
        }
      } catch (error) {
        console.error("Order failed:", error);
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
        console.log("🔄 Loading orders...");
        const response = await fetch("/api/orders");
        console.log("📡 Orders response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📋 Orders data received:", data);

        if (data.success) {
          dispatch({ type: "SET_ORDERS", payload: data.data });
          console.log("✅ Orders loaded successfully");
        } else {
          console.error("❌ Orders API returned success: false", data);
        }
      } catch (error) {
        console.error("❌ Failed to load orders:", error.message);
        console.error("🔍 Full error:", error);
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

  // Load user from localStorage and Firebase Auth on app start
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          role: "customer", // Default role
          photoURL: firebaseUser.photoURL,
        };
        dispatch({ type: "SET_USER", payload: userData });
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // Check localStorage as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          dispatch({ type: "SET_USER", payload: JSON.parse(storedUser) });
        }
      }
    });

    return () => unsubscribe();
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
