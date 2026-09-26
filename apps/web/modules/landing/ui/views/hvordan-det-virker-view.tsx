import {
	ArrowRight,
	ArrowUpRight,
	BookOpen,
	Gauge,
	Globe,
	Inbox,
	MessageCircle,
	MousePointerClick,
	Network,
	Palette,
	ShieldCheck,
	SlidersHorizontal,
	UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	LANDING_AUTH_PATHS,
	LANDING_CONTACT_PAGE_PATH,
} from "@/modules/landing/constants";
import TRACKS from "@/modules/landing/hvordan-video-tracks.json";
import {
	CinematicMacbook,
	type VideoTrack,
} from "@/modules/landing/ui/components/cinematic-macbook";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import story from "@/modules/landing/ui/components/product-story.module.css";
import local from "./hvordan-det-virker.module.css";

/** Screenshots are captured from the real dashboard (public/images/hvordan). */
const SHOT = (name: string) => `/images/hvordan/${name}-v2.webp`;

/** Each part gets its own stage: photos, a paper surface or a deep-green one. */
type Backdrop = "forest" | "sky" | "touch" | "paper" | "ink";
const PHOTO: Partial<Record<Backdrop, string>> = {
	forest: "/images/agenci-meet-forest.webp",
	sky: "/images/agenci-nature-sky.webp",
	touch: "/images/agenci-nature-touch.webp",
};

type Feature = {
	id: string;
	step: string;
	label: string;
	title: ReactNode;
	lead: string;
	details: { icon: typeof Globe; text: string }[];
	shot: string;
	alt: string;
	backdrop: Backdrop;
	/** Show in a flat browser frame instead of the moving MacBook. */
	flat?: boolean;
};

const FEATURES: Feature[] = [
	{
		id: "oversikt",
		step: "01",
		label: "Oversikt",
		title: (
			<>
				Se hvordan det går.
				<br />
				På ett blikk.
			</>
		),
		lead: "Samtaler, løste saker og når kundene chatter — samlet for hver agent, så dere vet hvor det går bra og hva som trenger en hånd.",
		details: [
			{ icon: Gauge, text: "Andel løst uten et menneske" },
			{ icon: MessageCircle, text: "Samtaler over tid" },
			{ icon: MousePointerClick, text: "Når kundene faktisk spør" },
		],
		shot: "oversikt",
		alt: "Agenci-dashboardet med oversikt over samtaler, løste saker og aktivitet",
		backdrop: "paper",
	},
	{
		id: "samtaler",
		step: "02",
		label: "Samtaler",
		title: (
			<>
				Hver samtale.
				<br />
				Med hele historikken.
			</>
		),
		lead: "Følg med mens agenten svarer, se hvem kunden er og hvor de kom fra, og ta over når noen trenger et menneske.",
		details: [
			{ icon: Inbox, text: "Innboks med status per samtale" },
			{ icon: UserRound, text: "Kontaktinfo og kontekst" },
			{ icon: ShieldCheck, text: "Løs, eskaler eller åpne igjen" },
		],
		shot: "samtaler",
		alt: "Samtaleinnboksen i Agenci med en valgt samtale og kundens detaljer",
		backdrop: "sky",
	},
	{
		id: "kunnskap",
		flat: true,
		step: "03",
		label: "Kunnskap",
		title: (
			<>
				Alt agenten vet.
				<br />
				Synlig og under kontroll.
			</>
		),
		lead: "Nettsider, dokumenter og filer blir til kunnskap agenten svarer fra. Se hva som er lært, spør kunnskapsbasen direkte, og legg til mer når dere vil.",
		details: [
			{ icon: Network, text: "Kunnskapen som et levende kart" },
			{ icon: BookOpen, text: "Kildebibliotek med status" },
			{ icon: Globe, text: "Nettsider og dokumenter" },
		],
		shot: "kunnskap",
		alt: "Kunnskapsbasen i Agenci med kunnskapsgraf og kildebibliotek",
		backdrop: "ink",
	},
	{
		id: "tilpasning",
		step: "04",
		label: "Tilpasning",
		title: (
			<>
				Deres regler.
				<br />
				Deres måte å svare på.
			</>
		),
		lead: "Velg AI-modell, gi agenten en personlighet og tydelige regler, og bestem når et menneske skal ta over. Farger og tekst i chatten tilpasser dere på samme sted.",
		details: [
			{ icon: SlidersHorizontal, text: "AI-modell og personlighet" },
			{ icon: ShieldCheck, text: "Regler og emner å unngå" },
			{ icon: Palette, text: "Farger og tekst i chatten" },
		],
		shot: "tilpasning",
		alt: "Oppførsel i Agenci: valg av AI-modell, personlighet, regler og overlevering",
		backdrop: "touch",
	},
];

