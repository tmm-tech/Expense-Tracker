import { useState } from "react";
import { Bell, ChevronRight, Download, Globe, Lock, Moon, Palette, Sun, Trash2, Upload, User } from "lucide-react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Target, PiggyBank, CreditCard, Building, Home, BarChart2, FileText, Settings, Menu, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "../Component/button";
import { Input } from "../Component/input";
import { Label } from "../Component/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/select";
import { Switch } from "../Component/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../Component/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Component/card";
import { Avatar, AvatarFallback, AvatarImage } from "../Component/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../Component/dialog";
import { Alert, AlertDescription, AlertTitle } from "../Component/alert";
import Sidebar from '../Component/Sidebar';

export default function Settings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [currency, setCurrency] = useState("USD")
  const [language, setLanguage] = useState("en")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
    // Here you would implement the actual theme change logic
  }

  const handleNotificationChange = (type: "email" | "push" | "sms") => {
    setNotifications(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Here you would implement the actual password change logic
    setIsChangingPassword(false)
  }

  const handleDeleteAccount = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Here you would implement the actual account deletion logic
    setIsDeletingAccount(false)
  }

  return (
      <div className="flex h-screen bg-gray-100 bg-[url('https://unsplash.com/photos/a-blurry-photo-of-a-white-background-GJKx5lhwU3M')] bg-cover bg-center bg-fixed">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white bg-opacity-90 border-b p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-semibold text-gray-800">Financial Dashboard</h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-6 w-6 text-gray-600" />
          </Button>
        </header>
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">John Doe</h3>
                  <p className="text-sm text-gray-500">john.doe@example.com</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value="John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value="john.doe@example.com" />
              </div>
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleThemeChange("system")}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={() => handleNotificationChange("email")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications on your device</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={() => handleNotificationChange("push")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms}
                  onCheckedChange={() => handleNotificationChange("sms")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Manage your data and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Export Data</h3>
                  <p className="text-sm text-gray-500">Download all your data</p>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Import Data</h3>
                  <p className="text-sm text-gray-500">Upload data from another source</p>
                </div>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Delete Account</h3>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" onClick={() => setIsDeletingAccount(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and a new password.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Change Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeletingAccount} onOpenChange={setIsDeletingAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteAccount}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="delete-confirmation">
                  Type "DELETE" to confirm
                </Label>
                <Input id="delete-confirmation" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive">Delete Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
        </div>
        </div>
  )
}
