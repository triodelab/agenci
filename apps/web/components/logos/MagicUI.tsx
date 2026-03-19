import type { SVGProps } from "react";

export default function MagicUI(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 2L14 8L20 9L15 14L16 20L12 17L8 20L9 14L4 9L10 8L12 2Z"
        fill="url(#magic-a)"
      />
      <path d="M19 5L20 7L22 8L20 9L19 11L18 9L16 8L18 7L19 5Z" fill="url(#magic-b)" />
      <defs>
        <linearGradient id="magic-a" x1="4" y1="2" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="magic-b" x1="16" y1="5" x2="22" y2="11" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
