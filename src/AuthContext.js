import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log('Checking user session...');
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        console.log('Session:', session, 'Session error:', sessionError);
  
        if (session?.user) {
          setUser(session.user);
          console.log('User ID:', session.user.id);
  
          // Fetch user role
          const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
  
          console.log('Role fetch:', { data, error });
  
          if (data) {
            setRole(data.role);
          }
        } else {
          setUser(null);
          setRole(null);
          console.warn('No user session found.');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };
  
    checkUser();
  
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Full Auth State Change Event:', {
        event,
        session,
        user: session?.user
      });
    
      // Use a microtask to ensure state updates are processed immediately
      Promise.resolve().then(() => {
        if (event === 'SIGNED_IN') {
          if (session?.user) {
            setUser(session.user);
            // Fetch role logic
            supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single()
              .then(({ data, error }) => {
                if (error) {
                  console.error('Error fetching role:', error);
                }
                setRole(data?.role ?? 'user');
              });
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('Signing out or no session...');
          setUser(null);
          setRole(null);
        }
      });
    });  
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);  
  
  const signUp = async (email, password, fullName) => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
  
      console.log('Sign up auth data:', authData);
      console.log('Sign up auth error:', authError);

      if (authError) {
        toast.error(authError.message);
        return { error: authError };
      }
  
      // Check if email confirmation is required
      if (authData.user?.identities?.length === 0) {
        toast.success('Please check your email to confirm your account', {
          duration: 6000,
          position: 'top-center'
        });
        return { error: null };
      }
  
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email,
          full_name: fullName,
          role: 'user'
        });
  
      console.log('User insert error:', insertError);

      if (insertError) {
        toast.error(insertError.message);
        return { error: insertError };
      }
  
      toast.success('Account created successfully!');
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      toast.error('An unexpected error occurred during sign up');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in data:', data);
      console.log('Sign in error:', error);

      if (error) {
        toast.error(error.message);
        return { error };
      }

      setUser (data.user);

      toast.success('Successfully logged in');
      return { error: null };
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast.error('An unexpected error occurred during login');
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Immediately set user and role to null before the sign-out API call
      setUser(null);
      setRole(null);
  
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
  
      if (error) {
        console.error('Sign out error:', error);
        toast.error('Error logging out');
        return { error };
      }
  
      console.log('Signed out successfully.');
      toast.success('Logged out successfully');
      return { error: null };
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast.error('Error logging out');
      return { error };
    }
  };
  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      signUp, 
      signIn, 
      signOut, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);