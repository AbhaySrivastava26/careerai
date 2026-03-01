import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "./SkillGap.css";

export default function SkillGap({ data }) {
  const navigate = useNavigate();
  const gap = data?.skill_gap || {};
  const matches = data?.career_matches || [];

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
    <div className="sg-wrapper">
      {/* Header */}
      <div className="sg-header">
        {/* <p className="sg-step">Step 2 of 4</p> */}
        <h1 className="sg-title"style={{color: "#359bef"}} >Skill Gap Analysis</h1>
        <p className="sg-subtitle"style={{color: "#1b6aaa"}}   >
          How ready are you for <strong style={{color: "#3244bc"}}>{role}</strong>?
        </p>
      </div>

      {/* Readiness Card */}
      <div className="sg-readiness-card">
        {/* Circle */}
        <div className="sg-circle-wrapper">
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
              className="sg-progress-ring"
            />
          </svg>
          <div className="sg-circle-content">
            <span className="sg-percentage" style={{ color: getReadinessColor() }}>
              {readiness}%
            </span>
            <span className="sg-ready-label">Ready</span>
          </div>
        </div>

        {/* Content */}
        <div className="sg-readiness-content">
          <h2 className="sg-readiness-title">{getReadinessMessage()}</h2>
          <p className="sg-readiness-desc">
            You have <strong>{matchedReq.length}</strong> of{" "}
            <strong>{gap.total_required || matchedReq.length + missingReq.length}</strong> required skills for{" "}
            <strong>{role}</strong>
            {missingReq.length > 0
              ? `. Learn ${missingReq.slice(0, 2).join(", ")}${missingReq.length > 2 ? ` and ${missingReq.length - 2} more` : ""} to be fully ready.`
              : ". You're fully qualified on required skills!"}
          </p>

          {/* Stats */}
          <div className="sg-stats">
            <div className="sg-stat-item have">
              <div className="sg-stat-number">{matchedReq.length + matchedPref.length}</div>
              <div className="sg-stat-label">Have</div>
            </div>
            <div className="sg-stat-item required">
              <div className="sg-stat-number">{missingReq.length}</div>
              <div className="sg-stat-label">Missing<br />Required</div>
            </div>
            <div className="sg-stat-item optional">
              <div className="sg-stat-number">{missingPref.length}</div>
              <div className="sg-stat-label">Missing<br />Optional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="sg-grid">
        {/* Have Skills */}
        <div className="sg-card sg-card-have">
          <h3 className="sg-card-title">Skills You Have</h3>
          <div className="sg-tags">
            {[...matchedReq, ...matchedPref].length > 0 ? (
              [...matchedReq, ...matchedPref].map(s => (
                <span key={s} className="sg-tag sg-tag-have">
                  {s}
                </span>
              ))
            ) : (
              <p className="sg-empty">No skills added yet</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="sg-card sg-card-missing">
          <h3 className="sg-card-title">Required Skills to Learn</h3>
          {missingReq.length === 0 ? (
            <div className="sg-all-good">
              <p>You have all required skills!</p>
            </div>
          ) : (
            <div className="sg-tags">
              {missingReq.map(s => (
                <span key={s} className="sg-tag sg-tag-missing">
                  {s} 
                </span>
              ))}
            </div>
          )}

          {missingPref.length > 0 && (
            <div className="sg-nice-to-have">
              <h4 className="sg-nice-title">Nice-to-have Skills</h4>
              <div className="sg-tags">
                {missingPref.map(s => (
                  <span key={s} className="sg-tag sg-tag-nice">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Career Comparison */}
      <div className="sg-careers">
        <h3 className="sg-careers-title">All Career Readiness</h3>
        <div className="sg-career-list">
          {(data?.career_matches || []).map((m, idx) => (
            <div key={m.title} className="sg-career-row" style={{ animationDelay: `${idx * 0.1}s` }}>
              {/* <span className="sg-career-icon">{m.icon}</span> */}
              <span className="sg-career-name">{m.title}</span>
              <div className="sg-bar-track">
                <div
                  className="sg-bar-fill"
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
              <span className="sg-career-pct">{m.match_percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button className="sg-cta-btn" onClick={() => navigate("/roadmap")}>
        View Your Learning Roadmap
        <ChevronRight size={18} />
      </button>
    </div>
  );
}