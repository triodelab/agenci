import type { Metadata } from "next";
import { HvordanDetVirkerView } from "@/modules/landing/ui/views/hvordan-det-virker-view";

export const metadata: Metadata = {
  title: "Slik fungerer det",
  description:
    "Fra chat på nettsiden til dashboard: se hvordan Agenci samler innsikt, samtaler og oppsett — med skjermbilder fra produktet.",
};

export default function HvordanDetVirkerPage() {
  return <HvordanDetVirkerView />;
}
