import React from "react";
import { Volume2, Construction, ArrowLeft } from "lucide-react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const PronunciationComingSoon: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center py-16">
        {/* Icon group */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-28 h-28 rounded-full bg-amber-400/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
            <Construction className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-400 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Đang triển khai
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-text-main mb-3">Luyện phát âm</h1>
        <p className="text-text-sub text-base leading-relaxed mb-8">
          Chúng mình đang xây dựng tính năng luyện phát âm tiếng Nhật với AI.
          Sẽ sớm ra mắt — hãy quay lại sau nhé!
        </p>

        {/* Features preview */}
        <div className="grid grid-cols-1 gap-3 mb-10 text-left">
          {[
            { icon: "🎤", text: "Thu âm và nhận xét phát âm bằng AI" },
            { icon: "🔊", text: "Nghe mẫu phát âm chuẩn theo từng cấp độ" },
            { icon: "📊", text: "Theo dõi điểm số và tiến bộ theo thời gian" },
          ].map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-1 border border-border opacity-60"
            >
              <span className="text-xl">{f.icon}</span>
              <span className="text-sm text-text-sub">{f.text}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="flex items-center gap-2 mx-auto"
        >
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default PronunciationComingSoon;
