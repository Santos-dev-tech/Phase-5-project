import { RequestHandler } from "express";

// Mock data
const mealOptions = [
  {
    id: 1,
    name: "Beef with Rice",
    description: "Tender beef strips served with jasmine rice and vegetables",
    price: 12.99,
    rating: 4.8,
    prepTime: "25-30 min",
    category: "Main Course",
    available: true,
  },
  {
    id: 2,
    name: "Chicken Stir Fry",
    description: "Fresh chicken with mixed vegetables in savory sauce",
    price: 10.99,
    rating: 4.6,
    prepTime: "20-25 min",
    category: "Main Course",
    available: true,
  },
  {
    id: 3,
    name: "Fish and Chips",
    description: "Crispy battered fish with golden fries and tartar sauce",
    price: 13.99,
    rating: 4.7,
    prepTime: "30-35 min",
    category: "Main Course",
    available: false,
  },
  {
    id: 4,
    name: "Vegetarian Pasta",
    description: "Creamy pasta with seasonal vegetables and herbs",
    price: 9.99,
    rating: 4.5,
    prepTime: "15-20 min",
    category: "Main Course",
    available: true,
  },
];

let orders = [
  {
    id: 1,
    customerId: 1,
    customerName: "John Doe",
    mealId: 1,
    meal: "Beef with Rice",
    price: 12.99,
    status: "preparing",
    orderTime: new Date().toISOString(),
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Jane Smith",
    mealId: 2,
    meal: "Chicken Stir Fry",
    price: 10.99,
    status: "ready",
    orderTime: new Date().toISOString(),
  },
];

// Get today's menu
export const getTodaysMenu: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: mealOptions.filter((meal) => meal.available),
    date: new Date().toISOString().split("T")[0],
  });
};

// Get all meal options (admin)
export const getMealOptions: RequestHandler = (req, res) => {
  res.json({
    success: true,
    data: mealOptions,
  });
};

// Add new meal option (admin)
export const addMealOption: RequestHandler = (req, res) => {
  const { name, description, price, prepTime, category } = req.body;

  const newMeal = {
    id: mealOptions.length + 1,
    name,
    description,
    price: parseFloat(price),
    rating: 0,
    prepTime,
    category,
    available: true,
  };

  mealOptions.push(newMeal);

  res.json({
    success: true,
    data: newMeal,
    message: "Meal added successfully",
  });
};

// Place order
export const placeOrder: RequestHandler = (req, res) => {
  const { customerId, customerName, mealId } = req.body;

  const meal = mealOptions.find((m) => m.id === mealId);
  if (!meal || !meal.available) {
    return res.status(400).json({
      success: false,
      message: "Meal not available",
    });
  }

  const newOrder = {
    id: orders.length + 1,
    customerId,
    customerName,
    mealId,
    meal: meal.name,
    price: meal.price,
    status: "preparing",
    orderTime: new Date().toISOString(),
  };

  orders.push(newOrder);

  res.json({
    success: true,
    data: newOrder,
    message: "Order placed successfully",
  });
};

// Get orders (admin)
export const getOrders: RequestHandler = (req, res) => {
  const { date } = req.query;
  let filteredOrders = orders;

  if (date) {
    const targetDate = new Date(date as string).toISOString().split("T")[0];
    filteredOrders = orders.filter((order) =>
      order.orderTime.startsWith(targetDate),
    );
  }

  res.json({
    success: true,
    data: filteredOrders,
  });
};

// Update order status (admin)
export const updateOrderStatus: RequestHandler = (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const orderIndex = orders.findIndex(
    (order) => order.id === parseInt(orderId),
  );
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  orders[orderIndex].status = status;

  res.json({
    success: true,
    data: orders[orderIndex],
    message: "Order status updated",
  });
};

// Get customer's order history
export const getCustomerOrders: RequestHandler = (req, res) => {
  const { customerId } = req.params;

  const customerOrders = orders.filter(
    (order) => order.customerId === parseInt(customerId),
  );

  res.json({
    success: true,
    data: customerOrders,
  });
};

// Authentication endpoints (mock)
export const login: RequestHandler = (req, res) => {
  const { email, password } = req.body;

  // Mock authentication
  if (email === "admin@demo.com" && password === "demo123") {
    res.json({
      success: true,
      data: {
        id: 1,
        email: "admin@demo.com",
        name: "Admin User",
        role: "admin",
        token: "mock-admin-token",
      },
    });
  } else if (email === "customer@demo.com" && password === "demo123") {
    res.json({
      success: true,
      data: {
        id: 2,
        email: "customer@demo.com",
        name: "Customer User",
        role: "customer",
        token: "mock-customer-token",
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }
};

export const register: RequestHandler = (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Mock registration
  const newUser = {
    id: Math.floor(Math.random() * 1000) + 3,
    email,
    name: `${firstName} ${lastName}`,
    role: role || "customer",
    token: `mock-${role}-token-${Date.now()}`,
  };

  res.json({
    success: true,
    data: newUser,
    message: "Registration successful",
  });
};
