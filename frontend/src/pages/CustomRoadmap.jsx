import { useState } from "react";
import { Wand2, Search, Download, CheckCircle, Clock, Loader, AlertCircle } from "lucide-react";
import axios from "axios";

const API = "http://localhost:8080";

const phaseColors = [
  { bg: "#EFF6FF", border: "#BFDBFE", badge: "#2563EB", text: "#1E40AF" },
  { bg: "#F5F3FF", border: "#DDD6FE", badge: "#7C3AED", text: "#5B21B6" },
  { bg: "#F0FDF4", border: "#BBF7D0", badge: "#16A34A", text: "#14532D" },
  { bg: "#FFFBEB", border: "#FDE68A", badge: "#D97706", text: "#92400E" },
];

const SUGGESTED_ROLES = [
  "Full Stack Developer", "Data Engineer", "DevOps Engineer",
  "AI / GenAI Engineer", "Product Manager", "Cybersecurity Engineer",
  "Data Scientist", "Android Developer", "UI/UX Designer",
  "Frontend Developer", "Backend Developer", "NLP Engineer",
];

export default function CustomRoadmap() {
  const [role,      setRole]      = useState("");
  const [name,      setName]      = useState("");
  const [tab,       setTab]       = useState("text");
  const [roadmap,   setRoadmap]   = useState(null);
  const [imageUrl,  setImageUrl]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const generate = async () => {
    if (!role.trim()) return;
    setLoading(true);
    setError("");
    setRoadmap(null);
    setImageUrl(null);

    try {
      const { data } = await axios.post(`${API}/generate-roadmap`, null, {
        params: { role: role.trim(), name: name.trim() || "You", readiness: 50 },
      });
      setRoadmap(data.roadmap);
      if (data.roadmap_image_url) setImageUrl(data.roadmap_image_url);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate roadmap. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#F5F3FF", border: "1px solid #DDD6FE",
          borderRadius: 20, padding: "6px 16px", marginBottom: 16,
        }}>
          <Wand2 size={14} color="#7C3AED" />
          <span style={{ fontSize: 13, color: "#7C3AED", fontWeight: 600 }}>Custom Roadmap Generator</span>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#2563EB", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
          Generate Any Career Roadmap
        </h1>
        <p style={{ color: "#64748B", fontSize: 16, margin: 0 }}>
          Type any role — get a personalized 4-phase learning roadmap with text and visual formats.
        </p>
      </div>

      {/* Input form */}
      <div style={{
        background: "#fff", border: "1px solid #E2E8F0",
        borderRadius: 20, padding: "28px", marginBottom: 32,
      }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Target Role *
            </label>
            <div style={{ position: "relative" }}>
              <Search size={16} color="#94A3B8" style={{
                position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)"
              }} />
              <input
                value={role}
                onChange={e => setRole(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generate()}
                placeholder="e.g. Data Engineer, DevOps, Product Manager..."
                style={{
                  width: "100%", padding: "12px 14px 12px 42px",
                  border: "1px solid #E2E8F0", borderRadius: 10,
                  fontSize: 15, color: "#0F172A", outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = "#2563EB"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Your Name (optional)
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Abhay"
              style={{
                width: "100%", padding: "12px 14px",
                border: "1px solid #E2E8F0", borderRadius: 10,
                fontSize: 15, color: "#0F172A", outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "#2563EB"}
              onBlur={e => e.target.style.borderColor = "#E2E8F0"}
            />
          </div>
        </div>

        {/* Suggested roles */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: "0 0 10px", fontWeight: 500 }}>
            Quick select:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_ROLES.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: "5px 14px", borderRadius: 20,
                  border: `1px solid ${role === r ? "#2563EB" : "#E2E8F0"}`,
                  background: role === r ? "#EFF6FF" : "#F8FAFC",
                  color: role === r ? "#2563EB" : "#64748B",
                  fontSize: 13, fontWeight: role === r ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#FEF2F2", border: "1px solid #FECACA",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          }}>
            <AlertCircle size={16} color="#EF4444" />
            <span style={{ color: "#DC2626", fontSize: 14 }}>{error}</span>
          </div>
        )}

        <button
          onClick={generate}
          disabled={!role.trim() || loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "14px",
            background: !role.trim() || loading
              ? "#E2E8F0"
              : "linear-gradient(135deg, #7C3AED, #6D28D9)",
            color: !role.trim() || loading ? "#94A3B8" : "#fff",
            border: "none", borderRadius: 12,
            fontWeight: 700, fontSize: 16,
            cursor: !role.trim() || loading ? "not-allowed" : "pointer",
            boxShadow: !role.trim() || loading ? "none" : "0 4px 14px rgba(124,58,237,0.3)",
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <>
              <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />
              Generating Roadmap...
            </>
          ) : (
            <>
              <Wand2 size={18} />
              Generate Roadmap
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {roadmap && (
        <div>
          {/* Role title */}
          <div style={{
            background: "linear-gradient(135deg, #6D28D9, #7C3AED)",
            borderRadius: 16, padding: "20px 28px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Roadmap for</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
                {roadmap.target_role}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{roadmap.total_duration}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Total duration</div>
            </div>
          </div>

          {/* Overview */}
          {roadmap.overview && (
            <div style={{
              background: "#F5F3FF", border: "1px solid #DDD6FE",
              borderRadius: 12, padding: "16px 20px", marginBottom: 24,
            }}>
              <p style={{ color: "#5B21B6", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{roadmap.overview}</p>
            </div>
          )}

          {/* Tab switcher */}
          <div style={{
            display: "flex", gap: 4, background: "#F1F5F9",
            borderRadius: 10, padding: 4, marginBottom: 24, width: "fit-content",
          }}>
            {[
              { id: "text",  label: "📋 Text Roadmap"   },
              { id: "image", label: "🖼️  Visual Roadmap" },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "8px 20px", borderRadius: 8, border: "none",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
                background: tab === id ? "#fff" : "transparent",
                color:      tab === id ? "#7C3AED" : "#64748B",
                boxShadow:  tab === id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>

          {/* Text phases */}
          {tab === "text" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {(roadmap.phases || []).map((phase, i) => {
                const c = phaseColors[i % phaseColors.length];
                return (
                  <div key={i} style={{
                    background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: 16, padding: "24px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          background: c.badge, color: "#fff",
                          borderRadius: 8, padding: "4px 12px",
                          fontSize: 12, fontWeight: 700,
                        }}>
                          Phase {phase.phase_number}
                        </div>
                        <h3 style={{ fontWeight: 700, color: c.text, margin: 0, fontSize: 17 }}>{phase.title}</h3>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        background: "rgba(255,255,255,0.7)", borderRadius: 20,
                        padding: "4px 12px",
                      }}>
                        <Clock size={13} color="#64748B" />
                        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{phase.duration}</span>
                      </div>
                    </div>

                    {phase.focus && (
                      <p style={{ fontSize: 14, color: "#475569", margin: "0 0 16px", fontStyle: "italic" }}>
                        → {phase.focus}
                      </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {(phase.tasks || []).map((task, j) => (
                        <div key={j} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <CheckCircle size={16} color={c.badge} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Image roadmap */}
          {tab === "image" && (
            <div>
              {imageUrl ? (
                <div>
                  <img
                    src={imageUrl}
                    alt="Roadmap"
                    style={{
                      width: "100%", borderRadius: 16,
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    }}
                    onError={e => { e.target.style.display = "none"; }}
                  />
                  <a
                    href={imageUrl}
                    download={`roadmap_${roadmap.target_role.replace(/ /g, "_")}.png`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      marginTop: 16, background: "#0F172A", color: "#fff",
                      borderRadius: 10, padding: "10px 20px",
                      fontWeight: 600, fontSize: 14, textDecoration: "none",
                    }}
                  >
                    <Download size={16} /> Download Image
                  </a>
                </div>
              ) : (
                <div style={{
                  background: "#F8FAFC", border: "2px dashed #E2E8F0",
                  borderRadius: 16, padding: "60px", textAlign: "center",
                }}>
                  <p style={{ color: "#94A3B8", fontSize: 16, margin: 0 }}>
                    Image generation in progress or unavailable.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}