import React from "react";
import { Card as AntCard, CardProps as AntCardProps } from "antd";

export interface CardProps extends Omit<AntCardProps, 'type' | 'variant'> {
    variant?: "outlined" | "borderless";
    padding?: "none" | "small" | "medium" | "large";
    hoverable?: boolean;
    children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
    variant = "outlined",
    padding = "medium",
    hoverable = false,
    children,
    className = "",
    style,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            borderRadius: "12px",
            transition: "all 0.2s ease",
        };

        switch (variant) {
            case "borderless":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    border: "none",
                    boxShadow: "none",
                };
            case "outlined":
            default:
                return {
                    ...baseStyles,
                    backgroundColor: "var(--bg)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                };
        }
    };

    const getPaddingStyles = (): React.CSSProperties => {
        switch (padding) {
            case "none":
                return { padding: 0 };
            case "small":
                return { padding: "12px" };
            case "large":
                return { padding: "32px" };
            case "medium":
            default:
                return { padding: "20px" };
        }
    };

    const getHoverStyles = (): React.CSSProperties => {
        if (!hoverable) return {};
        return {
            cursor: "pointer",
            transition: "all 0.2s ease",
        };
    };

    return (
        <AntCard
            hoverable={hoverable}
            className={className}
            style={{
                ...getVariantStyles(),
                ...getPaddingStyles(),
                ...getHoverStyles(),
                ...style,
            }}
            styles={{
                body: {
                    padding: 0,
                },
            }}
            {...props}
        >
            {children}
        </AntCard>
    );
};

// Card Sub-components
interface CardHeaderProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    extra?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    subtitle,
    extra,
    className = "",
    style,
}) => {
    return (
        <div
            className={`card-header ${className}`}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                ...style,
            }}
        >
            <div>
                {title && (
                    <h3
                        style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: 600,
                            color: "var(--text-main)",
                            lineHeight: 1.4,
                        }}
                    >
                        {title}
                    </h3>
                )}
                {subtitle && (
                    <p
                        style={{
                            margin: "4px 0 0 0",
                            fontSize: "14px",
                            color: "var(--text-sub)",
                            lineHeight: 1.5,
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>
            {extra && <div className="card-header-extra">{extra}</div>}
        </div>
    );
};

interface CardBodyProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const CardBody: React.FC<CardBodyProps> = ({
    children,
    className = "",
    style,
}) => {
    return (
        <div
            className={`card-body ${className}`}
            style={{
                flex: 1,
                ...style,
            }}
        >
            {children}
        </div>
    );
};

interface CardFooterProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const CardFooter: React.FC<CardFooterProps> = ({
    children,
    className = "",
    style,
}) => {
    return (
        <div
            className={`card-footer ${className}`}
            style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "8px",
                ...style,
            }}
        >
            {children}
        </div>
    );
};

// Export all components
export { Card, CardHeader, CardBody, CardFooter };
export default Card;