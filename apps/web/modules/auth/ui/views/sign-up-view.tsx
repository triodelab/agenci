import { SignUp } from "@clerk/nextjs";

export const SignUpView = () => {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl="/org-selection"
      appearance={{
        elements: {
          rootBox: "w-full",
          card: "shadow-none bg-transparent p-0",
          headerTitle: "text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]",
          headerSubtitle: "text-[14px] text-[#6b7280]",
          socialButtonsBlockButton: "border border-[#d4d0cb] bg-white text-[13px] font-medium text-[#4b5563] hover:border-[#b8b3ae] hover:text-[#1C1C1C]",
          dividerLine: "bg-[#d4d0cb]",
          dividerText: "text-[11px] text-[#a09d98]",
          formFieldLabel: "text-[13px] font-medium text-[#4b5563]",
          formFieldInput: "rounded-[8px] border border-[#d4d0cb] bg-white px-3.5 py-2.5 text-[14px] text-[#1C1C1C] placeholder-[#a09d98] focus:border-[#b8b3ae] focus:ring-2 focus:ring-[#1C1C1C]/8",
          formButtonPrimary: "rounded-[8px] bg-[#1C1C1C] text-[14px] font-semibold text-white hover:bg-[#2a2a2a]",
          footerActionLink: "font-semibold text-[#1C1C1C] hover:text-[#2a2a2a]",
          alert: "rounded-[8px] border border-red-200 bg-red-50 text-[13px] text-red-600",
        },
      }}
    />
  );
};
