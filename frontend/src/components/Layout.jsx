import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

const NAV_ITEMS = [
  { to: "/",               label: "Upload"      },
  { to: "/dashboard",      label: "Dashboard"   },
  { to: "/careers",        label: "Careers"     },
  { to: "/skillgap",       label: "Skill Gap"   },
  { to: "/roadmap",        label: "Roadmap"     },
  { to: "/jobs",           label: "Jobs"        },
  { to: "/interview",      label: "Interview"   },
  { to: "/custom-roadmap", label: "Generate"    },
];

export default function Layout({ user, onLogout, resumeData }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-primary)",
      fontFamily: "'Outfit', sans-serif",
    }}>
      
      {/* Navbar */}
      <nav style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backdropFilter: "blur(8px)",
      }}>
        <div style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}>
          
          {/* Left: Logo */}
          <NavLink to="/" style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
              letterSpacing: "-0.5px",
            }}>
              CA
            </div>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}>
              CareerAI
            </span>
          </NavLink>

          {/* Right: Nav + User */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}>
            
            {/* Navigation links */}
            {user && (
              <div style={{ display: "flex", gap: 4 }}>
                {NAV_ITEMS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    style={({ isActive }) => ({
                      padding: "8px 16px",
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                      textDecoration: "none",
                      borderRadius: 6,
                      transition: "all 0.15s",
                      background: isActive ? "var(--bg-tertiary)" : "transparent",
                    })}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* User menu or Login button */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                
                {/* THEME TOGGLE BUTTON */}
                <button
                  onClick={toggleTheme}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 6,
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    // Moon icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  ) : (
                    // Sun icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  )}
                </button>
                
                {/* Resume loaded badge */}
                {resumeData && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--success)",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Resume Loaded
                  </div>
                )}
                
                {/* User menu */}
                <div style={{ position: "relative" }} ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 12px 6px 6px",
                      background: "var(--bg-tertiary)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-tertiary)"}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#ffffff",
                    }}>
                      {getInitials(user.name)}
                    </div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}>
                      {user.name.split(" ")[0]}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {showMenu && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      width: 200,
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-primary)",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px var(--shadow)",
                      overflow: "hidden",
                      zIndex: 1001,
                    }}>
                      <div style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border-primary)",
                      }}>
                        <div style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}>
                          {user.name}
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}>
                          {user.email}
                        </div>
                      </div>
                      
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          background: "transparent",
                          border: "none",
                          textAlign: "left",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#dc2626",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <NavLink
                  to="/login"
                  style={{
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    borderRadius: 6,
                    transition: "all 0.15s",
                  }}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  style={{
                    padding: "8px 16px",
                    background: "var(--accent-primary)",
                    color: "#ffffff",
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: "none",
                    borderRadius: 6,
                    transition: "all 0.15s",
                  }}
                >
                  Sign Up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "48px 32px 80px",
      }}>
        <Outlet />
      </main>
    </div>
  );
}