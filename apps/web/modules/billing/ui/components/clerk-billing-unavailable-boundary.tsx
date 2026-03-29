"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

const CLERK_BILLING_SETTINGS =
  "https://dashboard.clerk.com/last-active?path=billing/settings";

function isClerkBillingDisabledError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("cannot_render_billing_disabled") ||
    (msg.includes("billing") && msg.includes("disabled") && msg.includes("Clerk"))
  );
}

export function ClerkBillingDisabledNotice() {
  return (
    <div className="dash-panel-glass flex flex-col gap-4 p-6 text-left">
      <div>
        <p className="dash-page-kicker">Clerk Billing</p>
        <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
          Billing er ikke aktivert i Clerk ennå
        </p>
        <p className="text-muted-foreground mt-2 text-[13px] leading-relaxed">
          <code className="font-mono text-[12px]">&lt;PricingTable /&gt;</code> og organisasjonsfaktura
          krever at du slår på Clerk Billing (Beta) for denne applikasjonen og konfigurerer planer. Det
          finnes ingen ekstra API-nøkkel å lime inn i dette repoet for det — alt skjer i Clerk
          Dashboard.
        </p>
      </div>
      <ol className="text-foreground list-decimal space-y-2 pl-5 text-[13px] leading-relaxed">
        <li>
          Åpne{" "}
          <a
            className="text-primary font-medium underline underline-offset-2"
            href={CLERK_BILLING_SETTINGS}
            rel="noopener noreferrer"
            target="_blank"
          >
            Clerk → Billing-innstillinger
          </a>{" "}
          for riktig app (Development / Production).
        </li>
        <li>Følg veiviseren: koble til betaling (Stripe), og opprett minst én plan for organisasjoner.</li>
        <li>Last denne siden på nytt når status i Clerk viser at Billing er aktiv.</li>
      </ol>
    </div>
  );
}

type BoundaryState =
  | { status: "ok" }
  | { status: "billing_disabled" }
  | { status: "other"; message: string };

type Props = { children: ReactNode };

/**
 * Fanger Clerks runtime-feil når Billing ikke er skrudd på, slik at hele dashboardet ikke krasjer i dev.
 */
export class ClerkBillingUnavailableBoundary extends Component<Props, BoundaryState> {
  state: BoundaryState = { status: "ok" };

  static getDerivedStateFromError(error: Error): BoundaryState {
    if (isClerkBillingDisabledError(error)) {
      return { status: "billing_disabled" };
    }
    return { status: "other", message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[billing]", error.message, info.componentStack);
    }
  }

  render() {
    if (this.state.status === "billing_disabled") {
      return <ClerkBillingDisabledNotice />;
    }
    if (this.state.status === "other") {
      return (
        <div className="dash-panel-glass p-6 text-left">
          <p className="dash-page-kicker">Feil</p>
          <p className="text-foreground mt-2 text-[13px] leading-relaxed">
            Noe gikk galt ved lasting av billing-komponent. {this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
