import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo.js";
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

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Mealy Restaurant API v2.0 - M-Pesa Ready!" });
  });

  app.get("/api/demo", handleDemo);

  // Mealy API routes
  // Authentication
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);

  // Menu & Meals
  app.get("/api/menu/today", getTodaysMenu);
  app.get("/api/meals", getMealOptions);
  app.post("/api/meals", addMealOption);
  app.delete("/api/meals/:mealId", deleteMealOption);

  // Orders
  app.post("/api/orders", placeOrder);
  app.get("/api/orders", getOrders);
  app.put("/api/orders/:orderId/status", updateOrderStatus);
  app.get("/api/customers/:customerId/orders", getCustomerOrders);

  // Real M-Pesa Payment routes
  app.post("/api/payments/mpesa/initiate", initiateMpesaPayment);
  app.get("/api/payments/mpesa/status/:checkoutRequestId", checkPaymentStatus);
  app.post("/api/payments/mpesa/callback", handleMpesaCallback);
  app.get("/api/payments/transactions", getPaymentTransactions);
  app.get("/api/payments/mpesa/test", testMpesaConfig);
  app.post("/api/payments/mpesa/verify", verifyPayment);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Mealy Restaurant API",
      mpesa: "ready",
      businessAccount: "0746013145",
    });
  });

  return app;
}