const FLOW = [
	{
		title: "Kunden spør.",
		text: "Chatten ligger på nettsiden deres og er klar døgnet rundt.",
	},
	{
		title: "Agenci svarer.",
		text: "Ut fra deres egen kunnskap — og sier ifra når et menneske trengs.",
	},
	{
		title: "Dere har oversikten.",
		text: "Samtaler, kunnskap og innstillinger samlet i dashboardet.",
	},
];

const START = [
	{
		title: "Opprett en agent.",
		text: "Gi den et navn og fortell hva den skal hjelpe kundene med.",
	},
	{
		title: "Pek den mot nettsiden.",
		text: "Agenci leser innholdet og henter logo og farger av seg selv.",
	},
	{
		title: "Lim inn én kodelinje.",
		text: "Chatten dukker opp på nettsiden — og samtalene i dashboardet.",
	},
];

/** A recording in a light, flat browser frame. */
function BrowserFrame({
	video,
	poster,
	alt,
}: {
	video: string;
	poster: string;
	alt: string;
}) {
	return (
		<div className={local.screen}>
			<div className={local.screenBar} aria-hidden="true">
				<span />
				<span />
				<span />
				<em>app.agenci.no</em>
			</div>
			<video
				src={video}
				poster={poster}
				autoPlay
				muted
				loop
				playsInline
				preload="metadata"
				aria-label={alt}
				className={local.video}
			/>
		</div>
	);
}

function Stage({
	backdrop,
	className = "",
	children,
}: {
	backdrop: Backdrop;
	className?: string;
	children: ReactNode;
}) {
	const photo = PHOTO[backdrop];
	return (
		<div
			className={`${story.natureMedia} ${className} ${photo ? "" : local[backdrop]}`}
		>
			{photo ? (
				<Image
					src={photo}
					alt=""
					fill
					sizes="(max-width: 700px) 100vw, (max-width: 1300px) 80vw, 1100px"
					className={story.natureBackdrop}
				/>
			) : null}
			{children}
		</div>
	);
}

