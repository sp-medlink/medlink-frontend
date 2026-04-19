import type { Metadata } from "next";

import { ProfileSettingsPage } from "@/features/profile-settings";

export const metadata: Metadata = {
  title: "Settings",
  description: "Account profile and preferences",
};

export default function SettingsPage() {
  return <ProfileSettingsPage />;
}
