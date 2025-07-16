// Vercel API route for payments
export default async function handler(req, res) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join("/") : slug;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Handle M-Pesa payment routes
    if (path === "mpesa/initiate") {
      // Payment initiation
      const { phoneNumber, amount, customerId, customerName, mealId } =
        req.body;

      // Demo response
      res.json({
        success: true,
        data: {
          checkoutRequestId: `ws_CO_${Date.now()}_demo`,
          merchantRequestId: `demo_merchant_${Date.now()}`,
          customerMessage: "Demo: Payment request sent to your phone",
          amount: amount,
          phoneNumber: phoneNumber,
        },
      });
    } else if (path.startsWith("mpesa/status/")) {
      // Payment status check
      const checkoutRequestId = path.split("/")[2];

      // Demo logic - complete after 10 seconds
      const timestamp = parseInt(checkoutRequestId.split("_")[2]);
      const timeSince = Date.now() - timestamp;

      if (timeSince > 10000) {
        // Completed
        res.json({
          success: true,
          data: {
            status: "completed",
            resultDesc: "Payment completed successfully",
            mpesaReceiptNumber: `DEMO${Date.now()}`,
            amount: 1599,
          },
        });
      } else {
        // Still pending
        res.json({
          success: true,
          data: {
            status: "pending",
            resultDesc: "Waiting for you to complete payment on your phone",
          },
        });
      }
    } else {
      res.status(404).json({ success: false, message: "Route not found" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