export function HvordanDetVirkerView() {
	return (
		<>
			<LandingNav variant="auto" />
			<main className="landing-warp min-h-svh overflow-x-clip bg-[#FAFAFA] antialiased [text-rendering:optimizeLegibility]">
				<div className={story.root} data-agenci-product-sections>
					{/* Hero */}
					<section
						className={local.hero}
						data-landing-nav-surface="light"
						aria-labelledby="how-heading"
					>
						<div className={story.container}>
							<header className={story.centerHeading}>
								<span className={story.eyebrow}>Slik fungerer det</span>
								<h1 id="how-heading" className={local.title}>
									Fra spørsmål på nettsiden.
									<br />
									<span>Til oversikt i dashboardet.</span>
								</h1>
								<p>
									Kunden spør. Agenci svarer ut fra det dere vet. Dere følger
									alt fra ett sted.
								</p>
								<nav className={local.anchors} aria-label="Hopp til del">
									{FEATURES.map((f) => (
										<a key={f.id} href={`#${f.id}`} className={story.pill}>
											<span /> {f.label}
										</a>
									))}
								</nav>
							</header>
							<Stage backdrop="forest" className={local.heroMedia}>
								<CinematicMacbook
									image={SHOT("agenter")}
									alt="Agenci-dashboardet med bedriftens agenter"
									priority
									still
								/>
							</Stage>
						</div>
					</section>

					{/* The flow in three lines */}
					<section
						className={`${story.section} ${story.workflow}`}
						data-landing-nav-surface="light"
						aria-labelledby="flow-heading"
					>
						<div className={story.container}>
							<header className={story.workflowHeading}>
								<div>
									<span className={story.eyebrow}>Én sammenhengende flyt</span>
									<h2 id="flow-heading">
										Tre ledd.
										<br />
										<span>Ingen løse tråder.</span>
									</h2>
								</div>
								<p>
									Det kunden ser på nettsiden og det dere ser i dashboardet er
									den samme samtalen — med den samme kunnskapen bak.
								</p>
							</header>
							<ol className={story.steps}>
								{FLOW.map((s, i) => (
									<li key={s.title}>
										<span className={story.stepNumber}>0{i + 1}</span>
										<h3>{s.title}</h3>
										<p>{s.text}</p>
									</li>
								))}
							</ol>
						</div>
					</section>

					{/* The dashboard, part by part */}
					<section
						className={`${story.section} ${story.brandSection}`}
						data-landing-nav-surface="light"
						aria-labelledby="dashboard-heading"
					>
						<div className={story.container}>
							<header className={story.brandHeading}>
								<span className={story.pill}>
									<span /> Dashboardet
								</span>
								<h2 id="dashboard-heading">
									Alt dere trenger.
									<br />
									<span>Ingenting dere ikke trenger.</span>
								</h2>
							</header>
							<div className={story.featureRows}>
								{FEATURES.map((f, i) => (
									<article
										key={f.id}
										id={f.id}
										className={`${story.featureRow} ${i % 2 ? local.rowFlip : ""}`}
										aria-labelledby={`${f.id}-heading`}
									>
										<div className={story.featureCopy}>
											<span className={local.step}>
												{f.step} · {f.label}
											</span>
											<h3 id={`${f.id}-heading`}>{f.title}</h3>
											<p>{f.lead}</p>
											<ul className={story.featureDetails}>
												{f.details.map(({ icon: Icon, text }) => (
													<li key={text}>
														<span>
															<Icon size={20} aria-hidden="true" />
														</span>
														{text}
													</li>
												))}
											</ul>
										</div>
										<Stage backdrop={f.backdrop} className={story.featureMedia}>
											{f.flat ? (
												<BrowserFrame
													video={`/images/hvordan/${f.id}.mp4`}
													poster={`/images/hvordan/${f.id}.jpg`}
													alt={f.alt}
												/>
											) : (
												<CinematicMacbook
													video={`/images/hvordan/${f.id}.mp4`}
													poster={`/images/hvordan/${f.id}.jpg`}
													track={(TRACKS as Record<string, VideoTrack>)[f.id]}
													alt={f.alt}
												/>
											)}
										</Stage>
									</article>
								))}
							</div>
						</div>
					</section>

					{/* Getting started */}
					<section
						className={`${story.section} ${story.workflow}`}
						data-landing-nav-surface="light"
						aria-labelledby="start-heading"
					>
						<div className={story.container}>
							<header className={story.workflowHeading}>
								<div>
									<span className={story.eyebrow}>Kom i gang</span>
									<h2 id="start-heading">
										I gang på minutter.
										<br />
										<span>Ikke uker.</span>
									</h2>
								</div>
								<p>
									Ingen integrasjonsprosjekt. Agenci lærer fra det dere allerede
									har, og dere justerer i eget tempo.
								</p>
							</header>
							<ol className={story.steps}>
								{START.map((s, i) => (
									<li key={s.title}>
										<span className={story.stepNumber}>0{i + 1}</span>
										<h3>{s.title}</h3>
										<p>{s.text}</p>
									</li>
								))}
							</ol>
							<div className={story.startBar}>
								<div>
									<h3>Klar for den første samtalen?</h3>
									<p>Start gratis, eller finn riktig oppsett sammen med oss.</p>
								</div>
								<div className={story.actions}>
									<Link
										className={story.primaryLink}
										href={LANDING_AUTH_PATHS.signUp}
									>
										Kom i gang gratis <ArrowRight size={18} />
									</Link>
									<Link
										className={story.secondaryLink}
										href={LANDING_CONTACT_PAGE_PATH}
									>
										Snakk med oss <ArrowUpRight size={18} />
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
