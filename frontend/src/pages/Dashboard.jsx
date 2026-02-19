import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import "./Dashboard.css";

/* SVG Chart Components */
function ProgressRing({ percent, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 75 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1s" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="28"
        fontWeight="800"
        fill={color}
        fontFamily="'Outfit', sans-serif"
      >
        {percent}%
      </text>
    </svg>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bar-chart">
      {data.map((item, i) => (
        <div key={i} className="bar-item">
          <div className="bar-header">
            <span className="bar-label">{item.label}</span>
            <span className="bar-value">{item.value}%</span>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(item.value / max) * 100}%`,
                background: item.color || "#0f172a",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const CATEGORY_COLORS = {
  programming_languages: "#2563eb",
  web_frontend: "#0891b2",
  web_backend: "#059669",
  databases: "#7c3aed",
  cloud_devops: "#dc2626",
  ai_ml: "#d97706",
  tools: "#475569",
  soft_skills: "#db2777",
};

const CATEGORY_LABELS = {
  programming_languages: "Programming",
  web_frontend: "Frontend",
  web_backend: "Backend",
  databases: "Databases",
  cloud_devops: "Cloud & DevOps",
  ai_ml: "AI & ML",
  tools: "Tools",
  soft_skills: "Soft Skills",
};

export default function Dashboard({ data }) {
  const navigate = useNavigate();

  if (!data) {
    return <EmptyState message="Upload your resume to view your professional dashboard." />;
  }

  const name = data.name || "Professional";
  const email = data.email || "";
  const education = data.education || [];
  const experience = data.experience || [];
  const projects = data.projects || [];
  const certs = data.certifications || [];
  const matches = data.career_matches || [];
  const skillGap = data.skill_gap || {};
  const categorized = data.skills?.categorized || {};
  const allSkills = data.skills?.all || [];

  const topMatch = matches[0] || {};
  const readiness = skillGap.readiness_pct || 0;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const careerData = matches.slice(0, 4).map((m, i) => ({
    label: m.title,
    value: m.match_percentage,
    color: ["#0f172a", "#334155", "#475569", "#64748b"][i],
  }));

  return (
    <div className="dashboard-wrapper">
      
      {/* Page header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Professional Dashboard</h1>
        <p className="dashboard-subtitle">
          Comprehensive overview of skills, experience, and career readiness
        </p>
      </div>

      {/* Grid layout */}
      <div className="dashboard-grid">
        
        {/* Left sidebar - Profile */}
        <div className="dashboard-sidebar">
          {/* Avatar */}
          <div className="profile-avatar">
            {initials}
          </div>

          {/* Name */}
          <div className="profile-name">{name}</div>

          {/* Role badge */}
          {topMatch.title && (
            <div className="profile-role-badge">
              {topMatch.title}
            </div>
          )}

          {/* Contact */}
          {email && (
            <div className="profile-email">
              {email}
            </div>
          )}

          {/* Divider */}
          <div className="profile-divider" />

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-number">{allSkills.length}</div>
              <div className="stat-label">Skills</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{experience.length}</div>
              <div className="stat-label">Roles</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{education.length}</div>
              <div className="stat-label">Degrees</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{certs.length}</div>
              <div className="stat-label">Certs</div>
            </div>
          </div>
        </div>

        {/* Right - Main content grid */}
        <div className="dashboard-main-grid">
          
          {/* Readiness */}
          <div className="dashboard-card readiness-card">
            <div className="card-title">Career Readiness</div>
            <div className="readiness-circle">
              <ProgressRing percent={readiness} />
            </div>
            <div className="readiness-role">
              {skillGap.role || topMatch.title || "Target Role"}
            </div>
            <div className="readiness-desc">
              {skillGap.matched_required?.length || 0} of {skillGap.total_required || 0} required skills
            </div>
          </div>

          {/* Top Match */}
          <div className="dashboard-card top-match-card">
            <div className="card-subtitle">Top Career Match</div>
            <div className="top-match-title">
              {topMatch.title || "—"}
            </div>
            <div className="top-match-stats">
              <div>
                <div className="top-match-number">
                  {topMatch.match_percentage || 0}%
                </div>
                <div className="top-match-label">
                  Match Score
                </div>
              </div>
              <div>
                <div className="top-match-salary">
                  {topMatch.salary_range || "—"}
                </div>
                <div className="top-match-label">
                  Salary Range
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career compatibility */}
      <div className="dashboard-card full-width">
        <div className="card-title">Career Path Compatibility</div>
        <BarChart data={careerData} />
      </div>

      {/* Skills breakdown */}
      <div className="dashboard-card full-width">
        <div className="card-title">Technical Skills</div>
        <div className="skills-breakdown">
          {Object.entries(categorized)
            .filter(([, arr]) => arr.length > 0)
            .map(([key, arr]) => (
              <div key={key} className="skill-category">
                <div className="skill-category-title">
                  {CATEGORY_LABELS[key] || key} ({arr.length})
                </div>
                <div className="skill-tags">
                  {arr.map(skill => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bottom grid - Experience & Education */}
      <div className="dashboard-bottom-grid">
        
        {/* Experience */}
        <div className="dashboard-card">
          <div className="card-title">Experience</div>
          {experience.length === 0 ? (
            <div className="empty-state">
              No experience listed
            </div>
          ) : (
            <div className="timeline">
              {experience.map((exp, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-role">{exp.role}</div>
                  <div className="timeline-company">{exp.company}</div>
                  <div className="timeline-duration">{exp.duration}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="dashboard-card">
          <div className="card-title">Education</div>
          <div className="timeline">
            {education.map((edu, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-role">{edu.degree}</div>
                <div className="timeline-company">{edu.institution}</div>
                {edu.grade && (
                  <div className="timeline-duration">
                    {edu.grade} • {edu.year}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      
    </div>
  );
}