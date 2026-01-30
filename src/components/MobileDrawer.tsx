import React from "react";
import { Drawer, Button } from "antd";
import { CloseOutlined, CheckOutlined, BookOutlined, ReadOutlined, ExperimentOutlined, SoundOutlined, MessageOutlined, AimOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { closeDrawer } from "../store/slices/uiSlice";

const MobileDrawer: React.FC = () => {
  const { drawerOpen } = useAppSelector(state => state.ui);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { key: '/lessons', icon: <BookOutlined />, label: 'Bài học' },
    { key: '/kanji', icon: <ReadOutlined />, label: 'Hán tự' },
    { key: '/grammar', icon: <ExperimentOutlined />, label: 'Ngữ pháp' },
    { key: '/pronunciation', icon: <SoundOutlined />, label: 'Phát âm' },
    { key: '/conversation', icon: <MessageOutlined />, label: 'Hội thoại' },
    { key: '/tests', icon: <AimOutlined />, label: 'Thi JLPT' },
    { key: '/profile', icon: <UserOutlined />, label: 'Hồ sơ' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    dispatch(closeDrawer()); // Đóng ngay lập tức
  };

  const handleClose = () => {
    dispatch(closeDrawer());
  };

  return (
    <Drawer
      title={null}  // Tắt header mặc định
      placement="left"
      open={drawerOpen}
      onClose={handleClose}
      width="78vw"  // ✅ KHÔNG full màn hình
      closable={false}  // Tắt nút close mặc định
      maskClosable={true}  // Tap overlay để đóng
      styles={{
        body: { padding: 0 },
        header: { display: 'none' }
      }}
      className="mobile-drawer"
    >
      {/* Custom Header */}
      <div className="mobile-drawer-header">
        <div className="drawer-logo">
          <div className="logo-icon">日</div>
          <div className="logo-text">
            <h3>Nihongo</h3>
            <p>Học tiếng Nhật</p>
          </div>
        </div>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          className="drawer-close-btn"
        />
      </div>

      {/* Menu Items */}
      <div className="mobile-drawer-menu">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`drawer-menu-item ${location.pathname === item.key ? 'active' : ''
              }`}
            onClick={() => handleMenuClick(item.key)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
            {location.pathname === item.key && (
              <CheckOutlined className="menu-check" />
            )}
          </button>
        ))}
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

        .drawer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        }

        .logo-text h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .logo-text p {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .mobile-drawer-menu {
          padding: 8px 0;
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

        .drawer-menu-item.active {
          background: #eff6ff;
          color: #2563eb;
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

        .drawer-menu-item.active .menu-icon {
          color: #2563eb;
        }

        .menu-label {
          flex: 1;
          font-weight: 500;
        }

        .menu-check {
          color: #2563eb;
          font-size: 14px;
        }
      `}</style>
    </Drawer>
  );
};

export default MobileDrawer;
