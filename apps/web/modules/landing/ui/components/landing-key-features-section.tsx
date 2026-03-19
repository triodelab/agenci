"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import React from "react";
import {
    Package,
    DollarSign,
    Truck,
    Handshake,
    Clock,
    Zap,
    HelpCircle,
    Headphones,
    CalendarCheck,
    RefreshCw,
    Languages,
    ClipboardList,
    ShieldCheck,
    Sparkles,
} from 'lucide-react'
import { AnimatedGroup } from '@workspace/ui/components/animated-group'
import { TextEffect } from '@workspace/ui/components/text-effect'
import { motion } from 'motion/react'
import { LandingDashboardPreview } from '@/modules/landing/ui/components/landing-dashboard-preview'

const features = [
    {
        title: 'FAQ og vanlige spørsmål',
        description: 'Svarer på vanlige spørsmål, retningslinjer og policy uansett tema — ikke bare produkter.',
        icon: HelpCircle,
    },
    {
        title: 'Reklamasjon og support',
        description: 'Håndterer henvendelser, klager og eskalering til riktig person i teamet ditt.',
        icon: Headphones,
    },
    {
        title: 'Booking og avtaler',
        description: 'Hjelper med timebestilling, avtaler og oppfølging som en del av kundeservicen.',
        icon: CalendarCheck,
    },
    {
        title: 'Produktinfo',
        description: 'Detaljert informasjon om produkter, spesifikasjoner og funksjoner automatisk.',
        icon: Package,
    },
    {
        title: 'Priser og tilbud',
        description: 'Umiddelbar prisinformasjon, rabatter og tilbud basert på kundens behov.',
        icon: DollarSign,
    },
    {
        title: 'Shipping og levering',
        description: 'Svar om leveringstider, fraktkostnader og sporingsinformasjon.',
        icon: Truck,
    },
    {
        title: 'Human handoff',
        description: 'Overfører sømløst til et menneske når Agenci ikke kan hjelpe.',
        icon: Handshake,
    },
    {
        title: '24/7 tilgjengelighet',
        description: 'Svarer kunder døgnet rundt, uansett tid eller dag.',
        icon: Clock,
    },
    {
        title: 'Rask respons',
        description: 'Umiddelbare svar uten ventetid — hjelp på sekunder.',
        icon: Zap,
    },
    {
        title: 'Ordre og sporlog',
        description: 'Ordrestatus, sporingslenker og forventet levering — uten at kunden må logge inn.',
        icon: ClipboardList,
    },
    {
        title: 'Retur og bytte',
        description: 'Veiledning gjennom retur, bytte og reklamasjon i tråd med policyene deres.',
        icon: RefreshCw,
    },
    {
        title: 'Flerspråklig støtte',
        description: 'Svar på flere språk slik at internasjonale kunder får samme service.',
        icon: Languages,
    },
    {
        title: 'Trygghet og personvern',
        description: 'Klare svar om datalagring, samtykke og sikkerhet — bygger tillit.',
        icon: ShieldCheck,
    },
    {
        title: 'Smarte anbefalinger',
        description: 'Foreslår produkter og tillegg basert på behov, uten å være påtrengende.',
        icon: Sparkles,
    },
]

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 20,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function LandingKeyFeaturesSection() {
    return (
        <section
          id={LANDING_SECTION_IDS.features}
          aria-labelledby="features-heading"
          className="relative overflow-hidden bg-background py-24 md:py-36"
        >
            <div
                aria-hidden
                className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-60"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_0%,transparent_0%,var(--color-background)_78%)]"
            />
            
            <div className="mx-auto max-w-[95rem] px-6 lg:px-16 xl:px-20 2xl:px-24">
                <div className="flex flex-col gap-10 lg:gap-12">
                    {/* Top section - Text and features list */}
                    <div className="w-full">
                        <div id="features-heading" className="mb-10 text-center lg:mb-12">
                            <p className="mb-4 inline-flex rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur-sm">
                                Produktoversikt
                            </p>
                            <AnimatedGroup variants={transitionVariants}>
                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h2"
                                    className="text-balance text-4xl font-semibold tracking-tight lg:text-[2.75rem]">
                                    <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                                        Alt widgeten kan gjøre
                                    </span>
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.3}
                                    as="p"
                                    className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
                                    Kort sagt: funksjoner som dekker hele kundeservicen — fra første kontakt til oppfølging og overlevering til mennesker.
                                </TextEffect>
                            </AnimatedGroup>
                        </div>

                        {/*
                          Ikke bruk display:contents på AnimatedGroup her — motion sitt whileInView
                          får da ikke et synlig snitt, og kortene blir stuck på hidden (opacity: 0).
                        */}
                        <AnimatedGroup
                            variants={transitionVariants}
                            className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                        >
                            {features.map((feature) => {
                                const Icon = feature.icon
                                return (
                                    <motion.div
                                        key={feature.title}
                                        whileHover={{ y: -2 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        className="group flex h-full cursor-default">
                                            <div className="flex h-full min-h-[170px] flex-1 flex-col rounded-2xl border border-border/60 bg-card/90 p-5 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-border group-hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.12)] dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
                                            <div className="mb-4 flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                                                <Icon className="size-5 text-muted-foreground" />
                                            </div>
                                            <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                                            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatedGroup>
                    </div>

                    {/* Bottom section – 3D-lignende scene + dashboard-forhåndsvisning */}
                    <div className="relative mx-auto w-full max-w-[min(100%,90rem)]">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-background via-background/80 to-transparent lg:h-48"
                        />
                        <div className="landing-key-features-perspective pl-1 sm:pl-3 lg:pl-8 xl:pl-14">
                            <div className="landing-key-features-stage">
                                <LandingDashboardPreview />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
