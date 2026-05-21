import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/Card';
import useAuth from '../hooks/useAuth';

function ProfileDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);

  const profileUserId = profile?.user?.id || profile?.user_id || profile?.owner_id || profile?.author_id;
  const isOwnProfile = Boolean(user?.id && profileUserId && user.id === profileUserId);
  const isApproved = profile?.status === 'approved' || profile?.approved === true;

  useEffect(() => {
    setLoading(true);
    api.get(`/profiles/${id}`).then((response) => {
      setProfile(response.data.profile);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!isAuthenticated || isOwnProfile || !profileUserId || !isApproved) {
        setConversation([]);
        return;
      }
      setConversationLoading(true);
      try {
        const response = await api.get(`/messages/${profileUserId}`);
        setConversation(response.data.messages || []);
      } catch {
        setConversation([]);
      } finally {
        setConversationLoading(false);
      }
    };

    if (profile) {
      loadConversation();
    }
  }, [profile, profileUserId, isAuthenticated, isOwnProfile, isApproved]);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim() || !profileUserId) return;
    setSending(true);
    try {
      await api.post('/messages', { receiver_id: profileUserId, body: message.trim() });
      setMessage('');
      const response = await api.get(`/messages/${profileUserId}`);
      setConversation(response.data.messages || []);
    } catch {
      // ignore send error for now
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <section className="page-card"><p>Loading profile...</p></section>;
  }

  if (!profile) {
    return <section className="page-card"><p>Profile not found.</p></section>;
  }

  return (
    <section className="page-card profile-page">
      <Card title={profile.display_name || 'Profile'}>
        <p>{profile.bio || 'No biography available.'}</p>
        <dl className="profile-details">
          <div>
            <dt>Age</dt>
            <dd>{profile.age || '—'}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{profile.city ? `${profile.city}, ${profile.country}` : 'Not listed'}</dd>
          </div>
          <div>
            <dt>Occupation</dt>
            <dd>{profile.occupation || 'Not listed'}</dd>
          </div>
          <div>
            <dt>Goal</dt>
            <dd>{profile.relationship_goal || 'Looking for connection'}</dd>
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

      <Card title="Messages">
        {!isApproved ? (
          <p>This profile is not approved yet. Messaging is unavailable.</p>
        ) : isOwnProfile ? (
          <p>You cannot message your own profile.</p>
        ) : !isAuthenticated ? (
          <p>Please log in to message this user.</p>
        ) : (
          <>
            <div className="conversation-window">
              {conversationLoading ? (
                <p>Loading conversation...</p>
              ) : conversation.length ? (
                conversation.map((messageItem) => (
                  <div
                    key={messageItem.id}
                    className={`message-bubble ${messageItem.sender_id === profileUserId ? 'message-bubble--other' : 'message-bubble--self'}`}
                  >
                    <p>{messageItem.body}</p>
                    <span>{new Date(messageItem.created_at).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p>No messages yet. Start the conversation below.</p>
              )}
            </div>
            <form className="message-form" onSubmit={sendMessage}>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a message..."
              />
              <button type="submit" className="button" disabled={sending || !message.trim()}>
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </Card>
    </section>
  );
}

export default ProfileDetail;
