import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeDatabase } from "./database/db.js";

// Import route handlers
import { handleDemo } from "./routes/demo.js";
import authRoutes from "./routes/auth.js";
import mealsRoutes from "./routes/meals.js";
import {
  getTodaysMenu,
  getMealOptions,
  addMealOption,
  deleteMealOption,
  placeOrder,
  getOrders,
  updateOrderStatus,
  getCustomerOrders,
  login,
  register,
} from "./routes/mealy.js";
import {
  initiateMpesaPayment,
  checkPaymentStatus,
  handleMpesaCallback,
  getPaymentTransactions,
  testMpesaConfig,
  verifyPayment,
} from "./routes/payments.js";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Trust proxy for rate limiting to work correctly
  app.set("trust proxy", 1);

  // Initialize database on startup
  initializeDatabase();

  // Middleware
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:8080",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Mealy API",
      version: "1.0.0",
    });
  });

  // Legacy ping endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Mealy Express server!" });
  });

  app.get("/api/demo", handleDemo);

  // NEW AUTHENTICATION ROUTES (JWT-based)
  app.use("/api/auth", authRoutes);

  // NEW MEAL MANAGEMENT ROUTES
  app.use("/api/meals", mealsRoutes);

  // General meals endpoint for frontend compatibility
  app.get("/api/meals", getMealOptions);

  // LEGACY Mealy API routes (keep for backward compatibility)
  // Authentication (legacy)
  app.post("/api/legacy/auth/login", login);
  app.post("/api/legacy/auth/register", register);

  // Menu & Meals (legacy)
  app.get("/api/menu/today", getTodaysMenu);
  app.get("/api/legacy/meals", getMealOptions);
  app.post("/api/legacy/meals", addMealOption);
  app.delete("/api/legacy/meals/:mealId", deleteMealOption);

  // Orders (legacy)
  app.post("/api/orders", placeOrder);
  app.get("/api/orders", getOrders);
  app.put("/api/orders/:orderId/status", updateOrderStatus);
  app.get("/api/customers/:customerId/orders", getCustomerOrders);

  // M-Pesa Payment Routes
  app.post("/api/payments/mpesa/initiate", initiateMpesaPayment);
  app.get("/api/payments/mpesa/status/:checkoutRequestId", checkPaymentStatus);
  app.post("/api/payments/mpesa/callback", handleMpesaCallback);
  app.get("/api/payments/transactions", getPaymentTransactions);
  app.get("/api/payments/mpesa/test", testMpesaConfig);
  app.post("/api/payments/mpesa/verify", verifyPayment);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  });

  // 404 handler for API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({
      error: "Endpoint not found",
      message: `The requested endpoint ${req.path} does not exist`,
    });
  });

  return app;
}
