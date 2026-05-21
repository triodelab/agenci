import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";

export const metadata: Metadata = {
  title: "Opprett konto",
};

const Page = () => {
  return (
    <Suspense>
      <SignUpView />
    </Suspense>
  );
};

export default Page;
