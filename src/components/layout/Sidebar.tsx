import React, { useMemo, useState } from "react";
import { Drawer, Layout, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FlaskConical,
  Volume2,
  MessageSquare,
  Target,
  Languages,
  Settings,
  Check,
  Type,
  BookOpen,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { APP_HEADER_HEIGHT_PX, APP_SIDEBAR_SIZE_PX } from "../../constants/layout";
import { FONT_PRESETS, getFontPreset } from "../../constants/fonts";
import { KanjiPageIcon } from "../icons";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setFontPreset, setUIFontFamily, setJapaneseFontFamily } from "../../store/slices/uiSlice";

const { Sider } = Layout;

const UI_FONT_OPTIONS = [
  {
    key: "/kanji",
    icon: <Icon icon="material-symbols-light:kanji-alcohol" className="w-5 h-5" color="currentColor" />,
    label: "Hán tự",
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
      icon: <Home className="w-5 h-5" />,
      label: "Trang chủ",
    },
    {
      key: "/kanji",
      icon: <Icon icon="material-symbols-light:kanji-alcohol" className="w-5 h-5" color="currentColor" />,
      label: "Hán tự",
    },
    {
      key: "/grammar",
      icon: <FlaskConical className="w-5 h-5" />,
      label: "Ngữ pháp",
    },
    {
      key: "/pronunciation",
      icon: <Volume2 className="w-5 h-5" />,
      label: "Phát âm",
    },
    {
      key: "/conversation",
      icon: <MessageSquare className="w-5 h-5" />,
      label: "Hội thoại",
    },
    {
      key: "/practice",
      icon: <BookOpen className="w-5 h-5" />,
      label: "Luyện tập",
    },
    {
      key: "/tests",
      icon: <Target className="w-5 h-5" />,
      label: "Thi JLPT",
    },
  ];

  // Desktop Sidebar Only
  return (
    <>
      <Sider
        width={APP_SIDEBAR_SIZE_PX}
        className="app-sidebar bg-surface-2 border-r border-border"
        style={{
          overflow: "hidden",
          height: `calc(100vh - ${APP_HEADER_HEIGHT_PX}px)`,
          position: "fixed",
          left: 0,
          top: APP_HEADER_HEIGHT_PX,
          bottom: 0,
          zIndex: 40,
          background: "var(--surface-2)",
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
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-text-sub hover:bg-hover-bg hover:text-text-main",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "text-xl leading-none",
                        isActive
                          ? "text-primary"
                          : "text-text-sub",
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
            <div className="mx-auto mb-2 h-px w-8 bg-border" />
            <Tooltip title="Cài đặt Font" placement="right">
              <button
                type="button"
                onClick={() => setFontDrawerOpen(true)}
                aria-label="Cài đặt Font"
                className="w-full rounded-2xl py-3 flex items-center justify-center transition-colors text-text-sub hover:bg-hover-bg hover:text-text-main"
              >
                <span className="text-xl leading-none">
                  <Type className="w-5 h-5" />
                </span>
              </button>
            </Tooltip>
          </div>
        </div>
      </Sider>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" />
            <span className="text-text-main">Cài đặt Font</span>
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
            <h3 className="text-base font-bold text-text-main">
              Font Kanji
            </h3>
            <div className="text-xs text-text-sub bg-surface-3 px-2 py-1 rounded-full">
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
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-bg hover:border-primary/50 hover:bg-primary/5",
                  ].join(" ")}
                >
                  <div
                    className="text-3xl leading-none mb-2 text-text-main group-hover:text-primary transition-colors"
                    style={{ fontFamily: previewFontFamily }}
                  >
                    漢字
                  </div>
                  <div className={[
                    "text-xs font-semibold transition-colors",
                    selected ? "text-primary" : "text-text-sub"
                  ].join(" ")}>
                    {preset.label}
                  </div>

                  {selected && (
                    <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm shadow-lg">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-8" />

        {/* Font Tiếng Nhật */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-text-main">
              Font Tiếng Nhật
            </h3>
            <div className="text-xs text-text-sub bg-surface-3 px-2 py-1 rounded-full">
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
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-bg hover:border-primary/50 hover:bg-primary/5",
                  ].join(" ")}
                >
                  <div
                    className="text-xl leading-none mb-2 text-text-main group-hover:text-primary transition-colors"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    こんにちは
                  </div>
                  <div className={[
                    "text-xs font-semibold transition-colors",
                    selected ? "text-primary" : "text-text-sub"
                  ].join(" ")}>
                    {font.label}
                  </div>

                  {selected && (
                    <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm shadow-lg">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-surface-2 rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Type className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-main mb-1">
                Hướng dẫn
              </h4>
              <p className="text-xs text-text-sub leading-relaxed">
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
