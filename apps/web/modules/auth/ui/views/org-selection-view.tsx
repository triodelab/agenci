import { OrganizationList } from "@clerk/nextjs";

export const OrgSelectionView = () => {
  return (
    <OrganizationList
      afterCreateOrganizationUrl="/agents"
      afterSelectOrganizationUrl="/dashboard"
      hidePersonal
      skipInvitationScreen
    />
  );
};
