import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to CodeNest Compiler API!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "Backend is running",
    project: "CodeNest",
  });
});

app.listen(PORT, () => {
  console.log(`CodeNest Backend running on port ${PORT}`);
});
