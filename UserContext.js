// pages/UserContext.js

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "/firebase"; // Adjust if necessary
import { onAuthStateChanged } from "firebase/auth";

// Create a UserContext
const UserContext = createContext(null);

// UserProvider component that provides user context to the whole app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Set the user when authentication state changes
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// Custom hook to use user context
export const useUser = () => useContext(UserContext);
