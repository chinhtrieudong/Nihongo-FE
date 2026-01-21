import React from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout } from "antd";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAppSelector } from "../store/hooks";

const { Content } = AntLayout;

const Layout: React.FC = () => {
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  return (
    <AntLayout className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <AntLayout
        style={{
          marginLeft: sidebarOpen ? 256 : 64,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header />
        <Content className="overflow-auto" style={{ padding: '24px' }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
