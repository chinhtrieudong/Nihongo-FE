import React from "react";
import { Card, Avatar, Tag } from "antd";

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
            <div className="divide-y divide-black/10 dark:divide-white/10">
                {activities.map((item, index) => (
                    <div
                        key={`${item.action}-${index}`}
                        className="flex items-center gap-3 py-3"
                    >
                        <Avatar
                            icon={item.icon}
                            className="bg-blue-100 text-blue-600"
                        />
                        <div className="flex-1">
                            <div className="text-sm font-medium">{item.action}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {item.time}
                            </div>
                        </div>
                        {item.score && <Tag color="success">{item.score}</Tag>}
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RecentActivity;
