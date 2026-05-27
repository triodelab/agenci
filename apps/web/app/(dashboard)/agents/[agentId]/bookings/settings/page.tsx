import type { Metadata } from "next";
import { BookingSettingsView } from "@/modules/bookings/ui/views/booking-settings-view";
import { Id } from "@workspace/backend/_generated/dataModel";

export const metadata: Metadata = { title: "Timebestilling-innstillinger" };

const Page = async ({ params }: { params: Promise<{ agentId: string }> }) => {
  const { agentId } = await params;
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <BookingSettingsView agentId={agentId as Id<"agents">} />
    </div>
  );
};

export default Page;
