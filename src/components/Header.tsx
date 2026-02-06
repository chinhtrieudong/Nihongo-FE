import React from "react";
import { Layout, Button, Switch, Dropdown, Avatar } from "antd";
import { LogoutOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { toggleDarkMode } from "../store/slices/uiSlice";
import { logoutUser } from "../store/slices/userSlice";

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { currentUser } = useAppSelector((state) => state.user);

  const displayName = currentUser?.username || currentUser?.email || "User";
  const displayEmail = currentUser?.email || "";

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <AntHeader
      className="bg-white dark:bg-secondary-925 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-center border-l-0"
      style={{
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div className="flex items-center justify-between w-full max-w-7xl">
        <div
          className="text-lg font-semibold text-secondary-900 dark:text-secondary-100"
          style={{ fontFamily: "\"Caveat\", cursive" }}
        >
          Nihon Nào!
        </div>

        <div className="flex items-center space-x-4">
          <Switch
            checked={darkMode}
            onChange={() => dispatch(toggleDarkMode())}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />

          <Dropdown
            placement="bottomRight"
            trigger={["click"]}
            dropdownRender={() => (
              <div className="header-user-menu">
                <div className="header-user-meta">
                  <div className="header-user-name">{displayName}</div>
                  {displayEmail && (
                    <div className="header-user-email">{displayEmail}</div>
                  )}
                </div>
                <div className="header-user-divider" />
                <button
                  type="button"
                  className="header-user-logout"
                  onClick={handleLogout}
                >
                  <LogoutOutlined />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          >
            <Button type="text" className="header-user-trigger">
              <Avatar size={32} className="header-user-avatar">
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </Button>
          </Dropdown>
        </div>
      </div>
      <style>{`
        .header-user-trigger {
          padding: 0;
          height: auto;
        }
        .header-user-avatar {
          background: #3b82f6;
        }
        .header-user-menu {
          min-width: 260px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
          border: 1px solid #e5e7eb;
          padding: 12px;
        }
        .dark .header-user-menu {
          background: #111827;
          border-color: #374151;
        }
        .header-user-meta {
          padding: 4px 6px 10px;
        }
        .header-user-name {
          font-weight: 600;
          color: #111827;
        }
        .dark .header-user-name {
          color: #f9fafb;
        }
        .header-user-email {
          font-size: 12px;
          color: #6b7280;
        }
        .dark .header-user-email {
          color: #9ca3af;
        }
        .header-user-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 6px 0;
        }
        .dark .header-user-divider {
          background: #374151;
        }
        .header-user-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ef4444;
          font-weight: 600;
          padding: 10px 8px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .header-user-logout:hover {
          background: #fee2e2;
        }
        .dark .header-user-logout:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </AntHeader>
  );
};

export default Header;
