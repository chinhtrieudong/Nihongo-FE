import React from "react";
import { Button, Avatar, Switch } from "antd";
import { Menu, Sun, Moon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { openDrawer } from "../../store/slices/uiSlice";
import { useTheme } from "../../hooks/useTheme";

const MobileHeader: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.user.currentUser);
  const darkMode = useAppSelector(state => state.ui.darkMode);
  const { toggleTheme } = useTheme();

  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      '/lessons': 'Bài học',
      '/kanji': 'Hán tự',
      '/grammar': 'Ngữ pháp',
      '/pronunciation': 'Phát âm',

      '/tests': 'Thi JLPT',
      '/profile': 'Hồ sơ'
    };
    return titles[path] || 'Nihon Nào!';
  };

  return (
    <header className="mobile-header">
      <div className="mobile-header-content">
        {/* Left: Menu Button */}
        <Button
          type="text"
          icon={<Menu className="w-4 h-4" />}
          onClick={() => dispatch(openDrawer())}
          className="mobile-menu-btn"
          size="large"
        />

        {/* Center: Page Title */}
        <h1 className="mobile-page-title">
          {getPageTitle(location.pathname)}
        </h1>

        {/* Right: User Actions */}
        <div className="mobile-user-actions">
          <Switch
            size="small"
            checked={darkMode}
            onChange={() => toggleTheme()}
            checkedChildren={<Moon className="w-4 h-4" />}
            unCheckedChildren={<Sun className="w-4 h-4" />}
          />
          <Avatar
            size="small"
            style={{ backgroundColor: '#1890ff' }}
          >
            {currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
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
          background: rgba(30, 41, 59, 0.8);
          border-bottom: 1px solid #334155;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(8px);
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
          font-size: 18px;
          font-weight: 600;
          margin: 0 16px;
          color: var(--text-main);
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
      `}</style>
    </header>
  );
};

export default MobileHeader;
