import type { Metadata } from "next";
import { OrganizationView } from "@/modules/settings/ui/views/organization-view";

export const metadata: Metadata = { title: "Organisasjon — Innstillinger" };

export default function OrganizationPage() {
  return <OrganizationView />;
}
