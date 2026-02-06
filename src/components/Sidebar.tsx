import React from "react";
import { Layout, Typography } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ReadOutlined,
  ExperimentOutlined,
  SoundOutlined,
  MessageOutlined,
  AimOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;
const { Title } = Typography;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const menuItems = [
    {
      key: "/lessons",
      icon: <HomeOutlined />,
      label: <Link to="/lessons">Trang chủ</Link>,
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

  // Desktop Sidebar Only
  return (
    <Sider
      width={96}
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
      <div className="pt-4 pb-3 flex items-center justify-center">
        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
          日
        </div>
      </div>

      <nav className="flex flex-col items-center gap-3 px-3 py-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.key;
          return (
            <Link
              key={item.key}
              to={item.key}
              className={`w-full rounded-2xl px-2 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-secondary-100 text-secondary-900 dark:bg-secondary-800 dark:text-secondary-100"
                  : "text-secondary-500 hover:bg-secondary-100/70 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800/60 dark:hover:text-secondary-100"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-center leading-tight">
                {typeof item.label === "string" ? item.label : (item.label as any).props.children}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4" />
    </Sider>
  );
};

export default Sidebar;
