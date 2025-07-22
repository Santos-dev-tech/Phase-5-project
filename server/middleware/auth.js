import jwt from "jsonwebtoken";
import { query } from "../database/db.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "mealy-secret-key-change-in-production";

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      caterer_id: user.caterer_id,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// Verify JWT token middleware
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Access token required",
      message: "Please provide a valid authentication token",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database
    const userResult = await query(
      "SELECT id, email, full_name, role, caterer_id FROM users WHERE id = $1 AND email = $2",
      [decoded.id, decoded.email],
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid token",
        message: "User not found or token is invalid",
      });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(403).json({
      error: "Invalid token",
      message: "Token is invalid or expired",
    });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please log in to access this resource",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions",
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
      });
    }

    next();
  };
};

// Middleware for admin/caterer access
export const requireAdmin = requireRole(["admin", "caterer"]);

// Middleware for customer access
export const requireCustomer = requireRole(["customer"]);

// Middleware for caterer-specific access (admin or same caterer)
export const requireCatererAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }

  // Admin can access all caterers
  if (req.user.role === "admin") {
    return next();
  }

  // Caterer can only access their own data
  if (req.user.role === "caterer") {
    const catererId =
      req.params.catererId || req.body.caterer_id || req.query.caterer_id;

    if (catererId && parseInt(catererId) !== req.user.caterer_id) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only access your own caterer data",
      });
    }

    return next();
  }

  return res.status(403).json({
    error: "Insufficient permissions",
    message: "Access denied. Admin or caterer role required",
  });
};

export default {
  generateToken,
  authenticateToken,
  requireRole,
  requireAdmin,
  requireCustomer,
  requireCatererAccess,
};
