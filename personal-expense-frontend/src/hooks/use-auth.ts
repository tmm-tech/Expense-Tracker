import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // --- Initial session + auth listener ---
  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) setError(error);
        setSession(data.session);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- Google sign in ---
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setError(error);
      setLoading(false);
    }
    // success → Supabase will redirect
  }, []);

  // --- Sign out ---
  const signOut = useCallback(async () => {
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error);
    }

    setSession(null);
    setLoading(false);
  }, []);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session,

    loading,
    error,

    signInWithGoogle,
    signOut,
  };
}