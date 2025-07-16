// Vercel serverless function entry point for Mealy Restaurant App

export default async function handler(req, res) {
  try {
    // Dynamic import to handle the Express app
    const { default: app } = await import("../dist/server/node-build.mjs");

    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);

    // Fallback response
    res.status(500).json({
      success: false,
      message: "Server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
}
