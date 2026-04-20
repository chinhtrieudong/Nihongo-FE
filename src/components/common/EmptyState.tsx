import React from 'react';
import { Button } from 'antd';
import { ArrowLeft, Search, FileX, Inbox, RefreshCcw } from 'lucide-react';

type EmptyType = 'default' | 'search' | 'error' | 'data';

interface EmptyStateProps {
    description?: string | React.ReactNode;
    title?: string;
    image?: React.ReactNode;
    children?: React.ReactNode;
    type?: EmptyType;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    size?: 'default' | 'small' | 'large';
}

const typeConfig: Record<EmptyType, {
    icon: React.ReactNode;
    defaultDesc: string;
    bgColor: string;
    iconColor: string;
    iconBg: string;
}> = {
    default: {
        icon: <Inbox className="w-12 h-12" />,
        defaultDesc: 'Không có dữ liệu',
        bgColor: 'from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50',
        iconColor: 'text-slate-400 dark:text-slate-500',
        iconBg: 'bg-slate-100 dark:bg-slate-800'
    },
    search: {
        icon: <Search className="w-12 h-12" />,
        defaultDesc: 'Không tìm thấy kết quả',
        bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        iconColor: 'text-blue-400 dark:text-blue-500',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    error: {
        icon: <FileX className="w-12 h-12" />,
        defaultDesc: 'Không thể tải dữ liệu',
        bgColor: 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20',
        iconColor: 'text-red-400 dark:text-red-500',
        iconBg: 'bg-red-100 dark:bg-red-900/30'
    },
    data: {
        icon: <Inbox className="w-12 h-12" />,
        defaultDesc: 'Chưa có dữ liệu',
        bgColor: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
        iconColor: 'text-amber-400 dark:text-amber-500',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30'
    },
};

const sizeClasses = {
    small: 'py-12',
    default: 'py-16',
    large: 'py-24',
};

const EmptyState: React.FC<EmptyStateProps> = ({
    description,
    title,
    image,
    children,
    type = 'default',
    action,
    size = 'default',
}) => {
    const config = typeConfig[type];
    const finalDescription = description || config.defaultDesc;
    const sizeClass = sizeClasses[size];

    return (
        <div className={`flex flex-col items-center justify-center ${sizeClass}`}>
            <div className={`relative mb-6`}>
                {/* Background glow effect */}
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 ${config.iconBg}`} />
                {/* Icon container */}
                <div className={`relative ${config.iconBg} rounded-3xl p-6 shadow-lg border border-white/20 dark:border-white/10`}>
                    <div className={`${config.iconColor} animate-pulse-slow`}>
                        {image || config.icon}
                    </div>
                </div>
            </div>

            <div className="text-center max-w-lg px-6">
                {title && (
                    <h3 className="text-2xl font-bold text-text-main mb-3">
                        {title}
                    </h3>
                )}
                <div className="text-text-sub text-base leading-relaxed">
                    {finalDescription}
                </div>
            </div>

            {(action || children) && (
                <div className="mt-8 flex gap-3">
                    {action && (
                        <Button
                            type="primary"
                            size="large"
                            onClick={action.onClick}
                            icon={action.icon || (type === 'error' ? <RefreshCcw className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />)}
                            className="h-12 px-8 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            {action.label}
                        </Button>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
};

export default EmptyState;