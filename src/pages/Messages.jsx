import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";

function Messages() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/messages")
      .then((response) => {
        setThreads(response.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getDisplayName = (thread) => {
    return (
      thread.other_user?.profile?.display_name ||
      thread.other_user?.email ||
      "Conversation"
    );
  };

  const getProfileId = (thread) => {
    return thread.other_user?.profile?.id || null;
  };

  const getProfileImage = (thread) => {
    return (
      thread.other_user?.profile?.profile_image_url ||
      `https://i.pravatar.cc/400?img=${(thread.other_user?.id % 70) + 1}`
    );
  };

  return (
    <section className="page-card messages-page">
      <div className="page-header">
        <span className="eyebrow">Your inbox</span>
        <h1>Your conversations</h1>
        <p>
          These are the people you have messaged. Click a person to open their
          profile and continue the conversation.
        </p>
      </div>

      <Card title="Messaged profiles">
        {loading ? (
          <p className="messages-status">Loading conversations...</p>
        ) : (
          <div className="messages-list">
            {threads.length ? (
              threads.map((thread) => {
                const displayName = getDisplayName(thread);
                const profileId = getProfileId(thread);
                const profileImage = getProfileImage(thread);

                return (
                  <Link
                    key={thread.id}
                    to={profileId ? `/profiles/${profileId}#messages` : "#"}
                    className="message-thread"
                  >
                    <img src={profileImage} alt={displayName} />

                    <div className="message-thread__content">
                      <div className="message-thread__top">
                        <strong>{displayName}</strong>

                        {thread.created_at && (
                          <time>
                            {new Date(thread.created_at).toLocaleDateString()}
                          </time>
                        )}
                      </div>

                      <span>
                        {thread.body?.slice(0, 70) || "New conversation"}
                        {thread.body?.length > 70 ? "..." : ""}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="empty-state">No conversations yet.</p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}

export default Messages;