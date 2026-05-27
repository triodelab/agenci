import type { Metadata } from "next";
import { PlanView } from "@/modules/settings/ui/views/plan-view";

export const metadata: Metadata = { title: "Plan — Innstillinger" };

export default function PlanPage() {
  return <PlanView />;
}
