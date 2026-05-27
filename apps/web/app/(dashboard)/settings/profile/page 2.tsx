import type { Metadata } from "next";
import { ProfileView } from "@/modules/settings/ui/views/profile-view";

export const metadata: Metadata = { title: "Profil — Innstillinger" };

export default function ProfilePage() {
  return <ProfileView />;
}
