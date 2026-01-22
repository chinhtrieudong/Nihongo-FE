import React from "react";
import { Card, List, Avatar, Tag } from "antd";
import {
    TrophyOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    FireOutlined
} from "@ant-design/icons";

interface ActivityItem {
    action: string;
    time: string;
    score?: string;
    icon: React.ReactNode;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    return (
        <Card title="Hoạt động gần đây">
            <List
                dataSource={activities}
                renderItem={(item) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={item.icon} className="bg-blue-100 text-blue-600" />}
                            title={item.action}
                            description={item.time}
                        />
                        {item.score && <Tag color="success">{item.score}</Tag>}
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default RecentActivity;
