"use client";

import { api } from "@workspace/backend/_generated/api";
import { useQuery } from "convex/react";
import {
  BotIcon,
  ListTreeIcon,
  MessageSquareIcon,
  MicIcon,
  PaletteIcon,
} from "lucide-react";
import { TwoColumnFormSkeleton } from "@/modules/dashboard/ui/components/dashboard-skeleton";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import type { WidgetCustomizationSection } from "../../types";
import { CustomizationForm } from "../components/customization-form";

function NavRow({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-150",
        active
          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 [&_svg]:text-primary-foreground"
          : "text-foreground/88 hover:bg-muted/70 hover:text-foreground",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function NavGlyph({
  active,
  children,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-[7px] border text-muted-foreground",
        active
          ? "border-primary-foreground/25 bg-primary-foreground/12 text-primary-foreground"
          : "border-border/50 bg-[var(--dash-knowledge-folder)]",
        className,
      )}
      aria-hidden
    >
      {children}
    </span>
  );
}

const SECTION_COPY: Record<
  WidgetCustomizationSection,
  { title: string; description: string }
> = {
  agent: {
    title: "Agent",
    description:
      "Velg hvilken agent som skal svare besøkende i chat-widgeten på nettsiden din.",
  },
  messages: {
    title: "Åpningsmelding",
    description:
      "Teksten besøkende ser først når de åpner chat-widgeten. Hold den kort, vennlig og tydelig.",
  },
  suggestions: {
    title: "Hurtigvalg",
    description:
      "Tre forslagsknapper som hjelper brukeren i gang. La dem stå tomme hvis du ikke vil vise forslag.",
  },
  appearance: {
    title: "Utseende",
    description:
      "Juster oppsett og farger til venstre — forhåndsvisningen til høyre oppdateres live.",
  },
  voice: {
    title: "Stemme (Vapi)",
    description:
      "Koble widgeten til taleassistent og visningsnummer når tale er aktivert for organisasjonen.",
  },
};

export const CustomizationView = ({ agentId }: { agentId?: import("@workspace/backend/_generated/dataModel").Id<"agents"> }) => {
  const widgetSettings = useQuery(api.private.widgetSettings.getOne, agentId ? { agentId } : {});
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });
  const agents = useQuery(api.private.agents.list);

  const hasVapi = !!vapiPlugin;
  const [section, setSection] = useState<WidgetCustomizationSection>("agent");

  useEffect(() => {
    if (!hasVapi && section === "voice") {
      setSection("messages");
    }
  }, [hasVapi, section]);

  const isLoading = widgetSettings === undefined || vapiPlugin === undefined || agents === undefined;

  if (isLoading) {
    return <TwoColumnFormSkeleton />;
  }

  const meta = SECTION_COPY[section];

  return (
    <div className="flex h-full min-h-0 w-full flex-1 bg-transparent">
      <aside className="dash-subpane-rail flex w-[288px] shrink-0 flex-col">
        <header className="border-border/60 border-b px-5 pb-4 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Utseende
          </p>
          <h1 className="mt-1.5 font-semibold text-[16px] text-foreground tracking-tight">
            Widget
          </h1>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Tilpass chat-opplevelsen på nettsiden din.
          </p>
        </header>
        <ScrollArea className="min-h-0 flex-1">
          <nav
            aria-label="Widget-innstillinger"
            className="flex flex-col gap-px px-2 py-3"
          >
            <NavRow
              active={section === "agent"}
              onClick={() => setSection("agent")}
            >
              <NavGlyph active={section === "agent"}>
                <BotIcon className="size-[15px]" strokeWidth={1.65} />
              </NavGlyph>
              <span className="min-w-0 flex-1 truncate leading-snug">
                Agent
              </span>
            </NavRow>
            <NavRow
              active={section === "messages"}
              onClick={() => setSection("messages")}
            >
              <NavGlyph active={section === "messages"}>
                <MessageSquareIcon className="size-[15px]" strokeWidth={1.65} />
              </NavGlyph>
              <span className="min-w-0 flex-1 truncate leading-snug">
                Åpningsmelding
              </span>
            </NavRow>
            <NavRow
              active={section === "suggestions"}
              onClick={() => setSection("suggestions")}
            >
              <NavGlyph active={section === "suggestions"}>
                <ListTreeIcon className="size-[15px]" strokeWidth={1.65} />
              </NavGlyph>
              <span className="min-w-0 flex-1 truncate leading-snug">
                Hurtigvalg
              </span>
            </NavRow>
            <NavRow
              active={section === "appearance"}
              onClick={() => setSection("appearance")}
            >
              <NavGlyph active={section === "appearance"}>
                <PaletteIcon className="size-[15px]" strokeWidth={1.65} />
              </NavGlyph>
              <span className="min-w-0 flex-1 truncate leading-snug">
                Utseende
              </span>
            </NavRow>
            {hasVapi ? (
              <NavRow
                active={section === "voice"}
                onClick={() => setSection("voice")}
              >
                <NavGlyph active={section === "voice"}>
                  <MicIcon className="size-[15px]" strokeWidth={1.65} />
                </NavGlyph>
                <span className="min-w-0 flex-1 truncate leading-snug">
                  Stemme
                </span>
              </NavRow>
            ) : null}
          </nav>
        </ScrollArea>
      </aside>

      <div className="dash-subpane-main flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "shrink-0 border-border/60 border-b bg-background",
            section === "appearance" ? "px-6 py-4" : "px-8 py-6",
          )}
        >
          <h2 className="font-semibold text-[16px] text-foreground tracking-tight">
            {meta.title}
          </h2>
          <p
            className={cn(
              "mt-1.5 max-w-xl text-[13px] leading-relaxed text-muted-foreground",
              section === "appearance" && "max-w-2xl text-[12px]",
            )}
          >
            {meta.description}
          </p>
        </header>

        <div
          className={cn(
            "min-h-0 flex-1",
            section === "appearance"
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto",
          )}
        >
          <CustomizationForm
            activeSection={section}
            hasVapiPlugin={hasVapi}
            initialData={widgetSettings}
            agents={agents ?? []}
            forAgentId={agentId}
          />
        </div>
      </div>
    </div>
  );
};
