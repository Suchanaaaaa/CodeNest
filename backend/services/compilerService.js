
import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

const IMAGE_NAME = "codenest-compiler";

const COMPILE_TIMEOUT = 15000;
const EXECUTION_TIMEOUT = 5000;
const MAX_OUTPUT_SIZE = 100000;

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

// Stop Docker container safely
function stopContainer(containerName) {
  return new Promise((resolve) => {
    if (!containerName) {
      return resolve();
    }

    const child = spawn(
      "docker",
      ["stop", "--time", "1", containerName],
      {
        windowsHide: true,
        stdio: "ignore",
      }
    );

    child.on("close", resolve);
    child.on("error", resolve);
  });
}

// Run compilation process
function runProcess(command, args, options = {}, containerName = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const terminate = async (message) => {
      if (settled) return;

      settled = true;
      clearTimeout(timer);

      await stopContainer(containerName);
      child.kill("SIGKILL");

      reject(new Error(message));
    };

    const timer = setTimeout(() => {
      terminate("Compilation time limit exceeded.");
    }, COMPILE_TIMEOUT);

    child.stdout.on("data", (data) => {
      if (settled) return;

      const chunk = data.toString();

      if (stdout.length + chunk.length > MAX_OUTPUT_SIZE) {
        terminate("Compilation output limit exceeded.");
        return;
      }

      stdout += chunk;
    });

    child.stderr.on("data", (data) => {
      if (settled) return;

      const chunk = data.toString();

      if (stderr.length + chunk.length > MAX_OUTPUT_SIZE) {
        terminate("Compilation output limit exceeded.");
        return;
      }

      stderr += chunk;
    });

    child.on("error", (error) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        reject(error);
      }
    });

    child.on("close", (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
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

  const containerName = `codenest-${crypto.randomUUID()}`;

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
      "--name", containerName,
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
      [...dockerLimits, ...config.compile],
      {},
      containerName
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
      let outputLimitExceeded = false;

      const terminate = async (message) => {
        if (settled) return;

        settled = true;
        clearTimeout(timer);

        await stopContainer(containerName);
        child.kill("SIGKILL");

        reject(new Error(message));
      };

      // Execution timeout
      const timer = setTimeout(() => {
        terminate("Execution time limit exceeded.");
      }, EXECUTION_TIMEOUT);

      // Capture standard output
      child.stdout.on("data", (data) => {
        if (settled || outputLimitExceeded) return;

        const chunk = data.toString();

        if (stdout.length + chunk.length > MAX_OUTPUT_SIZE) {
          outputLimitExceeded = true;
          terminate("Program output limit exceeded.");
          return;
        }

        stdout += chunk;
      });

      // Capture standard error
      child.stderr.on("data", (data) => {
        if (settled || outputLimitExceeded) return;

        const chunk = data.toString();

        if (stderr.length + chunk.length > MAX_OUTPUT_SIZE) {
          outputLimitExceeded = true;
          terminate("Program output limit exceeded.");
          return;
        }

        stderr += chunk;
      });

      child.on("error", (error) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(error);
        }
      });

      child.on("close", (exitCode) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);

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

    // Runtime error handling
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
