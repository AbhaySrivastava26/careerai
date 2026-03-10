import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import CareerMatches from "./pages/CareerMatches";
import SkillGap from "./pages/SkillGap";
import Roadmap from "./pages/Roadmap";
import Jobs from "./pages/Jobs";
import CustomRoadmap from "./pages/CustomRoadmap";
import Interview from "./pages/Interview";
import CompanyPrep from "./pages/CompanyPrep";

const API = "http://localhost:8080";

export default function App() {
  const [user, setUser] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResumeLoadedNotif, setShowResumeLoadedNotif] = useState(false);

  // Load user's most recent resume
  const loadMostRecentResume = async () => {
    try {
      const { data } = await axios.get(`${API}/auth/my-resumes`);
      
      if (data.resumes && data.resumes.length > 0) {
        // Get the most recent resume (first in array)
        const latestResumeId = data.resumes[0].id;
        
        // Fetch full resume data
        const response = await axios.get(`${API}/resume/${latestResumeId}`);
        const fullData = response.data.data; // API returns { success: true, data: {...} }
        setResumeData(fullData);
        
        // Show notification
        setShowResumeLoadedNotif(true);
        setTimeout(() => setShowResumeLoadedNotif(false), 4000);
        
        console.log(" Loaded previous resume data");
      }
    } catch (error) {
      console.log("No previous resume found or error loading:", error.message);
    }
  };

  // Check for saved token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        // Set default auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Load user's most recent resume
        loadMostRecentResume();
      } catch (e) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    
    setLoading(false);
  }, []);

  // Update axios defaults when user changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // When user logs in, load their resume
  const handleSetUser = async (userData) => {
    setUser(userData);
    
    // Try to load their most recent resume
    setTimeout(() => {
      loadMostRecentResume();
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setResumeData(null);
  };

  // When new resume is uploaded, save it
  const handleSetResumeData = (data) => {
    setResumeData(data);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div>
          <div style={{
            width: 48,
            height: 48,
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #0f172a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }} />
          <div style={{ fontSize: 14, color: "#64748b" }}>Loading...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
      {/* Resume loaded notification */}
      {showResumeLoadedNotif && (
        <div style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          background: "#0f172a",
          color: "#ffffff",
          padding: "14px 20px",
          borderRadius: 8,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "slideIn 0.3s ease",
          fontFamily: "'Outfit', sans-serif",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Welcome back!</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Your resume data has been loaded</div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <LoginWrapper setUser={handleSetUser} />
        } />
        <Route path="/signup" element={
          user ? <Navigate to="/" /> : <SignupWrapper setUser={handleSetUser} />
        } />

        {/* Main routes */}
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} resumeData={resumeData} />}>
          {/* <Route index element={<Upload setResumeData={handleSetResumeData} />} /> */}
          <Route index element={<Navigate to="/upload" />} />
          <Route path="upload" element={<Upload setResumeData={handleSetResumeData} />} />
          <Route path="dashboard" element={<Dashboard data={resumeData} />} />
          {/* <Route path="careers" element={<CareerMatches data={resumeData} />} /> */}
          <Route path="skillgap" element={<SkillGap data={resumeData} />} />
          <Route path="roadmap" element={<Roadmap data={resumeData} />} />
          <Route path="jobs" element={<Jobs data={resumeData} />} />
          <Route path="interview" element={<Interview data={resumeData} />} />
          <Route path="custom-roadmap" element={<CustomRoadmap />} />
          <Route path="company-prep" element={<CompanyPrep />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

// Wrappers to avoid passing through Layout
function LoginWrapper({ setUser }) {
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Login setUser={setUser} />
    </div>
  );
}

function SignupWrapper({ setUser }) {
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Signup setUser={setUser} />
    </div>
  );
}