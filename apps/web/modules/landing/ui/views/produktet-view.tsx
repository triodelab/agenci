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
	Smartphone,
	UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	LANDING_AUTH_PATHS,
	LANDING_CONTACT_PAGE_PATH,
} from "@/modules/landing/constants";
import TRACKS from "@/modules/landing/produktet-video-tracks.json";
import {
	CinematicMacbook,
	type VideoTrack,
} from "@/modules/landing/ui/components/cinematic-macbook";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import story from "@/modules/landing/ui/components/product-story.module.css";
import local from "./produktet.module.css";

/** Screenshots are captured from the real dashboard (public/images/produktet). */
const SHOT = (name: string) => `/images/produktet/${name}-v2.webp?v=${ASSET_VERSION}`;
/**
 * Bump when the recordings are re-shot: a new URL makes browsers and the CDN
 * fetch the new files instead of an old cached copy.
 */
const ASSET_VERSION = "3";
const clip = (id: string, ext: "mp4" | "jpg") =>
	`/images/produktet/${id}.${ext}?v=${ASSET_VERSION}`;

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
		lead: "Hvor mange som skriver, hvor mange agenten løser selv, og når på døgnet kundene er innom. Du ser fort hva som går bra, og hva som trenger deg.",
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
		lead: "Les med mens agenten svarer, se hvem kunden er og hvor de kom fra, og hopp inn selv når det trengs.",
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
		lead: "Nettsider, PDF-er og dokumenter blir til det agenten svarer ut fra. Du ser nøyaktig hva den har lært, kan spørre den direkte, og legge til mer når du vil.",
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
		lead: "Bestem hvordan agenten skal snakke, hva den ikke skal svare på, og når den skal sende saken videre til deg. Farger og tekster i chatten endrer du samme sted.",
		details: [
			{ icon: SlidersHorizontal, text: "AI-modell og personlighet" },
			{ icon: ShieldCheck, text: "Regler og emner å unngå" },
			{ icon: Palette, text: "Farger og tekst i chatten" },
		],
		shot: "tilpasning",
		alt: "Oppførsel i Agenci: valg av AI-modell, personlighet, regler og overlevering",
		backdrop: "touch",
	},
	{
		id: "widget",
		step: "05",
		label: "Widget",
		title: (
			<>
				Chatten i deres farger.
				<br />
				Prøv den før du lagrer.
			</>
		),
		lead: "Velg fargene fra nettsiden eller en ferdig palett, og se chatten endre seg med en gang. Skriv et spørsmål i forhåndsvisningen, så ser du nøyaktig hva kundene dine får til svar.",
		details: [
			{ icon: Palette, text: "Farger hentet fra nettsiden" },
			{ icon: MessageCircle, text: "Test agenten før den går live" },
			{ icon: Smartphone, text: "Forhåndsvisning på mobil og desktop" },
		],
		shot: "widget",
		alt: "Widget-tilpasning i Agenci: fargene byttes, og agenten svarer på et spørsmål i mobilforhåndsvisningen",
		backdrop: "forest",
	},
];

const FLOW = [
	{
		title: "Kunden spør.",
		text: "Chatten ligger på nettsiden og svarer døgnet rundt, også i helgene.",
	},
	{
		title: "Agenci svarer.",
		text: "Ut fra det dere selv har skrevet, og sier fra når et menneske trengs.",
	},
	{
		title: "Dere har oversikten.",
		text: "Samtaler, kunnskap og innstillinger på ett sted i dashbordet.",
	},
];

const START = [
	{
		title: "Opprett en agent.",
		text: "Gi den et navn og skriv kort hva den skal hjelpe kundene med.",
	},
	{
		title: "Pek den mot nettsiden.",
		text: "Agenci leser innholdet og henter logo og farger av seg selv.",
	},
	{
		title: "Lim inn én kodelinje.",
		text: "Chatten dukker opp på nettsiden, og samtalene i dashbordet.",
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

export function ProduktetView() {
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
								<span className={story.eyebrow}>Produktet</span>
								<h1 id="how-heading" className={local.title}>
									Kunden spør på nettsiden.
									<br />
									<span>Du ser alt i dashbordet.</span>
								</h1>
								<p>
									Agenci svarer ut fra det dere har lagt inn, og du følger med
									på alt fra ett sted. Her er hvordan det henger sammen.
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
									<span className={story.eyebrow}>Fra spørsmål til svar</span>
									<h2 id="flow-heading">
										Kunden i chatten.
										<br />
										<span>Du i dashbordet.</span>
									</h2>
								</div>
								<p>
									Det kunden ser i chatten, ser du i dashbordet. Samme samtale,
									med den samme kunnskapen bak.
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
									<span /> Dashbordet
								</span>
								<h2 id="dashboard-heading">
									Dashbordet,
									<br />
									<span>del for del.</span>
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
													video={clip(f.id, "mp4")}
													poster={clip(f.id, "jpg")}
													alt={f.alt}
												/>
											) : (
												<CinematicMacbook
													video={clip(f.id, "mp4")}
													poster={clip(f.id, "jpg")}
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
										Kom i gang
										<br />
										<span>på én ettermiddag.</span>
									</h2>
								</div>
								<p>
									Du trenger ingen utvikler. Agenci lærer av det som allerede
									ligger på nettsiden din, og du justerer når du har tid.
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
