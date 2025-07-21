// Mock data with beautiful food images
const mealOptions = [
  {
    id: 1,
    name: "Beef with Jasmine Rice",
    description:
      "Tender beef strips marinated in herbs, served with fragrant jasmine rice and seasonal vegetables",
    price: 15.99,
    rating: 4.8,
    prepTime: "25-30 min",
    category: "Main Course",
    available: true,
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Chicken Teriyaki Stir Fry",
    description:
      "Succulent chicken breast with fresh vegetables in our signature teriyaki glaze",
    price: 13.99,
    rating: 4.6,
    prepTime: "20-25 min",
    category: "Main Course",
    available: true,
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Crispy Fish & Chips",
    description:
      "Beer-battered fish fillet with golden fries, mushy peas, and house-made tartar sauce",
    price: 16.99,
    rating: 4.7,
    prepTime: "30-35 min",
    category: "Main Course",
    available: false,
    image:
      "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Mediterranean Pasta",
    description:
      "Fresh pasta with sun-dried tomatoes, olives, feta cheese, and herbs in olive oil",
    price: 12.99,
    rating: 4.5,
    prepTime: "15-20 min",
    category: "Main Course",
    available: true,
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Grilled Salmon",
    description:
      "Atlantic salmon fillet with lemon butter sauce, roasted vegetables, and quinoa",
    price: 18.99,
    rating: 4.9,
    prepTime: "25-30 min",
    category: "Main Course",
    available: true,
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "BBQ Pork Ribs",
    description:
      "Slow-cooked pork ribs with smoky BBQ sauce, coleslaw, and sweet potato fries",
    price: 19.99,
    rating: 4.8,
    prepTime: "35-40 min",
    category: "Main Course",
    available: true,
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 7,
    name: "Vegetarian Buddha Bowl",
    description:
      "Quinoa, roasted vegetables, avocado, chickpeas with tahini dressing",
    price: 11.99,
    rating: 4.4,
    prepTime: "20-25 min",
    category: "Vegetarian",
    available: true,
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop&auto=format",
  },
  {
    id: 8,
    name: "Chocolate Lava Cake",
    description:
      "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    rating: 4.9,
    prepTime: "15-20 min",
    category: "Dessert",
    available: true,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=300&fit=crop&auto=format",
  },
];

let orders = [
  {
    id: 1,
    customerId: 1,
    customerName: "Sarah Johnson",
    mealId: 1,
    meal: "Beef with Jasmine Rice",
    price: 15.99,
    status: "preparing",
    orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Mike Chen",
    mealId: 2,
    meal: "Chicken Teriyaki Stir Fry",
    price: 13.99,
    status: "ready",
    orderTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 minutes ago
  },
  {
    id: 3,
    customerId: 3,
    customerName: "Emma Davis",
    mealId: 5,
    meal: "Grilled Salmon",
    price: 18.99,
    status: "delivered",
    orderTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
  },
];

// Get today's menu
export const getTodaysMenu = (req, res) => {
  res.json({
    success: true,
    data: mealOptions.filter((meal) => meal.available),
    date: new Date().toISOString().split("T")[0],
  });
};

// Get all meal options (admin)
export const getMealOptions = (req, res) => {
  res.json({
    success: true,
    data: mealOptions,
  });
};

// Add new meal option (admin)
export const addMealOption = (req, res) => {
  const { name, description, price, prepTime, category, image } = req.body;

  const newMeal = {
    id: mealOptions.length + 1,
    name,
    description,
    price: parseFloat(price),
    rating: 0,
    prepTime,
    category,
    available: true,
    image:
      image ||
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=300&fit=crop&auto=format",
  };

  mealOptions.push(newMeal);

  res.json({
    success: true,
    data: newMeal,
    message: "Meal added successfully",
  });
};

// Delete meal option (admin)
export const deleteMealOption = (req, res) => {
  const { mealId } = req.params;
  const index = mealOptions.findIndex((meal) => meal.id === parseInt(mealId));

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Meal not found",
    });
  }

  mealOptions.splice(index, 1);

  res.json({
    success: true,
    message: "Meal deleted successfully",
  });
};

// Place order
export const placeOrder = (req, res) => {
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
export const getOrders = (req, res) => {
  const { date } = req.query;
  let filteredOrders = orders;

  if (date) {
    const targetDate = new Date(date).toISOString().split("T")[0];
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
export const updateOrderStatus = (req, res) => {
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
export const getCustomerOrders = (req, res) => {
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
export const login = (req, res) => {
  const { email, password } = req.body;

  // Mock authentication
  if (email === "admin@demo.com" && password === "demo123") {
    res.json({
      success: true,
      data: {
        id: 1,
        email: "admin@demo.com",
        name: "Chef Martinez",
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
        name: "Alex Thompson",
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

export const register = (req, res) => {
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
