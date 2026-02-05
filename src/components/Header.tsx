import React from "react";
import { Layout, Button, Switch, Tooltip } from "antd";
import { MenuOutlined, LogoutOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { toggleSidebar, toggleDarkMode } from "../store/slices/uiSlice";
import { logoutUser } from "../store/slices/userSlice";

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <AntHeader
      className="bg-white dark:bg-secondary-925 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-center"
      style={{
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div className="flex items-center justify-between w-full max-w-7xl">
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
          <Switch
            checked={darkMode}
            onChange={() => dispatch(toggleDarkMode())}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />

          <Tooltip title="Đăng xuất" placement="bottom">
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="flex items-center justify-center"
            />
          </Tooltip>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
