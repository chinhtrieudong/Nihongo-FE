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
                  location.pathname.startsWith("/mina/"));
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
        title={
          <div className="flex items-center gap-2">
            <FontSizeOutlined className="text-primary-600 dark:text-primary-400" />
            <span className="text-secondary-900 dark:text-secondary-100">Cài đặt Font</span>
          </div>
        }
        placement="right"
        open={fontDrawerOpen}
        onClose={() => setFontDrawerOpen(false)}
        size={380}
        className="font-settings-drawer"
        styles={{
          body: { padding: '16px 20px' },
          header: {
            borderBottom: '1px solid var(--ant-color-border-secondary)',
            background: 'var(--ant-color-bg-container)'
          }
        }}
      >
        {/* Font Kanji */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-secondary-900 dark:text-secondary-100">
              Font Kanji
            </h3>
            <div className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded-full">
              {selectedPreset.label}
            </div>
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
                    "relative text-left rounded-2xl border-2 p-4 transition-all duration-200",
                    "group hover:shadow-lg hover:scale-[1.02]",
                    selected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-2 ring-primary-200 dark:ring-primary-800"
                      : "border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10",
                  ].join(" ")}
                >
                  <div
                    className="text-3xl leading-none mb-2 text-secondary-900 dark:text-secondary-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors"
                    style={{ fontFamily: previewFontFamily }}
                  >
                    漢字
                  </div>
                  <div className={[
                    "text-xs font-semibold transition-colors",
                    selected ? "text-primary-700 dark:text-primary-300" : "text-secondary-700 dark:text-secondary-300"
                  ].join(" ")}>
                    {preset.label}
                  </div>

                  {selected && (
                    <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white text-sm shadow-lg">
                      <CheckOutlined />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-secondary-300 dark:via-secondary-600 to-transparent my-8" />

        {/* Font Tiếng Nhật */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-secondary-900 dark:text-secondary-100">
              Font Tiếng Nhật
            </h3>
            <div className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-1 rounded-full">
              {selectedJapaneseFont.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {JAPANESE_FONT_OPTIONS.map((font) => {
              const selected = font.key === japaneseFontFamily;

              return (
                <button
                  key={font.key}
                  type="button"
                  onClick={() => dispatch(setJapaneseFontFamily(font.key))}
                  className={[
                    "relative text-left rounded-2xl border-2 p-4 transition-all duration-200",
                    "group hover:shadow-lg hover:scale-[1.02]",
                    selected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md ring-2 ring-primary-200 dark:ring-primary-800"
                      : "border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/10",
                  ].join(" ")}
                >
                  <div
                    className="text-xl leading-none mb-2 text-secondary-900 dark:text-secondary-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    こんにちは
                  </div>
                  <div className={[
                    "text-xs font-semibold transition-colors",
                    selected ? "text-primary-700 dark:text-primary-300" : "text-secondary-700 dark:text-secondary-300"
                  ].join(" ")}>
                    {font.label}
                  </div>

                  {selected && (
                    <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white text-sm shadow-lg">
                      <CheckOutlined />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-secondary-50 dark:bg-secondary-900/50 rounded-xl border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
              <FontSizeOutlined className="text-primary-600 dark:text-primary-400 text-sm" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-secondary-900 dark:text-secondary-100 mb-1">
                Hướng dẫn
              </h4>
              <p className="text-xs text-secondary-600 dark:text-secondary-400 leading-relaxed">
                Font Kanji áp dụng cho các ký tự Hán tự. Font Tiếng Nhật áp dụng cho văn bản tiếng Nhật (hiragana, katakana).
              </p>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Sidebar;
