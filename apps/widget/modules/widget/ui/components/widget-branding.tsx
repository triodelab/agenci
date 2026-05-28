"use client";

import { useAtomValue } from "jotai";
import { widgetSettingsAtom } from "../../atoms/widget-atoms";

export const WidgetBranding = () => {
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  if (widgetSettings?.hideBranding) return null;

  return (
    <a
      href="https://agenci.no?utm_source=widget&utm_medium=branding"
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-7 shrink-0 items-center justify-center border-t border-[var(--widget-input-border)]/40 bg-[var(--widget-input-bg)] text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70 transition-colors hover:text-foreground"
    >
      Powered by Agenci
    </a>
  );
};
