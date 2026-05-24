import Image from "next/image";

import { cn } from "@workspace/ui/lib/utils";

/** Public asset — bruk konsekvent for merkevare i app og landing. */
export const AGENCI_LOGO_SRC = "/AgenciLogo.png" as const;

export const Logo = ({
  className,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <Image
      alt="Agenci"
      className={cn("h-6 w-auto", className)}
      height={32}
      priority
      src={AGENCI_LOGO_SRC}
      width={160}
    />
  );
};

export const LogoIcon = ({
  className,
}: {
  className?: string;
  uniColor?: boolean;
}) => {
  return (
    <Image
      alt=""
      aria-hidden
      className={cn("size-6 object-contain", className)}
      height={40}
      src={AGENCI_LOGO_SRC}
      width={40}
    />
  );
};

export const LogoStroke = ({ className }: { className?: string }) => {
  return (
    <Image
      alt=""
      aria-hidden
      className={cn("size-7 object-contain", className)}
      height={40}
      src={AGENCI_LOGO_SRC}
      width={40}
    />
  );
};

/**
 * Én linje: venstre del av `AgenciLogo.png` (ikon / «A») + «genci».
 * PNG er ofte hele ordmerket — smal `overflow-hidden` viser kun venstre del så vi ikke får dobbel «A».
 * `surface`: mørk flate → lys glyf; lys flate → mørk glyf.
 */
export function AgenciNavWordmark({
  className,
  surface,
}: {
  className?: string;
  surface: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex select-none items-center gap-0 whitespace-nowrap text-[17px] font-semibold leading-none tracking-[-0.03em]",
        className,
      )}
      aria-hidden
    >
      {/* Avklippet venstre del av PNG (hele filen er ofte ordmerket) — smal boks = kun ikon/A */}
      <span className="relative inline-flex h-[1.1em] w-[0.96em] shrink-0 overflow-hidden">
        <Image
          alt=""
          src={AGENCI_LOGO_SRC}
          width={640}
          height={160}
          className={cn(
            "block h-[1.1em] w-auto max-w-none object-left object-contain",
            surface === "dark"
              ? "brightness-0 invert"
              : "brightness-0 contrast-[1.05]",
          )}
          priority
        />
      </span>
      <span
        className={cn(
          "-ml-[0.07em] pl-0",
          surface === "dark" ? "text-white" : "text-[#1C1C1C]",
        )}
      >genci</span>
    </span>
  );
}
