"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { AgenciNavWordmark } from "@/components/logo";

const features = [
  "Trent på din bedrifts kunnskap",
  "Svarer på kundens spørsmål 24/7",
  "Integreres enkelt på nettsiden din",
  "GDPR-trygg og norsk personvern",
];

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full bg-[#1C1C1C]">
      {/* Left panel — dark branding */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden border-r border-[#2a2a2a] p-12 lg:flex">
        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 72px)",
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 72px)",
            ].join(", "),
          }}
        />

        {/* Top: logo */}
        <Link href="/" className="relative z-10">
          <AgenciNavWordmark surface="dark" className="text-[#f2f3f5] opacity-90" />
        </Link>

        {/* Middle: headline + features */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              AI-kundestøtte
            </p>
            <h1 className="font-display text-[2.2rem] font-semibold leading-[1.1] tracking-[-0.045em] text-[#f2f3f5]">
              Din AI-assistent —{" "}
              <span className="text-white">klar til å hjelpe</span>
            </h1>
            <p className="text-[15px] leading-[1.65] text-[#6b7280]">
              Agenci lærer av bedriftens kunnskap og svarer kundene dine
              automatisk — dag og natt.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08]">
                  <CheckIcon className="h-3 w-3 text-[#9ca3af]" />
                </span>
                <span className="text-[14px] text-[#9ca3af]">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: tagline */}
        <p className="relative z-10 text-[12px] text-[#4b5563]">
          © {new Date().getFullYear()} Agenci · Triodelab DA
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#EEEBE6] px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <AgenciNavWordmark surface="light" className="text-[#1C1C1C]" />
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
};
