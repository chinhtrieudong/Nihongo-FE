import React, { useMemo, useState } from "react";
import { Drawer, Layout, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ExperimentOutlined,
  SoundOutlined,
  MessageOutlined,
  AimOutlined,
  SettingOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { APP_HEADER_HEIGHT_PX, APP_SIDEBAR_SIZE_PX } from "../constants/layout";
import { FONT_PRESETS, getFontPreset } from "../constants/fonts";
import { KanjiPageIcon } from "./icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFontPreset } from "../store/slices/uiSlice";

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { fontPreset } = useAppSelector((state) => state.ui);
  const [fontDrawerOpen, setFontDrawerOpen] = useState(false);

  const selectedPreset = useMemo(() => getFontPreset(fontPreset), [fontPreset]);

  const menuItems = [
    {
      key: "/lessons",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },
    {
      key: "/kanji",
      icon: <KanjiPageIcon size={22} />,
      label: "Hán tự",
    },
    {
      key: "/grammar",
      icon: <ExperimentOutlined />,
      label: "Ngữ pháp",
    },
    {
      key: "/pronunciation",
      icon: <SoundOutlined />,
      label: "Phát âm",
    },
    {
      key: "/conversation",
      icon: <MessageOutlined />,
      label: "Hội thoại",
    },
    {
      key: "/tests",
      icon: <AimOutlined />,
      label: "Thi JLPT",
    },
  ];

  // Desktop Sidebar Only
  return (
    <>
      <Sider
        width={APP_SIDEBAR_SIZE_PX}
        className="app-sidebar bg-white dark:bg-secondary-925 border-r-0"
        style={{
          overflow: "hidden",
          height: `calc(100vh - ${APP_HEADER_HEIGHT_PX}px)`,
          position: "fixed",
          left: 0,
          top: APP_HEADER_HEIGHT_PX,
          bottom: 0,
          zIndex: 40,
          background: "var(--ant-color-bg-container, #ffffff)",
          fontFamily: 'var(--app-font-family)',
        }}
      >
        <div className="h-full flex flex-col py-4">
          <nav className="flex flex-col items-center gap-2 px-3 flex-1">
            {menuItems.map((item) => {
              const isLessons =
                item.key === "/lessons" &&
                (location.pathname === "/" ||
                  location.pathname === "/lessons" ||
                  location.pathname.startsWith("/lessons/"));
              const isActive = isLessons || location.pathname === item.key;

              return (
                <Tooltip key={item.key} title={item.label} placement="right">
                  <Link
                    to={item.key}
                    className={[
                      "w-full rounded-2xl px-2 py-3",
                      "flex flex-col items-center justify-center gap-1",
                      "text-xs font-medium",
                      "transition-colors",
                      isActive
                        ? "bg-slate-100 text-slate-900 shadow-sm dark:bg-secondary-800 dark:text-secondary-100"
                        : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-secondary-300 dark:hover:bg-secondary-800/50 dark:hover:text-secondary-100",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-xl leading-none",
                        isActive
                          ? "text-slate-700 dark:text-secondary-100"
                          : "text-slate-500 dark:text-secondary-300",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>
                    <span className="text-center leading-tight">{item.label}</span>
                  </Link>
                </Tooltip>
              );
            })}
          </nav>

          <div className="px-3 pt-2">
            <div className="mx-auto mb-2 h-px w-8 bg-slate-200 dark:bg-secondary-800" />
            <Tooltip title="Font Kanji" placement="right">
              <button
                type="button"
                onClick={() => setFontDrawerOpen(true)}
                aria-label="Font Kanji"
                className="w-full rounded-2xl py-3 flex items-center justify-center transition-colors text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-secondary-300 dark:hover:bg-secondary-800/50 dark:hover:text-secondary-100"
              >
                <span className="text-xl leading-none">
                  <SettingOutlined />
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </Sider>

      <Drawer
        title="Font Kanji"
        placement="right"
        open={fontDrawerOpen}
        onClose={() => setFontDrawerOpen(false)}
        size={360}
      >
        <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-4">
          Đang dùng: <span className="font-semibold">{selectedPreset.label}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FONT_PRESETS.map((preset) => {
            const selected = preset.key === fontPreset;
            const previewFontFamily = preset.previewFontFamily || preset.fontFamily;

            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => dispatch(setFontPreset(preset.key))}
                className={[
                  "relative text-left rounded-xl border p-3 transition-colors",
                  "bg-white dark:bg-secondary-925",
                  selected
                    ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900/40"
                    : "border-secondary-200 hover:border-secondary-300 dark:border-secondary-800 dark:hover:border-secondary-700",
                ].join(" ")}
              >
                <div
                  className="text-3xl leading-none mb-2 text-secondary-900 dark:text-secondary-100"
                  style={{ fontFamily: previewFontFamily }}
                >
                  漢字
                </div>
                <div className="text-xs font-semibold text-secondary-900 dark:text-secondary-100">
                  {preset.label}
                </div>

                {selected ? (
                  <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white text-xs">
                    <CheckOutlined />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">
          Ghi chú: Các font Kanji được tải từ Google Fonts.
        </div>
      </Drawer>
    </>
  );
};

export default Sidebar;
