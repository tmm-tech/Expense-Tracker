import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function ProfileSection() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");

  // 🔐 Supabase auth user
  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  // 👤 Backend profile
  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ["profile"],
    enabled: !!authUser,
    queryFn: () => apiFetch("/users/me"),
  });

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (payload: { name?: string }) =>
      apiFetch("/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-6 animate-pulse space-y-3">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Manage your personal information
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>

          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Display Name</p>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass"
                autoFocus
              />
            ) : (
              <p className="font-medium">
                {profile.name || "No name set"}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={profile.email || "Not provided"}
            disabled
            className="glass"
          />
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={() =>
                  updateProfile.mutate({
                    name: name.trim() || undefined,
                  })
                }
                size="sm"
                disabled={updateProfile.isPending}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setName(profile.name || "");
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}