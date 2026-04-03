import React from "react";
import { Layout, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import { Database, Home } from "lucide-react";
import { APP_HEADER_HEIGHT_PX, APP_SIDEBAR_SIZE_PX } from "../../constants/layout";

const { Sider } = Layout;

const menuItems = [
  {
    key: "/admin",
    icon: <Database className="w-5 h-5" />,
    label: "Quản trị dữ liệu",
  },
  {
    key: "/lessons",
    icon: <Home className="w-5 h-5" />,
    label: "Khu học viên",
  },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Sider
      width={APP_SIDEBAR_SIZE_PX}
      className="app-sidebar bg-white dark:bg-secondary-925 border-r-0"
      style={{
        overflow: "hidden",
        height: `calc(100vh - ${APP_HEADER_HEIGHT_PX}px)`,
        position: "fixed",
        left: 0,
        top: APP_HEADER_HEIGHT_PX,
        bottom: 0,
        zIndex: 40,
        background: "var(--ant-color-bg-container, #ffffff)",
        fontFamily: "var(--app-font-family)",
      }}
    >
      <div className="h-full flex flex-col py-4">
        <nav className="flex flex-col items-center gap-2 px-3 flex-1">
          {menuItems.map((item) => {
            const isAdminRoot =
              item.key === "/admin" && location.pathname.startsWith("/admin");
            const isActive = isAdminRoot || location.pathname === item.key;

            return (
              <Tooltip key={item.key} title={item.label} placement="right">
                <Link
                  to={item.key}
                  className={[
                    "w-full rounded-2xl px-2 py-3",
                    "flex flex-col items-center justify-center gap-1",
                    "text-xs font-medium",
                    "transition-colors",
                    isActive
                      ? "bg-slate-100 text-slate-900 shadow-sm dark:bg-secondary-800 dark:text-secondary-100"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-secondary-300 dark:hover:bg-secondary-800/50 dark:hover:text-secondary-100",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-xl leading-none",
                      isActive
                        ? "text-slate-700 dark:text-secondary-100"
                        : "text-slate-500 dark:text-secondary-300",
                    ].join(" ")}
                  >
                    {item.icon}
                  </span>
                  <span className="text-center leading-tight">{item.label}</span>
                </Link>
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </Sider>
  );
};

export default AdminSidebar;
