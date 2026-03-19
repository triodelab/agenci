import type { SVGProps } from "react";

export default function GooglePaLM(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 2C8 2 5 5 5 9C5 13 8 18 12 22C16 18 19 13 19 9C19 5 16 2 12 2ZM12 6C13.5 6 14.5 7 14.5 8.5C14.5 10 13.5 11 12 11C10.5 11 9.5 10 9.5 8.5C9.5 7 10.5 6 12 6Z"
        fill="url(#palm-a)"
      />
      <defs>
        <linearGradient id="palm-a" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#34A853" />
          <stop offset="1" stopColor="#FBBC05" />
        </linearGradient>
      </defs>
    </svg>
  );
}
