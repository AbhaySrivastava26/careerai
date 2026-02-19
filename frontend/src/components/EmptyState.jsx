import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

export default function EmptyState({ message = "Upload your resume first to see results here." }) {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 400, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: "#EFF6FF", display: "flex",
        alignItems: "center", justifyContent: "center", marginBottom: 20,
      }}>
        <Upload size={32} color="#2563EB" />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 10px" }}>
        No Resume Data Yet
      </h2>
      <p style={{ color: "#64748B", fontSize: 15, maxWidth: 380, margin: "0 0 24px", lineHeight: 1.6 }}>
        {message}
      </p>
      <button
        onClick={() => navigate("/")}
        style={{
          background: "linear-gradient(135deg, #20d930, #1D4ED8)",
          color: "#fff", border: "none", borderRadius: 12,
          padding: "12px 28px", fontWeight: 700, fontSize: 15,
          cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
        }}
      >
        Upload Resume →
      </button>
    </div>
  );
}