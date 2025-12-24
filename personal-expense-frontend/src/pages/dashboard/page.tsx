import { SignInButton } from "@/components/ui/signin";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardContent } from "./_components/DashboardContent";
import { useAuth } from "../../hooks/use-auth";

export default function Dashboard() {
  const { session, loading } = useAuth();

// ⏳ Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="h-12 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  // 🚫 Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">
            Sign in to access your dashboard
          </h1>
          <SignInButton />
        </div>
      </div>
    );
  }

  // ✅ Authenticated (replaces <Authenticated />)
  return <DashboardContent />;
}
