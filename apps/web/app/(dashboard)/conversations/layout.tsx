import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

const Layout = ({
  children
}: { children: React.ReactNode; }) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ConversationsLayout>{children}</ConversationsLayout>
    </div>
  );
};

export default Layout;
