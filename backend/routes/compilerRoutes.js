
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

    // Check required fields
    if (!language || code === undefined || code === null || code === "") {
      return res.status(400).json({
        success: false,
        message: "Language and code are required.",
      });
    }

    // Check supported language
    if (!["c", "cpp", "java"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported programming language.",
      });
    }

    // Check source code type and empty content
    if (typeof code !== "string" || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Source code cannot be empty.",
      });
    }

    // Check source code size
    if (Buffer.byteLength(code, "utf8") > 50000) {
      return res.status(400).json({
        success: false,
        message: "Source code is too large.",
      });
    }

    // Check program input
    if (
      typeof input !== "string" ||
      Buffer.byteLength(input, "utf8") > 10000
    ) {
      return res.status(400).json({
        success: false,
        message: "Program input is too large.",
      });
    }

    // Execute code
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
