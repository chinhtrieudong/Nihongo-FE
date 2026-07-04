import React from "react";
import { Button, Avatar, Dropdown } from "antd";
import { Menu, Sun, Moon, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { openDrawer } from "../../store/slices/uiSlice";
import { logoutUser } from "../../store/slices/userSlice";
import { useTheme } from "../../hooks/useTheme";
import { APP_HEADER_HEIGHT_PX } from "../../constants/layout";

const MobileHeader: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.user.currentUser);
  const darkMode = useAppSelector(state => state.ui.darkMode);
  const { toggleTheme } = useTheme();

  const displayName = currentUser?.username || currentUser?.email || "User";
  const displayEmail = currentUser?.email || "";

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const getPageTitle = (path: string) => {
    const titles: Record<string, string> = {
      '/': 'Từ vựng',
      '/kanji': 'Hán tự',
      '/grammar': 'Ngữ pháp',
      '/pronunciation': 'Phát âm',
      '/practice': 'Luyện tập',
      '/tests': 'Thi JLPT',
      '/profile': 'Hồ sơ'
    };
    if (path.startsWith('/mina/')) return 'Từ vựng';
    if (path.startsWith('/lessons')) return 'Bài học';
    return titles[path] || 'Nihon Nào!';
  };

  return (
    <header 
      className="mobile-header fixed top-0 left-0 right-0 z-50 flex items-center justify-between backdrop-blur-md bg-surface-2/90 border-b border-border transition-colors"
      style={{ height: APP_HEADER_HEIGHT_PX }}
    >
      <div className="flex items-center justify-between w-full h-full px-4">
        {/* Left: Menu Button */}
        <Button
          type="text"
          icon={<Menu className="w-5 h-5 text-text-main" />}
          onClick={() => dispatch(openDrawer())}
          className="flex items-center justify-center -ml-2"
          size="large"
        />

        {/* Center: Page Title */}
        <h1 className="flex-1 text-center text-lg font-semibold m-0 px-4 text-text-main truncate">
          {getPageTitle(location.pathname)}
        </h1>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => toggleTheme()}
            className="relative w-11 h-6 rounded-full p-1 transition-all duration-500 ease-out focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                : 'linear-gradient(135deg, #60a5fa 0%, #fbbf24 100%)'
            }}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div 
              className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transform transition-all duration-500 ease-out flex items-center justify-center ${
                darkMode 
                  ? 'translate-x-5 bg-slate-700' 
                  : 'translate-x-0 bg-white'
              }`}
            >
              {darkMode ? (
                <Moon className="w-3 h-3 text-blue-300" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </button>
          
          <Dropdown
            placement="bottomRight"
            trigger={["click"]}
            popupRender={() => (
              <div className="min-w-[240px] bg-bg rounded-xl shadow-lg border border-border p-3">
                <div className="px-2 pb-3">
                  <div className="font-semibold text-text-main">{displayName}</div>
                  {displayEmail && (
                    <div className="text-xs text-text-sub mt-0.5">{displayEmail}</div>
                  )}
                </div>
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  className="w-full flex items-center gap-2 text-error font-semibold p-2.5 rounded-lg bg-transparent border-none cursor-pointer hover:bg-hover-bg"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          >
            <Button type="text" className="p-0 h-auto flex items-center justify-center -mr-2">
              <Avatar
                size={30}
                className="bg-primary text-white font-medium"
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
