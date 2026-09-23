import { ArrowUpRight } from "lucide-react";
import { LandingContactForm } from "./landing-contact-form";

export function LandingContactSection() {
  return (
    <section
      id="contact"
      data-landing-nav-surface="light"
      className="agenci-editorial"
      aria-labelledby="contact-heading"
    >
      <div className="agenci-contact-grid">
        <div className="agenci-contact-intro">
          <span className="agenci-eyebrow">Vi er mennesker, vi også</span>
          <h2 id="contact-heading">
            Nysgjerrig?
            <br />
            <em>La oss ta en prat.</em>
          </h2>
          <p>
            Fortell litt om bedriften din, eller spør om det du lurer på. Vi
            hjelper deg å finne en god start.
          </p>
          <a href="mailto:hei@agenci.no" className="agenci-text-link">
            hei@agenci.no <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="agenci-contact-panel">
          <LandingContactForm variant="light" />
        </div>
      </div>
    </section>
  );
}
