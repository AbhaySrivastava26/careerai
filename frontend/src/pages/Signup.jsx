import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8080";

export default function Signup({ setUser }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${API}/auth/register`, {
        name,
        email,
        password,
      });

      // Save token and user
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 72px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.6px",
            marginBottom: 8,
          }}>
            Create Account
          </h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Start your AI-powered career journey
          </p>
        </div>

        {/* Form */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: 32,
        }}>
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 8,
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                // placeholder="John Doe"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 8,
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                // placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#0f172a",
                marginBottom: 8,
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  fontSize: 14,
                  color: "#0f172a",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                fontSize: 13,
                color: "#dc2626",
                marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px",
                background: loading ? "#f1f5f9" : "#0f172a",
                color: loading ? "#94a3b8" : "#ffffff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div style={{
            textAlign: "center",
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0",
          }}>
            <p style={{ fontSize: 13, color: "#64748b" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#2563eb",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}