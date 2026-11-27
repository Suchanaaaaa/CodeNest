import { useEffect, useState } from "react";
import axios from "axios";
import CodeEditor from "./components/CodeEditor";
import LanguageSelector from "./components/LanguageSelector";

const API = "http://localhost:5000";

const templates = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, CodeNest!\\n");
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, CodeNest!" << endl;
    return 0;
}`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeNest!");
    }
}`,
};

const statusLabels = {
  running: "Running...",
  success: "✓ Success",
  error: "✕ Error",
};

// Saved theme পড়া (না থাকলে dark)
const getInitialTheme = () => {
  try {
    const saved = localStorage.getItem("codenest-theme");
    return saved === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export default function App() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(
    "Your output will appear here after compilation."
  );
  const [status, setStatus] = useState("idle"); // idle | running | success | error
  const [runTime, setRunTime] = useState(null); // milliseconds
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme); // dark | light

  // Theme বদলালে <html> এ বসানো আর save করা
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("codenest-theme", theme);
    } catch {
      // storage না চললে সমস্যা নেই
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  // Backend health check
  useEffect(() => {
    axios
      .get(`${API}/api/health`)
      .then(() => {
        setBackendStatus("Connected");
      })
      .catch((error) => {
        console.error("Backend connection error:", error);
        setBackendStatus("Disconnected");
      });
  }, []);

  // Language change
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(templates[newLanguage]);
    setOutput("Language changed. Ready to compile.");
    setStatus("idle");
    setRunTime(null);
  };

  // Actual code execution
  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first.");
      setStatus("error");
      setRunTime(null);
      return;
    }

    setIsRunning(true);
    setStatus("running");
    setRunTime(null);
    setOutput("Compiling and executing your code...");

    const startTime = performance.now();

    try {
      const response = await axios.post(`${API}/api/compiler/run`, {
        language,
        code,
        input,
      });

      const result = response.data;

      if (result.success) {
        setStatus("success");
        setOutput(
          result.output || "Program executed successfully. No output."
        );
      } else {
        setStatus("error");
        setOutput(
          result.output ||
            result.error ||
            result.message ||
            "Compilation or execution failed."
        );
      }
    } catch (error) {
      console.error("Code execution error:", error);

      setStatus("error");
      setOutput(
        error.response?.data?.message ||
          error.message ||
          "Unable to execute code."
      );
    } finally {
      setRunTime(Math.round(performance.now() - startTime));
      setIsRunning(false);
    }
  };

  return (
    <div className="ide">
      <header className="ide-header">
        <div className="brand">
          <span className="brand-icon">&lt;/&gt;</span>
          <span>
            Code<span className="accent">Nest</span>
          </span>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title="Switch theme"
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>

          <span className="connection">
            <span
              className={`dot ${
                backendStatus === "Connected" ? "online" : ""
              }`}
            />
            {backendStatus}
          </span>
        </div>
      </header>

      <main className="workspace">
        <section className="editor-panel">
          {/* LEFT: code */}
          <div className="code-pane">
            <div className="toolbar">
              <div className="file-name">
                <span className="file-icon">●</span>
                <span>Main.{language === "cpp" ? "cpp" : language}</span>
              </div>

              <LanguageSelector
                language={language}
                setLanguage={changeLanguage}
              />
            </div>

            <div className="editor-area">
              <CodeEditor
                language={language}
                code={code}
                setCode={setCode}
                theme={theme}
              />
            </div>
          </div>

          {/* RIGHT: run + input + output */}
          <div className="io-pane">
            <div className="io-top">
              <button
                type="button"
                className="run-button"
                onClick={handleRun}
                disabled={isRunning || backendStatus !== "Connected"}
              >
                {isRunning ? "Running..." : "▶ Run"}
              </button>
            </div>

            <div className="io-block input-block">
              <div className="panel-heading">
                <span>INPUT</span>
                <span className="panel-muted">Program input</span>
              </div>
              <textarea
                className="input-area"
                placeholder="Enter your program input here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <div className="input-hint">
                If your code takes input, add it in the above box before
                running.
              </div>
            </div>

            <div className="io-block output-block">
              <div className="panel-heading">
                <span>OUTPUT</span>
                <span className="panel-muted">Program execution result</span>

                {status !== "idle" && (
                  <div className="output-meta">
                    <span className={`status-badge ${status}`}>
                      {statusLabels[status]}
                    </span>
                    {runTime !== null && status !== "running" && (
                      <span className="run-time">{runTime} ms</span>
                    )}
                  </div>
                )}
              </div>
              <div className="output-area">
                <pre className={`output-placeholder ${status}`}>{output}</pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="ide-footer">
        CodeNest <span>•</span> Multi-Language Compiler
      </footer>
    </div>
  );
}