import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function App() {
  const [backendStatus, setBackendStatus] = useState("Checking connection...");

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/health`)
      .then((response) => {
        setBackendStatus(response.data.status || "Connected");
      })
      .catch(() => {
        setBackendStatus("Backend connection failed");
      });
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="CodeNext home">
          <span className="brand-mark">&lt;/&gt;</span>
          <span>Code<span className="brand-accent">Nest</span></span>
        </a>
        <span className="topbar-label">MULTI-LANGUAGE COMPILER</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR CODING WORKSPACE</p>
        <h1>Build, compile, and <span>run.</span></h1>
        <p className="intro">
          A workspace for C, C++, and Java. The editor and compiler workflow
          will be added step by step.
        </p>

        <div className="status-card">
          <span className="status-dot" />
          <div>
            <strong>Backend status</strong>
            <p>{backendStatus}</p>
          </div>
        </div>

        <div className="language-list" aria-label="Planned languages">
          <span>C</span>
          <span>C++</span>
          <span>Java</span>
        </div>
      </section>

      <footer>CodeNest · Project setup</footer>
    </main>
  );
}
