import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Upload.css";

const API = "http://localhost:8080";

const FEATURES = [
  { 
    title: "Mock Interview", 
    desc: "AI-powered technical interviews tailored to your target role with real-time feedback and scoring",
    route: "/interview",
    color: "#3b82f6",
    icon: "interview"
  },
  { 
    title: "Learning Roadmap", 
    desc: "Personalized 12-week development plan with curated resources and visual timeline",
    route: "/roadmap",
    color: "#06b6d4",
    icon: "roadmap"
  },
  { 
    title: "Live Opportunities", 
    desc: "Real-time job listings from leading companies matched to your profile",
    route: "/jobs",
    color: "#10b981",
    icon: "jobs"
  },
  { 
    title: "Skill Analytics", 
    desc: "Comprehensive breakdown of technical and professional competencies",
    route: "/skillgap",
    color: "#f59e0b",
    icon: "skills"
  },
];

const ANALYSIS_STEPS = [
  "Parsing resume",
  "Extracting skills",
  "Analyzing experience",
  "Matching careers",
  "Building roadmap",
  "Generating insights",
];

// SVG Icons Component
function IconComponent({ type }) {
  const iconProps = { width: 48, height: 48, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5" };
  
  switch(type) {
    case "interview":
      return (
        <svg {...iconProps}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "roadmap":
      return (
        <svg {...iconProps}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "jobs":
      return (
        <svg {...iconProps}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 3v4" />
          <path d="M8 3v4" />
          <path d="M2 11h20" />
        </svg>
      );
    case "skills":
      return (
        <svg {...iconProps}>
          <path d="M6 9l6 6 12-12" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Upload({ setResumeData }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(ext)) {
      setError("Only PDF and DOCX files are supported");
      return;
    }
    setError("");
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setProgress(0);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < ANALYSIS_STEPS.length - 1 ? prev + 1 : prev));
    }, 1200);

    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 4, 95));
    }, 300);

    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axios.post(`${API}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setProgress(100);
      setCurrentStep(ANALYSIS_STEPS.length - 1);
      setResumeData({ ...data.data, resume_id: data.resume_id });
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      setError(err.response?.data?.detail || "Upload failed. Ensure API is running on port 8080.");
      setLoading(false);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  return (
    <div className="upload-wrapper">
      
      {/* Hero section */}
      <div className="upload-hero">
        <h1 className="upload-title">
          AI-Powered Career<br/>Intelligence Platform
        </h1>
        <p className="upload-subtitle">
          Upload your resume to receive comprehensive career analysis,
          personalized learning pathways, and targeted opportunities.
        </p>
      </div>

      {/* Upload area */}
      <div className="upload-container">
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => !loading && document.getElementById("fileInput").click()}
          className={`upload-box ${dragging ? "dragging" : ""} ${file ? "has-file" : ""} ${loading ? "loading" : ""}`}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf,.docx"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {loading ? (
            <div className="upload-loading">
              {/* Animated background elements */}
              <div className="loading-bg-element element-1"></div>
              <div className="loading-bg-element element-2"></div>
              <div className="loading-bg-element element-3"></div>

              {/* Main loading content */}
              <div className="loading-content">
                <div className="loading-spinner"></div>
                
                <div className="loading-text">
                  <h3 className="loading-title">Analyzing Your Resume</h3>
                  <p className="loading-subtitle">
                    {ANALYSIS_STEPS[currentStep]}...
                  </p>
                </div>

                {/* Progress bar */}
                <div className="progress-container">
                  <div className="progress-bar-wrapper">
                    <div className="progress-bar" style={{ width: `${progress}%` }}>
                      <div className="progress-shimmer"></div>
                    </div>
                  </div>
                  <div className="progress-text">{progress}%</div>
                </div>

                {/* Step indicators */}
                <div className="step-indicators">
                  {ANALYSIS_STEPS.map((step, idx) => (
                    <div
                      key={step}
                      className={`step-indicator ${idx <= currentStep ? "active" : ""}`}
                      style={{
                        transitionDelay: `${idx * 0.1}s`
                      }}
                    >
                      <div className="step-dot"></div>
                      <span className="step-label">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : file ? (
            <div className="upload-file-info">
              <div className="file-icon-wrapper">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{(file.size / 1024).toFixed(1)} KB • Click to change</div>
              </div>
            </div>
          ) : (
            <div className="upload-empty">
              <div className="upload-icon-wrapper">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div className="upload-text">
                <div className="upload-label">Drop resume file here</div>
                <div className="upload-hint">or click to browse • PDF, DOCX supported</div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="upload-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={upload}
          disabled={!file || loading}
          className="upload-button"
        >
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Analyzing...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </div>

      {/* Features grid */}
      <div className="features-section">
        <h2 className="features-title">Platform Features</h2>
        <div className="features-grid">
          {FEATURES.map(({ title, desc, route, color, icon }) => (
            <div
              key={title}
              className="feature-card"
              onClick={() => navigate(route)}
              style={{ borderTopColor: color }}
            >
              <div className="feature-icon-wrapper" style={{ background: `${color}15` }}>
                <div className="feature-icon" style={{ color }}>
                  <IconComponent type={icon} />
                </div>
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
              <div className="feature-link">
                Explore →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}