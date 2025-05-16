"use client";

import { createContext, useContext, ReactNode } from "react";

// Mock user data for development
const MOCK_USER = {
  id: "dev_user_123",
  firstName: "Dev",
  lastName: "User",
  imageUrl: "/img/dummy/profile-photo-dummy.jpg",
  // Add any other user properties you need
};

interface DevAuthContextType {
  isAuthenticated: boolean;
  user: typeof MOCK_USER;
}

const DevAuthContext = createContext<DevAuthContextType>({
  isAuthenticated: true,
  user: MOCK_USER,
});

export const DevAuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <DevAuthContext.Provider
      value={{
        isAuthenticated: true,
        user: MOCK_USER,
      }}
    >
      {children}
    </DevAuthContext.Provider>
  );
};

export const useDevAuth = () => useContext(DevAuthContext);