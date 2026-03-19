"use client";

import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";
import { AnimatedGroup } from "@workspace/ui/components/animated-group";
import { TextEffect } from '@workspace/ui/components/text-effect'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { motion, useReducedMotion } from "motion/react";

const transitionVariants = {
    item: {
        hidden: { opacity: 0, filter: 'blur(12px)', y: 16 },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: { type: 'spring' as const, bounce: 0.25, duration: 1.2 },
        },
    },
}

const faqs = [
    {
        q: 'Hvor lang tid tar det å komme i gang?',
        a: 'Vanligvis kan du være live på minutter. Du legger inn widgeten, kobler til innholdet ditt, og justerer hva Agenci får lov til å svare på.',
    },
    {
        q: 'Kan Agenci overføre til et menneske?',
        a: 'Ja. Når Agenci ikke kan hjelpe (eller når kunden ber om det), kan samtalen overføres til teamet ditt for human takeover.',
    },
    {
        q: 'Hvilke spørsmål kan Agenci svare på?',
        a: 'Alt kundeservice kan: vanlige spørsmål, FAQ, reklamasjon, booking, produktinfo, priser, levering og mer. Du kontrollerer innhold og policy via dashboardet.',
    },
    {
        q: 'Hva er Voice (Premium)?',
        a: 'Voice gir Voice In/Out – kunder kan snakke og få svar med naturlig tale. Dette er en premium feature for team som vil tilby en sterkere opplevelse.',
    },
    {
        q: 'Er dette sikkert og GDPR-vennlig?',
        a: 'Vi bygger for B2B. Du har kontroll over hva Agenci kan si, og hvordan data håndteres. Ved Enterprise kan vi også tilpasse krav rundt sikkerhet og avtaler.',
    },
] as const

export function LandingFaqSection() {
    const reduced = useReducedMotion();

    return (
        <section
          id={LANDING_SECTION_IDS.faq}
          aria-labelledby="faq-heading"
          className="relative overflow-hidden bg-background py-24 md:py-36"
        >
            <div
                aria-hidden
                className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-50"
            />
            <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_0%,transparent_0%,var(--color-background)_78%)]"
            />

            <div className="mx-auto max-w-3xl px-6">
                <div id="faq-heading" className="text-center">
                    <AnimatedGroup variants={transitionVariants}>
                        <TextEffect
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            as="h2"
                            className="text-balance text-4xl font-semibold tracking-tight lg:text-[2.75rem]"
                        >
                            FAQ
                        </TextEffect>
                        <TextEffect
                            per="line"
                            preset="fade-in-blur"
                            speedSegment={0.3}
                            delay={0.35}
                            as="p"
                            className="mt-6 text-balance text-lg text-muted-foreground"
                        >
                            Svar på de vanligste spørsmålene om Agenci.
                        </TextEffect>
                    </AnimatedGroup>
                </div>

                <motion.div
                    className="mt-12 rounded-[2rem] border border-border/50 bg-gradient-to-b from-card/95 to-card/85 p-2 shadow-[0_28px_90px_-40px_rgba(15,23,42,0.18)] backdrop-blur-sm dark:shadow-[0_28px_90px_-40px_rgba(0,0,0,0.45)] md:mt-14 md:p-3"
                    initial={reduced ? false : { opacity: 0, y: 22, scale: 0.98 }}
                    whileInView={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.45 }}
                >
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((item) => (
                            <AccordionItem key={item.q} value={item.q} className="border-border/50 px-1">
                                <AccordionTrigger
                                    className={cn(
                                        "rounded-xl px-4 py-5 text-left text-base font-medium hover:no-underline md:px-5 md:py-5",
                                        "data-[state=open]:bg-muted/30",
                                    )}
                                >
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-5 text-base leading-relaxed text-muted-foreground md:px-5">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    )
}

