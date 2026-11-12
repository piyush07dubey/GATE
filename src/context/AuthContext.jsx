import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with /auth/me in background
        api.get('/auth/me')
          .then((profile) => {
            const updated = {
              id: profile.email,
              email: profile.email,
              user_metadata: { full_name: profile.full_name },
            };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
          })
          .catch(() => {
            // Token expired or invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            setUser(null);
          });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.postForm('/auth/token', { username: email, password });
      localStorage.setItem('access_token', data.access_token);
      const fullName = data.user?.full_name || email.split('@')[0];
      const userData = {
        id: email,
        email,
        user_metadata: { full_name: fullName },
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${fullName}!`);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, fullName) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, full_name: fullName });
      toast.success('Account created! Signing you in...');
      // Automatically log in upon successful sign-up
      return await signInWithEmail(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    toast.error('Google Sign-In requires OAuth configuration. Please sign in with email.');
  };

  const signOut = async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
