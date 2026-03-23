"use client";

import { MessageCircleWarningIcon } from "lucide-react";
import { useEffect, useState } from "react";

/** Vises når `/` åpnes uten `?organizationId=` (lokal test / feil lenke). */
export function WidgetMissingOrg() {
  const [exampleUrl, setExampleUrl] = useState(
    "http://localhost:3001/?organizationId=org_xxxxxxxxxxxxxxxx",
  );

  useEffect(() => {
    setExampleUrl(
      `${window.location.origin}/?organizationId=org_xxxxxxxxxxxxxxxx`,
    );
  }, []);

  return (
    <div className="mx-auto flex h-full min-h-[min(100vh,720px)] max-w-md flex-col justify-center gap-6 rounded-2xl border border-border/80 bg-card p-8 shadow-[var(--shadow-soft)]">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessageCircleWarningIcon className="size-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Mangler organization ID
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Åpne dashboard → <span className="font-medium text-foreground">Integrations</span> og
          trykk <span className="font-medium text-foreground">Åpne widget</span>, eller legg til
          Clerk sin ID i URL-en (starter med{" "}
          <code className="rounded bg-muted px-1 font-mono text-foreground">org_</code>):
        </p>
        <code className="mt-3 block rounded-lg bg-muted px-3 py-2 font-mono text-[0.8rem] text-foreground leading-snug break-all sm:text-xs">
          {exampleUrl}
        </code>
        <p className="text-muted-foreground text-xs">
          Bytt ut <code className="font-mono">org_xxxxxxxxxxxxxxxx</code> med din ekte ID fra
          Clerk.
        </p>
      </div>
    </div>
  );
}
