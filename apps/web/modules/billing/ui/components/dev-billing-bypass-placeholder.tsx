import { isHideClerkBillingUi } from "@/lib/dev-bypass";

export function BillingClerkLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Laster billing"
      className="min-h-[14rem] animate-pulse rounded-xl bg-muted/40"
    />
  );
}

/** Vises når `NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true` og bruker ikke er på team-listen. */
export function DevBillingBypassPlaceholder() {
  if (!isHideClerkBillingUi()) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <div className="dash-panel-glass flex flex-col gap-3 p-6 text-left">
        <p className="dash-page-kicker">Dev</p>
        <p className="text-lg font-semibold tracking-tight text-foreground">Clerk Billing skjult</p>
        <p className="text-muted-foreground text-[13px] leading-relaxed">
          Plassholder er aktiv fordi Clerk Billing-komponenter er slått av i dette miljøet.
        </p>
      </div>
      <div className="dash-bento-block flex flex-col gap-3 p-6 text-left">
        <p className="dash-page-kicker">Miljøvariabel</p>
        <code className="break-all rounded-lg bg-muted/60 px-2 py-1.5 font-mono text-[11px] text-foreground">
          NEXT_PUBLIC_HIDE_CLERK_BILLING_UI=true
        </code>
        <p className="text-muted-foreground text-[12px] leading-relaxed">
          Fjern den eller legg e-post i NEXT_PUBLIC_TEAM_DEVELOPER_EMAILS for å se ekte faktura og
          planer.
        </p>
      </div>
      <div className="app-dashboard-panel flex flex-col justify-between gap-4 p-6 text-left">
        <div>
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Neste steg
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-foreground">
            Aktiver Clerk Billing i Dashboard og unsett hide-flagget for produksjonslik flyt.
          </p>
        </div>
      </div>
    </div>
  );
}
