import React from "react";
import { Drawer, Button } from "antd";
import { X, Check, Database, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { closeDrawer } from "../../store/slices/uiSlice";

const AdminMobileDrawer: React.FC = () => {
  const { drawerOpen } = useAppSelector((state) => state.ui);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { key: "/admin", icon: <Database className="w-5 h-5" />, label: "Quản trị dữ liệu" },
    { key: "/lessons", icon: <Home className="w-5 h-5" />, label: "Khu học viên" },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    dispatch(closeDrawer());
  };

  const handleClose = () => {
    dispatch(closeDrawer());
  };

  return (
    <Drawer
      title={null}
      placement="left"
      open={drawerOpen}
      onClose={handleClose}
      size="default"
      closable={false}
      maskClosable={true}
      styles={{
        body: { padding: 0, background: 'var(--surface-2)', fontFamily: 'var(--app-font-family)' },
        header: { display: 'none' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
      className="mobile-drawer"
    >
      <div className="flex flex-col h-full bg-surface-2">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src="/Logo.svg" alt="Nihon Nào!" className="w-10 h-10 select-none" draggable={false} />
            <div>
              <h3 className="m-0 text-lg font-semibold text-text-main leading-tight">Admin</h3>
              <p className="m-0 text-xs text-text-sub">Quản lý dữ liệu</p>
            </div>
          </div>
          <Button
            type="text"
            icon={<X className="w-5 h-5 text-text-sub" />}
            onClick={handleClose}
            className="flex items-center justify-center"
          />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          {menuItems.map((item) => {
            const isAdminRoot =
              item.key === "/admin" && location.pathname.startsWith("/admin");
            const isActive = isAdminRoot || location.pathname === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.key)}
                className={[
                  "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border-none text-left",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "bg-transparent text-text-main hover:bg-hover-bg"
                ].join(" ")}
              >
                <span className={isActive ? "text-primary" : "text-text-sub"}>{item.icon}</span>
                <span className="flex-1 text-base">{item.label}</span>
                {isActive && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};

export default AdminMobileDrawer;
