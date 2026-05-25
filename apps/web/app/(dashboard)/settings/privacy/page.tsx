import type { Metadata } from "next";
import { PrivacyView } from "@/modules/settings/ui/views/privacy-view";

export const metadata: Metadata = { title: "Personvern — Innstillinger" };

export default function PrivacyPage() {
  return <PrivacyView />;
}
