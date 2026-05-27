import { OrganizationList } from "@clerk/nextjs";

export const OrgSelectionView = () => {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/onboarding"
      afterSelectOrganizationUrl="/dashboard"
      hidePersonal
      skipInvitationScreen
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
          organizationListCreateOrganizationBox: {
            border: "1px solid #d4d0cb",
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
          },
          organizationListCreateOrganizationActionButton: {
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: "500",
            color: "#1C1C1C",
          },
          organizationPreviewSecondaryIdentifier: {
            fontFamily: "inherit",
            fontSize: "12px",
            color: "#6b7280",
          },
          organizationPreviewTextContainer: {
            fontFamily: "inherit",
          },
          organizationPreviewMainIdentifier: {
            fontFamily: "inherit",
            fontSize: "14px",
            fontWeight: "500",
            color: "#1C1C1C",
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
          formFieldInput: {
            fontFamily: "inherit",
            border: "1px solid #d4d0cb",
            borderRadius: "8px",
            backgroundColor: "#FFFFFF",
            height: "40px",
            fontSize: "14px",
            color: "#1C1C1C",
            boxShadow: "none",
          },
          formFieldLabel: {
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: "500",
            color: "#4b5563",
          },
        },
      }}
    />
  );
};
