/**
 * Blog registry — one entry per article. Everything SEO reads comes from
 * here (metadata, JSON-LD, sitemap, RSS, OG images), so adding a post is:
 *   1. write the body in `modules/blog/content/<slug>.tsx`
 *   2. add an entry below (with `Body` pointing at it)
 * The URL is always `/blogg/<slug>`.
 */
import type { ComponentType } from "react";
import ChatbotArticle from "./content/chatbot";

export type FaqEntry = { question: string; answer: string };

/** Photography from the homepage — covers use real images, not flat colour. */
export const COVER_PHOTOS = {
	sky: {
		src: "/images/agenci-nature-sky.webp",
		og: "public/images/og/nature-sky.jpg",
	},
	hills: {
		src: "/images/agenci-nature-hills.webp",
		og: "public/images/og/nature-hills.jpg",
	},
	touch: {
		src: "/images/agenci-nature-touch.webp",
		og: "public/images/og/nature-touch.jpg",
	},
	forest: {
		src: "/images/agenci-meet-forest.webp",
		og: "public/images/og/meet-forest.jpg",
	},
} as const;
export type CoverPhoto = keyof typeof COVER_PHOTOS;
export type TocEntry = { id: string; label: string };

export type BlogPost = {
	slug: string;
	/** On-page H1 (can be longer than the title tag). */
	title: string;
	/** `<title>` / OG title — keep under ~60 characters. */
	seoTitle: string;
	/** Meta description — ~150–160 characters. */
	description: string;
	/** Lead under the H1. */
	lead: string;
	category: string;
	/** Cover photo (also the background of the share image). */
	cover: CoverPhoto;
	keywords: string[];
	/** ISO dates (YYYY-MM-DD). */
	publishedAt: string;
	updatedAt: string;
	readingMinutes: number;
	author: string;
	toc: TocEntry[];
	faq: FaqEntry[];
	Body: ComponentType;
};

export const POSTS: BlogPost[] = [
	{
		slug: "chatbot",
		title: "Chatbot: forbedre kundeservice, reduser kostnader og frigjør tid",
		seoTitle: "Chatbot for bedrifter: bedre kundeservice 24/7",
		description:
			"Lær hvordan en AI-chatbot kan forbedre kundeservicen, redusere kostnader og frigjøre tid 24/7. Alt om chatbot-teknologi for norske bedrifter.",
		lead: "I dagens digitale landskap forventer kunder raske og nøyaktige svar uansett tid på døgnet. Her er alt du trenger å vite om chatbot-teknologi — og hvordan det kan transformere kundeservicen din.",
		category: "Kundeservice & AI",
		cover: "sky",
		keywords: [
			"chatbot",
			"AI chatbot",
			"chatbot nettside",
			"chatbot norsk",
			"chatbot bedrift",
			"chatbot kundeservice",
			"KI chatassistent",
			"automatisk kundeservice",
		],
		publishedAt: "2026-05-26",
		updatedAt: "2026-05-26",
		readingMinutes: 8,
		author: "Agenci",
		toc: [
			{ id: "hva-er-chatbot", label: "Hva er en chatbot?" },
			{ id: "mer-enn-assistent", label: "Mer enn en digital assistent" },
			{ id: "hvordan-fungerer", label: "Hvordan fungerer en chatbot?" },
			{ id: "typer-teknologier", label: "Typer chatbot-teknologier" },
			{ id: "fordeler", label: "Fordeler for din bedrift" },
			{ id: "velge-riktig", label: "Velge riktig chatbot" },
			{ id: "fremtiden", label: "Fremtiden for chatbot" },
			{ id: "faq", label: "Ofte stilte spørsmål" },
		],
		faq: [
			{
				question: "Hva er en chatbot, og hvordan fungerer den?",
				answer:
					"En chatbot er et dataprogram som simulerer samtaler med mennesker via tekst. Den bruker AI og naturlig språkbehandling (NLP) for å forstå brukerens spørsmål og generere relevante svar. Agenci sin chatbot bruker din bedrifts egne data for å gi presise og kontekstuelle svar.",
			},
			{
				question: "Hva er hovedfordelene med å implementere en chatbot?",
				answer:
					"De største fordelene inkluderer 24/7 tilgjengelighet for kunder, raskere responstider, reduserte driftskostnader ved å automatisere rutineoppgaver, og innsamling av verdifull data om kundehenvendelser.",
			},
			{
				question: "Er Agenci sin chatbot GDPR-kompatibel?",
				answer:
					"Ja, Agenci er 100 % GDPR-kompatibel. All data som behandles av chatboten forblir kundens eiendom.",
			},
			{
				question: "Hvor lang tid tar det å sette opp en chatbot fra Agenci?",
				answer:
					"Oppsettet er svært raskt. Chatboten kan gå live på under 5 minutter ved å lime inn én enkelt linje med kode på nettsiden din. Ingen IT-kompetanse nødvendig.",
			},
			{
				question: "Kan Agenci sin chatbot overføre samtaler til et menneske?",
				answer:
					"Ja. Agenci tilbyr funksjoner for sanntidsovervåking og sømløs overføring til et menneskelig teammedlem dersom chatboten møter en kompleks henvendelse.",
			},
			{
				question: "Hva skiller Agenci sin chatbot fra andre løsninger?",
				answer:
					"Agenci sin chatbot bruker eksklusivt din bedrifts egen kunnskapsbase (FAQ, prisliste, retningslinjer) for å generere svar. Dette sikrer faktiske, kontekstbevisste svar uten hallusinasjoner eller generiske robotreplikker.",
			},
			{
				question: "Hvilke prisplaner tilbyr Agenci?",
				answer:
					"Agenci tilbyr en gratis plan med opptil 50 samtaler per måned. Betalte planer inkluderer Starter, Pro og Business med varierende antall samtaler og funksjoner, og et skreddersydd oppsett for større organisasjoner. Ingen bindingstid.",
			},
		],
		Body: ChatbotArticle,
	},
];

/** Newest first. */
export function allPosts() {
	return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string) {
	return POSTS.find((p) => p.slug === slug) ?? null;
}

/** Same category first, then newest — never the post itself. */
export function relatedPosts(post: BlogPost, limit = 3) {
	return allPosts()
		.filter((p) => p.slug !== post.slug)
		.sort(
			(a, b) =>
				Number(b.category === post.category) -
				Number(a.category === post.category),
		)
		.slice(0, limit);
}

const DATE = new Intl.DateTimeFormat("nb-NO", {
	day: "numeric",
	month: "long",
	year: "numeric",
});
export const formatDate = (iso: string) =>
	DATE.format(new Date(`${iso}T12:00:00Z`));
