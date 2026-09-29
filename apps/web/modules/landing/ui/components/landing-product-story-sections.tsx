import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  MessageCircle,
  Plus,
  Settings2,
} from "lucide-react";
import { ProductDemo } from "./product-demo";
import { InteractiveProductDemo } from "./interactive-demo";
import type { ProductDemoScene } from "../../product-demo-config";
import styles from "./product-story.module.css";
import { LANDING_AUTH_PATHS } from "../../constants";
export { LandingOutcomeDemosSection } from "./landing-outcome-section";

/** Photography gives the glass a real backdrop; copy stays on a solid white surface. */
function NatureDemo({
  scene,
  description,
  image,
  className = "",
}: {
  scene: ProductDemoScene;
  description: string;
  image: "sky" | "touch" | "hills";
  className?: string;
}) {
  return (
    <div className={`${styles.natureMedia} ${className}`}>
      <Image
        src={`/images/agenci-nature-${image}.webp`}
        alt=""
        fill
        sizes="(max-width: 700px) 100vw, (max-width: 1300px) 65vw, 820px"
        className={styles.natureBackdrop}
      />
      <ProductDemo scene={scene} description={description} />
    </div>
  );
}

export function LandingMeetSection() {
  return (
    <section
      id="product"
      className={styles.meet}
      data-landing-nav-surface="light"
      aria-labelledby="meet-heading"
    >
      <div className={styles.container}>
        <header className={styles.centerHeading}>
          <span className={styles.eyebrow}>Dashbordet ditt</span>
          <h2 id="meet-heading">Møt Agenci.</h2>
          <p>Alt kundene spør om, og hvordan det gikk. På én side.</p>
        </header>
        <div id="dashboard-scroll" className={styles.dashboardStage}>
          <InteractiveProductDemo />
        </div>
        <div className={styles.meetCaption}>
          <p>
            Se hva kundene lurer på, hva agenten har løst
            <br />
            og hvilke samtaler som venter på deg.
          </p>
          <Link className={styles.textLink} href="/produktet">
            Se produktet <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LandingBrandSection() {
  return (
    <section
      id="your-brand"
      className={`${styles.section} ${styles.brandSection}`}
      data-landing-nav-surface="light"
      aria-labelledby="brand-heading"
    >
      <div className={styles.container}>
        <header className={styles.brandHeading}>
          <span className={styles.pill}>
            <span /> Deres stemme
          </span>
          <h2 id="brand-heading">
            Den snakker
            <br />
            <span>slik dere gjør.</span>
          </h2>
        </header>
        <div className={styles.featureRows}>
          <article
            className={styles.featureRow}
            aria-labelledby="brand-tone-heading"
          >
            <div className={styles.featureCopy}>
              <h3 id="brand-tone-heading">
                Du bestemmer
                <br />
                hvordan den snakker.
              </h3>
              <p>
                Varm eller saklig, du eller De, kort eller grundig. Skriv inn
                det den aldri skal si, og prøv svarene før kundene ser dem.
              </p>
              <ul className={styles.featureDetails}>
                <li>
                  <span>
                    <Settings2 size={20} aria-hidden="true" />
                  </span>
                  Tone og tiltale
                </li>
                <li>
                  <span>
                    <FileText size={20} aria-hidden="true" />
                  </span>
                  Regler og ting å unngå
                </li>
                <li>
                  <span>
                    <MessageCircle size={20} aria-hidden="true" />
                  </span>
                  Test før du publiserer
                </li>
              </ul>
            </div>
            <NatureDemo
              scene="brand"
              image="sky"
              className={styles.featureMedia}
              description="En varm og tydelig tone velges i agentens innstillinger og gjenspeiles i et testsvar."
            />
          </article>
          <article
            id="integrations"
            className={`${styles.featureRow} ${styles.featurePresence}`}
            aria-labelledby="brand-presence-heading"
          >
            <div className={styles.featureCopy}>
              <h3 id="brand-presence-heading">
                Ser ut som resten
                <br />
                av nettsiden.
              </h3>
              <p>
                Agenci henter logoen og fargene fra nettsiden deres, så chatten
                passer inn fra første dag.
              </p>
            </div>
            <NatureDemo
              scene="presence"
              image="hills"
              className={`${styles.hillMedia} ${styles.featureMedia}`}
              description="En Agenci-chat åpnes på en illustrativ nettside og ønsker kunden velkommen."
            />
          </article>
        </div>
        <div className={styles.bento}>
          <article
            id="security-behavior"
            className={`${styles.bentoCard} ${styles.handoffCard}`}
          >
            <div className={styles.bentoCopy}>
              <h3>
                Når det trengs
                <br />
                et menneske.
              </h3>
              <p>
                Noen saker vil du ta selv. Agenci sender dem til deg med hele
                samtalen, så kunden slipper å forklare alt på nytt.
              </p>
            </div>
            <NatureDemo
              scene="handoff"
              image="touch"
              description="Maria i kundeservice overtar en samtale med kundens spørsmål og historikk tilgjengelig."
            />
          </article>
          <article className={`${styles.bentoCard} ${styles.helpCard}`}>
            <div className={styles.bentoCopy}>
              <h3>
                Fra «jeg lurer på»
                <br />
                til «det passer fint».
              </h3>
              <p>
                Kunden finner en ledig time rett i chatten og får bekreftelsen
                med én gang. Du slipper å ta telefonen.
              </p>
            </div>
            <NatureDemo
              scene="booking"
              image="sky"
              className={styles.bookingMedia}
              description="En kunde finner en ledig fredagstime i samtalen og får en bekreftelse på bestillingen."
            />
          </article>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: "Lim inn nettsiden.",
    text: "Agenci leser innholdet og lærer hva dere selger og hvordan dere jobber.",
  },
  {
    title: "Bestem tonen.",
    text: "Velg hvordan den skal snakke, og hva den ikke skal svare på.",
  },
  {
    title: "Legg chatten på siden.",
    text: "Én kodelinje. Står du fast, hjelper vi deg.",
  },
  {
    title: "Følg med og fyll på.",
    text: "Se samtalene i dashbordet, og skriv inn svarene som mangler.",
  },
];

export function LandingWorkflowSection() {
  return (
    <section
      id="how-agenci-works"
      className={`${styles.section} ${styles.workflow}`}
      data-landing-nav-surface="light"
      aria-labelledby="workflow-heading"
    >
      <div className={styles.container}>
        <header className={styles.workflowHeading}>
          <div>
            <span className={styles.eyebrow}>
              Slik kommer du i gang
            </span>
            <h2 id="workflow-heading">
              Enkelt å
              <br />
              <span>komme i gang.</span>
            </h2>
          </div>
          <p>
            Du trenger ikke skrive en eneste FAQ fra bunnen av. Agenci
            starter med det som allerede står på nettsiden din, og så fyller
            du på etter hvert.
          </p>
        </header>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div id="final-cta" className={styles.startBar}>
          <div>
            <h3>Prøv den på din egen nettside.</h3>
            <p>Gratis opp til 50 samtaler i måneden. Ingen kort, ingen binding.</p>
          </div>
          <div id="contact" className={styles.actions}>
            <Link className={styles.primaryLink} href={LANDING_AUTH_PATHS.signUp}>
              Prøv gratis <ArrowRight size={18} />
            </Link>
            <Link className={styles.secondaryLink} href="/kontakt">
              Book en prat <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className={styles.practical}>
          <details id="faq" className={styles.disclosure}>
            <summary>
              Et par ting du kanskje lurer på <Plus size={20} />
            </summary>
            <div className={styles.quickAnswers}>
              <div>
                <h3>Hvor får Agenci svarene fra?</h3>
                <p>
                  Fra nettsiden din og dokumentene du laster opp. Den holder
                  seg til det dere har lagt inn, og sier fra når den ikke vet
                  svaret i stedet for å gjette.
                </p>
              </div>
              <div>
                <h3>Kan jeg ta over en samtale?</h3>
                <p>
                  Ja. Du ser samtalene mens de pågår og kan svare selv når
                  som helst. Kunden ser hele tråden, og merker ingen pause.
                </p>
              </div>
              <div>
                <h3>Trenger jeg hjelp med oppsettet?</h3>
                <p>
                  De fleste klarer det selv på en kvarters tid. Står du fast,
                  hjelper vi deg.{" "}
                  <Link href="/kontakt">
                    Ta kontakt med oss <ArrowUpRight size={14} />
                  </Link>
                </p>
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
