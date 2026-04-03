import React from "react";
import { Button, Avatar, Switch } from "antd";
import { Menu, Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { openDrawer } from "../../store/slices/uiSlice";
import { useTheme } from "../../hooks/useTheme";

const AdminMobileHeader: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const { toggleTheme } = useTheme();

  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      "/admin": "Quản trị dữ liệu",
      "/lessons": "Khu học viên",
    };
    return titles[path] || "Admin";
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        <Button
          type="text"
          icon={<Menu className="w-4 h-4" />}
          onClick={() => dispatch(openDrawer())}
          className="mobile-menu-btn"
          size="large"
        />

        <h1 className="mobile-page-title">{getPageTitle(location.pathname)}</h1>

        <div className="mobile-user-actions">
          <Switch
            size="small"
            checked={darkMode}
            onChange={() => toggleTheme()}
            checkedChildren={<Moon className="w-4 h-4" />}
            unCheckedChildren={<Sun className="w-4 h-4" />}
          />
          <Avatar size="small" style={{ backgroundColor: "#1890ff" }}>
            {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
          </Avatar>
        </div>
      </div>

      <style>{`
        .mobile-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          z-index: 100;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 16px;
        }

        .mobile-page-title {
          flex: 1;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          margin: 0 10px;
          color: #111827;
        }

        .mobile-user-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .mobile-menu-btn {
          flex-shrink: 0;
        }

        .dark .mobile-header {
          background: #1f2937;
          border-bottom-color: #374151;
        }

        .dark .mobile-page-title {
          color: #f9fafb;
        }
      `}</style>
    </header>
  );
};

export default AdminMobileHeader;
