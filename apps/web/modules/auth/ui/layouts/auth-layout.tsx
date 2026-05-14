"use client";

import Link from "next/link";
import { CheckIcon } from "lucide-react";
import { Logo } from "@/components/logo";

const features = [
  "Trent på din bedrifts kunnskap",
  "Svarer på kundens spørsmål 24/7",
  "Integreres enkelt på nettsiden din",
  "GDPR-trygg og norsk personvern",
];

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — dark branding */}
      <div
        className="relative hidden w-[45%] flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background:
            "radial-gradient(ellipse 100% 75% at 15% 10%, rgba(20,184,166,0.18), transparent 52%), radial-gradient(ellipse 80% 60% at 85% 90%, rgba(6,182,212,0.10), transparent 55%), linear-gradient(180deg,#050508 0%,#080c0b 100%)",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top: logo */}
        <Link href="/" className="relative z-10">
          <Logo className="h-7 w-auto brightness-0 invert" />
        </Link>

        {/* Middle: headline + features */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-3">
            <p
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: "#2dd4bf" }}
            >
              AI-kundestøtte
            </p>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
              Din AI-assistent —{" "}
              <span style={{ color: "#2dd4bf" }}>klar til å hjelpe</span>
            </h1>
            <p className="text-[15px] leading-relaxed" style={{ color: "#a1a1aa" }}>
              Agenci lærer av bedriftens kunnskap og svarer kundene dine
              automatisk — dag og natt.
            </p>
          </div>

          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                  style={{ background: "rgba(45,212,191,0.15)" }}
                >
                  <CheckIcon className="h-3 w-3" style={{ color: "#2dd4bf" }} />
                </span>
                <span className="text-sm" style={{ color: "#d4d4d8" }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: tagline */}
        <p className="relative z-10 text-xs" style={{ color: "#52525b" }}>
          © {new Date().getFullYear()} Agenci · Triodelab DA
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12 dark:bg-zinc-950">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo className="h-7 w-auto dark:brightness-0 dark:invert" />
        </div>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
};
