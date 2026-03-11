import React from "react";
import { Drawer, Button } from "antd";
import {
  CloseOutlined,
  CheckOutlined,
  DatabaseOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { closeDrawer } from "../store/slices/uiSlice";

const AdminMobileDrawer: React.FC = () => {
  const { drawerOpen } = useAppSelector((state) => state.ui);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { key: "/admin", icon: <DatabaseOutlined />, label: "Quản trị dữ liệu" },
    { key: "/lessons", icon: <HomeOutlined />, label: "Khu học viên" },
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
      maskClosable
      styles={{
        body: { padding: 0 },
        header: { display: "none" },
      }}
      className="mobile-drawer"
    >
      <div className="mobile-drawer-header">
        <div className="drawer-logo">
          <img src="/Logo.svg" alt="Nihon Nao" className="logo-icon" />
          <div className="logo-text">
            <h3>Admin</h3>
            <p>Quản lý dữ liệu</p>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          className="drawer-close-btn"
        />
      </div>

      <div className="mobile-drawer-menu">
        {menuItems.map((item) => {
          const isAdminRoot =
            item.key === "/admin" && location.pathname.startsWith("/admin");
          const isActive = isAdminRoot || location.pathname === item.key;

          return (
            <button
              key={item.key}
              className={`drawer-menu-item ${isActive ? "active" : ""}`}
              onClick={() => handleMenuClick(item.key)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {isActive && <CheckOutlined className="menu-check" />}
            </button>
          );
        })}
      </div>

      <style>{`
        .mobile-drawer .ant-drawer-body {
          padding: 0;
        }

        .mobile-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .dark .mobile-drawer-header {
          border-bottom-color: #374151;
          background: #1f2937;
        }

        .drawer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
        }

        .logo-text h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .dark .logo-text h3 {
          color: #f9fafb;
        }

        .logo-text p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .dark .logo-text p {
          color: #9ca3af;
        }

        .mobile-drawer-menu {
          padding: 0;
        }

        .drawer-menu-item {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 16px 20px;
          border: none;
          background: none;
          text-align: left;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .drawer-menu-item:hover {
          background: #f3f4f6;
        }

        .dark .drawer-menu-item:hover {
          background: #374151;
        }

        .drawer-menu-item.active {
          background: #eff6ff;
          color: #2563eb;
        }

        .dark .drawer-menu-item.active {
          background: #1e3a8a;
          color: #60a5fa;
        }

        .menu-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dark .menu-icon {
          color: #9ca3af;
        }

        .drawer-menu-item.active .menu-icon {
          color: #2563eb;
        }

        .dark .drawer-menu-item.active .menu-icon {
          color: #60a5fa;
        }

        .menu-label {
          flex: 1;
          font-weight: 500;
          color: #111827;
        }

        .dark .menu-label {
          color: #f9fafb;
        }

        .menu-check {
          color: #2563eb;
          font-size: 14px;
        }

        .dark .menu-check {
          color: #60a5fa;
        }

        .dark .ant-drawer-body {
          background: #111827;
        }
      `}</style>
    </Drawer>
  );
};

export default AdminMobileDrawer;
