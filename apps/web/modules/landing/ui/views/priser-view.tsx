"use client";

import {
	ArrowRight,
	ArrowUpRight,
	Check,
	MessageCircle,
	Minus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
	LANDING_AUTH_PATHS,
	LANDING_CONTACT_PAGE_PATH,
} from "@/modules/landing/constants";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import story from "@/modules/landing/ui/components/product-story.module.css";
import local from "./priser.module.css";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Bullet = { text: string; included: boolean };

type Plan = {
	id: string;
	name: string;
	monthlyPrice: number;
	yearlyPrice: number;
	conversations: string;
	blurb: string;
	featured: boolean;
	cta: string;
	bullets: Bullet[];
};

const PLANS: Plan[] = [
	{
		id: "gratis",
		name: "Gratis",
		monthlyPrice: 0,
		yearlyPrice: 0,
		conversations: "50 samtaler / mnd",
		blurb: "Se hva Agenci gjør for deg — uten å legge inn kortinfo.",
		featured: false,
		cta: "Start gratis",
		bullets: [
			{ text: "1 AI-agent", included: true },
			{ text: "Timebestilling i chatten", included: false },
			{ text: "Chat-widget på nettsiden", included: true },
			{ text: "1 teammedlem", included: true },
			{ text: "Grunnleggende analyser", included: true },
			{ text: "Fjern «Powered by Agenci»", included: false },
			{ text: "Prioritert support", included: false },
		],
	},
	{
		id: "starter",
		name: "Starter",
		monthlyPrice: 499,
		yearlyPrice: 399,
		conversations: "500 samtaler / mnd",
		blurb: "For deg som er klar til å automatisere de vanligste spørsmålene.",
		featured: false,
		cta: "Kom i gang",
		bullets: [
			{ text: "1 AI-agent", included: true },
			{ text: "Timebestilling i chatten", included: true },
			{ text: "Chat-widget på nettsiden", included: true },
			{ text: "2 teammedlemmer", included: true },
			{ text: "Grunnleggende analyser", included: true },
			{ text: "Fjern «Powered by Agenci»", included: false },
			{ text: "E-poststøtte", included: false },
		],
	},
	{
		id: "pro",
		name: "Pro",
		monthlyPrice: 1499,
		yearlyPrice: 1199,
		conversations: "2 000 samtaler / mnd",
		blurb: "For team som vokser og trenger full kontroll over kundeservice.",
		featured: true,
		cta: "Kom i gang",
		bullets: [
			{ text: "3 AI-agenter", included: true },
			{ text: "Timebestilling i chatten", included: true },
			{ text: "Chat-widget på nettsiden", included: true },
			{ text: "5 teammedlemmer", included: true },
			{ text: "Full analyse og rapporter", included: true },
			{ text: "Fjern «Powered by Agenci»", included: true },
			{ text: "Prioritert e-poststøtte", included: true },
		],
	},
	{
		id: "business",
		name: "Business",
		monthlyPrice: 3999,
		yearlyPrice: 3199,
		conversations: "10 000 samtaler / mnd",
		blurb: "Når én agent ikke er nok og dere trenger alt på plass.",
		featured: false,
		cta: "Kom i gang",
		bullets: [
			{ text: "10 AI-agenter", included: true },
			{ text: "Timebestilling i chatten", included: true },
			{ text: "Alle integrasjoner", included: true },
			{ text: "Ubegrenset teammedlemmer", included: true },
			{ text: "Full analyse + CSV-eksport", included: true },
			{ text: "Fjern «Powered by Agenci»", included: true },
			{ text: "Dedikert support", included: true },
		],
	},
];

const nok = (n: number) => Math.round(n).toLocaleString("nb-NO");

