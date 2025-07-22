import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "mealy_db",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
};

async function setupDatabase() {
  console.log("🚀 Setting up Mealy database...");

  // First, connect to postgres database to create our database
  const adminClient = new Client({
    ...dbConfig,
    database: "postgres", // Connect to default postgres database
  });

  try {
    await adminClient.connect();
    console.log("✅ Connected to PostgreSQL server");

    // Check if database exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database],
    );

    if (dbCheckResult.rows.length === 0) {
      // Create database
      await adminClient.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`✅ Created database: ${dbConfig.database}`);
    } else {
      console.log(`✅ Database ${dbConfig.database} already exists`);
    }

    await adminClient.end();

    // Now connect to our database and run schema
    const client = new Client(dbConfig);
    await client.connect();
    console.log(`✅ Connected to database: ${dbConfig.database}`);

    // Read and execute schema
    const schemaPath = join(__dirname, "server", "database", "schema.sql");
    const schema = readFileSync(schemaPath, "utf8");

    // Split schema into individual statements and execute
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        await client.query(statement);
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        // Ignore "already exists" errors
        if (!error.message.includes("already exists")) {
          console.error(`❌ Error executing statement: ${error.message}`);
        } else {
          console.log(
            `⚠️  Skipped (already exists): ${statement.substring(0, 50)}...`,
          );
        }
      }
    }

    // Verify tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log("\n📊 Database tables created:");
    tablesResult.rows.forEach((row) => {
      console.log(`   - ${row.table_name}`);
    });

    // Check if admin user exists
    const adminCheck = await client.query(
      "SELECT email FROM users WHERE role = $1 LIMIT 1",
      ["admin"],
    );

    if (adminCheck.rows.length > 0) {
      console.log("\n👤 Admin user found:");
      console.log(`   Email: ${adminCheck.rows[0].email}`);
      console.log("   Password: admin123");
    }

    await client.end();
    console.log("\n🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   1. Make sure PostgreSQL is running");
    console.error("   2. Check your .env file configuration");
    console.error("   3. Verify database credentials");
    process.exit(1);
  }
}

setupDatabase();
