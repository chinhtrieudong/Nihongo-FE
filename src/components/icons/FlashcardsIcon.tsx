import React from "react";

type FlashcardsIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  background?: string;
  opacity?: number;
  rotation?: number;
  shadow?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  padding?: number;
};

const FlashcardsIcon: React.FC<FlashcardsIconProps> = ({
  size,
  color = "#000000",
  strokeWidth = 2,
  background = "transparent",
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
}) => {
  const transforms: string[] = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push("scaleX(-1)");
  if (flipVertical) transforms.push("scaleY(-1)");

  const baseSize = 48;
  const viewBoxSize = baseSize + padding * 2;
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        opacity,
        transform: transforms.join(" ") || undefined,
        filter:
          shadow > 0
            ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))`
            : undefined,
        backgroundColor: background !== "transparent" ? background : undefined,
      }}
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.243 7.561h19.514a2.65 2.65 0 0 1 2.657 2.658v27.563a2.65 2.65 0 0 1-2.657 2.657H14.243a2.65 2.65 0 0 1-2.657-2.657V10.219a2.65 2.65 0 0 1 2.656-2.658m1.108 9.325h17.703M15.35 20.312h17.703M15.35 23.74h17.703M15.35 27.166h17.703M15.35 13.459h7.097M15.35 30.593h7.097M15.35 34.02h17.703m-21.468 3.716h24.83m-16.556 0v2.702m8.283-2.702v2.702m-16.573-3.6L5.592 14.524a2.65 2.65 0 0 1 1.878-3.255h0l4.1-1.099m24.861 26.668l5.977-22.314a2.65 2.65 0 0 0-1.878-3.255h0l-4.1-1.099"
      />
    </svg>
  );
};

export default FlashcardsIcon;
