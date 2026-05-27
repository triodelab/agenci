import type { Metadata } from "next";
import { Suspense } from "react";
import { OrgSelectionView } from "@/modules/auth/ui/views/org-selection-view";

export const metadata: Metadata = {
  title: "Velg organisasjon",
};

const Page = () => {
  return (
    <Suspense>
      <OrgSelectionView />
    </Suspense>
  );
};

export default Page;
