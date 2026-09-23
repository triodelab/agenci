/**
 * Task 1.2 — Forgot password placeholder.
 * Better Auth reset requires a configured email sender; until then we show guidance.
 */
"use client";

import Link from "next/link";

export const ForgotPasswordView = () => {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#1C1C1C]">
          Glemt passord
        </h2>
        <p className="text-[14px] text-[#6b7280]">
          Passordtilbakestilling via e-post er ikke satt opp ennå på den nye
          auth-serveren. Kontakt support, eller opprett en ny konto i
          utviklingsmiljøet.
        </p>
      </div>

      <Link
        href="/sign-in"
        className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#1C1C1C] px-4 text-[14px] font-semibold text-white transition hover:bg-[#2a2a2a]"
      >
        Tilbake til innlogging
      </Link>
    </div>
  );
};
