import type { Metadata } from "next";
import { IntegrationsView } from "@/modules/integrations/ui/views/integrations-view";

export const metadata: Metadata = { title: "Integrasjoner" };

const Page = () => {
  return <IntegrationsView />
}
 
export default Page;