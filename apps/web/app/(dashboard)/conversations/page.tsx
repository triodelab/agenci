import type { Metadata } from "next";
import { ConversationsView } from "@/modules/dashboard/ui/views/conversations-view";

export const metadata: Metadata = { title: "Samtaler" };

const Page = () => {
  return <ConversationsView />
};
 
export default Page;
