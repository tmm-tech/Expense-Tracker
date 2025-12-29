import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  Archive,
  Trash2,
  Eye,
  CheckCheck,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Alert {
  _id: string;
  id: string;
  title: string;
  message: string;
  severity: "critical" | "warning" | "success" | "info";
  type: string;
  isRead: boolean;
  isArchived: boolean;
  actionUrl?: string;
  amount?: number;
  createdAt: Date;
}

export function AlertsView() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);

const { data: alerts = [], isLoading } = useQuery<Alert[]>({
  queryKey: ["alerts", showArchived],
  queryFn: () =>
    apiFetch(`/alerts?includeArchived=${showArchived}`),
});

const markAsRead = useMutation({
  mutationFn: (id: string) =>
    apiFetch(`https://expense-tracker-u6ge.onrender.com/alerts/mark-read/${id}`, { method: "POST" }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
});

const markAllAsRead = useMutation({
  mutationFn: () =>
    apiFetch("/alerts/mark-all-read", { method: "POST" }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
});

const archiveAlert = useMutation({
  mutationFn: (id: string) =>
    apiFetch(`/alerts/archive/${id}`, { method: "POST" }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
});

const deleteAlert = useMutation({
  mutationFn: (id: string) =>
    apiFetch(`/alerts/${id}`, { method: "DELETE" }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
});

const runAllChecks = useMutation({
  mutationFn: () =>
    apiFetch("/alerts/run-checks", { method: "POST" }),
  onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
});

  const [isRefreshing, setIsRefreshing] = useState(false);

 const handleAlertClick = async (alert: Alert) => {
  if (!alert.isRead) {
    await markAsRead.mutateAsync(alert.id);
  }
  if (alert.actionUrl) {
    const url = new URL(alert.actionUrl, window.location.origin);
    navigate(url.pathname + url.search);
  }
};

const handleRefreshAlerts = async () => {
  await runAllChecks.mutateAsync();
};
const handleMarkAllRead = async () => {
  await markAllAsRead.mutateAsync();
};

  if (!alerts) {
    return <div>Loading...</div>;
  }

  const activeAlerts = alerts.filter((a) => !a.isArchived);
  const archivedAlerts = alerts.filter((a) => a.isArchived);
  const displayAlerts = showArchived ? archivedAlerts : activeAlerts;
  const unreadCount = activeAlerts.filter((a) => !a.isRead).length;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Alerts & Notifications</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stay informed about your financial activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshAlerts}
            disabled={isRefreshing}
            className="gap-2"
          >
            <Bell className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-2">
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Active</p>
                <p className="text-xl md:text-2xl font-bold">{activeAlerts.length}</p>
              </div>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Unread</p>
                <p className="text-xl md:text-2xl font-bold text-blue-500">{unreadCount}</p>
              </div>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Critical</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-500">
                  {activeAlerts.filter((a) => a.severity === "critical").length}
                </p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-muted/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Archived</p>
                <p className="text-xl md:text-2xl font-bold">{archivedAlerts.length}</p>
              </div>
              <Archive className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archive Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={!showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(false)}
        >
          Active ({activeAlerts.length})
        </Button>
        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived(true)}
        >
          Archived ({archivedAlerts.length})
        </Button>
      </div>

      {/* Alerts List */}
      {displayAlerts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bell />
            </EmptyMedia>
            <EmptyTitle>
              {showArchived ? "No archived alerts" : "No active alerts"}
            </EmptyTitle>
            <EmptyDescription>
              {showArchived
                ? "Archived alerts will appear here"
                : "You're all caught up! New alerts will appear here"}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-2">
          {displayAlerts.map((alert) => (
            <Card
              key={alert._id}
              className={cn(
                "glass-card cursor-pointer transition-all hover:border-primary/50",
                !alert.isRead && "border-l-4 border-l-primary",
                alert.severity === "critical" && "border-l-red-500",
                alert.severity === "warning" && "border-l-yellow-500",
                alert.severity === "success" && "border-l-green-500"
              )}
              onClick={() => handleAlertClick(alert)}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      "p-2 rounded-lg shrink-0",
                      alert.severity === "critical" && "bg-red-500/10",
                      alert.severity === "warning" && "bg-yellow-500/10",
                      alert.severity === "success" && "bg-green-500/10",
                      alert.severity === "info" && "bg-blue-500/10"
                    )}
                  >
                    {alert.severity === "critical" && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    {alert.severity === "warning" && (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    {alert.severity === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {alert.severity === "info" && <Info className="w-4 h-4 text-blue-500" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm md:text-base truncate">
                        {alert.title}
                      </h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 text-xs",
                          alert.severity === "critical" && "border-red-500/20 bg-red-500/10",
                          alert.severity === "warning" && "border-yellow-500/20 bg-yellow-500/10",
                          alert.severity === "success" && "border-green-500/20 bg-green-500/10",
                          alert.severity === "info" && "border-blue-500/20 bg-blue-500/10"
                        )}
                      >
                        {alert.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {format(alert.createdAt, "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                      {alert.amount !== undefined && (
                        <>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="text-xs font-semibold">
                            KES {alert.amount.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {!alert.isArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          archiveAlert.mutate(alert._id);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this alert?")) {
                          deleteAlert.mutate(alert._id);
                        }
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}