import React from "react";
import { Layout, Button, Dropdown, Avatar } from "antd";
import { LogOut, Sun, Moon } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { toggleDarkMode } from "../../store/slices/uiSlice";
import { logoutUser } from "../../store/slices/userSlice";
import { APP_HEADER_HEIGHT_PX } from "../../constants/layout";
import { useTheme } from "../../hooks/useTheme";

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { darkMode } = useAppSelector((state) => state.ui);
  const { currentUser } = useAppSelector((state) => state.user);
  const { toggleTheme } = useTheme();

  const displayName = currentUser?.username || currentUser?.email || "User";
  const displayEmail = currentUser?.email || "";

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <AntHeader
      className="app-header backdrop-blur flex items-center justify-start border-l-0"
      style={{
        padding: "0 12px",
        height: APP_HEADER_HEIGHT_PX,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: "var(--surface-2)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img
            src="/Logo.svg"
            alt="Nihon Nào!"
            className="w-9 h-9 select-none"
            draggable={false}
          />
          <div
            className="text-lg font-semibold text-text-main"
          >
            Nihon Nào!
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleThemeToggle}
            className="theme-toggle relative w-12 h-7 rounded-full p-1 transition-all duration-500 ease-spring focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(135deg, #60a5fa 0%, #fbbf24 100%)'
            }}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div 
              className={`absolute top-1 w-5 h-5 rounded-full shadow-lg transform transition-all duration-500 ease-spring flex items-center justify-center ${
                darkMode 
                  ? 'translate-x-5 bg-slate-800' 
                  : 'translate-x-0 bg-white'
              }`}
            >
              {darkMode ? (
                <Moon className="w-3 h-3 text-blue-300" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full overflow-hidden">
              {darkMode ? (
                <>
                  <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" />
                  <div className="absolute top-2 left-4 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse delay-75" />
                  <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/25 rounded-full animate-pulse delay-150" />
                </>
              ) : (
                <>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full blur-sm" />
                  <div className="absolute top-0 right-2 w-2 h-2 bg-yellow-300/40 rounded-full blur-sm" />
                </>
              )}
            </div>
          </button>

          <Dropdown
            placement="bottomRight"
            trigger={["click"]}
            popupRender={() => (
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
                  <LogOut className="w-4 h-4" />
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
          background: var(--primary);
        }
        .header-user-menu {
          min-width: 260px;
          background: var(--bg);
          border-radius: 12px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.18);
          border: 1px solid var(--border);
          padding: 12px;
        }
        .header-user-meta {
          padding: 4px 6px 10px;
        }
        .header-user-name {
          font-weight: 600;
          color: var(--text-main);
        }
        .header-user-email {
          font-size: 12px;
          color: var(--text-sub);
        }
        .header-user-divider {
          height: 1px;
          background: var(--border);
          margin: 6px 0;
        }
        .header-user-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--error);
          font-weight: 600;
          padding: 10px 8px;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .header-user-logout:hover {
          background: var(--hover-bg);
        }
      `}</style>
    </AntHeader>
  );
};

export default Header;
