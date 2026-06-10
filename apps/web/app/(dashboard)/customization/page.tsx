import type { Metadata } from "next";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";

export const metadata: Metadata = { title: "Tilpasning" };

const Page = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <CustomizationView />
    </div>
  );
};

export default Page;
