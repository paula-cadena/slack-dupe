import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // If there's no token, no need to check the protected endpoint
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        const { data } = await api.get('/auth/protected');
        setUser(data.logged_in_as);
      } catch (err) {
        // If token is invalid/expired, remove it and set user to null
        localStorage.removeItem('access_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Login function that saves the token to localStorage
  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    // Save token to localStorage
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
  };

  // Logout function that removes the token from localStorage
  const logout = async () => {
    // Optionally call a backend logout endpoint if needed
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    setUser(null);
  };

  // Signup function that saves the token on registration
  const signup = async (credentials) => {
    const { data } = await api.post('/auth/signup', credentials);
    localStorage.setItem('access_token', data.access_token);
    setUser(data.user);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);