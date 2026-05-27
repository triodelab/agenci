import type { Metadata } from "next";
import { HvordanDetVirkerView } from "@/modules/landing/ui/views/hvordan-det-virker-view";

export const metadata: Metadata = {
  title: "Slik fungerer Agenci",
  description:
    "Steg for steg: last opp kunnskap, tilpass chatassistenten og lim inn én kodelinje på nettsiden. Se hele flyten med skjermbilder.",
  alternates: { canonical: "/hvordan-det-virker" },
};

export default function HvordanDetVirkerPage() {
  return <HvordanDetVirkerView />;
}
