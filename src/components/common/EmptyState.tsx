import React from 'react';
import { Empty, Button } from 'antd';
import { ArrowLeft, Search, FileX, Inbox } from 'lucide-react';

type EmptyType = 'default' | 'search' | 'error' | 'data';

interface EmptyStateProps {
    description?: string | React.ReactNode;
    title?: string;
    image?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
    type?: EmptyType;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    size?: 'default' | 'small' | 'large';
}

const typeConfig: Record<EmptyType, { icon: React.ReactNode; defaultDesc: string }> = {
    default: { icon: <Inbox className="w-16 h-16 text-text-muted" />, defaultDesc: 'Không có dữ liệu' },
    search: { icon: <Search className="w-16 h-16 text-text-muted" />, defaultDesc: 'Không tìm thấy kết quả' },
    error: { icon: <FileX className="w-16 h-16 text-text-muted" />, defaultDesc: 'Không thể tải dữ liệu' },
    data: { icon: <Inbox className="w-16 h-16 text-text-muted" />, defaultDesc: 'Chưa có dữ liệu' },
};

const sizeClasses = {
    small: 'py-8',
    default: 'py-12',
    large: 'py-20',
};

const EmptyState: React.FC<EmptyStateProps> = ({
    description,
    title,
    image,
    className = '',
    children,
    type = 'default',
    action,
    size = 'default',
}) => {
    const config = typeConfig[type];
    const finalDescription = description || config.defaultDesc;
    const sizeClass = sizeClasses[size];

    return (
        <div className={`flex flex-col items-center justify-center ${sizeClass} ${className}`}>
            <Empty
                image={image || config.icon}
                description={null}
                className="mb-4"
            />
            <div className="text-center max-w-md px-4">
                {title && (
                    <h3 className="text-lg font-semibold text-text-main mb-2">
                        {title}
                    </h3>
                )}
                <div className="text-text-sub text-sm leading-relaxed">
                    {finalDescription}
                </div>
            </div>
            {(action || children) && (
                <div className="mt-6 flex gap-3">
                    {action && (
                        <Button
                            type="primary"
                            onClick={action.onClick}
                            icon={action.icon || <ArrowLeft className="w-4 h-4" />}
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