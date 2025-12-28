import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { API_BASE_URL } from "@/lib/config";

/* ---------------- TYPES ---------------- */

type AlertSeverity = "critical" | "warning" | "success" | "info";

type Alert = {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  createdAt: string; // ISO string
  actionUrl?: string;
  isRead: boolean;
};

/* ---------------- COMPONENT ---------------- */

export function AlertsBell() {
  const navigate = useNavigate();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["alerts-unread-count"],
    queryFn: () => apiFetch<number>(`${API_BASE_URL}/alerts/unread-count`),
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts-recent"],
    queryFn: () => apiFetch<Alert[]>(`${API_BASE_URL}/alerts?onlyUnread=true`),
  });

  const displayAlerts = alerts.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 sm:w-96 p-0 glass-card" align="end">
        {/* Header */}
        <div className="p-4 border-b border-border/40">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[400px] overflow-y-auto">
          {displayAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No new notifications
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {displayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (alert.actionUrl) {
                      const url = new URL(
                        alert.actionUrl,
                        window.location.origin,
                      );
                      navigate(url.pathname + url.search);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg shrink-0",
                        alert.severity === "critical" && "bg-red-500/10",
                        alert.severity === "warning" && "bg-yellow-500/10",
                        alert.severity === "success" && "bg-green-500/10",
                        alert.severity === "info" && "bg-blue-500/10",
                      )}
                    >
                      {alert.severity === "critical" && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      {alert.severity === "warning" && (
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                      )}
                      {alert.severity === "success" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      )}
                      {alert.severity === "info" && (
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {alert.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(alert.createdAt), "MMM dd, h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {displayAlerts.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                onClick={() => navigate("/dashboard?tab=alerts")}
              >
                <span>View all notifications</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}