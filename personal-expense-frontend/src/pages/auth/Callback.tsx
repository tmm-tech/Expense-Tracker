import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const navigateHome = useCallback(
    () => navigate("/", { replace: true }),
    [navigate]
  );

  const finalizeAuth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.getSession();
      const session = data?.session ?? null;

      if (error || !session?.access_token) {
        console.error("Auth callback error:", error, data);
        setError("Unable to complete sign in. Please try again.");
        setLoading(false);
        return;
      }

      const res = await fetch(
        "https://expense-tracker-u6ge.onrender.com/api/users/sync",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        console.error("User sync failed:", body);
        throw new Error(body?.message || "Failed to sync account");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Finalize auth error:", err);
      setError("Failed to complete sign in. Please try again.");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    finalizeAuth();
  }, [finalizeAuth]);

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-svh gap-4">
        <Spinner className="size-8" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-svh gap-6 px-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-destructive font-medium">Something went wrong</p>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={navigateHome}>
            Return home
          </Button>
          <Button onClick={finalizeAuth}>Try again</Button>
        </div>
      </div>
    );
  }

  return null;
}