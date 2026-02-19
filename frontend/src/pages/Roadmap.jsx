import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, ChevronRight } from "lucide-react";
import EmptyState from "../components/EmptyState";
import "./Roadmap.css";

const API = "http://localhost:8080";

const COLORS = [
  { bg: "#F5F3FF", border: "#E9D5FF", badge: "#7C3AED", text: "#5B21B6" },
  { bg: "#F0FDF4", border: "#BBFBEE", badge: "#16A34A", text: "#14532D" },
  { bg: "#FFFBEB", border: "#FEF08A", badge: "#D97706", text: "#92400E" },
  { bg: "#EFF6FF", border: "#BFDBFE", badge: "#2563EB", text: "#1E40AF" },
];

export default function Roadmap({ data }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("text");

  if (!data) return <EmptyState message="Upload your resume to generate your personalised learning roadmap." />;

  const roadmap = data.roadmap || {};
  const resumeId = data.resume_id;
  const imageUrl = resumeId ? `${API}/roadmap-image/${resumeId}` : null;
  const phases = roadmap.phases || [];

  return (
    <div className="rm-root">
      {/* Header */}
      <div className="rm-header">
        {/* <p className="rm-step">Step 3 of 4</p> */}
        <h1 className="rm-title">Your Learning Roadmap</h1>
        <p className="rm-subtitle">
          A personalised <strong>{roadmap.total_duration || "12-week"}</strong> plan to become a{" "}
          <strong>{roadmap.target_role}</strong>
        </p>
      </div>

      {/* Overview */}
      {roadmap.overview && (
        <div className="rm-overview">
          <p>{roadmap.overview}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="rm-stats">
        <div className="rm-stat-card">
          <div className="rm-stat-label">Total Duration</div>
          <div className="rm-stat-value">{roadmap.total_duration || "12 weeks"}</div>
        </div>
        <div className="rm-stat-card">
          <div className="rm-stat-label">Learning Phases</div>
          <div className="rm-stat-value">{phases.length} Phases</div>
        </div>
        <div className="rm-stat-card">
          <div className="rm-stat-label">Target Role</div>
          <div className="rm-stat-value">{roadmap.target_role || "—"}</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="rm-tabs">
        <button
          onClick={() => setTab("text")}
          className={`rm-tab ${tab === "text" ? "active" : ""}`}
        >
          Text Roadmap
        </button>
        <button
          onClick={() => setTab("image")}
          className={`rm-tab ${tab === "image" ? "active" : ""}`}
        >
          Visual Roadmap
        </button>
      </div>

      {/* Text Phases */}
      {tab === "text" && (
        <div className="rm-phases">
          {phases.map((phase, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <div key={i} className="rm-phase" style={{ background: c.bg, borderColor: c.border }}>
                <div className="rm-phase-header">
                  <div className="rm-phase-left">
                    <span className="rm-phase-badge" style={{ background: c.badge }}>
                      Phase {phase.phase_number}
                    </span>
                    <h3 className="rm-phase-title" style={{ color: c.text }}>
                      {phase.title}
                    </h3>
                  </div>
                  <div className="rm-phase-duration">{phase.duration}</div>
                </div>

                {phase.focus && (
                  <p className="rm-phase-focus">{phase.focus}</p>
                )}

                <div className="rm-phase-tasks">
                  {(phase.tasks || []).map((task, j) => (
                    <div key={j} className="rm-task">
                      <span className="rm-task-bullet" style={{ background: c.badge }}></span>
                      <span className="rm-task-text">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Tab */}
      {tab === "image" && (
        <div className="rm-image-section">
          {imageUrl ? (
            <div>
              <img
                src={imageUrl}
                alt="Learning Roadmap"
                className="rm-roadmap-image"
                onError={e => { e.target.style.display = "none"; }}
              />
              <a href={imageUrl} download="my_roadmap.png" className="rm-download-btn">
                <Download size={16} />
                Download Roadmap Image
              </a>
            </div>
          ) : (
            <div className="rm-empty-state">
              <p>No roadmap image available</p>
            </div>
          )}
        </div>
      )}

      {/* CTA Button */}
      <button className="rm-cta-btn" onClick={() => navigate("/jobs")}>
        View Live Jobs
        <ChevronRight size={18} />
      </button>
    </div>
  );
}