/**
 * Structured data (schema.org JSON-LD) for the blog. Rendered as plain
 * `<script type="application/ld+json">` in server components, so it is in the
 * initial HTML that crawlers read.
 */
import { getSiteUrl } from "@/lib/site-url";
import type { BlogPost } from "./posts";

const ORG = {
	"@type": "Organization",
	name: "Agenci",
	url: "https://agenci.no",
	logo: { "@type": "ImageObject", url: "https://agenci.no/AgenciLogo.png" },
};

export function JsonLd({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: serialised JSON-LD, escaped below
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data).replace(/</g, "\\u003c"),
			}}
		/>
	);
}

export function postUrl(slug: string) {
	return `${getSiteUrl()}/blogg/${slug}`;
}

export function blogPostingLd(post: BlogPost) {
	const url = postUrl(post.slug);
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description,
		image: [`${url}/opengraph-image`],
		datePublished: post.publishedAt,
		dateModified: post.updatedAt,
		author: { ...ORG },
		publisher: ORG,
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		url,
		inLanguage: "nb-NO",
		articleSection: post.category,
		keywords: post.keywords.join(", "),
		timeRequired: `PT${post.readingMinutes}M`,
	};
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

export function faqLd(post: BlogPost) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: post.faq.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: { "@type": "Answer", text: f.answer },
		})),
	};
}

export function blogLd(posts: BlogPost[]) {
	const base = getSiteUrl();
	return {
		"@context": "https://schema.org",
		"@type": "Blog",
		name: "Agenci-bloggen",
		description:
			"Artikler og guider om AI-chatbot, kundeservice og automatisering for norske bedrifter.",
		url: `${base}/blogg`,
		inLanguage: "nb-NO",
		publisher: ORG,
		blogPost: posts.map((p) => ({
			"@type": "BlogPosting",
			headline: p.title,
			url: postUrl(p.slug),
			datePublished: p.publishedAt,
			dateModified: p.updatedAt,
		})),
	};
}
