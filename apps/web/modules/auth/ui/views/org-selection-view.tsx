import { OrganizationList } from "@clerk/nextjs";

export const OrgSelectionView = () => {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/onboarding"
      afterSelectOrganizationUrl="/dashboard"
      hidePersonal
      skipInvitationScreen
    />
  );
};
