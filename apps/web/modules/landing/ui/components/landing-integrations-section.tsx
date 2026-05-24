"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Code2Icon, WebhookIcon } from "lucide-react";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";

type Integration = {
  id: string;
  name: string;
  category: string;
  logo: string | null;
  iconColor?: string;
  iconLetter?: string;
  live: boolean;
  icon?: "code" | "webhook";
};

const INTEGRATIONS: Integration[] = [
  {
    id: "widget",
    name: "Nettside",
    category: "Widget-integrasjon",
    logo: null,
    icon: "code",
    live: true,
  },
  {
    id: "hubspot",
    name: "HubSpot",
    category: "CRM",
    logo: "/brands/hubspot.svg",
    live: false,
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "E-handel",
    logo: "/brands/shopify.svg",
    live: false,
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "E-post",
    logo: "/brands/gmail.svg",
    live: false,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    category: "API & automatisering",
    logo: null,
    icon: "webhook",
    live: false,
  },
  {
    id: "slack",
    name: "Slack",
    category: "Intern chat",
    logo: null,
    iconColor: "#4A154B",
    iconLetter: "S",
    live: false,
  },
];

export function LandingIntegrationsSection() {
  const reduceMotion = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      id={LANDING_SECTION_IDS.integrations}
      data-landing-nav-surface="dark"
      className="border-t border-[#2a2a2a] bg-[#1C1C1C]"
      aria-labelledby="integrations-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-12 xl:gap-20 xl:items-center">

          {/* Left */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              Integrasjoner
            </p>
            <h2
              id="integrations-heading"
              className="text-[2rem] font-bold leading-[1.07] tracking-[-0.038em] text-[#f2f3f5] sm:text-[2.6rem] md:text-[3.2rem]"
            >
              Passer inn der dere allerede jobber
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.7] text-[#6b7280]">
              Start med widgeten på nettsiden — den er klar i dag. Koble til CRM, e-post og nettbutikk etter hvert, slik at Agenci glir inn i arbeidsflyten din uten friksjon.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                <span className="size-1.5 rounded-full bg-[#27a644]" />
                Nettside-widget tilgjengelig nå
              </span>
              <span className="text-[#2a2a2a]">·</span>
              <span className="text-[13px] text-[#3d4149]">
                Flere integrasjoner under utvikling
              </span>
            </div>
          </motion.div>

          {/* Right — grid */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {INTEGRATIONS.map((integration, i) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                index={i}
                reduceMotion={reduceMotion ?? false}
                ease={[...ease]}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function IntegrationCard({
  integration,
  index,
  reduceMotion,
  ease,
}: {
  integration: Integration;
  index: number;
  reduceMotion: boolean;
  ease: [number, number, number, number];
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: 0.06 + index * 0.055, ease }}
      whileHover={reduceMotion ? undefined : { y: -3, transition: { duration: 0.18, ease: "easeOut" } }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-4 transition-[border-color,box-shadow] duration-200 hover:border-[#3a3a3a] hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]"
    >
      <div className="mb-5 flex items-start justify-between">
        <IntegrationIcon integration={integration} />
        {integration.live ? (
          <span className="flex size-1.5 shrink-0 rounded-full bg-[#27a644] mt-0.5 shadow-[0_0_6px_1px_rgba(39,166,68,0.4)]" />
        ) : (
          <span className="rounded-full border border-[#2a2a2a] bg-[#0a0b0c] px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.15em] text-[#3d4149]">
            Snart
          </span>
        )}
      </div>

      <div>
        <p className="text-[13px] font-semibold tracking-[-0.01em] text-[#d1d5db]">
          {integration.name}
        </p>
        <p className="mt-0.5 text-[11px] text-[#6b7280]">
          {integration.category}
        </p>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[12px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(255,255,255,0.02), transparent 70%)",
        }}
      />
    </motion.div>
  );
}

function IntegrationIcon({ integration }: { integration: Integration }) {
  if (integration.logo) {
    return (
      <div className="flex size-9 items-center justify-center rounded-[8px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <Image
          src={integration.logo}
          alt={integration.name}
          width={22}
          height={22}
          className="object-contain"
        />
      </div>
    );
  }

  if (integration.icon === "code") {
    return (
      <div className="flex size-9 items-center justify-center rounded-[8px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <Code2Icon className="size-4 text-[#9ca3af]" strokeWidth={1.75} />
      </div>
    );
  }

  if (integration.icon === "webhook") {
    return (
      <div className="flex size-9 items-center justify-center rounded-[8px] border border-[#2a2a2a] bg-[#1a1a1a]">
        <WebhookIcon className="size-4 text-[#6b7280]" strokeWidth={1.75} />
      </div>
    );
  }

  if (integration.iconLetter && integration.iconColor) {
    return (
      <div
        className="flex size-9 items-center justify-center rounded-[8px] text-[15px] font-bold text-white"
        style={{ backgroundColor: integration.iconColor + "22", border: `1px solid ${integration.iconColor}33` }}
      >
        <span style={{ color: integration.iconColor }}>{integration.iconLetter}</span>
      </div>
    );
  }

  return (
    <div className="size-9 rounded-[8px] border border-[#2a2a2a] bg-[#1a1b1e]" />
  );
}
