import React from "react";
import { Layout } from "antd";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";

const { Content } = Layout;

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <Layout className="mobile-layout app-surface">
      {/* Fixed Header */}
      <MobileHeader />

      {/* Main Content */}
      <Content className="mobile-main-content academic-canvas app-surface">
        <div className="">
          {children}
        </div>
      </Content>

      {/* Drawer (hidden by default) */}
      <MobileDrawer />

      <style>{`
        .mobile-layout {
          min-height: 100vh;
        }

        .mobile-main-content {
          width: 100%;
          margin-left: 0;  /* ✅ QUAN TRỌNG: Không bị đẩy ngang */
          padding-top: 56px;  /* Header height */
          min-height: calc(100vh - 56px);
        }
      `}</style>
    </Layout>
  );
};

export default MobileLayout;
