
import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

const IMAGE_NAME = "codenest-compiler";
const TIMEOUT = 15000;

const LANGUAGE_CONFIG = {
  c: {
    filename: "main.c",
    compile: ["gcc", "main.c", "-o", "program"],
    execute: ["./program"],
  },
  cpp: {
    filename: "main.cpp",
    compile: ["g++", "main.cpp", "-o", "program"],
    execute: ["./program"],
  },
  java: {
    filename: "Main.java",
    compile: ["javac", "Main.java"],
    execute: ["java", "Main"],
  },
};

// Run Docker process
function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      child.kill("SIGKILL");

      if (!settled) {
        settled = true;
        reject(new Error("Process timed out."));
      }
    }, TIMEOUT);

    child.stdout.on("data", (data) => {
      stdout += data.toString();

      if (stdout.length > 100000) {
        child.kill("SIGKILL");
      }
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();

      if (stderr.length > 100000) {
        child.kill("SIGKILL");
      }
    });

    child.on("error", (error) => {
      clearTimeout(timer);

      if (!settled) {
        settled = true;
        reject(error);
      }
    });

    child.on("close", (code) => {
      clearTimeout(timer);

      if (!settled) {
        settled = true;
        resolve({ code, stdout, stderr });
      }
    });
  });
}

// Execute user code
export async function executeCode({
  language,
  code,
  input = "",
}) {
  const config = LANGUAGE_CONFIG[language];

  if (!config) {
    throw new Error("Unsupported programming language.");
  }

  if (typeof code !== "string" || !code.trim()) {
    throw new Error("Source code cannot be empty.");
  }

  if (Buffer.byteLength(code, "utf8") > 50000) {
    throw new Error("Source code is too large.");
  }

  if (
    typeof input !== "string" ||
    Buffer.byteLength(input, "utf8") > 10000
  ) {
    throw new Error("Program input is too large.");
  }

  const workspace = path.join(
    os.tmpdir(),
    `codenest-${crypto.randomUUID()}`
  );

  try {
    // Create temporary workspace
    await fs.mkdir(workspace, { mode: 0o700 });

    // Write source code
    await fs.writeFile(
      path.join(workspace, config.filename),
      code,
      {
        encoding: "utf8",
        mode: 0o600,
      }
    );

    // Docker security and resource limits
    const dockerLimits = [
      "run",
      "--rm",
      "--network", "none",
      "--memory", "256m",
      "--memory-swap", "256m",
      "--cpus", "0.5",
      "--pids-limit", "64",
      "--read-only",
      "--cap-drop", "ALL",
      "--security-opt", "no-new-privileges",
      "--user", "10001:10001",
      "--tmpfs", "/tmp:rw,noexec,nosuid,size=32m",
      "--mount",
      `type=bind,source=${workspace},target=/workspace`,
      "--workdir", "/workspace",
      IMAGE_NAME,
    ];

    // Step 1: Compile source code
    const compile = await runProcess(
      "docker",
      [...dockerLimits, ...config.compile]
    );

    if (compile.code !== 0) {
      return {
        success: false,
        output:
          compile.stderr ||
          compile.stdout ||
          "Compilation failed.",
      };
    }

    // Step 2: Execute compiled program
    // -i keeps Docker stdin open for user input
    const executionArgs = [
      ...dockerLimits.slice(0, 1),
      "-i",
      ...dockerLimits.slice(1),
      ...config.execute,
    ];

    const execution = await new Promise((resolve, reject) => {
      const child = spawn(
        "docker",
        executionArgs,
        {
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true,
        }
      );

      let stdout = "";
      let stderr = "";
      let settled = false;

      const timer = setTimeout(() => {
        child.kill("SIGKILL");

        if (!settled) {
          settled = true;
          reject(
            new Error("Execution time limit exceeded.")
          );
        }
      }, TIMEOUT);

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("error", (error) => {
        clearTimeout(timer);

        if (!settled) {
          settled = true;
          reject(error);
        }
      });

      child.on("close", (exitCode) => {
        clearTimeout(timer);

        if (!settled) {
          settled = true;
          resolve({
            exitCode,
            stdout,
            stderr,
          });
        }
      });

      // Send user input to Docker container
      child.stdin.end(input);
    });

  
const runtimeError =
  execution.stderr?.trim() ||
  (execution.exitCode !== 0
    ? `Runtime Error: Program exited with code ${execution.exitCode}.`
    : "");

return {
  success: execution.exitCode === 0,
  output: execution.stdout,
  error: runtimeError,
  message:
    execution.exitCode === 0
      ? "Program executed successfully."
      : runtimeError,
};


  } finally {
    // Remove temporary workspace
    await fs.rm(workspace, {
      recursive: true,
      force: true,
    });
  }
}