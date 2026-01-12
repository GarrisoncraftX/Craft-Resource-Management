/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { User, AuthContextType } from '@/types/nodejsbackendapi/authTypes';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('craft_token');
    const storedUser = localStorage.getItem('craft_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user JSON:', error);
        localStorage.removeItem('craft_token');
        localStorage.removeItem('craft_user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  const loginCallback = React.useCallback((userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('craft_token', authToken);
    localStorage.setItem('craft_user', JSON.stringify(userData));
  }, []);

  const logoutCallback = React.useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('craft_token');
    localStorage.removeItem('craft_user');
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    login: loginCallback,
    logout: logoutCallback,
    token,
  }), [user, isAuthenticated, loginCallback, logoutCallback, token]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
