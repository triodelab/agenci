import { Suspense } from "react";
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";

const Page = () => {
  return (
    <Suspense>
      <SignUpView />
    </Suspense>
  );
};

export default Page;
