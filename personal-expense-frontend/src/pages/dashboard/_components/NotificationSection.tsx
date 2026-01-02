import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell } from "lucide-react";
import { toast } from "sonner";

type NotificationSettings = {
  emailNotifications: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
};

export default function NotificationsSection() {
  const queryClient = useQueryClient();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [goalReminders, setGoalReminders] = useState(true);

  // 🔐 Auth user (guard)
  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  // 🔔 Load notification settings
  const { data: settings, isLoading } = useQuery<NotificationSettings>({
    queryKey: ["notification-settings"],
    enabled: !!authUser,
    queryFn: () => apiFetch("/users/me/notifications"),
  });

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications);
      setBudgetAlerts(settings.budgetAlerts);
      setGoalReminders(settings.goalReminders);
    }
  }, [settings]);

  // 💾 Save mutation
  const saveSettings = useMutation({
    mutationFn: (payload: NotificationSettings) =>
      apiFetch("/users/me/notifications", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      toast.success("Notification settings updated");
      queryClient.invalidateQueries({
        queryKey: ["notification-settings"],
      });
    },
    onError: () => {
      toast.error("Failed to update notification settings");
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4 animate-pulse">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive updates
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email updates about your finances
            </p>
          </div>
          <Switch
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
          />
        </div>

        {/* Budget alerts */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Budget Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Get notified when approaching budget limits
            </p>
          </div>
          <Switch
            checked={budgetAlerts}
            onCheckedChange={setBudgetAlerts}
          />
        </div>

        {/* Goal reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Goal Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Receive reminders about your financial goals
            </p>
          </div>
          <Switch
            checked={goalReminders}
            onCheckedChange={setGoalReminders}
          />
        </div>

        <Button
          className="w-full"
          disabled={saveSettings.isPending}
          onClick={() =>
            saveSettings.mutate({
              emailNotifications,
              budgetAlerts,
              goalReminders,
            })
          }
        >
          Save Notification Settings
        </Button>
      </CardContent>
    </Card>
  );
}