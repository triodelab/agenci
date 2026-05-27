import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInView } from "@/modules/auth/ui/views/sign-in-view";

export const metadata: Metadata = {
  title: "Logg inn",
};

const Page = () => {
  return (
    <Suspense>
      <SignInView />
    </Suspense>
  );
};

export default Page;
