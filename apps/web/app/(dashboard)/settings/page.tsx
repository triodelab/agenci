import type { Metadata } from "next";
import { SettingsView } from "@/modules/settings/ui/views/settings-view";

export const metadata: Metadata = { title: "Innstillinger" };

export default function SettingsPage() {
  return <SettingsView />;
}
