import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api"; // ✅ use the helper

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
      // Use apiFetch to sync user
      await apiFetch("/users/sync", { method: "POST" });

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Finalize auth error:", err);
      setError(err?.message || "Failed to complete sign in. Please try again.");
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