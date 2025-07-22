import { createServer } from "../server/index.js";

let app;

// Export handler function for Vercel
export default function handler(req, res) {
  if (!app) {
    app = createServer();
  }
  return app(req, res);
}
