import React, { createContext, useState, useContext } from 'react';

const NewMessageContext = createContext({
  count: 0,
  setCount: () => {},
  increment: () => {},
  reset: () => {}
});

export const NewMessageProvider = ({ children }) => {
  const [count, setCount] = useState(0);
  const increment = () => setCount((c) => c + 1);
  const reset = () => setCount(0);
  return (
    <NewMessageContext.Provider value={{ count, setCount, increment, reset }}>
      {children}
    </NewMessageContext.Provider>
  );
};

export const useNewMessage = () => useContext(NewMessageContext);
