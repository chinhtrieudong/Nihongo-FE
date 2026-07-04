import React from "react";
import { Layout } from "antd";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";
import { APP_HEADER_HEIGHT_PX } from "../../constants/layout";
import { useAppSelector } from "../../store/hooks";

const { Content } = Layout;

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { fontPreset } = useAppSelector(state => state.ui);
  
  return (
    <Layout 
      className="mobile-layout min-h-screen bg-bg"
      style={{ fontFamily: 'var(--app-font-family)' }}
    >
      {/* Fixed Header */}
      <MobileHeader />

      {/* Main Content */}
      <Content 
        className="mobile-main-content bg-surface-1 text-text-main w-full ml-0"
        style={{ 
          paddingTop: APP_HEADER_HEIGHT_PX,
          minHeight: `calc(100vh - ${APP_HEADER_HEIGHT_PX}px)`
        }}
      >
        <div className="h-full">
          {children}
        </div>
      </Content>

      {/* Drawer (hidden by default) */}
      <MobileDrawer />
    </Layout>
  );
};

export default MobileLayout;
