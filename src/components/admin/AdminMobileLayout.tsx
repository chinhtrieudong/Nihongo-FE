import React from "react";
import { Layout } from "antd";
import AdminMobileHeader from "./AdminMobileHeader";
import AdminMobileDrawer from "./AdminMobileDrawer";
import { APP_HEADER_HEIGHT_PX } from "../../constants/layout";

const { Content } = Layout;

interface AdminMobileLayoutProps {
  children: React.ReactNode;
}

const AdminMobileLayout: React.FC<AdminMobileLayoutProps> = ({ children }) => {
  return (
    <Layout 
      className="mobile-layout min-h-screen bg-bg"
      style={{ fontFamily: 'var(--app-font-family)' }}
    >
      <AdminMobileHeader />

      <Content 
        className="mobile-main-content bg-surface-1 text-text-main w-full ml-0"
        style={{ 
          paddingTop: APP_HEADER_HEIGHT_PX,
          minHeight: `calc(100vh - ${APP_HEADER_HEIGHT_PX}px)`
        }}
      >
        <div className="h-full">{children}</div>
      </Content>

      <AdminMobileDrawer />
    </Layout>
  );
};

export default AdminMobileLayout;
