import React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends Omit<AntButtonProps, 'variant'> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "small" | "middle" | "large";
    loading?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "middle",
    loading = false,
    icon,
    children,
    className = "",
    style,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            borderRadius: "8px",
            fontWeight: 500,
            transition: "all 0.2s ease",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
        };

        switch (variant) {
            case "primary":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--primary)",
                    borderColor: "var(--primary)",
                    color: "#ffffff",
                };
            case "secondary":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--secondary)",
                    borderColor: "var(--secondary)",
                    color: "#ffffff",
                };
            case "outline":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                };
            case "ghost":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    color: "var(--primary)",
                };
            case "danger":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--error)",
                    borderColor: "var(--error)",
                    color: "#ffffff",
                };
            default:
                return baseStyles;
        }
    };

    const getSizeStyles = (): React.CSSProperties => {
        switch (size) {
            case "small":
                return { height: "32px", padding: "0 12px", fontSize: "14px" };
            case "large":
                return { height: "48px", padding: "0 24px", fontSize: "16px" };
            default:
                return { height: "40px", padding: "0 16px", fontSize: "14px" };
        }
    };

    return (
        <AntButton
            type={variant === "primary" ? "primary" : "default"}
            size={size}
            loading={loading}
            icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
            className={className}
            style={{
                ...getVariantStyles(),
                ...getSizeStyles(),
                ...style,
            }}
            {...props}
        >
            {children}
        </AntButton>
    );
};

export default Button;