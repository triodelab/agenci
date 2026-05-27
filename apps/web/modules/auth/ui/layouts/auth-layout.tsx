"use client";

import Link from "next/link";
import { AgenciNavWordmark } from "@/components/logo";

const features = [
  "Trent på din bedrifts kunnskap og dokumenter",
  "Svarer på kundens spørsmål 24/7",
  "Integreres på nettsiden din på 5 minutter",
  "GDPR-trygg og norsk personvern",
];

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel */}
      <div className="relative hidden w-[46%] flex-col overflow-hidden lg:flex" style={{ backgroundColor: "#0D0D0D" }}>
        {/* Dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gradient glow bottom-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-[40%] w-[60%]"
          style={{
            background: "radial-gradient(ellipse at 0% 100%, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <Link href="/">
            <AgenciNavWordmark surface="dark" className="opacity-90" />
          </Link>

          {/* Main content */}
          <div className="space-y-10">
            <div className="space-y-5">
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#9CA3AF" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                AI-kundestøtte
              </div>
              <h1
                className="text-[2.4rem] font-semibold leading-[1.08] tracking-[-0.045em]"
                style={{ color: "#F4F4F5" }}
              >
                Svar kundene dine{" "}
                <span style={{ color: "#A5B4FC" }}>automatisk</span>
                {" "}— dag og natt
              </h1>
              <p className="text-[15px] leading-[1.7]" style={{ color: "#6B7280", maxWidth: "340px" }}>
                Agenci lærer av bedriftens kunnskap og hjelper kundene dine
                direkte på nettsiden din.
              </p>
            </div>

            <ul className="space-y-3.5">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span
                    className="mt-[3px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "rgba(165,180,252,0.12)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] leading-[1.5]" style={{ color: "#9CA3AF" }}>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <p className="text-[12px]" style={{ color: "#3F3F46" }}>
            © {new Date().getFullYear()} Agenci · Triodelab DA
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#FFFFFF" }}>
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <AgenciNavWordmark surface="light" />
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
};
