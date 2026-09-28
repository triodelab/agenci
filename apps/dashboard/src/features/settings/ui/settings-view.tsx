import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@workspace/ui/lib/utils";
import {
  Building2Icon,
  CreditCardIcon,
  ShieldIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react";
import { OrganizationSettings } from "./sections/organization-settings";
import { PreferencesSettings } from "./sections/preferences-settings";
import { ProfileSettings } from "./sections/profile-settings";
import { SecuritySettings } from "./sections/security-settings";

export const SETTINGS_SECTIONS = ["profil", "sikkerhet", "preferanser", "organisasjon"] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const isSettingsSection = (s: string): s is SettingsSection =>
  (SETTINGS_SECTIONS as readonly string[]).includes(s);

/**
 * Innstillinger: a sub-menu on the left and one page on the right.
 * `scope` is the URL the settings live under (the org, or the agent you are
 * in), so the dashboard sidebar stays the same while you change settings.
 */
export default function SettingsView({
  section,
  scope,
  orgBase,
}: {
  section: SettingsSection;
  scope: string;
  orgBase: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const groups: {
    label: string;
    items: { to: string; label: string; icon: typeof UserRoundIcon; section?: SettingsSection }[];
  }[] = [
    {
      label: "Konto",
      items: [
        { to: `${scope}/settings/profil`, label: "Profil", icon: UserRoundIcon, section: "profil" },
        { to: `${scope}/settings/sikkerhet`, label: "Sikkerhet", icon: ShieldIcon, section: "sikkerhet" },
        { to: `${scope}/settings/preferanser`, label: "Preferanser", icon: SlidersHorizontalIcon, section: "preferanser" },
      ],
    },
    {
      label: "Organisasjon",
      items: [
        { to: `${scope}/settings/organisasjon`, label: "Generelt", icon: Building2Icon, section: "organisasjon" },
        { to: `${orgBase}/members`, label: "Medlemmer", icon: UsersIcon },
        { to: `${scope}/billing`, label: "Plan og faktura", icon: CreditCardIcon },
      ],
    },
  ];

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <header className="px-1">
        <h1 className="[font-family:var(--font-agenci-title)] text-[24px] leading-[1.15] font-medium tracking-[-0.03em] text-(--agenci-ink)">
          Innstillinger
        </h1>
        <p className="mt-1.5 text-[13.5px] text-(--agenci-ink-2)">
          Kontoen din, hvordan Agenci oppfører seg for deg, og innstillinger for teamet.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
        <nav aria-label="Innstillinger" className="lg:sticky lg:top-0 lg:self-start">
          <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-5 lg:overflow-visible lg:pb-0">
            {groups.map((g) => (
              <div key={g.label} className="flex shrink-0 gap-1 lg:flex-col">
                <p className="hidden px-3 pb-1 text-[11.5px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase lg:block">
                  {g.label}
                </p>
                {g.items.map((item) => {
                  const active = item.section ? item.section === section : pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex h-9 shrink-0 items-center gap-2.5 rounded-[10px] px-3 text-[13.5px] transition-colors",
                        active
                          ? "bg-white font-medium text-(--agenci-ink) shadow-[0_1px_2px_rgb(5_6_7/0.06),0_0_0_1px_var(--agenci-line)] dark:bg-white/10"
                          : "text-(--agenci-ink-2) hover:bg-black/[0.04] hover:text-(--agenci-ink) dark:hover:bg-white/5",
                      )}
                    >
                      <item.icon className="size-4" strokeWidth={1.6} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <div className="min-w-0 max-w-[880px]">
          {section === "profil" ? <ProfileSettings /> : null}
          {section === "sikkerhet" ? <SecuritySettings /> : null}
          {section === "preferanser" ? <PreferencesSettings /> : null}
          {section === "organisasjon" ? <OrganizationSettings /> : null}
        </div>
      </div>
    </div>
  );
}
