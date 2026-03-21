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
  FontSizeOutlined,
} from "@ant-design/icons";
import { APP_HEADER_HEIGHT_PX, APP_SIDEBAR_SIZE_PX } from "../constants/layout";
import { FONT_PRESETS, getFontPreset } from "../constants/fonts";
import { KanjiPageIcon } from "./icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFontPreset, setUIFontFamily, setJapaneseFontFamily } from "../store/slices/uiSlice";

const { Sider } = Layout;

const UI_FONT_OPTIONS = [
  {
    key: "default",
    label: "Itim",
    fontFamily: "'Itim', 'Noto Sans', system-ui, sans-serif",
  },
  {
    key: "noto_sans",
    label: "Noto Sans",
    fontFamily: "'Noto Sans', sans-serif",
  },
  {
    key: "inter",
    label: "Inter",
    fontFamily: "'Inter', sans-serif",
  },
  {
    key: "poppins",
    label: "Poppins",
    fontFamily: "'Poppins', sans-serif",
  },
  {
    key: "roboto",
    label: "Roboto",
    fontFamily: "'Roboto', sans-serif",
  },
  {
    key: "montserrat",
    label: "Montserrat",
    fontFamily: "'Montserrat', sans-serif",
  },
];

const JAPANESE_FONT_OPTIONS = [
  {
    key: "default_jp",
    label: "Mặc định",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  {
    key: "noto_sans_jp",
    label: "Noto Sans JP",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  {
    key: "noto_serif_jp",
    label: "Noto Serif JP",
    fontFamily: "'Noto Serif JP', serif",
  },
  {
    key: "zen_kaku_gothic",
    label: "Zen Kaku Gothic",
    fontFamily: "'Zen Kaku Gothic New', sans-serif",
  },
  {
    key: "shippori_mincho",
    label: "Shippori Mincho",
    fontFamily: "'Shippori Mincho', serif",
  },
  {
    key: "sawarabi_gothic",
    label: "Sawarabi Gothic",
    fontFamily: "'Sawarabi Gothic', sans-serif",
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { fontPreset, uiFontFamily, japaneseFontFamily } = useAppSelector((state) => state.ui);
  const [fontDrawerOpen, setFontDrawerOpen] = useState(false);

  const selectedPreset = useMemo(() => getFontPreset(fontPreset), [fontPreset]);
  const selectedUIFont = useMemo(
    () => UI_FONT_OPTIONS.find((f) => f.key === uiFontFamily) || UI_FONT_OPTIONS[0],
    [uiFontFamily]
  );
  const selectedJapaneseFont = useMemo(
    () => JAPANESE_FONT_OPTIONS.find((f) => f.key === japaneseFontFamily) || JAPANESE_FONT_OPTIONS[0],
    [japaneseFontFamily]
  );

  const menuItems = [
    {
      key: "/",
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
              const isHome =
                item.key === "/" &&
                (location.pathname === "/" ||
                  location.pathname === "/lessons" ||
                  location.pathname.startsWith("/lessons/"));
              const isActive = isHome || location.pathname === item.key;

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
                        ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-100",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-xl leading-none",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400",
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
            <Tooltip title="Cài đặt Font" placement="right">
              <button
                type="button"
                onClick={() => setFontDrawerOpen(true)}
                aria-label="Cài đặt Font"
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
        title="Cài đặt Font"
        placement="right"
        open={fontDrawerOpen}
        onClose={() => setFontDrawerOpen(false)}
        size={400}
      >
        {/* Font Giao diện */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
            Font Giao diện
          </h3>
          <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
            Đang dùng: <span className="font-semibold">{selectedUIFont.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {UI_FONT_OPTIONS.map((font) => {
              const selected = font.key === uiFontFamily;

              return (
                <button
                  key={font.key}
                  type="button"
                  onClick={() => dispatch(setUIFontFamily(font.key))}
                  className={[
                    "relative text-left rounded-xl border p-3 transition-colors",
                    "bg-white dark:bg-secondary-925",
                    selected
                      ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900/40"
                      : "border-secondary-200 hover:border-secondary-300 dark:border-secondary-800 dark:hover:border-secondary-700",
                  ].join(" ")}
                >
                  <div
                    className="text-2xl leading-none mb-1 text-secondary-900 dark:text-secondary-100"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    Aa
                  </div>
                  <div className="text-xs font-semibold text-secondary-900 dark:text-secondary-100">
                    {font.label}
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
        </div>

        {/* Divider */}
        <div className="h-px bg-secondary-200 dark:bg-secondary-700 my-6" />

        {/* Font Kanji */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
            Font Kanji
          </h3>
          <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
            Đang dùng: <span className="font-semibold">{selectedPreset.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
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
                    className="text-2xl leading-none mb-1 text-secondary-900 dark:text-secondary-100"
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
        </div>

        {/* Divider */}
        <div className="h-px bg-secondary-200 dark:bg-secondary-700 my-6" />

        {/* Font Tiếng Nhật */}
        <div>
          <h3 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-3">
            Font Tiếng Nhật
          </h3>
          <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
            Đang dùng: <span className="font-semibold">{selectedJapaneseFont.label}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {JAPANESE_FONT_OPTIONS.map((font) => {
              const selected = font.key === japaneseFontFamily;

              return (
                <button
                  key={font.key}
                  type="button"
                  onClick={() => dispatch(setJapaneseFontFamily(font.key))}
                  className={[
                    "relative text-left rounded-xl border p-3 transition-colors",
                    "bg-white dark:bg-secondary-925",
                    selected
                      ? "border-primary-500 ring-2 ring-primary-200 dark:ring-primary-900/40"
                      : "border-secondary-200 hover:border-secondary-300 dark:border-secondary-800 dark:hover:border-secondary-700",
                  ].join(" ")}
                >
                  <div
                    className="text-lg leading-none mb-1 text-secondary-900 dark:text-secondary-100"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    こんにちは
                  </div>
                  <div className="text-xs font-semibold text-secondary-900 dark:text-secondary-100">
                    {font.label}
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
        </div>

        <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
          Ghi chú: Font giao diện áp dụng cho toàn bộ ứng dụng. Font Kanji áp dụng cho các ký tự Hán tự. Font Tiếng Nhật áp dụng cho văn bản tiếng Nhật.
        </div>
      </Drawer>
    </>
  );
};

export default Sidebar;
