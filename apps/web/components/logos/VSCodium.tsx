import type { SVGProps } from "react";

export default function VSCodium(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M3 3L10.5 11.5L3 21H5.5L12 14L18.5 21H21L13.5 12L21 3H18.5L12 10L5.5 3H3Z"
        fill="url(#vsc-a)"
      />
      <defs>
        <linearGradient id="vsc-a" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#007ACC" />
          <stop offset="1" stopColor="#1F8AD4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
