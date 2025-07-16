// Authentication API routes
export default function handler(req, res) {
  const { action } = req.query;

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
    if (action === "login") {
      const { email, password } = req.body;

      // Demo login logic
      if (email && password) {
        const userData = {
          id: 1,
          name: email.split("@")[0] || "User",
          email: email,
          role: email.includes("admin") ? "admin" : "customer",
        };

        res.json({
          success: true,
          data: userData,
          message: "Login successful",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Email and password required",
        });
      }
    } else if (action === "register") {
      const { name, email, password } = req.body;

      // Demo registration logic
      if (name && email && password) {
        const userData = {
          id: Date.now(),
          name: name,
          email: email,
          role: "customer",
        };

        res.json({
          success: true,
          data: userData,
          message: "Registration successful",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Auth action not found",
      });
    }
  } catch (error) {
    console.error("Auth API Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}
