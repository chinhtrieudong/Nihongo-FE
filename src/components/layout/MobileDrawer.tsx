import React, { useMemo, useState } from "react";
import { Drawer, Button } from "antd";
import { X, Check, Type, FileText, FileCheck, ChessKnight, ChessKing, Volume2, Target } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { closeDrawer, setFontPreset, setJapaneseFontFamily } from "../../store/slices/uiSlice";
import { FONT_PRESETS, getFontPreset } from "../../constants/fonts";

const JAPANESE_FONT_OPTIONS = [
  { key: "default_jp", label: "Mặc định", fontFamily: "'Noto Sans JP', sans-serif" },
  { key: "noto_sans_jp", label: "Noto Sans JP", fontFamily: "'Noto Sans JP', sans-serif" },
  { key: "noto_serif_jp", label: "Noto Serif JP", fontFamily: "'Noto Serif JP', serif" },
  { key: "zen_kaku_gothic", label: "Zen Kaku Gothic", fontFamily: "'Zen Kaku Gothic New', sans-serif" },
  { key: "shippori_mincho", label: "Shippori Mincho", fontFamily: "'Shippori Mincho', serif" },
  { key: "sawarabi_gothic", label: "Sawarabi Gothic", fontFamily: "'Sawarabi Gothic', sans-serif" },
];

const MobileDrawer: React.FC = () => {
  const { drawerOpen, fontPreset, japaneseFontFamily } = useAppSelector(state => state.ui);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [fontDrawerOpen, setFontDrawerOpen] = useState(false);

  const selectedPreset = useMemo(() => getFontPreset(fontPreset), [fontPreset]);
  const selectedJapaneseFont = useMemo(
    () => JAPANESE_FONT_OPTIONS.find((f) => f.key === japaneseFontFamily) || JAPANESE_FONT_OPTIONS[0],
    [japaneseFontFamily]
  );

  const menuItems = [
    { key: "/", icon: <ChessKing className="w-5 h-5" />, label: "Từ vựng" },
    { key: "/kanji", icon: <ChessKnight className="w-5 h-5" />, label: "Hán tự" },
    { key: "/grammar", icon: <FileText className="w-5 h-5" />, label: "Ngữ pháp" },
    { key: "/pronunciation", icon: <Volume2 className="w-5 h-5" />, label: "Phát âm", comingSoon: true },
    { key: "/practice", icon: <Target className="w-5 h-5" />, label: "Luyện tập" },
    { key: "/tests", icon: <FileCheck className="w-5 h-5" />, label: "Thi JLPT" },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    dispatch(closeDrawer());
  };

  const handleClose = () => {
    dispatch(closeDrawer());
  };

  return (
    <>
      <Drawer
        title={null}
        placement="left"
        open={drawerOpen}
        onClose={handleClose}
        size="default"
        closable={false}
        maskClosable={true}
        styles={{
          body: { padding: 0, background: 'var(--surface-2)', fontFamily: 'var(--app-font-family)' },
          header: { display: 'none' },
          mask: { backdropFilter: 'blur(4px)' }
        }}
        className="mobile-drawer"
      >
        <div className="flex flex-col h-full bg-surface-2">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img src="/Logo.svg" alt="Nihon Nào!" className="w-10 h-10 select-none" draggable={false} />
              <div>
                <h3 className="m-0 text-lg font-semibold text-text-main leading-tight">Nihon Nào!</h3>
                <p className="m-0 text-xs text-text-sub">Học tiếng Nhật</p>
              </div>
            </div>
            <Button
              type="text"
              icon={<X className="w-5 h-5 text-text-sub" />}
              onClick={handleClose}
              className="flex items-center justify-center"
            />
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
            {menuItems.map(item => {
              const isHome =
                item.key === "/" &&
                (location.pathname === "/" ||
                  location.pathname === "/lessons" ||
                  location.pathname.startsWith("/mina/"));
              const isActive = isHome || location.pathname === item.key;
              const isComingSoon = (item as any).comingSoon === true;

              if (isComingSoon) {
                return (
                  <div
                    key={item.key}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl border-none text-left opacity-40 cursor-not-allowed select-none"
                  >
                    <span className="text-text-sub">{item.icon}</span>
                    <span className="flex-1 text-base text-text-main">{item.label}</span>
                    <span className="text-[10px] font-bold bg-amber-400 text-white rounded-full px-2 py-0.5 leading-tight">
                      Sắp có
                    </span>
                  </div>
                );
              }

              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  className={[
                    "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border-none text-left",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "bg-transparent text-text-main hover:bg-hover-bg"
                  ].join(" ")}
                >
                  <span className={isActive ? "text-primary" : "text-text-sub"}>{item.icon}</span>
                  <span className="flex-1 text-base">{item.label}</span>
                  {isActive && <Check className="w-4 h-4 text-primary" />}
                </button>
              );
            })}

            <div className="my-4 h-px bg-border w-full" />
            
            <button
              onClick={() => setFontDrawerOpen(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 border-none text-left bg-transparent text-text-main hover:bg-hover-bg"
            >
              <span className="text-text-sub"><Type className="w-5 h-5" /></span>
              <span className="flex-1 text-base">Cài đặt Font</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Font Settings Drawer */}
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
        size="85%"
        styles={{
          body: { padding: '16px 20px', background: 'var(--bg)', fontFamily: 'var(--app-font-family)' },
          header: {
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)'
          }
        }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-text-main m-0">Font Kanji</h3>
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
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-1 hover:border-primary/50",
                  ].join(" ")}
                >
                  <div className="text-2xl leading-none mb-2 text-text-main" style={{ fontFamily: previewFontFamily }}>
                    漢字
                  </div>
                  <div className={["text-xs font-semibold", selected ? "text-primary" : "text-text-sub"].join(" ")}>
                    {preset.label}
                  </div>
                  {selected && (
                    <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-border my-6" />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-text-main m-0">Font Tiếng Nhật</h3>
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
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-1 hover:border-primary/50",
                  ].join(" ")}
                >
                  <div className="text-lg leading-none mb-2 text-text-main" style={{ fontFamily: font.fontFamily }}>
                    こんにちは
                  </div>
                  <div className={["text-xs font-semibold", selected ? "text-primary" : "text-text-sub"].join(" ")}>
                    {font.label}
                  </div>
                  {selected && (
                    <span className="absolute top-2 right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default MobileDrawer;
