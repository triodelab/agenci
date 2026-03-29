import { ArrowLeftRightIcon, type LucideIcon, PlugIcon } from "lucide-react";
import Image from "next/image";
import { DashboardAccentButton } from "@/modules/dashboard/ui/components/dashboard-accent";
import { AGENCI_LOGO_SRC } from "@/components/logo";

export interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface PluginCardProps {
  isDisabled?: boolean;
  serviceName: string;
  serviceImage: string;
  features: Feature[];
  onSubmit: () => void;
}

export const PluginCard = ({
  isDisabled,
  serviceName,
  serviceImage,
  features,
  onSubmit,
}: PluginCardProps) => {
  return (
    <div className="dash-plugin-split h-fit w-full overflow-hidden rounded-2xl">
      <div className="dash-plugin-split-main">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-6 md:justify-start">
          <div className="flex flex-col items-center">
            <Image
              alt={serviceName}
              className="rounded-xl object-contain ring-1 ring-border/45"
              height={48}
              width={48}
              src={serviceImage}
            />
          </div>
          <div className="flex items-center text-muted-foreground">
            <ArrowLeftRightIcon className="size-5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col items-center">
            <Image
              alt="Agenci"
              className="object-contain opacity-95"
              height={48}
              width={48}
              src={AGENCI_LOGO_SRC}
            />
          </div>
        </div>

        <p className="mb-8 text-left text-[1.35rem] font-semibold tracking-tight text-foreground md:text-[1.5rem]">
          Connect your {serviceName} account
        </p>

        <ul className="space-y-5">
          {features.map((feature) => (
            <li className="flex gap-4" key={feature.label}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted/60 ring-1 ring-border/35">
                <feature.icon className="size-[18px] text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 pt-0.5">
                <div className="font-medium text-[14px] tracking-tight text-foreground">
                  {feature.label}
                </div>
                <div className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-plugin-split-cta">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Neste steg
        </p>
        <p className="text-[15px] font-medium leading-snug text-foreground">
          Koble til og aktiver stemme i widget og dashbord.
        </p>
        <DashboardAccentButton
          className="mt-2 h-11 w-full rounded-xl font-medium"
          disabled={isDisabled}
          onClick={onSubmit}
          type="button"
        >
          Connect
          <PlugIcon className="size-4" />
        </DashboardAccentButton>
      </div>
    </div>
  );
};
