import { Suspense } from "react";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

const Page = () => {
  return (
    <Suspense>
      <SignInView />
    </Suspense>
  );
};

export default Page;
