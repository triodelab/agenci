import type { SVGProps } from "react";

export default function MediaWiki(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 3L4 9L12 15L20 9L12 3ZM12 8L8 11L12 14L16 11L12 8Z"
        fill="url(#mw-a)"
      />
      <path
        d="M4 15L12 21L20 15"
        stroke="url(#mw-b)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <defs>
        <linearGradient id="mw-a" x1="4" y1="3" x2="20" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#006699" />
          <stop offset="1" stopColor="#0088CC" />
        </linearGradient>
        <linearGradient id="mw-b" x1="4" y1="15" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor="#006699" />
          <stop offset="1" stopColor="#0088CC" />
        </linearGradient>
      </defs>
    </svg>
  );
}
