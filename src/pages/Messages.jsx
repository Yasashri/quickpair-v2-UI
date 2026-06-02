
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/api";
import StatusMessage from "../components/StatusMessage";
import ScrollToTop from "../components/ScrollToTop";
import { formatLastSeen } from "../utils/date";
import ConversationView from "../components/ConversationView";

function Messages() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [searchParams] = useSearchParams();
  const userIdParam = searchParams.get("userId");

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setStatusError(null);

    api
      .get("/messages")
      .then((response) => {
        const threadList = response.data.data || [];
        setThreads(threadList);

        if (userIdParam) {
          const targetId = parseInt(userIdParam, 10);
          const existing = threadList.find((t) => t.other_user?.id === targetId);
          if (existing) {
            setSelectedThread(existing);
          } else {
            api
              .get(`/messages/${targetId}`)
              .then((res) => {
                const mockThread = {
                  id: "new-" + targetId,
                  other_user: res.data.other_user,
                  body: "",
                  created_at: null,
                };
                setSelectedThread(mockThread);
              })
              .catch(() => {});
          }
        }
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
  }, [navigate, userIdParam]);

  useEffect(() => {
    if (selectedThread) {
      document.body.classList.add("has-active-conversation");
    } else {
      document.body.classList.remove("has-active-conversation");
    }
    return () => {
      document.body.classList.remove("has-active-conversation");
    };
  }, [selectedThread]);

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
      `/avatar.jpg`
    );
  };

  return (
    <section className='page-card messages-page'>
      <ScrollToTop />
      {!selectedThread && (
        <div className='page-header'>
          <span className='eyebrow'>Your inbox</span>
          <h1>Your conversations</h1>
          <p>
            These are the people you have messaged. Click a person to open their
            profile and continue the conversation.
          </p>
        </div>
      )}

      {selectedThread ? (
        <ConversationView thread={selectedThread} onClose={() => setSelectedThread(null)} />
      ) : (
        <div className='messages-section'>
          <h2 className='messages-section-title'>Messaged profiles</h2>
          {loading ? (
            <div className='messages-list'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="message-thread" style={{ pointerEvents: "none", opacity: 0.7 }}>
                  <div className='message-thread__avatar-container'>
                    <div className="skeleton" style={{ width: "64px", height: "64px", borderRadius: "18px" }}></div>
                  </div>
                  <div className='message-thread__content'>
                    <div className='message-thread__top' style={{ display: "flex", justifyContent: "between", width: "100%", gap: "10px" }}>
                      <div className="skeleton" style={{ width: "120px", height: "18px" }}></div>
                      <div className="skeleton" style={{ width: "60px", height: "14px", marginLeft: "auto" }}></div>
                    </div>
                    <div className="skeleton" style={{ width: "70%", height: "16px", marginTop: "6px" }}></div>
                  </div>
                </div>
              ))}
            </div>
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
                  const profileImage = getProfileImage(thread);
                  const isActive = selectedThread && selectedThread.id === thread.id;
                  return (
                    <div
                      key={thread.id}
                      className={`message-thread${isActive ? ' active' : ''}`}
                      onClick={() => setSelectedThread(thread)}
                      role='button'
                      tabIndex={0}
                    >
                      <div className='message-thread__avatar-container'>
                        <img src={profileImage} alt={displayName} />
                        {thread.other_user?.is_online && (
                          <span className='avatar-online-dot' title='Online' />
                        )}
                      </div>
                      <div className='message-thread__content'>
                        <div className='message-thread__top'>
                          <div>
                            <strong>{displayName}</strong>
                            <div className='message-thread__status-container'>
                              {thread.other_user?.is_online ? (
                                <span className='status-text status-text--online'>Online</span>
                              ) : (
                                thread.other_user?.last_seen_at && (
                                  <span className='status-text status-text--offline'>
                                    Active {formatLastSeen(thread.other_user.last_seen_at)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          {thread.created_at && (
                            <time>{new Date(thread.created_at).toLocaleDateString()}</time>
                          )}
                        </div>
                        <span>
                          {thread.body?.slice(0, 70) || 'New conversation'}
                          {thread.body?.length > 70 ? '...' : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className='empty-state'>No conversations yet.</p>
              )}
            </div>
          )}
        </div>
      )}

    </section>
  );
}

export default Messages;
