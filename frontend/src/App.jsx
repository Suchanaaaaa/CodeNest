
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

export default function App() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(templates.cpp);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState(
    "Your output will appear here after compilation."
  );
  const [backendStatus, setBackendStatus] = useState("Connecting...");
  const [isRunning, setIsRunning] = useState(false);

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
  };

  // Actual code execution
  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first.");
      return;
    }

    setIsRunning(true);
    setOutput("Compiling and executing your code...");

    try {
      const response = await axios.post(
        `${API}/api/compiler/run`,
        {
          language,
          code,
          input,
        }
      );

      const result = response.data;

      if (result.success) {
        setOutput(
          result.output || "Program executed successfully. No output."
        );
      } else {
        setOutput(
          result.output ||
          result.error ||
          result.message ||
          "Compilation or execution failed."
        );
      }
    } catch (error) {
      console.error("Code execution error:", error);

      setOutput(
        error.response?.data?.message ||
        error.message ||
        "Unable to execute code."
      );
    } finally {
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
          <div className="toolbar">
            <div className="file-name">
              <span className="file-icon">●</span>
              <span>
                Main.{language === "cpp" ? "cpp" : language}
              </span>
            </div>

            <div className="toolbar-actions">
              <LanguageSelector
                language={language}
                setLanguage={changeLanguage}
              />

              <button
                type="button"
                className="run-button"
                onClick={handleRun}
                disabled={
                  isRunning || backendStatus !== "Connected"
                }
              >
                {isRunning ? "Running..." : "▶ Run"}
              </button>
            </div>
          </div>

          <div className="editor-area">
            <CodeEditor
              language={language}
              code={code}
              setCode={setCode}
            />
          </div>

          <div className="bottom-panel">
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

            <div className="panel-heading output-heading">
              <span>OUTPUT</span>
              <span className="panel-muted">
                Program execution result
              </span>
            </div>

            <div className="output-area">
              <pre className="output-placeholder">
                {output}
              </pre>
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
