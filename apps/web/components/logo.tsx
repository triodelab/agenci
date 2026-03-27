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
