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
          colorText: "#1C1C1C",
          colorTextSecondary: "#6b7280",
          colorTextOnPrimaryBackground: "#FFFFFF",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#1C1C1C",
          colorNeutral: "#d4d0cb",
          colorDanger: "#DC2626",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: { normal: "400", medium: "500", bold: "600" },
        },
        elements: {
          rootBox: {
            width: "100%",
          },
          card: {
            boxShadow: "none",
            backgroundColor: "transparent",
            padding: "0",
            border: "none",
            gap: "20px",
            width: "100%",
          },
          headerTitle: {
            fontSize: "22px",
            fontWeight: "600",
            letterSpacing: "-0.03em",
            color: "#1C1C1C",
          },
          headerSubtitle: {
            fontSize: "14px",
            color: "#6b7280",
            marginTop: "4px",
          },
          socialButtonsBlockButton: {
            border: "1px solid #d4d0cb",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            height: "40px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#4b5563",
            boxShadow: "none",
          },
          socialButtonsBlockButtonText: {
            fontSize: "13px",
            fontWeight: "500",
          },
          dividerRow: {
            marginTop: "4px",
            marginBottom: "4px",
          },
          dividerLine: {
            backgroundColor: "#d4d0cb",
          },
          dividerText: {
            color: "#a09d98",
            fontSize: "11px",
          },
          formFieldLabel: {
            fontSize: "13px",
            fontWeight: "500",
            color: "#4b5563",
            marginBottom: "6px",
          },
          formFieldInput: {
            border: "1px solid #d4d0cb",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            height: "40px",
            fontSize: "14px",
            color: "#1C1C1C",
            boxShadow: "none",
            paddingLeft: "14px",
            paddingRight: "14px",
          },
          formButtonPrimary: {
            backgroundColor: "#1C1C1C",
            borderRadius: "8px",
            height: "40px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#FFFFFF",
            boxShadow: "none",
            textTransform: "none",
            letterSpacing: "0em",
          },
          footerAction: {
            backgroundColor: "transparent",
            paddingTop: "8px",
          },
          footerActionText: {
            fontSize: "13px",
            color: "#6b7280",
            backgroundColor: "transparent",
          },
          footerActionLink: {
            fontSize: "13px",
            fontWeight: "600",
            color: "#1C1C1C",
          },
          identityPreviewText: {
            fontSize: "14px",
            color: "#1C1C1C",
          },
          identityPreviewEditButton: {
            fontSize: "13px",
            color: "#6b7280",
          },
          formFieldInputShowPasswordButton: {
            color: "#a09d98",
          },
          alertText: {
            fontSize: "13px",
          },
          alert: {
            borderRadius: "8px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
          },
          otpCodeFieldInput: {
            borderRadius: "8px",
            border: "1px solid #d4d0cb",
            backgroundColor: "#FFFFFF",
            color: "#1C1C1C",
          },
        },
      }}
    />
  );
};
