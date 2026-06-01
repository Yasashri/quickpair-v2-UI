import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import ScrollToTop from "../components/ScrollToTop";

function AdminUserComplianceReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [policies, setPolicies] = useState({ terms: "", privacy: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [userRes, termsRes, privacyRes] = await Promise.all([
          api.get(`/admin/users/${id}`),
          api.get("/policies/terms"),
          api.get("/policies/privacy"),
        ]);
        setUser(userRes.data);
        setPolicies({
          terms: termsRes.data.content,
          privacy: privacyRes.data.content,
        });
      } catch (err) {
        setError("Failed to load user or compliance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!loading && user && policies.terms && policies.privacy) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, user, policies]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "medium",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#e5e7eb" }}>
        Loading compliance data...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>
        {error || "User not found."}
      </div>
    );
  }

  const profile = user.dating_profile || {};

  return (
    <section 
      className="compliance-report" 
      style={{ 
        background: "#ffffff", 
        color: "#1f2937", 
        minHeight: "100vh", 
        padding: "40px 24px",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      <ScrollToTop />
      
      <style>{`
        @media print {
          body, .app-shell, .page-container, .compliance-report {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .compliance-report {
            padding: 0 !important;
          }
          .policy-doc-box {
            border: 1px solid #ccc !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>

      <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Print controls */}
        <div 
          className="no-print" 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "32px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "16px"
          }}
        >
          <button 
            type="button" 
            className="button button--ghost" 
            onClick={() => navigate("/admin/dashboard")}
            style={{ color: "#374151", borderColor: "#d1d5db" }}
          >
            &larr; Back to Admin Dashboard
          </button>
          <button 
            type="button" 
            className="button" 
            onClick={() => window.print()}
            style={{ background: "#2563eb", color: "#ffffff" }}
          >
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* Audit Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img src="/qplogo_no_text.png" alt="Logo" style={{ width: "48px", height: "48px", filter: "grayscale(100%)", marginBottom: "12px" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#111827", margin: "0 0 8px" }}>Legal Compliance & Audit Report</h1>
          <p style={{ color: "#6b7280", margin: 0, fontSize: "0.9rem" }}>QuickPair.ca Verification Audit Log</p>
          <p style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "4px" }}>Generated on: {formatDate(new Date())}</p>
        </div>

        {/* User Details */}
        <div style={{ marginBottom: "32px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", background: "#f9fafb" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: "0 0 16px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>User Information</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280", fontWeight: "600", width: "180px" }}>User Account ID:</td>
                <td style={{ padding: "6px 0", color: "#111827" }}>{user.id}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280", fontWeight: "600" }}>Email Address:</td>
                <td style={{ padding: "6px 0", color: "#111827" }}>{user.email}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280", fontWeight: "600" }}>Full Name (Profile):</td>
                <td style={{ padding: "6px 0", color: "#111827" }}>{profile.display_name || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280", fontWeight: "600" }}>Account Created:</td>
                <td style={{ padding: "6px 0", color: "#111827" }}>{formatDate(user.created_at)}</td>
              </tr>
              <tr>
                <td style={{ padding: "6px 0", color: "#6b7280", fontWeight: "600" }}>Account Status:</td>
                <td style={{ padding: "6px 0", color: "#111827" }}>{user.status || "active"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Policy Consent Audit Trail */}
        <div style={{ marginBottom: "40px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", background: "#f9fafb" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: "0 0 16px", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px" }}>Policy Acceptance Logs</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <tbody>
              <tr>
                <td style={{ padding: "8px 0", color: "#6b7280", fontWeight: "600", width: "180px" }}>Terms of Service:</td>
                <td style={{ padding: "8px 0" }}>
                  {user.terms_accepted_at ? (
                    <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Accepted on {formatDate(user.terms_accepted_at)}</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontWeight: "600" }}>✗ Not Accepted</span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#6b7280", fontWeight: "600" }}>Privacy Policy:</td>
                <td style={{ padding: "8px 0" }}>
                  {user.privacy_accepted_at ? (
                    <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Accepted on {formatDate(user.privacy_accepted_at)}</span>
                  ) : (
                    <span style={{ color: "#ef4444", fontWeight: "600" }}>✗ Not Accepted</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Accepted Document Content Snapshots */}
        <div style={{ pageBreakBefore: "always", marginTop: "40px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", marginBottom: "20px", borderBottom: "2px solid #111827", paddingBottom: "6px" }}>Agreement Document Exhibits</h2>
          
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#374151", margin: "24px 0 12px" }}>Exhibit A: Terms of Service</h3>
          <div 
            className="policy-doc-box" 
            style={{ 
              border: "1px solid #e5e7eb", 
              borderRadius: "8px", 
              padding: "16px", 
              fontSize: "0.8rem", 
              maxHeight: "350px", 
              overflowY: "auto",
              background: "#fafafa" 
            }}
            dangerouslySetInnerHTML={{ __html: policies.terms }}
          />

          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#374151", margin: "32px 0 12px" }}>Exhibit B: Privacy Policy</h3>
          <div 
            className="policy-doc-box" 
            style={{ 
              border: "1px solid #e5e7eb", 
              borderRadius: "8px", 
              padding: "16px", 
              fontSize: "0.8rem", 
              maxHeight: "350px", 
              overflowY: "auto",
              background: "#fafafa" 
            }}
            dangerouslySetInnerHTML={{ __html: policies.privacy }}
          />
        </div>

        {/* Signoff */}
        <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: "1px dashed #d1d5db", display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0 0 32px" }}>Auditor Verification Signature</p>
            <div style={{ borderBottom: "1px solid #4b5563", width: "200px" }}></div>
            <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "4px" }}>Authorized QuickPair Administrator</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0 0 32px" }}>Audit Seal / Stamp</p>
            <div style={{ border: "1px solid #d1d5db", width: "120px", height: "60px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#9ca3af", borderRadius: "4px" }}>
              COMPLIANCE AUDIT
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminUserComplianceReport;
