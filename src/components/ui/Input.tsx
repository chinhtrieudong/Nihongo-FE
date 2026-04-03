import React from "react";
import { Input as AntInput, InputProps as AntInputProps } from "antd";
import { Search, EyeOff, Eye } from "lucide-react";

const { TextArea: AntTextArea, Password: AntPassword } = AntInput;

export interface InputProps extends Omit<AntInputProps, 'size' | 'variant'> {
    variant?: "outlined" | "filled" | "borderless" | "underlined";
    size?: "small" | "middle" | "large";
    label?: string;
    error?: string;
    helperText?: string;
}

export interface TextAreaProps {
    variant?: "outlined" | "filled" | "borderless" | "underlined";
    size?: "small" | "middle" | "large";
    label?: string;
    error?: string;
    helperText?: string;
    rows?: number;
    maxLength?: number;
    showCount?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export interface PasswordProps extends Omit<AntInputProps, 'size' | 'variant'> {
    variant?: "outlined" | "filled" | "borderless" | "underlined";
    size?: "small" | "middle" | "large";
    label?: string;
    error?: string;
    helperText?: string;
    visibilityToggle?: boolean;
    iconRender?: (visible: boolean) => React.ReactNode;
}

export interface SearchInputProps extends Omit<AntInputProps, 'size' | 'variant'> {
    variant?: "outlined" | "filled" | "borderless" | "underlined";
    size?: "small" | "middle" | "large";
    label?: string;
    error?: string;
    helperText?: string;
    enterButton?: boolean | React.ReactNode;
    onSearch?: (value: string) => void;
}

const Input: React.FC<InputProps> = ({
    variant = "outlined",
    size = "middle",
    label,
    error,
    helperText,
    className = "",
    style,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            borderRadius: "8px",
            transition: "all 0.2s ease",
        };

        switch (variant) {
            case "filled":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--surface-3)",
                    borderColor: "transparent",
                };
            case "borderless":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    boxShadow: "none",
                };
            case "underlined":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    borderBottom: "1px solid var(--border)",
                    borderRadius: 0,
                };
            case "outlined":
            default:
                return {
                    ...baseStyles,
                    backgroundColor: "var(--bg)",
                    borderColor: error ? "var(--error)" : "var(--border)",
                };
        }
    };

    const getSizeStyles = (): React.CSSProperties => {
        switch (size) {
            case "small":
                return { height: "32px", fontSize: "14px" };
            case "large":
                return { height: "48px", fontSize: "16px" };
            default:
                return { height: "40px", fontSize: "14px" };
        }
    };

    return (
        <div className="input-wrapper">
            {label && (
                <label className="block text-sm font-medium text-text-main mb-1">
                    {label}
                </label>
            )}
            <AntInput
                size={size}
                className={className}
                style={{
                    ...getVariantStyles(),
                    ...getSizeStyles(),
                    ...style,
                }}
                status={error ? "error" : undefined}
                {...props}
            />
            {(error || helperText) && (
                <div className={`mt-1 text-sm ${error ? "text-error" : "text-text-sub"}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

const TextArea: React.FC<TextAreaProps> = ({
    variant = "outlined",
    size = "middle",
    label,
    error,
    helperText,
    rows = 4,
    maxLength,
    showCount = false,
    className = "",
    style,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            borderRadius: "8px",
            transition: "all 0.2s ease",
        };

        switch (variant) {
            case "filled":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--surface-3)",
                    borderColor: "transparent",
                };
            case "borderless":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    boxShadow: "none",
                };
            case "underlined":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    borderBottom: "1px solid var(--border)",
                    borderRadius: 0,
                };
            case "outlined":
            default:
                return {
                    ...baseStyles,
                    backgroundColor: "var(--bg)",
                    borderColor: error ? "var(--error)" : "var(--border)",
                };
        }
    };

    return (
        <div className="textarea-wrapper">
            {label && (
                <label className="block text-sm font-medium text-text-main mb-1">
                    {label}
                </label>
            )}
            <AntTextArea
                rows={rows}
                maxLength={maxLength}
                showCount={showCount}
                className={className}
                style={{
                    ...getVariantStyles(),
                    ...style,
                }}
                status={error ? "error" : undefined}
                {...props}
            />
            {(error || helperText) && (
                <div className={`mt-1 text-sm ${error ? "text-error" : "text-text-sub"}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

const Password: React.FC<PasswordProps> = ({
    variant = "outlined",
    size = "middle",
    label,
    error,
    helperText,
    visibilityToggle = true,
    iconRender,
    className = "",
    style,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            borderRadius: "8px",
            transition: "all 0.2s ease",
        };

        switch (variant) {
            case "filled":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--surface-3)",
                    borderColor: "transparent",
                };
            case "borderless":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    boxShadow: "none",
                };
            case "underlined":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    borderBottom: "1px solid var(--border)",
                    borderRadius: 0,
                };
            case "outlined":
            default:
                return {
                    ...baseStyles,
                    backgroundColor: "var(--bg)",
                    borderColor: error ? "var(--error)" : "var(--border)",
                };
        }
    };

    const getSizeStyles = (): React.CSSProperties => {
        switch (size) {
            case "small":
                return { height: "32px", fontSize: "14px" };
            case "large":
                return { height: "48px", fontSize: "16px" };
            default:
                return { height: "40px", fontSize: "14px" };
        }
    };

    const defaultIconRender = (visible: boolean) =>
        visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />;

    return (
        <div className="password-wrapper">
            {label && (
                <label className="block text-sm font-medium text-text-main mb-1">
                    {label}
                </label>
            )}
            <AntPassword
                size={size}
                visibilityToggle={visibilityToggle}
                iconRender={iconRender || defaultIconRender}
                className={className}
                style={{
                    ...getVariantStyles(),
                    ...getSizeStyles(),
                    ...style,
                }}
                status={error ? "error" : undefined}
                {...props}
            />
            {(error || helperText) && (
                <div className={`mt-1 text-sm ${error ? "text-error" : "text-text-sub"}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

const SearchInput: React.FC<SearchInputProps> = ({
    variant = "outlined",
    size = "middle",
    label,
    error,
    helperText,
    enterButton = true,
    onSearch,
    className = "",
    style,
    ...props
}) => {
    const getVariantStyles = (): React.CSSProperties => {
        const baseStyles: React.CSSProperties = {
            borderRadius: "8px",
            transition: "all 0.2s ease",
        };

        switch (variant) {
            case "filled":
                return {
                    ...baseStyles,
                    backgroundColor: "var(--surface-3)",
                    borderColor: "transparent",
                };
            case "borderless":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    boxShadow: "none",
                };
            case "underlined":
                return {
                    ...baseStyles,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    borderBottom: "1px solid var(--border)",
                    borderRadius: 0,
                };
            case "outlined":
            default:
                return {
                    ...baseStyles,
                    backgroundColor: "var(--bg)",
                    borderColor: error ? "var(--error)" : "var(--border)",
                };
        }
    };

    const getSizeStyles = (): React.CSSProperties => {
        switch (size) {
            case "small":
                return { height: "32px", fontSize: "14px" };
            case "large":
                return { height: "48px", fontSize: "16px" };
            default:
                return { height: "40px", fontSize: "14px" };
        }
    };

    return (
        <div className="search-input-wrapper">
            {label && (
                <label className="block text-sm font-medium text-text-main mb-1">
                    {label}
                </label>
            )}
            <AntInput
                size={size}
                prefix={<Search className="w-4 h-4 text-text-sub" />}
                className={className}
                style={{
                    ...getVariantStyles(),
                    ...getSizeStyles(),
                    ...style,
                }}
                status={error ? "error" : undefined}
                {...props}
            />
            {(error || helperText) && (
                <div className={`mt-1 text-sm ${error ? "text-error" : "text-text-sub"}`}>
                    {error || helperText}
                </div>
            )}
        </div>
    );
};

// Export all components
export { Input, TextArea, Password, SearchInput };
export default Input;