/** Counts smoothly to `value` (instant with reduced motion). */
function useTween(value: number, ms = 480) {
	const [shown, setShown] = useState(value);
	const from = useRef(value);
	useEffect(() => {
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduce || from.current === value) {
			from.current = value;
			setShown(value);
			return;
		}
		const start = performance.now();
		const a = from.current;
		let raf = 0;
		const tick = (now: number) => {
			const k = Math.min(1, (now - start) / ms);
			const e = 1 - (1 - k) ** 3;
			const v = a + (value - a) * e;
			from.current = v;
			setShown(v);
			if (k < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [value, ms]);
	return shown;
}

// ─── View ─────────────────────────────────────────────────────────────────────

export function PriserView() {
	const [isYearly, setIsYearly] = useState(false);

	return (
		<>
			<LandingNav variant="auto" />
			<main className="landing-warp min-h-svh overflow-x-clip bg-[#FAFAFA] antialiased [text-rendering:optimizeLegibility]">
				<div className={story.root} data-agenci-product-sections>
					{/* Hero + billing */}
					<section
						className={local.hero}
						data-landing-nav-surface="light"
						aria-labelledby="pricing-heading"
					>
						<div className={story.container}>
							<span className={story.eyebrow}>Priser</span>
							<h1 id="pricing-heading" className={local.title}>
								Start enkelt.
								<br />
								<span>Voks i ditt tempo.</span>
							</h1>
							<p className={local.lead}>
								Ingen kortinfo for å starte. Ingen bindingstid. Bytt eller si
								opp planen når dere vil.
							</p>
							<div className={local.billing}>
								<fieldset
									className={local.switch}
									data-yearly={isYearly}
									aria-label="Faktureringsperiode"
								>
									<span className={local.thumb} aria-hidden="true" />
									<button
										type="button"
										aria-pressed={!isYearly}
										onClick={() => setIsYearly(false)}
									>
										Månedlig
									</button>
									<button
										type="button"
										aria-pressed={isYearly}
										onClick={() => setIsYearly(true)}
									>
										Årlig
									</button>
								</fieldset>
								<span className={local.save} data-active={isYearly}>
									Spar 20 % med årlig fakturering
								</span>
							</div>
						</div>
					</section>

					{/* Plans */}
					<section
						className={story.section}
						style={{ paddingTop: 24 }}
						data-landing-nav-surface="light"
						aria-label="Planer"
					>
						<div className={story.container}>
							<div className={local.plans}>
								{PLANS.map((plan) => (
									<PlanCard key={plan.id} plan={plan} yearly={isYearly} />
								))}
							</div>
							<p className={local.footnote}>
								Alle priser ekskl. 25 % MVA · Ingen bindingstid
								{isYearly ? " · Faktureres årlig" : ""}
							</p>

							<div className={local.enterprise}>
								<div>
									<h3>Noe litt større?</h3>
									<p>
										La oss finne et oppsett som passer organisasjonen deres.
									</p>
								</div>
								<Link
									className={story.secondaryLink}
									href={LANDING_CONTACT_PAGE_PATH}
								>
									Snakk med oss <ArrowUpRight size={18} />
								</Link>
							</div>
						</div>
					</section>

					{/* Closing */}
					<section
						className={`${story.section} ${story.workflow}`}
						data-landing-nav-surface="light"
						aria-labelledby="pricing-cta-heading"
					>
						<div className={story.container}>
							<div className={story.startBar}>
								<div>
									<h3 id="pricing-cta-heading">
										Prøv Agenci gratis — ingen kort, ingen binding.
									</h3>
									<p>
										Kom i gang på under fem minutter, eller snakk med oss om et
										oppsett som passer volumet deres.
									</p>
								</div>
								<div className={story.actions}>
									<AuthAwareLink
										href={LANDING_AUTH_PATHS.signUp}
										loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
										className={story.primaryLink}
									>
										Start gratis <ArrowRight size={18} />
									</AuthAwareLink>
									<Link
										className={story.secondaryLink}
										href={LANDING_CONTACT_PAGE_PATH}
									>
										Kontaktskjema <ArrowUpRight size={18} />
									</Link>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
			<div className="bg-[#FAFAFA]">
				<LandingFooter />
			</div>
		</>
	);
}

function PlanCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
	const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
	const shown = useTween(price);
	const free = plan.monthlyPrice === 0;

	return (
		<article
			className={`${local.card} ${plan.featured ? local.featured : ""}`}
			aria-labelledby={`plan-${plan.id}`}
		>
			{plan.featured ? <span className={local.badge}>Mest populær</span> : null}
			<h2 id={`plan-${plan.id}`} className={local.planName}>
				{plan.name}
			</h2>
			<p className={local.blurb}>{plan.blurb}</p>

			<div className={local.price}>
				<span className={local.amount}>{nok(shown)}</span>
				{free ? null : <span className={local.per}>kr / mnd</span>}
			</div>
			<p className={local.billed}>
				{yearly && !free ? (
					<s className={local.was}>
						<span className="sr-only">før </span>
						{nok(plan.monthlyPrice)} kr
					</s>
				) : null}
				{free
					? "Alltid gratis"
					: yearly
						? `Faktureres ${nok(price * 12)} kr/år`
						: "Faktureres månedlig"}
			</p>

			<div className={local.quota}>
				<MessageCircle size={16} aria-hidden="true" />
				{plan.conversations}
			</div>

			<AuthAwareLink
				href={LANDING_AUTH_PATHS.signUp}
				loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
				className={local.cta}
			>
				{plan.cta} <ArrowRight size={16} />
			</AuthAwareLink>

			<ul className={local.features}>
				{plan.bullets.map((b) => (
					<li key={b.text} className={b.included ? undefined : local.excluded}>
						{b.included ? (
							<Check size={16} strokeWidth={2.2} aria-hidden="true" />
						) : (
							<Minus size={16} aria-hidden="true" />
						)}
						<span>
							{b.text}
							{b.included ? null : (
								<span className="sr-only"> (ikke inkludert)</span>
							)}
						</span>
					</li>
				))}
			</ul>
		</article>
	);
}
