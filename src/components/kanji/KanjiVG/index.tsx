import React from "react";

interface KanjiVGProps {
  character: string;
  size?: number;
  onStrokeComplete?: (strokeNum: number) => void;
  onComplete?: () => void;
  strokeColor?: string;
  outlineColor?: string;
  drawingColor?: string;
}

const KanjiVGComponent: React.FC<KanjiVGProps> = ({
  character,
  size = 300,
  onStrokeComplete,
  onComplete,
  strokeColor = "#EE0000",
  outlineColor = "#CCCCCC",
  drawingColor = "#000000",
}) => {
  // Simple synchronous component without async loading
  React.useEffect(() => {
    if (onComplete) {
      // Call completion callback after a short delay
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <div
      style={{
        fontSize: "100px",
        textAlign: "center",
        color: strokeColor,
        height: `${size}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--kanji-font-family)",
      }}
    >
      {character}
    </div>
  );
};

KanjiVGComponent.displayName = "KanjiVG";

export default KanjiVGComponent;
