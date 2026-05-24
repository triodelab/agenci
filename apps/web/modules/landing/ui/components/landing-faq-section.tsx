"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LANDING_SECTION_IDS, landingSectionHref } from "@/modules/landing/constants";

const faqs = [
  {
    q: "Er dette ikke bare en vanlig chatbot?",
    a: "Nei. Vanlige chatboter gir forhåndsdefinerte svar på forhåndsdefinerte spørsmål — og krasjer med alt annet. Agenci leser innholdet ditt og svarer fritt basert på det. Stiller kunden et spørsmål du ikke har dekket, sier den fra og tilbyr å koble til deg — i stedet for å gjette.",
  },
  {
    q: "Hvor lang tid tar det å sette opp?",
    a: "Under 5 minutter for det grunnleggende. Last opp FAQ-en din, lim inn én kodelinje på nettsiden, og du er live. Ingen utvikler nødvendig. Juster utseende og tone i dashboardet etterpå.",
  },
  {
    q: "Hva skjer hvis agenten svarer feil?",
    a: "Du ser alle samtaler i dashboardet og kan oppdatere innholdet når som helst. Hvis agenten er usikker, sier den tydelig fra til kunden i stedet for å gjette. Du kan også sette regler for hva den aldri skal svare på.",
  },
  {
    q: "Hva med GDPR og personvern?",
    a: "Agenci er bygd med GDPR i tankene. Du eier dataene dine. Vi bruker ikke samtaler til trening uten eksplisitt avtale. Du kan slette alt til enhver tid — uten å måtte ta kontakt med oss.",
  },
  {
    q: "Hva skjer når en kunde trenger å snakke med et menneske?",
    a: "Du ser samtalen live i dashboardet og kan ta over med ett klikk. Kunden slipper å forklare alt på nytt — all historikk er synlig for deg fra det øyeblikket du overtar.",
  },
  {
    q: "Hva koster det etter prøveperioden?",
    a: "Gratis-planen er gratis for alltid og gir deg 50 samtaler i måneden. Starter-planen koster 499 kr per måned. Ingen bindingstid — bytt plan eller si opp når som helst.",
  },
] as const;

export function LandingFaqSection() {
  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      data-landing-nav-surface="light"
      className="bg-[#F9F9F9]"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.8fr] lg:gap-20 xl:gap-28">

          {/* Left — sticky */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8A8A8A]">
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="text-[1.75rem] font-bold leading-[1.1] tracking-[-0.038em] text-[#1C1C1C] sm:text-[2.1rem]"
            >
              Spørsmål vi får ofte
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#6B6B6B]">
              Finner du ikke svaret du leter etter?
            </p>
            <Link
              href={landingSectionHref("contact")}
              className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-[#8A8A8A] transition-colors hover:text-[#1C1C1C]"
            >
              Send oss en melding
              <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          </div>

          {/* Right — accordion */}
          <Accordion type="single" collapsible defaultValue="item-0">
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border-[#E4DFD9]"
              >
                <AccordionTrigger className="py-5 text-left text-[14px] font-semibold leading-snug text-[#1C1C1C] hover:text-[#1C1C1C] hover:no-underline [&>svg]:text-[#A8A29E] [&[data-state=open]>svg]:text-[#6B6B6B]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[13.5px] leading-[1.75] text-[#6B6B6B]">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
