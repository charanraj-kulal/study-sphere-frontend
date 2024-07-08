// UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const storedData = sessionStorage.getItem("userData");
    return storedData ? JSON.parse(storedData) : null;
  });

  const updateUserData = (data) => {
    setUserData(data);
    if (data) {
      sessionStorage.setItem("userData", JSON.stringify(data));
    } else {
      sessionStorage.removeItem("userData");
    }
  };

  // The logout function is now part of updateUserData
  const logout = () => {
    updateUserData(null);
  };

  useEffect(() => {
    if (userData) {
      sessionStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  return (
    <UserContext.Provider value={{ userData, updateUserData, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
