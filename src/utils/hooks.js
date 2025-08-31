import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { ...session.user, uid: session.user.id } : null);
      setLoading(false);
    });
    // Checa sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { ...session.user, uid: session.user.id } : null);
      setLoading(false);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
};