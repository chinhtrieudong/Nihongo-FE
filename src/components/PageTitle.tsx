import React from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

export type PageTitleAlign = "left" | "center";

export type PageTitleProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  align?: PageTitleAlign;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  icon,
  extra,
  align = "left",
  className,
  titleClassName,
  subtitleClassName,
}) => {
  const isCenter = align === "center";

  return (
    <div
      className={[
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        isCenter ? "text-center sm:text-left" : "",
        className || "",
      ].join(" ")}
    >
      <div className={["min-w-0", isCenter ? "w-full" : ""].join(" ")}>
        <Title
          level={2}
          className={[
            "!mb-1 !leading-tight !font-semibold tracking-tight !text-xl sm:!text-3xl !text-secondary-900 dark:!text-secondary-100",
            titleClassName || "",
          ].join(" ")}
        >
          <span className="inline-flex items-center gap-3">
            {icon ? <span className="inline-flex items-center justify-center">{icon}</span> : null}
            <span className="align-middle">{title}</span>
          </span>
        </Title>
        {subtitle ? (
          <Text
            className={[
              "block text-sm sm:text-base text-secondary-600 dark:text-secondary-400",
              subtitleClassName || "",
            ].join(" ")}
          >
            {subtitle}
          </Text>
        ) : null}
      </div>

      {extra ? (
        <div className={["flex items-center gap-2", isCenter ? "justify-center" : ""].join(" ")}>
          {extra}
        </div>
      ) : null}
    </div>
  );
};

export default PageTitle;
