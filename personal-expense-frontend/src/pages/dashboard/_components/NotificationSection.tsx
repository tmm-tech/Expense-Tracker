// import { useState, useEffect } from "react";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "@/convex/_generated/api.js";
// import { Button } from "@/components/ui/button.tsx";
// import { Label } from "@/components/ui/label.tsx";
// import { Switch } from "@/components/ui/switch.tsx";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
// import { Bell } from "lucide-react";
// import { toast } from "sonner";

// export default function NotificationsSection() {
//   const user = useQuery(api.users.getCurrentUser);
//   const updateSettings = useMutation(api.users.updateSettings);

//   const [emailNotifications, setEmailNotifications] = useState(true);
//   const [budgetAlerts, setBudgetAlerts] = useState(true);
//   const [goalReminders, setGoalReminders] = useState(true);

//   useEffect(() => {
//     if (user) {
//       setEmailNotifications(user.emailNotifications ?? true);
//       setBudgetAlerts(user.budgetAlerts ?? true);
//       setGoalReminders(user.goalReminders ?? true);
//     }
//   }, [user]);

//   const handleSave = async () => {
//     try {
//       await updateSettings({
//         emailNotifications,
//         budgetAlerts,
//         goalReminders,
//       });
//       toast.success("Notification settings updated");
//     } catch (error) {
//       toast.error("Failed to update notification settings");
//       console.error(error);
//     }
//   };

//   return (
//     <Card className="glass-card">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Bell className="h-5 w-5" />
//           Notification Settings
//         </CardTitle>
//         <CardDescription>Manage how you receive updates</CardDescription>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div className="space-y-0.5">
//             <Label htmlFor="email-notifications">Email Notifications</Label>
//             <p className="text-sm text-muted-foreground">
//               Receive email updates about your finances
//             </p>
//           </div>
//           <Switch
//             id="email-notifications"
//             checked={emailNotifications}
//             onCheckedChange={setEmailNotifications}
//           />
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="space-y-0.5">
//             <Label htmlFor="budget-alerts">Budget Alerts</Label>
//             <p className="text-sm text-muted-foreground">
//               Get notified when approaching budget limits
//             </p>
//           </div>
//           <Switch
//             id="budget-alerts"
//             checked={budgetAlerts}
//             onCheckedChange={setBudgetAlerts}
//           />
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="space-y-0.5">
//             <Label htmlFor="goal-reminders">Goal Reminders</Label>
//             <p className="text-sm text-muted-foreground">
//               Receive reminders about your financial goals
//             </p>
//           </div>
//           <Switch
//             id="goal-reminders"
//             checked={goalReminders}
//             onCheckedChange={setGoalReminders}
//           />
//         </div>

//         <Button onClick={handleSave} className="w-full">
//           Save Notification Settings
//         </Button>
//       </CardContent>
//     </Card>
//   );
// }