import { SignIn } from "@clerk/nextjs";

export const SignInView = () => {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl="/agents"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "w-full shadow-none bg-transparent p-0 gap-5",
          header: "pb-0",
          headerTitle: "text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]",
          headerSubtitle: "text-[14px] text-[#6b7280] mt-1",
          socialButtonsRoot: "grid grid-cols-2 gap-2.5",
          socialButtonsBlockButton: "rounded-[8px] border border-[#d4d0cb] bg-white h-10 text-[13px] font-medium text-[#4b5563] hover:border-[#b8b3ae] hover:text-[#1C1C1C] shadow-none",
          socialButtonsBlockButtonText: "text-[13px] font-medium",
          dividerRow: "my-1",
          dividerLine: "bg-[#d4d0cb]",
          dividerText: "text-[11px] text-[#a09d98] px-3",
          formFieldLabel: "text-[13px] font-medium text-[#4b5563] mb-1.5",
          formFieldInput: "h-10 rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 text-[14px] text-[#1C1C1C] placeholder:text-[#a09d98] focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8 shadow-none",
          formButtonPrimary: "h-10 rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white hover:bg-[#2a2a2a] shadow-none normal-case",
          footerAction: "pt-2",
          footerActionText: "text-[13px] text-[#6b7280]",
          footerActionLink: "text-[13px] font-semibold text-[#1C1C1C] hover:text-[#2a2a2a]",
          identityPreviewText: "text-[14px] text-[#1C1C1C]",
          identityPreviewEditButton: "text-[13px] text-[#6b7280] hover:text-[#1C1C1C]",
          formFieldInputShowPasswordButton: "text-[#a09d98] hover:text-[#4b5563]",
          alertText: "text-[13px]",
          alert: "rounded-[8px] border border-red-200 bg-red-50 text-red-600",
          formFieldAction: "text-[12px] text-[#a09d98] hover:text-[#1C1C1C]",
          otpCodeFieldInput: "rounded-[8px] border border-[#d4d0cb] bg-white text-[#1C1C1C]",
        },
      }}
    />
  );
};
