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
import { LandingPricingSection } from "./landing-pricing-section";
import type { ProductDemoScene } from "../../product-demo-config";
import styles from "./product-story.module.css";
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
          <span className={styles.eyebrow}>En enklere hverdag starter her</span>
          <h2 id="meet-heading">Møt Agenci.</h2>
          <p>God hjelp for kundene. God oversikt for deg.</p>
        </header>
        <div id="dashboard-scroll" className={styles.dashboardStage}>
          <InteractiveProductDemo />
        </div>
        <div className={styles.meetCaption}>
          <p>
            Kunnskap, samtaler og mennesker.
            <br />
            Samlet på ett sted.
          </p>
          <Link className={styles.textLink} href="/hvordan-det-virker">
            Bli kjent med Agenci <ArrowUpRight size={18} />
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
            <span /> Laget for din bedrift
          </span>
          <h2 id="brand-heading">
            Hver samtale betyr noe.
            <br />
            <span>La hjelpen føles som dere.</span>
          </h2>
        </header>
        <div className={styles.featureRows}>
          <article
            className={styles.featureRow}
            aria-labelledby="brand-tone-heading"
          >
            <div className={styles.featureCopy}>
              <h3 id="brand-tone-heading">
                Deres kunnskap.
                <br />
                Deres måte å si det på.
              </h3>
              <p>
                Tilpass tonen, gi tydelige instrukser og prøv svarene før
                kundene møter dem.
              </p>
              <ul className={styles.featureDetails}>
                <li>
                  <span>
                    <Settings2 size={20} aria-hidden="true" />
                  </span>
                  Tilpass tonen
                </li>
                <li>
                  <span>
                    <FileText size={20} aria-hidden="true" />
                  </span>
                  Gi tydelige instrukser
                </li>
                <li>
                  <span>
                    <MessageCircle size={20} aria-hidden="true" />
                  </span>
                  Prøv svarene
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
                En del av
                <br />
                nettsiden din.
              </h3>
              <p>Samme uttrykk. En ny måte å hjelpe på.</p>
              <div className={styles.featureLink}>
                <Link href="/integrasjoner" className={styles.textLink}>
                  Se integrasjoner <ArrowUpRight size={20} aria-hidden="true" />
                </Link>
              </div>
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
                Teknologi.
                <br />
                Med folk i ryggen.
              </h3>
              <p>
                Noen spørsmål trenger et menneske. La teamet ta over, uten en ny
                start.
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
                Gjør veien videre enkel. Hjelp kunden å finne en tid, få et svar
                og komme videre med dagen.
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
    title: "Gi Agenci kunnskap.",
    text: "Legg til nettsiden, dokumentene og svarene dere allerede har.",
  },
  {
    title: "Finn deres stemme.",
    text: "Sett tonen og rammene. Prøv spørsmålene kundene faktisk stiller.",
  },
  {
    title: "Ønsk kundene velkommen.",
    text: "Legg chatten på nettsiden, og følg samtalene fra oversikten.",
  },
  {
    title: "Lær. Juster. Gjenta.",
    text: "Se hvor svarene kan bli bedre. Oppdater innholdet i deres tempo.",
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
              Fra første spørsmål til nyttig hjelp
            </span>
            <h2 id="workflow-heading">
              Enkelt å starte.
              <br />
              <span>Rom for å bli bedre.</span>
            </h2>
          </div>
          <p>
            Du kjenner bedriften din best. Agenci hjelper deg å gjøre den
            kunnskapen tilgjengelig – én god samtale av gangen.
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
            <h3>Klar for den første samtalen?</h3>
            <p>Start gratis, eller finn riktig oppsett sammen med oss.</p>
          </div>
          <div id="contact" className={styles.actions}>
            <Link className={styles.primaryLink} href="/sign-up">
              Kom i gang gratis <ArrowRight size={18} />
            </Link>
            <Link className={styles.secondaryLink} href="/kontakt">
              Snakk med oss <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
        <div className={styles.practical}>
          <details id="pricing" className={styles.disclosure}>
            <summary>
              Se priser og finn din plan <Plus size={20} />
            </summary>
            <LandingPricingSection embedded />
          </details>
          <details id="faq" className={styles.disclosure}>
            <summary>
              Et par ting du kanskje lurer på <Plus size={20} />
            </summary>
            <div className={styles.quickAnswers}>
              <div>
                <h3>Hva bruker Agenci til å svare?</h3>
                <p>
                  Innholdet dere legger til i kunnskapsbasen og instruksjonene
                  dere gir agenten. Start med de spørsmålene dere får oftest, og
                  test svarene før publisering.
                </p>
              </div>
              <div>
                <h3>Kan et menneske overta?</h3>
                <p>
                  Ja. Teamet kan følge samtalene og overta når kunden trenger
                  personlig hjelp. Historikken blir med videre.
                </p>
              </div>
              <div>
                <h3>Trenger vi hjelp med oppsettet?</h3>
                <p>
                  Vi hjelper dere å komme i gang.{" "}
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
