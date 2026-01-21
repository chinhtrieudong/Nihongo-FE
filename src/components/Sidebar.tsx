import React from "react";
import { Layout, Menu, Typography, Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  BookOutlined,
  ReadOutlined,
  ExperimentOutlined,
  SoundOutlined,
  MessageOutlined,
  AimOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../store/hooks";

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen } = useAppSelector((state) => state.ui);

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/lessons",
      icon: <BookOutlined />,
      label: <Link to="/lessons">Bài học</Link>,
    },
    {
      key: "/kanji",
      icon: <ReadOutlined />,
      label: <Link to="/kanji">Hán tự</Link>,
    },
    {
      key: "/grammar",
      icon: <ExperimentOutlined />,
      label: <Link to="/grammar">Ngữ pháp</Link>,
    },
    {
      key: "/pronunciation",
      icon: <SoundOutlined />,
      label: <Link to="/pronunciation">Phát âm</Link>,
    },
    {
      key: "/conversation",
      icon: <MessageOutlined />,
      label: <Link to="/conversation">Hội thoại</Link>,
    },
    {
      key: "/tests",
      icon: <AimOutlined />,
      label: <Link to="/tests">Thi JLPT</Link>,
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ</Link>,
    },
  ];

  return (
    <Sider
      collapsed={!sidebarOpen}
      collapsedWidth={64}
      width={256}
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={`flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            日
          </div>
          {sidebarOpen && (
            <Title level={4} className="!mb-0 !ml-3 text-blue-600 font-bold">
              Nihongo
            </Title>
          )}
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="border-none bg-transparent"
        items={menuItems}
        style={{ padding: '16px' }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`text-xs text-gray-500 dark:text-gray-400 ${sidebarOpen ? 'text-left' : 'text-center'}`}>
          {sidebarOpen ? 'Nihongo Master v1.0' : 'v1.0'}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
