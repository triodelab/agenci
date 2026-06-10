import type { Metadata } from "next";
import { FilesView } from "@/modules/files/ui/views/files-view";

export const metadata: Metadata = { title: "Kunnskapsbase" };

const Page = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <FilesView />
    </div>
  );
};

export default Page;
