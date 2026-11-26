import "dotenv/config";
import express from "express";
import cors from "cors";
import compilerRoutes from "./routes/compilerRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "100kb" }));
// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CodeNest Compiler API!",
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "Backend is running",
    project: "CodeNest",
  });
});

// Compiler Routes
app.use("/api/compiler", compilerRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;

  next(error);
});

// Global Error Handler
app.use(errorMiddleware);

export default app;