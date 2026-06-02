import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";
import { formatLastSeen } from "../utils/date";

function ProfileDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isProfileApproved, hasProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const profileUserId =
    profile?.user?.id ||
    profile?.user_id ||
    profile?.owner_id ||
    profile?.author_id;

  const isOnline = profile?.user?.is_online;
  const lastSeenAt = profile?.user?.last_seen_at;

  const isOwnProfile = Boolean(
    user?.id && profileUserId && user.id === profileUserId,
  );
  const isApproved =
    profile?.status === "approved" || profile?.approved === true;

  const profileImage =
    profile?.profile_image_url || profile?.profile_image || `/avatar.jpg`;

  useEffect(() => {
    setLoading(true);

    api
      .get(`/profiles/${id}`)
      .then((response) => {
        setProfile(response.data.profile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <section className='page-card profile-page skeleton-profile-detail'>
        <ScrollToTop />
        <div className="profile-detail-section">
          <div className='profile-hero'>
            <div className="skeleton skeleton-detail-image"></div>

            <div className='profile-hero__content'>
              <div className="profile-online-container">
                <div className="skeleton skeleton-detail-badge"></div>
              </div>

              <div className="skeleton skeleton-detail-name"></div>
              <div className="skeleton skeleton-detail-btn"></div>
            </div>
          </div>

          <dl className='profile-details'>
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <dt><div className="skeleton" style={{ height: "14px", width: "40px" }}></div></dt>
                <dd><div className="skeleton" style={{ height: "16px", width: "80px", marginTop: "4px" }}></div></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className='page-card profile-page'>
        <p className='profile-status'>Profile not found.</p>
      </section>
    );
  }

  return (
    <section className='page-card profile-page'>
      <ScrollToTop />
      <div className="profile-detail-section">
        <div className='profile-hero'>
          <img
            src={profileImage}
            alt={profile.display_name || "Profile image"}
          />

          <div className='profile-hero__content'>
            <div className="profile-online-container">
              <span
                className={`profile-badge ${isApproved ? "is-approved" : ""}`}
              >
                {isApproved ? "Approved profile" : profile.status || "Pending"}
              </span>

              {(isOnline !== undefined || lastSeenAt) && (
                <span className={`status-indicator-badge ${isOnline ? 'status-indicator-badge--online' : 'status-indicator-badge--offline'}`}>
                  {isOnline && <span className="status-badge-dot" />}
                  {isOnline ? 'Online' : `Last seen: ${formatLastSeen(lastSeenAt)}`}
                </span>
              )}

              {profile.user?.email_verified_at && (
                <span className="status-indicator-badge email-verified-badge" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.08)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                  <span style={{ marginRight: "4px" }}>✓</span> Email Verified
                </span>
              )}
            </div>

            <h2>{profile.display_name || "New member"}</h2>

            {/* Direct Message Action */}
            {!isOwnProfile && (
              <div style={{ marginTop: "24px" }}>
                {isApproved && isAuthenticated && hasProfile && isProfileApproved ? (
                  <Link 
                    to={`/messages?userId=${profileUserId}`} 
                    className="button"
                    style={{ textDecoration: "none", display: "inline-flex", gap: "8px" }}
                  >
                    💬 Message {profile.display_name}
                  </Link>
                ) : (
                  <p className="message-notice" style={{ margin: 0, padding: "10px 14px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)", fontSize: "0.85rem", color: "#b3aecf", display: "inline-block" }}>
                    {!isApproved ? (
                      `This profile is not approved yet. Messaging is unavailable.`
                    ) : !isAuthenticated ? (
                      <span>Please <Link to="/login" style={{ color: "#38bdf8", fontWeight: "700" }}>login</Link> to message {profile.display_name}.</span>
                    ) : !hasProfile ? (
                      <span>Please <Link to="/me" style={{ color: "#38bdf8", fontWeight: "700" }}>create your dating profile</Link> to message {profile.display_name}.</span>
                    ) : !isProfileApproved ? (
                      `Wait for admin approval of your profile to start messaging ${profile.display_name}.`
                    ) : null}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <dl className='profile-details'>
          <div>
            <dt>Age</dt>
            <dd>{profile.age || "—"}</dd>
          </div>

          <div>
            <dt>Location</dt>
            <dd>
              {profile.city
                ? `${profile.city}, ${profile.country}`
                : "Not listed"}
            </dd>
          </div>



          <div>
            <dt>Goal</dt>
            <dd>{profile.relationship_goal || "Looking for connection"}</dd>
          </div>

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
        </dl>
      </div>
    </section>
  );
}

export default ProfileDetail;
