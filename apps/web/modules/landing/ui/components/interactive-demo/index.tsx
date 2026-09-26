"use client";

import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, PanelLeft, Zap } from "lucide-react";
import { createDemoState } from "./demo-state";
import { DEMO_AGENT, demoNavigation } from "./demo-navigation";
import { DemoOverview } from "./overview";
import s from "./interactive-demo.module.css";

const STATE = createDemoState();
const noop = () => {};

/**
 * A still of the Agenci dashboard (apps/dashboard) with example data, set in
 * the valley photo. Shown, not operated: the window is `inert`.
 */
export function InteractiveProductDemo() {
  return (
    <div className={`${s.landscape} ${s.scene}`}>
      <Image
        src="/images/agenci-meet-norwegian-valley-v2.webp"
        alt=""
        fill
        sizes="(max-width: 1500px) 100vw, 1380px"
        className={s.wallpaper}
        draggable={false}
      />
      <div
        className={s.app}
        inert
        role="img"
        aria-label="Agenci-dashbordet med eksempeldata: varsler, løsningsgrad, samtaler og kunnskapsbase"
      >
        <aside className={s.sidebar}>
          <div className={s.brandRow}>
            <div className={s.wordmark}>
              <Image src="/AgenciLogo.png" alt="" width={26} height={26} />
              <span>genci</span>
            </div>
            <PanelLeft size={16} strokeWidth={1.5} />
          </div>

          <span className={s.backLink}>
            <ChevronLeft size={15} />
            Alle agenter
          </span>

          <nav className={s.navigation}>
            <span className={s.navLabel}>{DEMO_AGENT}</span>
            {demoNavigation.map(({ id, label, icon: Icon }) => (
              <span key={id} className={s.navItem} data-active={id === "overview"}>
                <Icon size={15} strokeWidth={1.6} />
                <span>{label}</span>
              </span>
            ))}
          </nav>

          <div className={s.sidebarBottom}>
            <div className={s.upgradeCard}>
              <span className={s.upgradeIcon}>
                <Zap size={13} />
              </span>
              <strong>Oppgrader plan</strong>
              <small>Lås opp AI-agenter, kunnskapsbase og tilpasning</small>
              <span className={s.upgradeButton}>
                Se planer <ArrowRight size={11} />
              </span>
            </div>
          </div>
        </aside>

        <div className={s.main}>
          <div className={s.topbar}>
            <div className={s.crumbs}>
              <span>Agenter</span>
              <ChevronRight size={12} className={s.crumbSep} />
              <strong>{DEMO_AGENT}</strong>
            </div>
            <span className={s.demoSwitch} data-on="true">
              <i />
              Demodata
            </span>
          </div>

          <div className={s.view}>
            <DemoOverview
              state={STATE}
              demoData
              navigate={noop}
              openConversations={noop}
            />
          </div>

          <p className={s.footer}>Eksempeldata</p>
        </div>
      </div>
      {/* Decorative scenery sits in front of the window, never in the hit-test path. */}
      <div className={s.foreground} aria-hidden="true">
        <Image
          src="/images/agenci-meet-norwegian-valley-v2.webp"
          alt=""
          fill
          sizes="(max-width: 1500px) 100vw, 1380px"
          className={s.foregroundPhoto}
          draggable={false}
        />
      </div>
    </div>
  );
}
