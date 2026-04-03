import React from "react";
import { Layout, Button, Dropdown, Avatar, Space, Typography } from "antd";
import {
    User,
    LogOut,
    PanelLeftClose,
    PanelLeft,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logoutUser } from "../../store/slices/userSlice";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface AdminHeaderProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ collapsed, onToggle }) => {
    const dispatch = useAppDispatch();
    const { currentUser } = useAppSelector((state) => state.user);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    const userMenuItems = [
        {
            key: "profile",
            label: <Text>{currentUser?.username || "Admin"}</Text>,
            disabled: true,
        },
        {
            type: "divider" as const,
        },
        {
            key: "logout",
            icon: <LogOut className="w-4 h-4" />,
            label: "Đăng xuất",
            onClick: handleLogout,
        },
    ];

    return (
        <AntHeader
            style={{
                padding: "0 24px",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #f0f0f0",
            }}
        >
            <Button
                type="text"
                icon={collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                onClick={onToggle}
                style={{ fontSize: "16px", width: 64, height: 64 }}
            />
            <Space>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                    <Space style={{ cursor: "pointer" }}>
                        <Avatar icon={<User className="w-4 h-4" />} />
                        <Text>{currentUser?.username || "Admin"}</Text>
                    </Space>
                </Dropdown>
            </Space>
        </AntHeader>
    );
};

export default AdminHeader;