import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { supabase } from "@/lib/supabase";
import { API_BASE_URL } from "@/lib/config";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finalizeAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.access_token) {
        console.error("Auth callback error:", error);
        navigate("/", { replace: true });
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        navigate("/", { replace: true });
      } catch (err) {
        console.error("User sync failed:", err);
        navigate("/", { replace: true });
      }
    };

    finalizeAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-svh gap-4">
      <Spinner className="size-8" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
