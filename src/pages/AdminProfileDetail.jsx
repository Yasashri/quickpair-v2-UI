import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";

function extractResource(data) {
  if (!data) return null;
  if (data.data && typeof data.data === "object") return data.data;
  if (data.profile && typeof data.profile === "object") return data.profile;
  if (data.user && typeof data.user === "object") return data.user;
  return data;
}

function AdminProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      let profileData = null;
      let userData = null;

      try {
        const profileResponse = await api.get(`/admin/profiles/${id}`);
        profileData = extractResource(profileResponse.data);
      } catch {
        try {
          const fallbackResponse = await api.get(`/profiles/${id}`);
          profileData = extractResource(fallbackResponse.data);
        } catch {
          profileData = null;
        }
      }

      try {
        const userResponse = await api.get(`/admin/profiles/${id}/user`);
        userData = extractResource(userResponse.data);
      } catch {
        userData = null;
      }

      setProfile(profileData);
      setUser(userData);
      setLoading(false);
    };

    loadProfile();
  }, [id]);

  const handleAction = async (action) => {
    if (action === "reject" && !feedback.trim()) {
      alert("Rejection feedback is required.");
      return;
    }

    if (!confirm(`Are you sure you want to ${action} this user/profile?`)) {
      return;
    }

    setActionLoading(true);

    try {
      if (action === "suspend" || action === "activate") {
        if (!user?.id) {
          alert("User data not loaded yet.");
          setActionLoading(false);
          return;
        }
        await api.post(`/admin/users/${user.id}/${action}`);
        alert(`User ${action}ed successfully.`);
      } else {
        const body = action === "reject" ? { feedback: feedback.trim() } : {};
        await api.post(`/admin/profiles/${id}/${action}`, body);
        alert(`Profile ${action}ed successfully.`);
      }
      navigate("/admin/dashboard");
    } catch (error) {
      alert(
        `Failed to ${action}: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getProfileImage = () => {
    return (
      profile?.profile_image_url ||
      profile?.image_url ||
      (profile?.profile_image_path
        ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}/storage/${
            profile.profile_image_path
          }`
        : null) ||
      `/avatar.jpg`
    );
  };

  return (
    <section className="page-card admin-profile-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Admin review</span>
          <h1>Profile Review</h1>
          <p>Review profile details, approve, reject, or suspend the user.</p>
        </div>

        <button
          className="button button--secondary"
          onClick={() => navigate("/admin/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <p className="admin-status">Loading profile details...</p>
      ) : !profile ? (
        <div className="admin-status">
          <p>Profile not found.</p>

          <button
            className="button"
            onClick={() => navigate("/admin/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      ) : (
        <Card title={`${profile.display_name || profile.email || "Profile"} Details`}>
          <div className="profile-review-container">
            <div className="profile-review-image">
              <img src={getProfileImage()} alt={profile.display_name || "Profile image"} />

              <div className="profile-review-image__content">
                <span
                  className={`status-badge ${
                    profile.status === "rejected"
                      ? "is-rejected"
                      : profile.status === "pending"
                        ? "is-pending"
                        : "is-approved"
                  }`}
                >
                  {profile.status || "Unknown"}
                </span>

                <h2>{profile.display_name || "Profile"}</h2>

                <p>{profile.bio || "No biography available."}</p>
              </div>
            </div>

            <dl className="profile-details">
              {user?.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
              )}

              {profile.display_name && (
                <div>
                  <dt>Display Name</dt>
                  <dd>{profile.display_name}</dd>
                </div>
              )}

              {profile.bio && (
                <div>
                  <dt>Biography</dt>
                  <dd>{profile.bio}</dd>
                </div>
              )}

              {profile.age && (
                <div>
                  <dt>Age</dt>
                  <dd>{profile.age}</dd>
                </div>
              )}

              {(profile.city || profile.country) && (
                <div>
                  <dt>Location</dt>
                  <dd>{[profile.city, profile.country].filter(Boolean).join(", ")}</dd>
                </div>
              )}

              {profile.occupation && (
                <div>
                  <dt>Occupation</dt>
                  <dd>{profile.occupation}</dd>
                </div>
              )}

              {profile.education && (
                <div>
                  <dt>Education</dt>
                  <dd>{profile.education}</dd>
                </div>
              )}

              {profile.relationship_goal && (
                <div>
                  <dt>Relationship Goal</dt>
                  <dd>{profile.relationship_goal}</dd>
                </div>
              )}

              {profile.looking_for && (
                <div>
                  <dt>Looking For</dt>
                  <dd>{profile.looking_for}</dd>
                </div>
              )}

              {profile.gender && (
                <div>
                  <dt>Gender</dt>
                  <dd>{profile.gender}</dd>
                </div>
              )}

              {profile.interests && (
                <div>
                  <dt>Interests</dt>
                  <dd>{profile.interests}</dd>
                </div>
              )}

              {profile.status && (
                <div>
                  <dt>Status</dt>
                  <dd>{profile.status}</dd>
                </div>
              )}

              {profile.created_at && (
                <div>
                  <dt>Created At</dt>
                  <dd>{new Date(profile.created_at).toLocaleString()}</dd>
                </div>
              )}

              <div className="feedback-field">
                <dt>Rejection Feedback</dt>
                <dd>
                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Enter rejection feedback here..."
                    rows={4}
                    className="rejection-feedback"
                  />
                </dd>
              </div>
            </dl>

            <div className="admin-actions-detailed">
              {profile.status === "pending" && (
                <button
                  className="button button--success"
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Approve Profile"}
                </button>
              )}

              <button
                className="button button--secondary"
                onClick={() => handleAction("reject")}
                disabled={actionLoading}
              >
                {actionLoading ? "Processing..." : "Reject Profile"}
              </button>

              {user?.status === "suspended" ? (
                <button
                  className="button button--success"
                  onClick={() => handleAction("activate")}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Reactivate User"}
                </button>
              ) : (
                user?.status && (
                  <button
                    className="button button--danger"
                    onClick={() => handleAction("suspend")}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Suspend User"}
                  </button>
                )
              )}
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

export default AdminProfileDetail;