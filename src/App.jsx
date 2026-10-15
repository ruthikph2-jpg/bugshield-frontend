import { useState } from "react";
import "./App.css";

const LANGUAGES = ["Python", "JavaScript", "Java", "C++", "C", "TypeScript", "Go", "Rust"];

const SAMPLE_CODE = {
  Python: `def divide(a, b):
    return a / b

print(divide(10, 0))`,
  JavaScript: `function getUser(users, id) {
  return users[id].name;
}

const users = [{ name: "Alice" }];
console.log(getUser(users, 5));`,
  Java: `public class Main {
  public static void main(String[] args) {
    int[] arr = {1, 2, 3};
    System.out.println(arr[5]);
  }
}`,
};

const SeverityBadge = ({ severity }) => {
  const colors = {
    High: "#ff4d4f",
    Medium: "#faad14",
    Low: "#52c41a",
    None: "#52c41a",
  };
  return (
    <span className="severity-badge" style={{ background: colors[severity] || "#aaa" }}>
      {severity} Severity
    </span>
  );
};

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("fixed");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError("Please paste some code to analyze.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
      setActiveTab("fixed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.fixedCode) {
      navigator.clipboard.writeText(result.fixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSample = () => {
    setCode(SAMPLE_CODE[language] || SAMPLE_CODE["Python"]);
    setResult(null);
    setError("");
  };

  const handleClear = () => {
    setCode("");
    setResult(null);
    setError("");
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">Bug<span className="logo-accent">Shield</span></span>
          </div>
          <p className="tagline">Detect it. Fix it. Understand it.</p>
        </div>
      </header>

      <main className="main">
        {/* Input Section */}
        <section className="card input-card">
          <div className="card-header">
            <h2>📋 Paste Your Code</h2>
            <div className="controls">
              <select
                className="lang-select"
                value={language}
                onChange={(e) => { setLanguage(e.target.value); setResult(null); }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button className="btn btn-ghost" onClick={handleSample}>Try Sample</button>
              <button className="btn btn-ghost" onClick={handleClear}>Clear</button>
            </div>
          </div>

          <textarea
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Paste your ${language} code here...`}
            spellCheck={false}
          />

          {error && <div className="error-box">⚠️ {error}</div>}

          <button
            className="btn btn-primary analyze-btn"
            onClick={analyzeCode}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner" /> Analyzing...</>
            ) : (
              <><span>🔍</span> Analyze & Fix Code</>
            )}
          </button>
        </section>

        {/* Result Section */}
        {result && (
          <section className="results">
            {/* Status Banner */}
            <div className={`status-banner ${result.hasBug ? "bug-found" : "no-bug"}`}>
              <span className="status-icon">{result.hasBug ? "🐛" : "✅"}</span>
              <div>
                <strong>{result.hasBug ? "Bug Detected!" : "No Bugs Found!"}</strong>
                <p>{result.bugDescription}</p>
              </div>
              {result.hasBug && <SeverityBadge severity={result.severity} />}
            </div>

            {result.hasBug && (
              <>
                {/* Bug Line */}
                {result.bugLine && (
                  <div className="card bug-line-card">
                    <h3>🔴 Buggy Line</h3>
                    <pre className="code-block bug-code">{result.bugLine}</pre>
                  </div>
                )}

                {/* Tabs: Fixed Code / Explanation / What Changed */}
                <div className="card tabs-card">
                  <div className="tabs">
                    <button
                      className={`tab ${activeTab === "fixed" ? "active" : ""}`}
                      onClick={() => setActiveTab("fixed")}
                    >✅ Fixed Code</button>
                    <button
                      className={`tab ${activeTab === "explanation" ? "active" : ""}`}
                      onClick={() => setActiveTab("explanation")}
                    >📝 Explanation</button>
                    <button
                      className={`tab ${activeTab === "changes" ? "active" : ""}`}
                      onClick={() => setActiveTab("changes")}
                    >🔧 What Changed</button>
                  </div>

                  <div className="tab-content">
                    {activeTab === "fixed" && (
                      <div>
                        <div className="code-header">
                          <span className="lang-pill">{language}</span>
                          <button className="btn btn-ghost small" onClick={handleCopy}>
                            {copied ? "✅ Copied!" : "📋 Copy"}
                          </button>
                        </div>
                        <pre className="code-block fixed-code">{result.fixedCode}</pre>
                      </div>
                    )}

                    {activeTab === "explanation" && (
                      <div className="explanation">
                        <p>{result.explanation}</p>
                      </div>
                    )}

                    {activeTab === "changes" && (
                      <ul className="changes-list">
                        {(result.whatChanged || []).map((change, i) => (
                          <li key={i}>
                            <span className="change-num">{i + 1}</span>
                            {change}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </>
            )}

            {!result.hasBug && (
              <div className="card">
                <div className="explanation">
                  <p>🎉 Your <strong>{language}</strong> code looks clean! No bugs were detected.</p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>🛡️ BugShield — Powered by Google Gemini AI</p>
      </footer>
    </div>
  );
}
