import React, { useState, useEffect } from "react";
import { Button } from "antd";
import { Trophy, BookOpen, CheckCircle, XCircle, Flame, Target, Zap, RotateCcw } from "lucide-react";
import type { VocabularyItem as VocabularyItemType } from "../../types/lesson";

// Animated counter hook
export const useAnimatedCounter = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(startValue + (target - startValue) * easeOutQuart);
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
    return () => setCount(0);
  }, [target, duration]);
  
  return count;
};

// Confetti particle component
export const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <div
    className="absolute w-2 h-2 rounded-full"
    style={{
      backgroundColor: color,
      animation: `confetti-fall 1.5s ease-out ${delay}s forwards`,
      left: `${Math.random() * 100}%`,
      top: '-10px',
    }}
  />
);

export interface CompletionModalProps {
  totalCount: number;
  knownCount: number;
  unknownCount: number;
  accuracyPercent: number;
  unknownItems: VocabularyItemType[];
  globalUnknownCount: number;
  onClose: () => void;
  onResetAll: () => void;
  onResetUnknown: () => void;
}

// Completion Modal Component - Redesigned for better UX
const CompletionModal: React.FC<CompletionModalProps> = ({
  totalCount,
  knownCount,
  unknownCount,
  accuracyPercent,
  onClose,
  onResetAll,
  onResetUnknown,
}) => {
  const animatedPercent = useAnimatedCounter(accuracyPercent, 1500);
  const animatedKnown = useAnimatedCounter(knownCount, 1000);
  
  const isPerfect = accuracyPercent === 100;
  const isGood = accuracyPercent >= 80;
  const hasUnknown = unknownCount > 0;
  
  // Get celebration message
  const getTitle = () => {
    if (isPerfect) return "Xuất sắc! 🎉";
    if (isGood) return "Rất tốt! 👍";
    return "Hoàn thành! 👏";
  };
  
  const getMessage = () => {
    if (isPerfect) return "Bạn đã nhớ toàn bộ từ vựng";
    if (isGood) return `Bạn đã nhớ ${accuracyPercent}% từ vựng`;
    return `Còn ${unknownCount} từ cần ôn thêm`;
  };
  
  const confettiColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
  
  // Get color theme based on performance
  const getTheme = () => {
    if (isPerfect) return { bg: 'from-emerald-500/20 to-teal-500/20', text: 'text-emerald-400', border: 'border-emerald-400/50', glow: 'shadow-emerald-500/30' };
    if (isGood) return { bg: 'from-blue-500/20 to-cyan-500/20', text: 'text-blue-400', border: 'border-blue-400/50', glow: 'shadow-blue-500/30' };
    return { bg: 'from-amber-500/20 to-orange-500/20', text: 'text-amber-400', border: 'border-amber-400/50', glow: 'shadow-amber-500/30' };
  };
  
  const theme = getTheme();
  
  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Confetti - more particles for celebration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: isPerfect ? 40 : 20 }).map((_, i) => (
          <ConfettiParticle 
            key={i} 
            delay={i * 0.03} 
            color={confettiColors[i % confettiColors.length]} 
          />
        ))}
      </div>
      
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(1080deg) scale(0.3); opacity: 0; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px currentColor; }
          50% { box-shadow: 0 0 60px currentColor; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      <div
        className="w-full max-w-sm relative"
        style={{ animation: 'scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className={`absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br ${theme.bg} blur-3xl opacity-60`} />
        <div className={`absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br ${theme.bg} blur-3xl opacity-60`} />
        
        <div className="relative rounded-3xl border border-white/10 bg-slate-900/95 p-10 text-white shadow-2xl overflow-hidden">
          {/* Close button - subtle */}
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center z-10"
          >
            ✕
          </button>
          
          <div className="text-center space-y-8">
            
            {/* 🎯 HERO: Big Percentage - THE FOCAL POINT */}
            <div className="relative flex justify-center">
              {/* Outer glow ring */}
              <div 
                className={`absolute inset-0 w-40 h-40 rounded-full ${theme.text} opacity-20`}
                style={{ 
                  animation: 'pulse-glow 2s ease-in-out infinite',
                  margin: 'auto',
                  top: 0, bottom: 0, left: 0, right: 0
                }}
              />
              
              {/* Main circle */}
              <div 
                className={`relative w-36 h-36 rounded-full border-4 ${theme.border} bg-slate-800 flex items-center justify-center`}
                style={{ boxShadow: `0 0 40px currentColor` }}
              >
                <div className="text-center">
                  <div className={`text-6xl font-bold ${theme.text} tabular-nums`}>
                    {animatedPercent}
                  </div>
                  <div className="text-sm font-medium text-slate-500">%</div>
                </div>
                
                {/* Perfect badge */}
                {isPerfect && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center" style={{ animation: 'float 2s ease-in-out infinite' }}>
                    <Trophy className="w-5 h-5 text-slate-900" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Title & Message */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {getTitle()}
              </h2>
              <p className="text-slate-400 text-lg">
                {getMessage()}
              </p>
            </div>
            
            {/* Compact Stats - Horizontal */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-slate-500 text-xs uppercase">Tổng</div>
                  <div className="font-semibold text-white">{totalCount}</div>
                </div>
              </div>
              
              <div className="h-8 w-px bg-white/10" />
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-slate-500 text-xs uppercase">Đã nhớ</div>
                  <div className="font-semibold text-emerald-400">{animatedKnown}</div>
                </div>
              </div>
              
              {hasUnknown && (
                <>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-slate-500 text-xs uppercase">Chưa nhớ</div>
                      <div className="font-semibold text-red-400">{unknownCount}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* 🔥 Streak Badge */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-medium">Chuỗi 3 ngày 🔥</span>
              </div>
            </div>
            
            {/* Unknown Words Summary - Compact */}
            {hasUnknown && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Cần ôn lại: <span className="text-red-400 font-medium">{unknownCount}</span> từ</span>
              </div>
            )}
            
            {/* 🎯 CTA SECTION - Clear hierarchy */}
            <div className="space-y-3 pt-6 mt-6 border-t border-white/10">
              {/* Primary Action */}
              {hasUnknown ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={onResetUnknown}
                  className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 border-none hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Ôn lại {unknownCount} từ chưa nhớ
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  onClick={onResetAll}
                  className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 border-none hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Tiếp tục bài tiếp theo
                </Button>
              )}
              
              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button
                  size="large"
                  className="flex-1 h-11 rounded-xl bg-transparent text-slate-400 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
                  onClick={onResetAll}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Học lại
                </Button>
                <Button
                  size="large"
                  className="flex-1 h-11 rounded-xl bg-transparent text-slate-400 border border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
                  onClick={onClose}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
