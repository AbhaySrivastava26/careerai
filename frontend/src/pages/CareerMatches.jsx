import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import EmptyState from "../components/EmptyState";
import "./SkillGap.css";

export default function SkillGap({ data }) {
  const navigate = useNavigate();

  if (!data) return <EmptyState message="Upload your resume to see your skill gap analysis." />;

  const gap = data.skill_gap || {};
  const matches = data.career_matches || [];
  const readiness = gap.readiness_pct || 0;
  const role = gap.role || matches[0]?.title || "Your Target Role";
  const matchedReq = gap.matched_required || [];
  const matchedPref = gap.matched_preferred || [];
  const missingReq = gap.missing_required || [];
  const missingPref = gap.missing_preferred || [];

  const getReadinessMessage = () => {
    if (readiness >= 75) return "Almost There";
    if (readiness >= 50) return "Good Progress";
    return "Getting Started";
  };

  const getReadinessColor = () => {
    if (readiness >= 75) return "#22C55E";
    if (readiness >= 50) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <div className="sg-root">
      {/* Header */}
      <div className="sg-header">
        <p className="sg-step">Step 2 of 4</p>
        <h1 className="sg-title">Skill Gap Analysis</h1>
        <p className="sg-subtitle">
          How ready are you for <strong>{role}</strong>?
        </p>
      </div>

      {/* Readiness Card */}
      <section className="sg-card sg-readiness-card">
        <div className="sg-readiness-circle">
          <svg width={140} height={140} viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="58" fill="none" stroke="#F1F5F9" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke={getReadinessColor()}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - readiness / 100)}`}
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="sg-readiness-center">
            <span className="sg-ready-pct" style={{ color: getReadinessColor() }}>
              {readiness}%
            </span>
            <span className="sg-ready-label">Ready</span>
          </div>
        </div>

        <div className="sg-readiness-main">
          <h2 className="sg-ready-header">{getReadinessMessage()}</h2>
          <p className="sg-ready-desc">
            You have <strong>{matchedReq.length}</strong> of{" "}
            <strong>{gap.total_required || matchedReq.length + missingReq.length}</strong>{" "}
            required skills for <strong>{role}</strong>
            {missingReq.length > 0
              ? `. Learn ${missingReq.join(", ")} to be fully ready.`
              : ". You have all required skills!"}
          </p>

          <div className="sg-stats-row">
            <div className="sg-stat-box sg-stat-have">
              <div className="sg-stat-count">{matchedReq.length + matchedPref.length}</div>
              <div className="sg-stat-label">Have</div>
            </div>
            <div className="sg-stat-box sg-stat-missing">
              <div className="sg-stat-count">{missingReq.length}</div>
              <div className="sg-stat-label">Missing<br />Required</div>
            </div>
            <div className="sg-stat-box sg-stat-optional">
              <div className="sg-stat-count">{missingPref.length}</div>
              <div className="sg-stat-label">Missing<br />Optional</div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <div className="sg-grid">
        {/* Have */}
        <div className="sg-card">
          <div className="sg-card-header">
            <div className="sg-card-icon" style={{ color: "#22C55E" }}>
              <CheckCircle size={20} />
            </div>
            <h3 className="sg-card-title" style={{ color: "#15803D" }}>
              Skills You Have
            </h3>
          </div>
          <div className="sg-skill-tags">
            {[...matchedReq, ...matchedPref].map(s => (
              <span key={s} className="sg-tag sg-tag-have">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Missing */}
        <div className="sg-card">
          <div className="sg-card-header">
            <div className="sg-card-icon" style={{ color: "#DC2626" }}>
              <XCircle size={20} />
            </div>
            <h3 className="sg-card-title" style={{ color: "#991B1B" }}>
              Skills to Learn
            </h3>
          </div>
          {missingReq.length === 0 ? (
            <div className="sg-all-have">You have all required skills!</div>
          ) : (
            <div className="sg-skill-tags">
              {missingReq.map(s => (
                <span key={s} className="sg-tag sg-tag-miss">
                  {s}
                </span>
              ))}
            </div>
          )}

          {missingPref.length > 0 && (
            <>
              <div className="sg-card-header sg-nice-header">
                <div className="sg-card-icon" style={{ color: "#F59E0B" }}>
                  <AlertTriangle size={18} />
                </div>
                <h4 className="sg-card-title" style={{ color: "#92400E" }}>
                  Nice-to-have
                </h4>
              </div>
              <div className="sg-skill-tags">
                {missingPref.map(s => (
                  <span key={s} className="sg-tag sg-tag-nice">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* All Career Readiness */}
      <div className="sg-card sg-careerlist">
        <h3 className="sg-careerlist-title">All Career Readiness</h3>
        <div className="sg-careercards">
          {matches.map((m, idx) => (
            <div key={m.title} className="sg-careerrow" style={{ animationDelay: `${idx * 0.1}s` }}>
              <span className="sg-career-icon">{m.icon}</span>
              <div className="sg-career-title">{m.title}</div>
              <div className="sg-bar-track">
                <div
                  className="sg-bar"
                  style={{
                    width: `${m.match_percentage}%`,
                    background:
                      m.match_percentage >= 70
                        ? "#22C55E"
                        : m.match_percentage >= 50
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                />
              </div>
              <div className="sg-career-pct">{m.match_percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        className="sg-roadmap-btn"
        onClick={() => navigate("/roadmap")}
      >
        View Learning Roadmap
        <ArrowRight size={18} />
      </button>
    </div>
  );
}