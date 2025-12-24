import ProfileSection from "./ProfileSection";
import PreferencesSection from "./PreferenceSection";
import NotificationsSection from "./NotificationSection";

export default function SettingsView() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <ProfileSection />
          <NotificationsSection />
        </div>

        <div className="space-y-6">
          <PreferencesSection />
        </div>
      </div>
    </div>
  );
}