import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileLayout from "./MobileLayout";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setMobile } from "../store/slices/uiSlice";

const { Content } = AntLayout;

const Layout: React.FC = () => {
  const { isMobile, sidebarOpen } = useAppSelector(state => state.ui);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      dispatch(setMobile(mobile));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  // ✅ HOÀN TOÀN TÁCH BIỆT
  if (isMobile) {
    return <MobileLayout><Outlet /></MobileLayout>;
  }

  // Desktop Layout
  return (
    <AntLayout className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <Sidebar />
      <AntLayout style={{ marginLeft: sidebarOpen ? 200 : 64, transition: 'margin-left 0.2s' }}>
        <Header />
        <Content className="overflow-auto theme-surface" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
