import React from "react";
import { Layout, Button, Avatar, Dropdown, Space, Switch, Typography, type MenuProps } from "antd";
import { MenuOutlined, UserOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { toggleSidebar, toggleDarkMode } from "../store/slices/uiSlice";
import { logout } from "../store/slices/userSlice";

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { darkMode } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      className="bg-white dark:bg-secondary-925 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between"
      style={{ padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}
    >
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center justify-center"
          size="large"
        />
      </div>

      <div className="flex items-center space-x-4">
        <Space>
          <Switch
            checked={darkMode}
            onChange={() => dispatch(toggleDarkMode())}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
        </Space>

        {currentUser && (
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
              <Avatar
                size="default"
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
              >
                {currentUser.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <span className="text-sm font-medium">
                {currentUser.fullName}
              </span>
            </Space>
          </Dropdown>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
