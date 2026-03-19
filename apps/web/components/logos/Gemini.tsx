import type { SVGProps } from "react";

export default function Gemini(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 4L14 8L18 9L15 12L16 16L12 14L8 16L9 12L6 9L10 8L12 4Z"
        fill="url(#gemini-a)"
      />
      <path
        d="M12 10L13 13L16 14L14 16L15 19L12 17L9 19L10 16L8 14L11 13L12 10Z"
        fill="url(#gemini-b)"
        opacity={0.8}
      />
      <defs>
        <linearGradient id="gemini-a" x1="6" y1="4" x2="18" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8E75B2" />
          <stop offset="1" stopColor="#5E5BE8" />
        </linearGradient>
        <linearGradient id="gemini-b" x1="8" y1="10" x2="16" y2="19" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
