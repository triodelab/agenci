"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { FileText } from "lucide-react";
import { ProductDemo } from "./product-demo";
import styles from "./product-story.module.css";

const cards = [
  { id: "ai-training", scene: "knowledge", description: "Nettsider, dokumenter og vanlige spørsmål samles i kunnskapsbasen og brukes til å svare kunden." },
  { id: "automatic-support", scene: "tickets", description: "Agenci svarer på vanlige spørsmål, mens en samtale som trenger personlig hjelp sendes til teamet." },
  { id: "ai-chat", scene: "conversation", description: "En kunde spør om å bytte en gave og får et svar som følger sammenhengen i samtalen." },
  { id: "optimize", scene: "insights", description: "Kundenes spørsmål blir til innsikt om hva som bør oppdateres i kunnskapsbasen." },
] as const;

const stages = [
  {
    label: "Koble til",
    cards: [
      { title: "Samle kunnskapen.", text: "Legg til nettsiden, dokumentene og svarene dere allerede har.", note: "Ett felles utgangspunkt for gode svar." },
      { title: "Finn deres stemme.", text: "Velg tonen og gi tydelige instrukser for hvordan Agenci skal hjelpe.", note: "Deres språk. Deres måte å møte kunder på." },
      { title: "Prøv en samtale.", text: "Test spørsmålene kundene faktisk stiller, og juster svarene før dere starter.", note: "Bli trygg på hjelpen kundene møter." },
      { title: "Ønsk kundene velkommen.", text: "Legg Agenci på nettsiden, og gi kunden en enkel vei til hjelp.", note: "Tilpasset nettsiden og bedriften deres." },
    ],
  },
  {
    label: "Se Agenci i arbeid",
    cards: [
      { title: "Kunnskapsbase", text: "Svar fra kunnskapen dere allerede har.", note: "" },
      { title: "Automatiske svar", text: "La Agenci ta de vanlige spørsmålene.", note: "" },
      { title: "Samtaler med kontekst", text: "Svar som følger samtalen videre.", note: "" },
      { title: "Bedre for hver samtale", text: "Gjør kundenes spørsmål til nyttig innsikt.", note: "" },
    ],
  },
  {
    label: "Forbedre",
    cards: [
      { title: "Lytt til spørsmålene.", text: "Se hva kundene lurer på, og hvor samtalene trenger et tydeligere svar.", note: "Innsikt fra samtalene, samlet på ett sted." },
      { title: "Fyll inn det som mangler.", text: "Oppdater nettsider, dokumenter og vanlige spørsmål med kunnskapen kunden trenger.", note: "Bedre kilder gir et bedre grunnlag for svar." },
      { title: "Finjuster hjelpen.", text: "Juster tonen og instruksjonene. Prøv samtalen på nytt og se hva som fungerer.", note: "Små forbedringer, i deres eget tempo." },
      { title: "Ha teamet i ryggen.", text: "Følg opp samtalene som trenger et menneske, og ta læringen med videre.", note: "Teknologi og mennesker, med samme oversikt." },
    ],
  },
] as const;

export function LandingOutcomeDemosSection() {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const inAction = active === 1;
  const activeStage = stages[active] ?? stages[0];

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % stages.length
      : event.key === "ArrowLeft" ? (index + stages.length - 1) % stages.length
      : event.key === "Home" ? 0 : event.key === "End" ? stages.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section id="use-cases" className={styles.outcomes} data-landing-nav-surface="light" aria-labelledby="outcome-heading">
      <div className={styles.outcomeFrame}>
        <header className={styles.outcomeHeader}>
          <span className={styles.outcomeEyebrow}>Gode samtaler betyr noe</span>
          <h2 id="outcome-heading">
            Fra gode samtaler<br />
            til <span>en enklere hverdag for alle.</span>
          </h2>
          <div className={styles.outcomeTabs} role="tablist" aria-label="Tre steg med Agenci" aria-orientation="horizontal">
            {stages.map((stage, index) => (
              <button
                key={stage.label}
                ref={(element) => { buttons.current[index] = element; }}
                id={`outcome-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={active === index}
                aria-controls="outcome-panel"
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
              >
                <span className={styles.outcomeStageNumber} aria-hidden="true">0{index + 1}</span>
                {stage.label}
              </button>
            ))}
          </div>
        </header>
        <div id="outcome-panel" className={styles.outcomeGrid} role="tabpanel" aria-labelledby={`outcome-tab-${active}`} tabIndex={0}>
          {cards.map((card, index) => {
            const content = activeStage.cards[index];
            if (!content) return null;
            return (
              <div className={styles.outcomeCell} key={card.id}>
                <article id={card.id} className={`${styles.outcomeCard} ${index === 1 ? styles.outcomeCardFeatured : ""} ${inAction ? styles.outcomeCardInAction : ""}`}>
                  <div key={`copy-${active}`} className={`${styles.cardCopy} ${styles.outcomeCopyIn}`}>
                    <span className={styles.outcomeLabel}>{inAction ? "I praksis" : `Steg 0${active + 1}`}</span>
                    <h3>{content.title}</h3>
                    <p>{content.text}</p>
                  </div>
                  {inAction ? (
                    <ProductDemo className={styles.outcomeAnimation} scene={card.scene} description={card.description} />
                  ) : (
                    <div key={`note-${active}`} className={`${styles.outcomeNote} ${styles.outcomeCopyIn}`}>
                      <FileText size={11} strokeWidth={1.2} aria-hidden="true" />
                      <p>{content.note}</p>
                    </div>
                  )}
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
