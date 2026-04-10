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
        <Card
            title={<span className="font-semibold">Hoạt động gần đây</span>}
            className="bg-surface-1 border border-border"
            styles={{ body: { padding: '12px 0' } }}
        >
            <div className="divide-y divide-black/10 dark:divide-white/10">
                {activities.map((item, index) => (
                    <div
                        key={`${item.action}-${index}`}
                        className="flex items-center gap-3 py-3 px-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <Avatar
                            icon={item.icon}
                            className="bg-blue-100 text-blue-600"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.action}</div>
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
