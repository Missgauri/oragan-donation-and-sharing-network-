import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

/**
 * Global app context — extend this as the app grows
 * (e.g. auth state, notifications, theme).
 */
export const AppProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  return (
    <AppContext.Provider value={{ notification, setNotification }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
