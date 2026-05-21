import { useEffect, useState } from 'react';
import api from '../api/api';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';

function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages').then((response) => {
      setThreads(response.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const loadConversation = async (userToChat) => {
    setSelectedUser(userToChat);
    const response = await api.get(`/messages/${userToChat.id}`);
    setConversation(response.data.messages);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!selectedUser || !message.trim()) return;
    await api.post('/messages', { receiver_id: selectedUser.id, body: message });
    setMessage('');
    loadConversation(selectedUser);
  };

  return (
    <section className="page-card messages-page">
      <div className="messages-layout">
        <Card title="Conversations">
          {loading ? (
            <p>Loading conversations...</p>
          ) : (
            <div className="messages-list">
              {threads.length ? threads.map((thread) => {
                const other = user && thread.sender.id === user.id ? thread.receiver : thread.sender;
                return (
                  <button key={thread.id} type="button" className="message-thread" onClick={() => loadConversation(other)}>
                    <strong>{other?.email || 'Conversation'}</strong>
                    <span>{thread.body?.slice(0, 45) || 'New conversation'}</span>
                  </button>
                );
              }) : <p className="empty-state">No conversations yet.</p>}
            </div>
          )}
        </Card>
        <Card title={selectedUser ? `Chat with ${selectedUser.email}` : 'Select a conversation'}>
          {selectedUser ? (
            <>
              <div className="conversation-window">
                {conversation.map((messageItem) => (
                  <div key={messageItem.id} className={`message-bubble ${messageItem.sender_id === selectedUser.id ? 'message-bubble--other' : 'message-bubble--self'}`}>
                    <p>{messageItem.body}</p>
                    <span>{new Date(messageItem.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <form className="message-form" onSubmit={sendMessage}>
                <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a message" />
                <button type="submit" className="button">Send</button>
              </form>
            </>
          ) : (
            <p>Select a conversation to view messages.</p>
          )}
        </Card>
      </div>
    </section>
  );
}

export default Messages;
