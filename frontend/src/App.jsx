
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
    console.log("Checking CodeNest Backend...");

    axios
      .get(`${API}/api/health`)
      .then((response) => {
        console.log("BACKEND CONNECTED:", response.data);
        setBackendStatus("Connected");
      })
      .catch((error) => {
        console.error("BACKEND CONNECTION ERROR:", error);
        setBackendStatus("Disconnected");
      });
  }, []);

  // Language change
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(templates[newLanguage]);
    setOutput("Language changed. Ready to test backend connection.");
  };

  // Run button click and API test
  const handleRun = async () => {
    console.log("RUN BUTTON CLICKED!");

    setIsRunning(true);
    setOutput("Run button clicked! Connecting to CodeNest Backend...");

    try {
      const response = await axios.get(
        `${API}/api/compiler/test`
      );

      console.log("API RESPONSE:", response.data);

      setOutput(
        `${response.data.message}

Backend connection successful!

Actual code compilation will be added in the next step.`
      );
    } catch (error) {
      console.error("API ERROR:", error);

      setOutput(
        error.response?.data?.message ||
        error.message ||
        "Unable to connect to Compiler API."
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
                {isRunning ? "Connecting..." : "▶ Run"}
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
                Backend API response
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
