import { Suspense } from "react";
import { OrgSelectionView } from "@/modules/auth/ui/views/org-selection-view";

const Page = () => {
  return (
    <Suspense>
      <OrgSelectionView />
    </Suspense>
  );
};

export default Page;
