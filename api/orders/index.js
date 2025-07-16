// Orders API route
const orders = []; // In-memory storage for demo

export default function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "POST") {
      // Place order
      const { customerId, customerName, mealId, paymentData, paymentStatus } =
        req.body;

      // Check for existing active order
      const existingOrder = orders.find(
        (order) =>
          order.customerId === customerId &&
          order.status !== "delivered" &&
          order.status !== "cancelled",
      );

      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message:
            "You already have an active order. Please wait for it to be completed.",
        });
      }

      // Create new order
      const newOrder = {
        id: orders.length + 1,
        customerId,
        customerName,
        mealId,
        meal: `Meal ${mealId}`,
        price: 15.99,
        status: paymentStatus === "completed" ? "preparing" : "pending_payment",
        orderTime: new Date().toISOString(),
        paymentStatus: paymentStatus || "pending",
        paymentData: paymentData || null,
      };

      orders.push(newOrder);

      res.json({
        success: true,
        data: newOrder,
        message: "Order placed successfully",
      });
    } else if (req.method === "GET") {
      // Get orders
      res.json({
        success: true,
        data: orders,
      });
    } else {
      res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }
  } catch (error) {
    console.error("Orders API Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
