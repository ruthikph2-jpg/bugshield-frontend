import { useState } from "react";
import Editor from "@monaco-editor/react";
import ReactDiffViewer from "react-diff-viewer-continued";
import Chat from "./Chat";
import "./App.css";

const LANGUAGES = ["Python", "JavaScript", "Java", "C++", "C", "TypeScript", "Go", "Rust"];

const MONACO_LANG_MAP = {
  Python: "python", JavaScript: "javascript", Java: "java",
  "C++": "cpp", C: "c", TypeScript: "typescript", Go: "go", Rust: "rust",
};

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
  const colors = { High: "#ff4d4f", Medium: "#faad14", Low: "#52c41a", None: "#52c41a" };
  return (
    <span className="severity-badge" style={{ background: colors[severity] || "#aaa" }}>
      {severity} Severity
    </span>
  );
};

function HistoryPanel({ backendUrl, onLoadHistory }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/history`);
      const data = await res.json();
      setHistory(data);
      setLoaded(true);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="card history-card">
      <div className="card-header">
        <h2>📜 Fix History</h2>
        <button className="btn btn-ghost" onClick={fetchHistory} disabled={loading}>
          {loading ? "Loading..." : loaded ? "🔄 Refresh" : "Load History"}
        </button>
      </div>
      {loaded && history.length === 0 && (
        <p className="empty-history">No history yet. Analyze some code first!</p>
      )}
      {history.map((item) => (
        <div key={item._id} className="history-item" onClick={() => onLoadHistory(item)}>
          <div className="history-left">
            <span className={`history-status ${item.hasBug ? "bug" : "clean"}`}>
              {item.hasBug ? "🐛 Bug Found" : "✅ Clean"}
            </span>
            <span className="history-lang">{item.language}</span>
            <span className="history-desc">{item.bugDescription?.slice(0, 60)}...</span>
          </div>
          <div className="history-right">
            {item.hasBug && <SeverityBadge severity={item.severity} />}
            <span className="history-time">{timeAgo(item.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("fixed");
  const [showDiff, setShowDiff] = useState(false);
  const [activeSection, setActiveSection] = useState("analyze"); // analyze | history

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const analyzeCode = async () => {
    if (!code.trim()) { setError("Please paste some code to analyze."); return; }
    setLoading(true); setError(""); setResult(null); setCopied(false); setShowDiff(false);

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

  const handleDownload = () => {
    if (!result?.fixedCode) return;
    const ext = { Python: "py", JavaScript: "js", Java: "java", "C++": "cpp", C: "c", TypeScript: "ts", Go: "go", Rust: "rs" };
    const blob = new Blob([result.fixedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fixed_code.${ext[language] || "txt"}`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleLoadHistory = (item) => {
    setCode(item.originalCode);
    setLanguage(item.language);
    setResult({
      hasBug: item.hasBug,
      bugDescription: item.bugDescription,
      bugLine: item.bugLine,
      fixedCode: item.fixedCode,
      explanation: item.explanation,
      whatChanged: item.whatChanged,
      severity: item.severity,
    });
    setActiveSection("analyze");
    setActiveTab("fixed");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <div className="nav-tabs">
            <button className={`nav-tab ${activeSection === "analyze" ? "active" : ""}`} onClick={() => setActiveSection("analyze")}>🔍 Analyze</button>
            <button className={`nav-tab ${activeSection === "history" ? "active" : ""}`} onClick={() => setActiveSection("history")}>📜 History</button>
          </div>
        </div>
      </header>

      <main className="main">
        {activeSection === "history" ? (
          <HistoryPanel backendUrl={BACKEND_URL} onLoadHistory={handleLoadHistory} />
        ) : (
          <>
            {/* Monaco Editor Input */}
            <section className="card input-card">
              <div className="card-header">
                <h2>📋 Paste Your Code</h2>
                <div className="controls">
                  <select className="lang-select" value={language} onChange={(e) => { setLanguage(e.target.value); setResult(null); }}>
                    {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button className="btn btn-ghost" onClick={() => { setCode(SAMPLE_CODE[language] || SAMPLE_CODE["Python"]); setResult(null); setError(""); }}>Try Sample</button>
                  <button className="btn btn-ghost" onClick={() => { setCode(""); setResult(null); setError(""); }}>Clear</button>
                </div>
              </div>

              <div className="monaco-wrapper">
                <Editor
                  height="280px"
                  language={MONACO_LANG_MAP[language] || "plaintext"}
                  value={code}
                  onChange={(val) => setCode(val || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    lineNumbers: "on",
                    renderLineHighlight: "all",
                    suggestOnTriggerCharacters: true,
                    tabSize: 2,
                  }}
                />
              </div>

              {error && <div className="error-box">⚠️ {error}</div>}

              <button className="btn btn-primary analyze-btn" onClick={analyzeCode} disabled={loading}>
                {loading ? <><span className="spinner" /> Analyzing...</> : <><span>🔍</span> Analyze & Fix Code</>}
              </button>
            </section>

            {/* Results */}
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

                    {/* Diff Toggle */}
                    <div className="diff-toggle-row">
                      <button className={`btn ${showDiff ? "btn-primary" : "btn-ghost"}`} onClick={() => setShowDiff(!showDiff)}>
                        {showDiff ? "📊 Hide Diff View" : "📊 Show Side-by-Side Diff"}
                      </button>
                    </div>

                    {/* Side-by-Side Diff Viewer */}
                    {showDiff && (
                      <div className="card diff-card">
                        <h3>📊 Code Diff — Before & After</h3>
                        <div className="diff-wrapper">
                          <ReactDiffViewer
                            oldValue={code}
                            newValue={result.fixedCode}
                            splitView={true}
                            leftTitle="❌ Original (Buggy)"
                            rightTitle="✅ Fixed Code"
                            useDarkTheme={true}
                            styles={{
                              variables: {
                                dark: {
                                  diffViewerBackground: "#0d0f1a",
                                  addedBackground: "#0f2d1a",
                                  addedColor: "#6ee77e",
                                  removedBackground: "#2d0f0f",
                                  removedColor: "#ff7875",
                                  wordAddedBackground: "#1a4d2a",
                                  wordRemovedBackground: "#4d1a1a",
                                  addedGutterBackground: "#0f2d1a",
                                  removedGutterBackground: "#2d0f0f",
                                  gutterBackground: "#141729",
                                  gutterBackgroundDark: "#0d0f1a",
                                  highlightBackground: "#1e2340",
                                  highlightGutterBackground: "#1e2340",
                                  codeFoldGutterBackground: "#1e2340",
                                  codeFoldBackground: "#141729",
                                  emptyLineBackground: "#0d0f1a",
                                  gutterColor: "#4a5568",
                                  addedGutterColor: "#6ee77e",
                                  removedGutterColor: "#ff7875",
                                  codeFoldContentColor: "#94a3b8",
                                  diffViewerTitleBackground: "#1e2340",
                                  diffViewerTitleColor: "#f1f5f9",
                                  diffViewerTitleBorderColor: "#2d3561",
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Tabs */}
                    <div className="card tabs-card">
                      <div className="tabs">
                        <button className={`tab ${activeTab === "fixed" ? "active" : ""}`} onClick={() => setActiveTab("fixed")}>✅ Fixed Code</button>
                        <button className={`tab ${activeTab === "explanation" ? "active" : ""}`} onClick={() => setActiveTab("explanation")}>📝 Explanation</button>
                        <button className={`tab ${activeTab === "changes" ? "active" : ""}`} onClick={() => setActiveTab("changes")}>🔧 What Changed</button>
                      </div>

                      <div className="tab-content">
                        {activeTab === "fixed" && (
                          <div>
                            <div className="code-header">
                              <span className="lang-pill">{language}</span>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button className="btn btn-ghost small" onClick={handleCopy}>{copied ? "✅ Copied!" : "📋 Copy"}</button>
                                <button className="btn btn-ghost small" onClick={handleDownload}>⬇️ Download</button>
                              </div>
                            </div>
                            <div className="monaco-wrapper fixed-monaco">
                              <Editor
                                height="240px"
                                language={MONACO_LANG_MAP[language] || "plaintext"}
                                value={result.fixedCode}
                                theme="vs-dark"
                                options={{ readOnly: true, minimap: { enabled: false }, scrollBeyondLastLine: false, wordWrap: "on", lineNumbers: "on", fontSize: 13 }}
                              />
                            </div>
                          </div>
                        )}

                        {activeTab === "explanation" && (
                          <div className="explanation"><p>{result.explanation}</p></div>
                        )}

                        {activeTab === "changes" && (
                          <ul className="changes-list">
                            {(result.whatChanged || []).map((change, i) => (
                              <li key={i}><span className="change-num">{i + 1}</span>{change}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Chat with AI */}
                    <Chat
                      code={code}
                      language={language}
                      fixedCode={result.fixedCode}
                      backendUrl={BACKEND_URL}
                    />
                  </>
                )}

                {!result.hasBug && (
                  <div className="card">
                    <div className="explanation">
                      <p>🎉 Your <strong>{language}</strong> code looks clean! No bugs were detected.</p>
                    </div>
                    <Chat code={code} language={language} fixedCode={code} backendUrl={BACKEND_URL} />
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>🛡️ BugShield — Powered by Google Gemini AI · MongoDB Atlas</p>
      </footer>
    </div>
  );
}
