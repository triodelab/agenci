import type { Metadata } from "next";
import { ProduktetView } from "@/modules/landing/ui/views/produktet-view";

export const metadata: Metadata = {
  title: "Produktet",
  description:
    "Steg for steg: last opp kunnskap, tilpass chatassistenten og lim inn én kodelinje på nettsiden. Se hele flyten med skjermbilder.",
  alternates: { canonical: "/produktet" },
};

export default function ProduktetPage() {
  return <ProduktetView />;
}
