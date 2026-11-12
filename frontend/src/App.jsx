
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
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  useEffect(() => {
    axios.get(`${API}/api/health`)
      .then(() => setBackendStatus("Connected"))
      .catch(() => setBackendStatus("Disconnected"));
  }, []);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(templates[newLanguage]);
  };

  return (
    <div className="ide">
      <header className="ide-header">
        <div className="brand">
          <span className="brand-icon">&lt;/&gt;</span>
          <span>Code<span className="accent">Nest</span></span>
        </div>

        <div className="header-right">
          <span className="connection">
            <span className={`dot ${backendStatus === "Connected" ? "online" : ""}`} />
            {backendStatus}
          </span>
        </div>
      </header>

      <main className="workspace">
        <section className="editor-panel">
          <div className="toolbar">
            <div className="file-name">
              <span className="file-icon">●</span>
              <span>Main.{language === "cpp" ? "cpp" : language}</span>
            </div>

            <div className="toolbar-actions">
              <LanguageSelector
                language={language}
                setLanguage={changeLanguage}
              />

              <button className="run-button" disabled title="Compilation will be added in Part 3">
                ▶ Run
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
            />
            <div className="panel-heading output-heading">
              <span>OUTPUT</span>
              <span className="panel-muted">Execution result will appear here</span>
            </div>
            <div className="output-area">
              <span className="output-placeholder">
                Your output will appear here after compilation.
              </span>
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
