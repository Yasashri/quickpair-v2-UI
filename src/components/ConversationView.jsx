import React, { useEffect, useState, useRef } from 'react';
import api from '../api/api';
import StatusMessage from './StatusMessage';
import { formatLastSeen } from "../utils/date";
import './ConversationView.scss';
import { useNewMessage } from '../context/NewMessageContext';

function ConversationView({ thread, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const participant = thread.other_user;
  const { increment, reset } = useNewMessage();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch full message history when thread changes
  useEffect(() => {
    if (!thread) return;
    setLoading(true);
    setError(null);
    api
      .get(`/messages/${thread.other_user?.id}`)
      .then((res) => {
        // API returns newest first; reverse for bottom display
        const msgs = (res.data.messages || []).slice().reverse();
        setMessages(msgs);
        // Reset new message count for this conversation
        reset();
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load messages');
      })
      .finally(() => setLoading(false));
  }, [thread, reset]);

  // Poll for new incoming messages
  useEffect(() => {
    if (!thread) return undefined;
    const interval = setInterval(() => {
      api
        .get(`/messages/${thread.other_user?.id}`)
        .then((res) => {
          const fetched = (res.data.messages || []).slice().reverse();
          if (fetched.length > messages.length) {
            // New messages arrived
            setMessages(fetched);
            increment();
          }
        })
        .catch(() => {});
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, [thread, messages.length, increment]);

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
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <div className="conversation-view">
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
    </div>
  );
}

export default ConversationView;
