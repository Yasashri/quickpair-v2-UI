import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../api/api';

const NewMessageContext = createContext({
  count: 0,
  setCount: () => {},
  increment: () => {},
  reset: () => {},
  toast: { show: false, senderName: '', body: '', userId: null },
  dismissToast: () => {}
});

export const NewMessageProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState({ show: false, senderName: '', body: '', userId: null });
  const countRef = useRef(count);

  // Keep countRef synchronized to avoid closure stale value issues in setInterval
  useEffect(() => {
    countRef.current = count;
  }, [count]);

  const increment = () => setCount((c) => c + 1);
  const reset = () => setCount(0);
  const dismissToast = () => setToast({ show: false, senderName: '', body: '', userId: null });

  useEffect(() => {
    const checkMessages = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        if (countRef.current !== 0) {
          setCount(0);
        }
        return;
      }

      try {
        const response = await api.get('/messages');
        const threads = response.data.data || [];
        
        const totalUnread = threads.reduce((acc, thread) => acc + (thread.unread_count || 0), 0);
        
        // Check if there is a new message (unread count increased)
        if (totalUnread > countRef.current) {
          // Find which thread has new unread messages
          const newUnreadThread = threads.find(thread => (thread.unread_count || 0) > 0);
          if (newUnreadThread) {
            const senderName = newUnreadThread.other_user?.profile?.display_name || newUnreadThread.other_user?.email || 'Someone';
            const body = newUnreadThread.body || 'Sent you a message';
            const userId = newUnreadThread.other_user?.id;

            setToast({
              show: true,
              senderName,
              body: body.length > 60 ? body.slice(0, 60) + '...' : body,
              userId
            });

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              setToast(prev => ({ ...prev, show: false }));
            }, 5000);
          }
        }

        setCount(totalUnread);
      } catch (err) {
        // Silent catch to prevent console errors on unapproved profiles
      }
    };

    // Run immediately on load
    checkMessages();

    // Poll every 1 minute (60 seconds)
    const interval = setInterval(checkMessages, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NewMessageContext.Provider value={{ count, setCount, increment, reset, toast, dismissToast }}>
      {children}
    </NewMessageContext.Provider>
  );
};

export const useNewMessage = () => useContext(NewMessageContext);

