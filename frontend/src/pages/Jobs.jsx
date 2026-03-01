import { useState } from "react";
import { Briefcase, MapPin, Clock, ExternalLink, Building2, Search } from "lucide-react";
import axios from "axios";
import EmptyState from "../components/EmptyState";

const API = "http://localhost:8080";

export default function Jobs({ data }) {
  const [extra,   setExtra]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState("");

  if (!data) return <EmptyState message="Upload your resume to see live job listings matched to your skills." />;

  const jobs    = data.jobs || [];
  const allJobs = [...jobs, ...extra];

  const filtered = allJobs.filter(j =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  const fetchMore = async (role) => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`${API}/jobs`, {
        params: { role, location: "India", limit: 6 },
      });
      setExtra(prev => [...prev, ...(res.jobs || [])]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        {/* <p style={{ color: "#2563EB", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Step 4 of 4</p> */}
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#2563EB", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
          Live Job Listings
        </h1>
        <p style={{ color: "#64748B", fontSize: 16, margin: 0 }}>
          Real jobs matching your top career paths — updated daily.
        </p>
      </div>

      {/* Search + role filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={15} color="#94A3B8" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs or companies..."
            style={{
              width: "100%", padding: "10px 12px 10px 38px",
              border: "1px solid #E2E8F0", borderRadius: 10,
              fontSize: 14, color: "#0F172A", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        {(data.career_matches || []).slice(0, 3).map(m => (
          <button key={m.title} onClick={() => fetchMore(m.title)} style={{
            padding: "10px 16px", border: "1px solid #E2E8F0", borderRadius: 10,
            background: "#fff", fontSize: 13, fontWeight: 500, color: "#64748B",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {m.icon} {m.title.split(" ")[0]} Jobs
          </button>
        ))}
      </div>

      <p style={{ color: "#94A3B8", fontSize: 14, marginBottom: 16 }}>
        Showing {filtered.length} job{filtered.length !== 1 ? "s" : ""}
        {search && ` for "${search}"`}
      </p>

      {filtered.length === 0 ? (
        <div style={{ background: "#F8FAFC", border: "2px dashed #E2E8F0", borderRadius: 16, padding: "60px", textAlign: "center" }}>
          <Briefcase size={40} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <p style={{ color: "#94A3B8", fontSize: 16, margin: 0 }}>
            No jobs found. Try clicking a role button above.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {filtered.map((job, i) => (
            <div key={i} style={{
              background: "#fff", border: "1px solid #E2E8F0",
              borderRadius: 16, padding: "22px",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, paddingRight: 12 }}>
                  <h3 style={{ fontWeight: 700, color: "#0F172A", margin: "0 0 4px", fontSize: 15, lineHeight: 1.3 }}>
                    {job.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Building2 size={12} color="#94A3B8" />
                    <span style={{ fontSize: 13, color: "#64748B" }}>{job.company}</span>
                  </div>
                </div>
                {job.company_logo && (
                  <img src={job.company_logo} alt={job.company}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain", border: "1px solid #F1F5F9" }}
                    onError={e => e.target.style.display = "none"}
                  />
                )}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, background: "#EFF6FF", color: "#2563EB", borderRadius: 20, padding: "3px 10px", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={10} /> {job.location}
                </span>
                <span style={{ fontSize: 12, background: "#F0FDF4", color: "#16A34A", borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>
                  {job.type}
                </span>
                {job.salary !== "Not disclosed" && (
                  <span style={{ fontSize: 12, background: "#FFFBEB", color: "#92400E", borderRadius: 20, padding: "3px 10px", fontWeight: 500 }}>
                    💰 {job.salary}
                  </span>
                )}
                <span style={{ fontSize: 12, background: "#F8FAFC", color: "#94A3B8", borderRadius: 20, padding: "3px 10px", display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock size={10} /> {job.posted}
                </span>
              </div>

              {job.description && (
                <p style={{
                  fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5,
                  display: "-webkit-box", WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>{job.description}</p>
              )}

              {job.matched_role && (
                <span style={{ fontSize: 12, color: "#7C3AED", fontWeight: 500 }}>
                  Matched for: {job.matched_role}
                </span>
              )}

              <a href={job.apply_link} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                background: "#0F172A", color: "#fff", borderRadius: 10,
                padding: "10px 16px", fontWeight: 600, fontSize: 13,
                textDecoration: "none", marginTop: "auto",
              }}>
                Apply Now <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: 32, color: "#2563EB", fontWeight: 600 }}>
          Fetching more jobs...
        </div>
      )}
    </div>
  );
}