import React, { useEffect, useState } from 'react';
import api from '../api/api';
import Card from './Card';
import StatusMessage from './StatusMessage';
import { formatLastSeen } from "../utils/date";
import './ConversationView.scss';

function ConversationView({ thread, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const participant = thread.other_user;

  // Fetch full message history when thread changes
  useEffect(() => {
    if (!thread) return;
    setLoading(true);
    setError(null);
    api
      .get(`/messages/${thread.other_user?.id}`)
      .then((res) => {
        setMessages(res.data.messages || []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load messages');
      })
      .finally(() => setLoading(false));
  }, [thread]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const payload = { body: newMessage, receiver_id: participant.id };
    api
      .post('/messages', payload)
      .then((res) => {
        // Append sent message to list
        setMessages((prev) => [...prev, res.data.data]);
        setNewMessage('');
      })
      .catch(() => {
        // Simple error handling – could be expanded
        alert('Failed to send message');
      });
  };

  const renderMessages = () => {
    if (loading) return <p className="conversation-loading">Loading messages...</p>;
    if (error)
      return (
        <StatusMessage type="error" title="Error" message={error} buttonText="Retry" onButtonClick={() => {
          setLoading(true);
          setError(null);
        }} />
      );
    if (!messages.length) return <p className="conversation-empty">No messages yet.</p>;
    return (
      <div className="conversation-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.sender_id === thread.other_user?.id ? 'incoming' : 'outgoing'}`}
          >
            <p>{msg.body}</p>
            <time>{new Date(msg.created_at).toLocaleTimeString()}</time>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="conversation-view">
      <div className="conversation-header">
        <button className="close-btn" onClick={onClose} aria-label="Close conversation">
          ✕
        </button>
        <div className="participant-info">
          <img src={participant.profile?.profile_image_url || `https://i.pravatar.cc/400?img=${(participant.id % 70) + 1}`} alt={participant.email} />
          <div className="name-status">
            <strong>{participant.display_name || participant.email}</strong>
            {participant.is_online ? (
              <span className="status online">Online</span>
            ) : (
              <span className="status offline">
                Active {participant.last_seen_at ? formatLastSeen(participant.last_seen_at) : 'unknown'}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="conversation-body">{renderMessages()}</div>
      <div className="conversation-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message…"
          rows={2}
        />
        <button onClick={handleSend} disabled={!newMessage.trim()}>
          Send
        </button>
      </div>
    </Card>
  );
}

export default ConversationView;
