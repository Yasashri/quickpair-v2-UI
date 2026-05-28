import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";
import useAuth from "../hooks/useAuth";
import ScrollToTop from "../components/ScrollToTop";
import { formatLastSeen } from "../utils/date";

function ProfileDetail() {
  const { id } = useParams();
  const { user, isAuthenticated, isProfileApproved, hasProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState(null);

  const profileUserId =
    profile?.user?.id ||
    profile?.user_id ||
    profile?.owner_id ||
    profile?.author_id;

  const isOnline = otherUserStatus ? otherUserStatus.is_online : profile?.user?.is_online;
  const lastSeenAt = otherUserStatus ? otherUserStatus.last_seen_at : profile?.user?.last_seen_at;

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

  useEffect(() => {
    let intervalId = null;

    const loadConversation = async (showLoading = true) => {
      if (
        !isAuthenticated ||
        !isProfileApproved ||
        !hasProfile ||
        isOwnProfile ||
        !profileUserId ||
        !isApproved
      ) {
        setConversation([]);
        setOtherUserStatus(null);
        return;
      }

      if (showLoading) {
        setConversationLoading(true);
      }

      try {
        const response = await api.get(`/messages/${profileUserId}`);
        setConversation(response.data.messages || []);
        if (response.data.other_user) {
          setOtherUserStatus(response.data.other_user);
        }
      } catch {
        if (showLoading) {
          setConversation([]);
        }
      } finally {
        if (showLoading) {
          setConversationLoading(false);
        }
      }
    };

    if (profile) {
      loadConversation(true);

      // Refresh conversation and status every 30 seconds
      intervalId = setInterval(() => {
        loadConversation(false);
      }, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    profile,
    profileUserId,
    isAuthenticated,
    isOwnProfile,
    isApproved,
    isProfileApproved,
    hasProfile,
  ]);

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!message.trim() || !profileUserId) {
      return;
    }

    setSending(true);

    try {
      await api.post("/messages", {
        receiver_id: profileUserId,
        body: message.trim(),
      });

      setMessage("");

      const response = await api.get(`/messages/${profileUserId}`);
      setConversation(response.data.messages || []);
      if (response.data.other_user) {
        setOtherUserStatus(response.data.other_user);
      }
    } catch {
      // ignore send error for now
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <section className='page-card profile-page'>
        <p className='profile-status'>Loading profile...</p>
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
      <Card title={profile.display_name || "Profile"}>
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

            <p>{profile.bio || "No biography available."}</p>
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
            <dt>Occupation</dt>
            <dd>{profile.occupation || "Not listed"}</dd>
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
      </Card>
      <div id='messages' className='profile-messages-section'>
        <Card
          title={
            <div className="messages-card-title">
              <span>Messages</span>
              {(isOnline !== undefined || lastSeenAt) && (
                <span className={`chat-status-indicator ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? 'Online' : `Active ${formatLastSeen(lastSeenAt)}`}
                </span>
              )}
            </div>
          }
        >
          {!isApproved ? (
            <p className='message-notice'>
              This profile is not approved yet. Messaging is unavailable.
            </p>
          ) : isOwnProfile ? (
            <p className='message-notice'>
              You cannot message your own profile.
            </p>
          ) : !isAuthenticated ? (
            <p className='message-notice'>
              Please log in to message {profile.display_name}.
            </p>
          ) : !hasProfile ? (
            <p className='message-notice'>Please create your dating profile to message {profile.display_name}.</p>
          ) : !isProfileApproved ? (
            <p className='message-notice'>
              Wait for admin approval to start messaging so ypu can share your thoughts with {profile.display_name}.
            </p>
          ) : (
            <>
              <div className='conversation-window'>
                {conversationLoading ? (
                  <p className='message-notice'>Loading conversation...</p>
                ) : conversation.length ? (
                  conversation.map((messageItem) => (
                    <div
                      key={messageItem.id}
                      className={`message-bubble ${
                        messageItem.sender_id === profileUserId
                          ? "message-bubble--other"
                          : "message-bubble--self"
                      }`}
                    >
                      <p>{messageItem.body}</p>
                      <span>
                        {new Date(messageItem.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className='message-notice'>
                    No messages yet. Start the conversation below.
                  </p>
                )}
              </div>

              <form className='message-form' onSubmit={sendMessage}>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder='Write a message...'
                />

                <button
                  type='submit'
                  className='button'
                  disabled={sending || !message.trim()}
                >
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}

export default ProfileDetail;
