import type { Metadata } from "next";
import { SecurityView } from "@/modules/settings/ui/views/security-view";

export const metadata: Metadata = { title: "Sikkerhet — Innstillinger" };

export default function SecurityPage() {
  return <SecurityView />;
}
