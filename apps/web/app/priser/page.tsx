import type { Metadata } from "next";
import { PriserView } from "@/modules/landing/ui/views/priser-view";

export const metadata: Metadata = {
  title: "Priser",
  description:
    "Enkel prising for Agenci — start gratis, voks i eget tempo. Ingen kortinfo, ingen bindingstid.",
  alternates: { canonical: "/priser" },
};

export default function PriserPage() {
  return <PriserView />;
}
