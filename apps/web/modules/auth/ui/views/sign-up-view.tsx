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
          fontFamily: "inherit",
          fontWeight: { normal: "400", medium: "500", bold: "600" },
        },
        elements: {
          rootBox: { width: "100%" },
          card: {
            boxShadow: "none",
            backgroundColor: "transparent",
            padding: "0",
            border: "none",
            gap: "20px",
            width: "100%",
          },
          header: { paddingBottom: "0" },
          headerTitle: {
            fontFamily: "inherit",
            fontSize: "22px",
            fontWeight: "600",
            letterSpacing: "-0.03em",
            color: "#1C1C1C",
          },
          headerSubtitle: {
            fontFamily: "inherit",
            fontSize: "14px",
            color: "#6b7280",
            marginTop: "4px",
          },
          socialButtonsBlockButton: {
            fontFamily: "inherit",
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
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: "500",
          },
          dividerRow: { marginTop: "4px", marginBottom: "4px" },
          dividerLine: { backgroundColor: "#d4d0cb" },
          dividerText: {
            fontFamily: "inherit",
            color: "#a09d98",
            fontSize: "11px",
          },
          formFieldLabel: {
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: "500",
            color: "#4b5563",
            marginBottom: "6px",
          },
          formFieldInput: {
            fontFamily: "inherit",
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
            fontFamily: "inherit",
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
          footer: {
            backgroundColor: "transparent",
            background: "transparent",
          },
          footerAction: {
            backgroundColor: "transparent",
            paddingTop: "8px",
          },
          footerActionText: {
            fontFamily: "inherit",
            fontSize: "13px",
            color: "#6b7280",
          },
          footerActionLink: {
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: "600",
            color: "#1C1C1C",
          },
          identityPreviewText: {
            fontFamily: "inherit",
            fontSize: "14px",
            color: "#1C1C1C",
          },
          identityPreviewEditButton: {
            fontFamily: "inherit",
            fontSize: "13px",
            color: "#6b7280",
          },
          formFieldInputShowPasswordButton: { color: "#a09d98" },
          formFieldSuccessText: {
            fontFamily: "inherit",
            fontSize: "12px",
          },
          alertText: {
            fontFamily: "inherit",
            fontSize: "13px",
          },
          alert: {
            borderRadius: "8px",
            border: "1px solid #fecaca",
            backgroundColor: "#fef2f2",
          },
          otpCodeFieldInput: {
            fontFamily: "inherit",
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
