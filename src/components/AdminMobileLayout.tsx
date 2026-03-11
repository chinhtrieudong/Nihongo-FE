import React from "react";
import { Layout } from "antd";
import AdminMobileHeader from "./AdminMobileHeader";
import AdminMobileDrawer from "./AdminMobileDrawer";

const { Content } = Layout;

interface AdminMobileLayoutProps {
  children: React.ReactNode;
}

const AdminMobileLayout: React.FC<AdminMobileLayoutProps> = ({ children }) => {
  return (
    <Layout className="mobile-layout app-surface">
      <AdminMobileHeader />

      <Content className="mobile-main-content academic-canvas app-surface">
        <div>{children}</div>
      </Content>

      <AdminMobileDrawer />

      <style>{`
        .mobile-layout {
          min-height: 100vh;
        }

        .mobile-main-content {
          width: 100%;
          margin-left: 0;
          padding-top: 56px;
          min-height: calc(100vh - 56px);
        }
      `}</style>
    </Layout>
  );
};

export default AdminMobileLayout;
