import React from "react";

type KanjidrawIconProps = {
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

const KanjidrawIcon: React.FC<KanjidrawIconProps> = ({
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
        d="M6.099 28.82H41.9M13.848 16.55h19.419c1.186 0 1.402 1.013.656 1.837c-2.922 3.232-6.866 4.687-10.306 5.489c-1.006.235-.818.802-.374 1.265c.978 1.02 2.064 2.448 2.064 5.002v8.929c0 2.169-1.614 3.443-3.556 3.443c-1.734 0-3.23-.364-5.203-1.375m7.46-35.655v4.064M7.02 16.324v-5.182A1.59 1.59 0 0 1 8.608 9.55H39.41c.878 0 1.59.71 1.59 1.589v5.128"
      />
    </svg>
  );
};

export default KanjidrawIcon;
