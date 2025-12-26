import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finalizeAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth callback error:", error);
        return;
      }

      if (!session?.user) {
        // No session → go home
        navigate("/", { replace: true });
        return;
      }

      // Optional: sync user profile
      await updateUserProfile(session.user);

      // Redirect home
      navigate("/", { replace: true });
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



async function updateUserProfile(user: User) {
  const { error } = await fetch("https://expense-tracker-u6ge.onrender.com/api/users/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  }).then((res) => res.json());

  if (error) {
    console.error("Failed to update user profile:", error);
  }
}
export function AuthCallbackError({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-svh gap-4 px-4 text-center">
      <p className="text-sm text-destructive">Error during sign-in: {message}</p>
      <Button variant="outline" onClick={() => navigate("/", { replace: true })}>
        Go back home
      </Button>
    </div>
  );
}