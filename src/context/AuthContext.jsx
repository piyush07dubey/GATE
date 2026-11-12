import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, API_BASE } from '../lib/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.postForm('/auth/token', { username: email, password });
      localStorage.setItem('access_token', data.access_token);
      const user = { id: email, email, user_metadata: { full_name: email.split('@')[0] } };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Signed in successfully');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    setLoading(true);
    try {
      const data = await api.post('/auth/register', { email, password, full_name: fullName });
      toast.success('Account created! Please sign in.');
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    toast.error('Google Sign-In is not available in local mode');
  };

  const signOut = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
