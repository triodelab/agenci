import type { Metadata } from "next";
import { Suspense } from "react";
import { ForgotPasswordView } from "@/modules/auth/ui/views/forgot-password-view";

export const metadata: Metadata = {
  title: "Glemt passord",
};

const Page = () => {
  return (
    <Suspense>
      <ForgotPasswordView />
    </Suspense>
  );
};

export default Page;
