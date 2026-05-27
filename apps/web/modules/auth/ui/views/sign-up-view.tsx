import { SignUp } from "@clerk/nextjs";

export const SignUpView = () => {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl="/org-selection"
      appearance={{
        variables: {
          colorBackground: "transparent",
          colorPrimary: "#1C1C1C",
          colorText: "#111111",
          colorTextSecondary: "#6B7280",
          colorTextOnPrimaryBackground: "#FFFFFF",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#111111",
          colorNeutral: "#E5E7EB",
          colorDanger: "#DC2626",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: { normal: "400", medium: "500", bold: "600" },
          spacingUnit: "16px",
        },
        elements: {
          card: {
            boxShadow: "none",
            backgroundColor: "transparent",
            padding: "0",
            border: "none",
            gap: "22px",
            width: "100%",
          },
          headerTitle: {
            fontSize: "24px",
            fontWeight: "600",
            letterSpacing: "-0.03em",
            color: "#111111",
          },
          headerSubtitle: {
            fontSize: "14px",
            color: "#6B7280",
            marginTop: "4px",
          },
          socialButtonsBlockButton: {
            border: "1.5px solid #E5E7EB",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            height: "42px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#374151",
            boxShadow: "none",
          },
          socialButtonsBlockButtonText: {
            fontSize: "13px",
            fontWeight: "500",
          },
          dividerRow: {
            marginTop: "2px",
            marginBottom: "2px",
          },
          dividerLine: {
            backgroundColor: "#E5E7EB",
          },
          dividerText: {
            color: "#9CA3AF",
            fontSize: "12px",
          },
          formFieldLabel: {
            fontSize: "13px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "6px",
          },
          formFieldInput: {
            border: "1.5px solid #E5E7EB",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            height: "42px",
            fontSize: "14px",
            color: "#111111",
            boxShadow: "none",
            paddingLeft: "14px",
            paddingRight: "14px",
          },
          formButtonPrimary: {
            backgroundColor: "#1C1C1C",
            borderRadius: "10px",
            height: "42px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#FFFFFF",
            boxShadow: "none",
            textTransform: "none",
            letterSpacing: "0em",
          },
          footerAction: {
            paddingTop: "8px",
          },
          footerActionText: {
            fontSize: "13px",
            color: "#6B7280",
          },
          footerActionLink: {
            fontSize: "13px",
            fontWeight: "600",
            color: "#1C1C1C",
          },
          identityPreviewText: {
            fontSize: "14px",
            color: "#111111",
          },
          identityPreviewEditButton: {
            fontSize: "13px",
            color: "#6B7280",
          },
          formFieldInputShowPasswordButton: {
            color: "#9CA3AF",
          },
          alertText: {
            fontSize: "13px",
          },
          alert: {
            borderRadius: "10px",
            border: "1px solid #FEE2E2",
            backgroundColor: "#FEF2F2",
          },
          formFieldAction: {
            fontSize: "12px",
            color: "#9CA3AF",
          },
          otpCodeFieldInput: {
            borderRadius: "10px",
            border: "1.5px solid #E5E7EB",
            backgroundColor: "#FFFFFF",
            color: "#111111",
          },
        },
      }}
    />
  );
};
