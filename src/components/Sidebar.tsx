import React from "react";
import { Layout, Menu, Typography, Space } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
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
      className="bg-white dark:bg-secondary-925 border-r border-secondary-200 dark:border-secondary-900"
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-900">
        <div className="flex items-center h-8">
          {/* Logo */}
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            日
          </div>

          {/* Title */}
          <div
            className={`ml-3 transition-all duration-200 overflow-hidden ${sidebarOpen ? "opacity-100 w-[160px]" : "opacity-0 w-0"
              }`}
          >
            <Title level={4} className="!mb-0 text-blue-600 font-bold whitespace-nowrap">
              Nihongo
            </Title>
          </div>
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        className="border-none bg-transparent"
        items={menuItems}
        style={{ padding: '16px' }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200 dark:border-secondary-900">
        <div className={`text-xs text-secondary-700 dark:text-secondary-400 ${sidebarOpen ? 'text-left' : 'text-center'}`}>
          {sidebarOpen ? 'Nihongo v1.0' : 'v1.0'}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
