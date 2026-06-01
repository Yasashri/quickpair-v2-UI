import { useEffect, useState } from "react";
import api from "../api/api";

function AdminPolicyEditor() {
  const [activeTab, setActiveTab] = useState("terms"); // "terms" or "privacy"
  const [policies, setPolicies] = useState({ terms: "", privacy: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPolicies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/policies");
      setPolicies({
        terms: res.data.terms?.content || "",
        privacy: res.data.privacy?.content || "",
      });
    } catch (err) {
      setError("Failed to load policies from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await api.put(`/admin/policies/${activeTab}`, {
        content: policies[activeTab],
      });
      setMessage(res.data.message || "Policy updated successfully!");
      setPolicies((prev) => ({
        ...prev,
        [activeTab]: res.data.policy.content,
      }));
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: "rgba(255, 255, 255, 0.6)", padding: "20px" }}>Loading policy documents...</p>;
  }

  return (
    <div className="policy-editor">
      <div className="policy-editor__header" style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          type="button"
          className={`button button--small ${activeTab === "terms" ? "active" : "button--ghost"}`}
          onClick={() => {
            setActiveTab("terms");
            setMessage("");
            setError("");
          }}
        >
          Terms of Service
        </button>
        <button
          type="button"
          className={`button button--small ${activeTab === "privacy" ? "active" : "button--ghost"}`}
          onClick={() => {
            setActiveTab("privacy");
            setMessage("");
            setError("");
          }}
        >
          Privacy Policy
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: "16px" }}>{error}</p>}
      {message && <p className="form-success" style={{ marginBottom: "16px", color: "#10b981", fontWeight: "600" }}>{message}</p>}

      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
            Edit HTML Content ({activeTab === "terms" ? "Terms of Service" : "Privacy Policy"})
          </label>
          <textarea
            value={policies[activeTab]}
            onChange={(e) =>
              setPolicies((prev) => ({
                ...prev,
                [activeTab]: e.target.value,
              }))
            }
            rows={20}
            style={{
              width: "100%",
              background: "#080e1a",
              color: "#e5e7eb",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "14px",
              padding: "16px",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              lineHeight: "1.5",
              resize: "vertical",
            }}
            required
            disabled={saving}
          />
        </div>

        <button
          type="submit"
          className="button"
          style={{ marginTop: "16px" }}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="button-spinner"></span>
              Saving Changes...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}

export default AdminPolicyEditor;
