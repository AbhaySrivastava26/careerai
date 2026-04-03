import { useState, useRef } from "react";
import EmptyState from "../components/EmptyState";
import "./ATSMatch.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const CATEGORY_LABELS = {
  programming_languages: { label: "Languages",    color: "#2563eb" },
  frameworks_libraries:  { label: "Frameworks",   color: "#0891b2" },
  databases:             { label: "Databases",    color: "#7c3aed" },
  cloud_devops:          { label: "Cloud/DevOps", color: "#dc2626" },
  soft_skills:           { label: "Soft Skills",  color: "#db2777" },
  ai_ml:                 { label: "AI / ML",      color: "#d97706" },
  tools:                 { label: "Tools",        color: "#475569" },
  other:                 { label: "Other",        color: "#64748b" },
};

function ProgressRing({ percent, size = 110, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 75 ? "#10b981" : percent >= 55 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--border-primary)" strokeWidth={strokeWidth} />
      <circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 1s" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="24" fontWeight="800"
        fill={color} fontFamily="'Outfit', sans-serif">{percent}%</text>
    </svg>
  );
}

export default function ATSMatch() {
  const fileRef   = useRef(null);
  const [file, setFile]           = useState(null);
  const [dragging, setDragging]   = useState(false);
  const [jdText, setJdText]       = useState("");
  const [targetRole, setTarget]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const [activeTab, setActiveTab] = useState("keywords");
  const [copiedIdx, setCopied]    = useState(null);
  const [loadingStep, setStep]    = useState(0);

  const STEPS = [
    "Parsing your resume...",
    "Extracting JD keywords...",
    "Scoring ATS compatibility...",
    "AI rewriting bullets...",
  ];

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()  => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  };
  const onFileChange = (e) => { if (e.target.files[0]) validateAndSet(e.target.files[0]); };
  const validateAndSet = (f) => {
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf","docx"].includes(ext)) { setError("Only PDF or DOCX supported."); return; }
    setFile(f); setError("");
  };

  const handleAnalyze = async () => {
    if (!file)          { setError("Please upload your resume."); return; }
    if (!jdText.trim()) { setError("Please paste the job description."); return; }
    setError(""); setLoading(true); setResult(null); setStep(0);

    const timer = setInterval(() => setStep(s => s < STEPS.length - 1 ? s + 1 : s), 1800);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("job_description", jdText);
      form.append("target_role", targetRole);

      const res = await fetch(`${API_BASE}/ats-match`, { method: "POST", body: form });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Analysis failed"); }
      const data = await res.json();
      setResult(data);
      setActiveTab("keywords");
    } catch(e) {
      setError(e.message);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const copyBullet = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const scoreColor = (s) => s >= 75 ? "#10b981" : s >= 55 ? "#f59e0b" : "#ef4444";
  const scoreLabel = (s) => s >= 85 ? "Excellent" : s >= 70 ? "Good" : s >= 55 ? "Average" : s >= 40 ? "Weak" : "Poor";
  const totalMissing = result ? Object.values(result.missing_keywords).flat().length : 0;

  return (
    <div className="ats-wrapper">

      {/* Page Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title" style={{ color: "#2273e5" }}>ATS Battle</h1>
        <p className="dashboard-subtitle" style={{ color: "#8baee0" }}>
          Upload your resume and paste a job description — AI scores compatibility,
          finds keyword gaps, and rewrites your bullets to beat ATS filters.
        </p>
      </div>

      {/* Input Section */}
      {!result && (
        <>
          <div className="ats-input-row">
            {/* Upload Card */}
            <div className="dashboard-card ats-upload-card">
              <div className="card-title">Your Resume</div>
              <div
                className={`ats-dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={onFileChange} style={{ display:"none" }} />
                {file ? (
                  <div className="ats-file-selected">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <div className="ats-file-name">{file.name}</div>
                    <div className="ats-file-meta">{(file.size/1024).toFixed(1)} KB · {file.name.split(".").pop().toUpperCase()}</div>
                    <button className="ats-remove-btn" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="ats-upload-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="ats-drop-title">Drop resume here</div>
                    <div className="ats-drop-sub">or click to browse</div>
                    <div className="ats-drop-formats">PDF &nbsp;·&nbsp; DOCX</div>
                  </>
                )}
              </div>
            </div>

            {/* JD Card */}
            <div className="dashboard-card ats-jd-card">
              <div className="ats-jd-header">
                <div className="card-title">Job Description</div>
                <span className="ats-char-count">{jdText.length} chars</span>
              </div>
              <textarea
                className="ats-jd-textarea"
                placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities and qualifications for accurate analysis."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="dashboard-card ats-action-card">
            <div className="ats-action-inner">
              <div className="ats-role-group">
                <label className="ats-role-label">Target Role <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="ats-role-input"
                  placeholder="e.g. Full Stack Developer, Data Scientist..."
                  value={targetRole}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>
              <button className={`ats-cta-btn ${loading ? "loading" : ""}`} onClick={handleAnalyze} disabled={loading}>
                {loading ? <><span className="ats-spinner" />Analyzing...</> : <>⚔️&nbsp; Run ATS Battle</>}
              </button>
            </div>
          </div>

          {error && <div className="ats-error">{error}</div>}

          {loading && (
            <div className="dashboard-card ats-loading-card">
              {STEPS.map((step, i) => (
                <div key={i} className={`ats-step ${i <= loadingStep ? "active" : ""} ${i < loadingStep ? "done" : ""}`}>
                  <span className="ats-step-dot" />
                  <span className="ats-step-label">{step}</span>
                  {i < loadingStep && <span className="ats-step-check">✓</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Results */}
      {result && (
        <div className="ats-results">

          {/* Top row: 3 cards */}
          <div className="ats-top-row">

            {/* Score */}
            <div className="dashboard-card ats-score-card">
              <div className="card-subtitle" style={{ textTransform:"uppercase", letterSpacing:"0.08em", fontSize:11, color:"var(--text-secondary)", marginBottom:16 }}>ATS Score</div>
              <ProgressRing percent={result.ats_score} />
              <div style={{ marginTop:12, fontSize:18, fontWeight:800, color: scoreColor(result.ats_score) }}>
                {scoreLabel(result.ats_score)}
              </div>
              <div style={{ fontSize:13, color:"var(--text-secondary)", marginTop:4, textAlign:"center" }}>
                {result.verdict?.replace(/^[^\s]+\s/, "")}
              </div>
            </div>

            {/* Keyword Stats */}
            <div className="dashboard-card ats-stats-card">
              <div className="card-title">Keyword Analysis</div>
              <div className="ats-stat-row">
                <div className="ats-stat-box" style={{ "--stat-color": "#10b981" }}>
                  <div className="ats-stat-num">{result.total_matched}</div>
                  <div className="ats-stat-lbl">Matched</div>
                </div>
                <div className="ats-stat-box" style={{ "--stat-color": "#ef4444" }}>
                  <div className="ats-stat-num">{totalMissing}</div>
                  <div className="ats-stat-lbl">Missing</div>
                </div>
                <div className="ats-stat-box" style={{ "--stat-color": "var(--text-primary)" }}>
                  <div className="ats-stat-num">{result.total_jd_keywords}</div>
                  <div className="ats-stat-lbl">JD Total</div>
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"var(--text-secondary)", marginBottom:8 }}>
                  <span>Coverage</span>
                  <span>{result.total_jd_keywords > 0 ? Math.round((result.total_matched / result.total_jd_keywords)*100) : 0}%</span>
                </div>
                <div className="ats-bar-track">
                  <div className="ats-bar-fill" style={{
                    width: `${result.total_jd_keywords > 0 ? (result.total_matched / result.total_jd_keywords)*100 : 0}%`,
                    background: scoreColor(result.ats_score),
                  }} />
                </div>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="dashboard-card ats-wins-card">
              <div className="card-title">⚡ Quick Wins</div>
              <div className="ats-wins-list">
                {result.quick_wins?.map((win, i) => (
                  <div key={i} className="ats-win-item">
                    <div className="ats-win-num">{i+1}</div>
                    <div className="ats-win-text">{win}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="ats-tab-bar">
            {[
              { id: "keywords", label: "🗝️ Keyword Gap" },
              { id: "bullets",  label: "✍️ Rewritten Bullets" },
            ].map(tab => (
              <button key={tab.id} className={`ats-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            ))}
            <button className="ats-new-btn" onClick={() => { setResult(null); setFile(null); setJdText(""); setTarget(""); }}>
              ↩ New Analysis
            </button>
          </div>

          {/* Keywords */}
          {activeTab === "keywords" && (
            <div className="ats-kw-grid">
              <div className="dashboard-card">
                <div className="card-title" style={{ color:"#10b981" }}>✅ Matched</div>
                <div className="ats-kw-body">
                  {Object.entries(result.matched_keywords).map(([cat, kws]) =>
                    kws.length > 0 ? (
                      <div key={cat} className="ats-kw-group">
                        <div className="ats-kw-label" style={{ color: CATEGORY_LABELS[cat]?.color }}>
                          {CATEGORY_LABELS[cat]?.label || cat}
                        </div>
                        <div className="skill-tags">
                          {kws.map(kw => <span key={kw} className="skill-tag ats-matched-tag">{kw}</span>)}
                        </div>
                      </div>
                    ) : null
                  )}
                  {result.total_matched === 0 && <div className="ats-empty">No keyword matches found.</div>}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-title" style={{ color:"#ef4444" }}>❌ Missing</div>
                <div className="ats-kw-body">
                  {Object.entries(result.missing_keywords).map(([cat, kws]) =>
                    kws.length > 0 ? (
                      <div key={cat} className="ats-kw-group">
                        <div className="ats-kw-label" style={{ color: CATEGORY_LABELS[cat]?.color }}>
                          {CATEGORY_LABELS[cat]?.label || cat}
                        </div>
                        <div className="skill-tags">
                          {kws.map(kw => <span key={kw} className="skill-tag ats-missing-tag">{kw}</span>)}
                        </div>
                      </div>
                    ) : null
                  )}
                  {totalMissing === 0 && (
                    <div className="ats-empty" style={{ color:"#10b981", fontWeight:600 }}>
                      🎉 Your resume covers all detected JD keywords!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Bullets */}
          {activeTab === "bullets" && (
            <div className="ats-bullets-section">
              <p className="ats-bullets-intro">
                AI has rewritten your resume bullets to naturally include missing keywords.
                Copy the optimized versions directly into your resume.
              </p>
              {result.rewritten_bullets?.length > 0 ? (
                result.rewritten_bullets.map((item, i) => (
                  <div key={i} className="dashboard-card ats-bullet-card">
                    <div className="ats-bullet-grid">
                      <div className="ats-bullet-side">
                        <span className="ats-bullet-badge ats-badge-orig">ORIGINAL</span>
                        <div className="ats-bullet-text ats-orig-text">{item.original}</div>
                      </div>
                      <div className="ats-bullet-divider">→</div>
                      <div className="ats-bullet-side">
                        <span className="ats-bullet-badge ats-badge-new">AI OPTIMIZED</span>
                        <div className="ats-bullet-text ats-new-text">{item.rewritten}</div>
                        {item.keywords_added?.length > 0 && (
                          <div className="ats-added-row">
                            <span style={{ color:"var(--text-secondary)", fontSize:12 }}>Added: </span>
                            <div className="skill-tags" style={{ display:"inline-flex", flexWrap:"wrap", gap:4 }}>
                              {item.keywords_added.map(kw => (
                                <span key={kw} className="skill-tag" style={{ fontSize:11 }}>{kw}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        <button className={`ats-copy-btn ${copiedIdx === i ? "copied" : ""}`} onClick={() => copyBullet(item.rewritten, i)}>
                          {copiedIdx === i ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="dashboard-card" style={{ padding:"2rem", color:"var(--text-secondary)", fontSize:14 }}>
                  No bullet points detected. Make sure your resume contains experience with action-verb sentences.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}   