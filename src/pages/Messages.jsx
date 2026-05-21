import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';

function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages').then((response) => {
      setThreads(response.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getOtherUser = (thread) => {
    return user && thread.sender?.id === user.id ? thread.receiver : thread.sender;
  };

  const getProfileId = (other) => {
    return other?.profile?.id || other?.profile_id || other?.user_profile_id || other?.id;
  };

  return (
    <section className="page-card messages-page">
      <div className="page-header">
        <h1>Your conversations</h1>
        <p>Click a profile to open its details and view the conversation below.</p>
      </div>
      <Card title="Messaged profiles">
        {loading ? (
          <p>Loading conversations...</p>
        ) : (
          <div className="messages-list">
            {threads.length ? threads.map((thread) => {
              const other = getOtherUser(thread);
              const profileId = getProfileId(other);
              return (
                <Link
                  key={thread.id}
                  to={profileId ? `/profiles/${profileId}` : '#'}
                  className="message-thread"
                >
                  <strong>{other?.display_name || other?.email || 'Conversation'}</strong>
                  <span>{thread.body?.slice(0, 45) || 'New conversation'}</span>
                </Link>
              );
            }) : <p className="empty-state">No conversations yet.</p>}
          </div>
        )}
      </Card>
    </section>
  );
}

export default Messages;
