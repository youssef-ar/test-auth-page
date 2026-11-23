import type { CSSProperties } from "react";

const GLOWS: CSSProperties[] = [
  { bottom: -210, width: 1094, height: 354, background: "#5E4FB0", opacity: 0.8, filter: "blur(200px)" },
  { bottom: -135, width: 595, height: 203, background: "#7E73BF", opacity: 0.5, filter: "blur(90px)" },
  { top: -112, width: 770, height: 249, background: "#5E4FB0", opacity: 0.8, filter: "blur(160px)" },
  { top: -58, width: 354, height: 142, background: "#9E96CF", opacity: 0.6, filter: "blur(130px)" },
];

export const AuthBackground = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[#1C1835]">
    {GLOWS.map((style, index) => (
      <div key={index} className="absolute left-1/2 -translate-x-1/2 rounded-[50%]" style={style} />
    ))}
  </div>
);
