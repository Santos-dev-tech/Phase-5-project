import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
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
} from "./routes/mealy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
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

  return app;
}
