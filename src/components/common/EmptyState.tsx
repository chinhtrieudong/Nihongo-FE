import React from 'react';
import { Empty } from 'antd';

interface EmptyStateProps {
    description?: string | React.ReactNode;
    image?: React.ReactNode;
    className?: string;
    children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    description = "Không có dữ liệu",
    image,
    className,
    children,
}) => {
    return (
        <Empty
            description={description}
            image={image || Empty.PRESENTED_IMAGE_SIMPLE}
            className={className}
        >
            {children}
        </Empty>
    );
};

export default EmptyState;