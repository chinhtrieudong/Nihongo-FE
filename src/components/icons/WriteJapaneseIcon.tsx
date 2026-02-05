import React from "react";

type WriteJapaneseIconProps = {
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

const WriteJapaneseIcon: React.FC<WriteJapaneseIconProps> = ({
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
        d="M14.263 19.299L5.5 33.61M31.349 7.866L14.263 19.299M42.5 22.627H28.217c-3.207.035-7.734 3.123-7.708 7.866V42.5m10.84-34.634l-1.623 14.762M26.42 11.164l4.276 2.653m-16.433 5.482l8.687 5.682"
      />
      <rect
        width="37"
        height="37"
        x="5.5"
        y="5.5"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        rx="4"
        ry="4"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M26.217 27.722h10.766m-6.738-1.852v6.505c0 1.408.217 3.111 1.294 4.02m2.49-5.604c-1.319 4.57-3.126 7.724-5.566 7.724c-1.576 0-2.661-1.249-2.661-2.753c0-2.679 3.061-5.131 6.982-5.141c2.604-.007 4.736 1.926 4.736 4.386c0 2.286-1.853 3.61-4.663 4.142"
      />
    </svg>
  );
};

export default WriteJapaneseIcon;
