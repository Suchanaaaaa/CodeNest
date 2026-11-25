
import express from "express";
import { executeCode } from "../services/compilerService.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "CodeNest Compiler Route is working!",
  });
});

// Actual code execution route
router.post("/run", async (req, res) => {
  try {
    const { language, code, input = "" } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        message: "Language and code are required.",
      });
    }

    const result = await executeCode({
      language,
      code,
      input,
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error("Compiler Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Code execution failed.",
    });
  }
});

export default router;
