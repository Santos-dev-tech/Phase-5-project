import express from "express";
import { z } from "zod";
import { query } from "../database/db.js";
import {
  authenticateToken,
  requireAdmin,
  requireCatererAccess,
} from "../middleware/auth.js";

const router = express.Router();

// Validation schemas
const mealOptionSchema = z.object({
  name: z.string().min(2, "Meal name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().optional(),
  isAvailable: z.boolean().default(true),
});

const mealUpdateSchema = mealOptionSchema.partial();

// Get all meal options for a caterer
router.get("/caterer/:catererId", authenticateToken, async (req, res) => {
  try {
    const { catererId } = req.params;
    const { category, available } = req.query;

    let queryText = `
      SELECT id, name, description, price, image_url, category, is_available, created_at, updated_at
      FROM meal_options 
      WHERE caterer_id = $1
    `;
    const queryParams = [catererId];

    // Add category filter
    if (category) {
      queryText += ` AND category = $${queryParams.length + 1}`;
      queryParams.push(category);
    }

    // Add availability filter
    if (available !== undefined) {
      queryText += ` AND is_available = $${queryParams.length + 1}`;
      queryParams.push(available === "true");
    }

    queryText += " ORDER BY category, name";

    const result = await query(queryText, queryParams);

    res.json({
      mealOptions: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        imageUrl: row.image_url,
        category: row.category,
        isAvailable: row.is_available,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching meal options:", error);
    res.status(500).json({
      error: "Failed to fetch meal options",
      message: "An error occurred while fetching meal options",
    });
  }
});

// Get single meal option
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT mo.*, c.name as caterer_name
       FROM meal_options mo
       JOIN caterers c ON mo.caterer_id = c.id
       WHERE mo.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Meal option not found",
        message: "The requested meal option does not exist",
      });
    }

    const mealOption = result.rows[0];

    res.json({
      mealOption: {
        id: mealOption.id,
        name: mealOption.name,
        description: mealOption.description,
        price: parseFloat(mealOption.price),
        imageUrl: mealOption.image_url,
        category: mealOption.category,
        isAvailable: mealOption.is_available,
        catererId: mealOption.caterer_id,
        catererName: mealOption.caterer_name,
        createdAt: mealOption.created_at,
        updatedAt: mealOption.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching meal option:", error);
    res.status(500).json({
      error: "Failed to fetch meal option",
      message: "An error occurred while fetching meal option",
    });
  }
});

// Create new meal option (Admin/Caterer only)
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const validatedData = mealOptionSchema.parse(req.body);
    const { name, description, price, imageUrl, category, isAvailable } =
      validatedData;

    // Determine caterer ID
    let catererId;
    if (req.user.role === "admin") {
      catererId = req.body.catererId || req.user.caterer_id;
      if (!catererId) {
        return res.status(400).json({
          error: "Caterer ID required",
          message: "Please specify which caterer this meal option belongs to",
        });
      }
    } else {
      catererId = req.user.caterer_id;
    }

    // Check if caterer exists
    const catererCheck = await query("SELECT id FROM caterers WHERE id = $1", [
      catererId,
    ]);

    if (catererCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Caterer not found",
        message: "The specified caterer does not exist",
      });
    }

    const result = await query(
      `INSERT INTO meal_options (caterer_id, name, description, price, image_url, category, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, price, image_url, category, is_available, created_at`,
      [catererId, name, description, price, imageUrl, category, isAvailable],
    );

    const mealOption = result.rows[0];

    res.status(201).json({
      message: "Meal option created successfully",
      mealOption: {
        id: mealOption.id,
        name: mealOption.name,
        description: mealOption.description,
        price: parseFloat(mealOption.price),
        imageUrl: mealOption.image_url,
        category: mealOption.category,
        isAvailable: mealOption.is_available,
        catererId,
        createdAt: mealOption.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating meal option:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Please check your input data",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to create meal option",
      message: "An error occurred while creating meal option",
    });
  }
});

// Update meal option (Admin/Caterer only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = mealUpdateSchema.parse(req.body);

    // Check if meal option exists and user has permission
    const mealCheck = await query("SELECT * FROM meal_options WHERE id = $1", [
      id,
    ]);

    if (mealCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Meal option not found",
        message: "The requested meal option does not exist",
      });
    }

    const existingMeal = mealCheck.rows[0];

    // Check caterer access
    if (
      req.user.role === "caterer" &&
      existingMeal.caterer_id !== req.user.caterer_id
    ) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only modify your own meal options",
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField =
          key === "imageUrl"
            ? "image_url"
            : key === "isAvailable"
              ? "is_available"
              : key;
        updateFields.push(`${dbField} = $${paramCounter}`);
        updateValues.push(value);
        paramCounter++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        error: "No fields to update",
        message: "Please provide at least one field to update",
      });
    }

    updateFields.push(`updated_at = $${paramCounter}`);
    updateValues.push(new Date());
    updateValues.push(id);

    const updateQuery = `
      UPDATE meal_options 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCounter + 1}
      RETURNING id, name, description, price, image_url, category, is_available, updated_at
    `;

    const result = await query(updateQuery, updateValues);
    const updatedMeal = result.rows[0];

    res.json({
      message: "Meal option updated successfully",
      mealOption: {
        id: updatedMeal.id,
        name: updatedMeal.name,
        description: updatedMeal.description,
        price: parseFloat(updatedMeal.price),
        imageUrl: updatedMeal.image_url,
        category: updatedMeal.category,
        isAvailable: updatedMeal.is_available,
        updatedAt: updatedMeal.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating meal option:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Please check your input data",
        details: error.errors,
      });
    }

    res.status(500).json({
      error: "Failed to update meal option",
      message: "An error occurred while updating meal option",
    });
  }
});

// Delete meal option (Admin/Caterer only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if meal option exists and user has permission
    const mealCheck = await query("SELECT * FROM meal_options WHERE id = $1", [
      id,
    ]);

    if (mealCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Meal option not found",
        message: "The requested meal option does not exist",
      });
    }

    const existingMeal = mealCheck.rows[0];

    // Check caterer access
    if (
      req.user.role === "caterer" &&
      existingMeal.caterer_id !== req.user.caterer_id
    ) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only delete your own meal options",
      });
    }

    // Check if meal is in any active orders
    const activeOrdersCheck = await query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE meal_option_id = $1 AND status IN ('pending', 'confirmed', 'preparing')`,
      [id],
    );

    if (parseInt(activeOrdersCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: "Cannot delete meal option",
        message: "This meal option has active orders and cannot be deleted",
      });
    }

    await query("DELETE FROM meal_options WHERE id = $1", [id]);

    res.json({
      message: "Meal option deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meal option:", error);
    res.status(500).json({
      error: "Failed to delete meal option",
      message: "An error occurred while deleting meal option",
    });
  }
});

// Get meal categories for a caterer
router.get(
  "/caterer/:catererId/categories",
  authenticateToken,
  async (req, res) => {
    try {
      const { catererId } = req.params;

      const result = await query(
        `SELECT DISTINCT category 
       FROM meal_options 
       WHERE caterer_id = $1 AND category IS NOT NULL 
       ORDER BY category`,
        [catererId],
      );

      res.json({
        categories: result.rows.map((row) => row.category),
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        error: "Failed to fetch categories",
        message: "An error occurred while fetching meal categories",
      });
    }
  },
);

export default router;
