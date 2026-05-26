import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import Card from "../components/Card";
import StatusMessage from "../components/StatusMessage";
import ScrollToTop from "../components/ScrollToTop";

function Messages() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setStatusError(null);

    api
      .get("/messages")
      .then((response) => {
        setThreads(response.data.data || []);
      })
      .catch((error) => {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 401) {
          setStatusError({
            type: "error",
            title: "Login required",
            message: "Please log in to view your conversations.",
            buttonText: "Go to login",
            action: () => navigate("/login"),
          });
          return;
        }

        if (status === 403) {
          setStatusError({
            type: "error",
            title: "Profile approval required",
            message:
              
              "You need a complete and approved profile to use this feature. If you have completed your profile please wait for our admins to approve you",
            buttonText: "Go to your profile",
            action: () => navigate("/me"),
          });
          return;
        }

        setStatusError({
          type: "error",
          title: "Could not load messages",
          message: message || "Something went wrong. Please try again later.",
          buttonText: "Try again",
          action: () => window.location.reload(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

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
    <section className='page-card messages-page'>
      <ScrollToTop />
      <div className='page-header'>
        <span className='eyebrow'>Your inbox</span>
        <h1>Your conversations</h1>
        <p>
          These are the people you have messaged. Click a person to open their
          profile and continue the conversation.
        </p>
      </div>

      <Card title='Messaged profiles'>
        {loading ? (
          <p className='messages-status'>Loading conversations...</p>
        ) : statusError ? (
          <StatusMessage
            type={statusError.type}
            title={statusError.title}
            message={statusError.message}
            buttonText={statusError.buttonText}
            onButtonClick={statusError.action}
          />
        ) : (
          <div className='messages-list'>
            {threads.length ? (
              threads.map((thread) => {
                const displayName = getDisplayName(thread);
                const profileId = getProfileId(thread);
                const profileImage = getProfileImage(thread);

                return (
                  <Link
                    key={thread.id}
                    to={profileId ? `/profiles/${profileId}#messages` : "#"}
                    className='message-thread'
                  >
                    <img src={profileImage} alt={displayName} />

                    <div className='message-thread__content'>
                      <div className='message-thread__top'>
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
              <p className='empty-state'>No conversations yet.</p>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}

export default Messages;
