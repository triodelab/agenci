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
    label: "Kom i gang",
    cards: [
      { title: "Gi den nettsiden din.", text: "Lim inn adressen. Agenci leser sidene og lærer produktene, prisene og reglene deres.", note: "PDF-er og dokumenter kan du legge til etterpå." },
      { title: "Bestem hvordan den snakker.", text: "Du eller De, kort eller grundig. Skriv inn det den aldri skal si.", note: "Den skal høres ut som dere." },
      { title: "Test før kundene gjør det.", text: "Still spørsmålene du vet kommer, og se svarene før chatten går live.", note: "Ingen overraskelser første dag." },
      { title: "Lim inn én kodelinje.", text: "Chatten dukker opp nederst på nettsiden. Virker med WordPress, Shopify, Wix og resten.", note: "Tar et par minutter." },
    ],
  },
  {
    label: "I bruk",
    cards: [
      { title: "Kunnskapsbase", text: "Svarer ut fra det dere selv har skrevet.", note: "" },
      { title: "Svar med én gang", text: "Døgnet rundt, også i helgene.", note: "" },
      { title: "Husker samtalen", text: "Kunden slipper å gjenta seg selv.", note: "" },
      { title: "Viser hva som mangler", text: "Du ser hvilke spørsmål den ikke kunne svare på.", note: "" },
    ],
  },
  {
    label: "Bli bedre",
    cards: [
      { title: "Se hva folk spør om.", text: "Oversikten viser de vanligste spørsmålene og når kundene skriver.", note: "Ofte ting du ikke visste at de lurte på." },
      { title: "Fyll hullene.", text: "Vet ikke agenten svaret, skriver du det inn én gang. Neste kunde får svar.", note: "Kunnskapsbasen blir bedre uke for uke." },
      { title: "Juster tonen.", text: "Er svarene for lange eller for stive? Endre det og test på nytt.", note: "Tar et minutt." },
      { title: "Ta over når det trengs.", text: "Saker agenten ikke skal løse, sendes til deg med hele samtalen.", note: "Kunden merker ingen pause." },
    ],
  },
] as const;

export function LandingOutcomeDemosSection() {
  const [active, setActive] = useState(0);
  /* Byttet animeres først etter første valg — ikke ved sidelasting. */
  const [switched, setSwitched] = useState(false);
  const selectStage = (index: number) => {
    setActive(index);
    setSwitched(true);
  };
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const inAction = active === 1;
  const activeStage = stages[active] ?? stages[0];

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowRight" ? (index + 1) % stages.length
      : event.key === "ArrowLeft" ? (index + stages.length - 1) % stages.length
      : event.key === "Home" ? 0 : event.key === "End" ? stages.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    selectStage(next);
    buttons.current[next]?.focus();
  }

  return (
    <section id="use-cases" className={styles.outcomes} data-landing-nav-surface="light" aria-labelledby="outcome-heading">
      <div className={styles.outcomeFrame}>
        <header className={styles.outcomeHeader}>
          <span className={styles.outcomeEyebrow}>Gode samtaler betyr noe</span>
          <h2 id="outcome-heading">
            Fra første oppsett<br />
            <span>til daglig bruk.</span>
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
                onClick={() => selectStage(index)}
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
                  <div key={`copy-${active}`} className={`${styles.cardCopy} ${switched ? styles.outcomeCopyIn : ""}`}>
                    <span className={styles.outcomeLabel}>{inAction ? "I praksis" : `Steg 0${active + 1}`}</span>
                    <h3>{content.title}</h3>
                    <p>{content.text}</p>
                  </div>
                  {inAction ? (
                    <ProductDemo className={styles.outcomeAnimation} scene={card.scene} description={card.description} />
                  ) : (
                    <div key={`note-${active}`} className={`${styles.outcomeNote} ${switched ? styles.outcomeCopyIn : ""}`}>
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
