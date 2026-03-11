import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar";
import AdminMobileLayout from "./AdminMobileLayout";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setMobile } from "../store/slices/uiSlice";
import { APP_HEADER_HEIGHT_PX, APP_SIDEBAR_SIZE_PX } from "../constants/layout";

const { Content } = AntLayout;

const AdminLayout: React.FC = () => {
  const { isMobile } = useAppSelector((state) => state.ui);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      dispatch(setMobile(mobile));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  if (isMobile) {
    return (
      <AdminMobileLayout>
        <Outlet />
      </AdminMobileLayout>
    );
  }

  return (
    <AntLayout className="min-h-screen app-surface">
      <Header />
      <AdminSidebar />
      <AntLayout
        style={{
          marginLeft: APP_SIDEBAR_SIZE_PX,
          marginTop: APP_HEADER_HEIGHT_PX,
          transition: "margin-left 0.2s",
        }}
      >
        <Content
          className="theme-surface academic-canvas app-surface"
          style={{ minHeight: `calc(100vh - ${APP_HEADER_HEIGHT_PX}px)` }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AdminLayout;
