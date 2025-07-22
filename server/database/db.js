import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mealy_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on("connect", () => {
  console.log("📊 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("💥 Database connection error:", err);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(
      `🔍 Executed query: ${text.substring(0, 50)}... (${duration}ms)`,
    );
    return res;
  } catch (error) {
    console.error("💥 Database query error:", error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = async () => {
  return await pool.connect();
};

// Helper function to initialize database
export const initializeDatabase = async () => {
  // Skip database initialization if password is not configured
  if (process.env.DB_PASSWORD === '[YOUR-PASSWORD]' || !process.env.DB_PASSWORD || process.env.DB_PASSWORD === 'postgres') {
    console.log("⚠️  Database not configured - skipping initialization");
    console.log("   To enable database features, please set proper DB_PASSWORD in .env file");
    return;
  }

  try {
    // Check if tables exist
    const tableCheck = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (tableCheck.rows.length === 0) {
      console.log("🚀 Initializing database tables...");
      // Here you would run your schema.sql file
      // For now, we'll assume tables are created manually
      console.log(
        "⚠️  Please run the schema.sql file to create database tables",
      );
    } else {
      console.log("✅ Database tables already exist");
    }
  } catch (error) {
    console.error("💥 Error initializing database:", error);
    console.log("   Application will continue without database features");
  }
};

export default pool;
