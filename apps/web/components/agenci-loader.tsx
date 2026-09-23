type AgenciLoaderProps = {
  className?: string;
  label?: string;
  decorative?: boolean;
  frame?: number;
};

/** The Agenci conversation outline, shared by loading states and product films. */
export function AgenciLoader({
  className = "",
  label = "Laster",
  decorative = false,
  frame,
}: AgenciLoaderProps) {
  const path =
    "M8 62V36C8 20.5 20.5 8 36 8H91C106 8 119 20 119 35S106 62 91 62H8Z";
  return (
    <span
      className={`agenci-loader ${className}`}
      style={
        frame === undefined
          ? undefined
          : { display: "inline-flex", width: 35, flexShrink: 0 }
      }
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    >
      <svg
        viewBox="0 0 128 70"
        fill="none"
        aria-hidden="true"
        style={{ width: "100%", height: "auto" }}
      >
        <path d={path} stroke="currentColor" strokeWidth="3" opacity=".22" />
        <path
          d={path}
          pathLength="100"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="26 74"
          strokeDashoffset={
            frame === undefined ? undefined : -(frame * 1.3) % 100
          }
          className={frame === undefined ? "agenci-loader-stroke" : undefined}
        />
      </svg>
    </span>
  );
}
