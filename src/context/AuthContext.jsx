import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mock functions for when Supabase is not configured yet
  const mockLogin = () => {
    setUser({ id: 'mock-user', email: 'student@gate.com', user_metadata: { full_name: 'GATE Student' } });
    toast.success('Logged in with Mock Account (Supabase not configured)');
  };

  const mockLogout = () => {
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    session,
    loading,
    signInWithEmail: async (email, password) => {
      if (!isSupabaseConfigured()) return mockLogin();
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    signUpWithEmail: async (email, password, fullName) => {
      if (!isSupabaseConfigured()) return mockLogin();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      if (error) throw error;
      return data;
    },
    signInWithGoogle: async () => {
      if (!isSupabaseConfigured()) return mockLogin();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) throw error;
      return data;
    },
    signOut: async () => {
      if (!isSupabaseConfigured()) return mockLogout();

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
