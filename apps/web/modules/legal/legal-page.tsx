/**
 * Shared layout for legal pages (personvern, vilkår): the blog's reading
 * layout — sticky table of contents, a plain-language summary up top, and
 * clear version/date information.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ArticleToc } from "@/modules/blog/ui/article-chrome";
import s from "@/modules/blog/ui/blog.module.css";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import l from "./legal.module.css";

export type LegalToc = { id: string; label: string }[];

/** Company details shown on both pages (override via env in production). */
export const COMPANY = {
	legalLine:
		process.env.NEXT_PUBLIC_COMPANY_LEGAL_LINE ??
		"Hassan Triodelab DA, org.nr. 835 796 892, Gildevangen 16 B, 0585 Oslo",
	name: "Hassan Triodelab DA",
	orgNr: "835 796 892",
	email: "post@triodelab.no",
};

const DATE = new Intl.DateTimeFormat("nb-NO", {
	day: "numeric",
	month: "long",
	year: "numeric",
});

export function LegalPage({
	eyebrow,
	title,
	lead,
	updated,
	version,
	summary,
	toc,
	related,
	children,
}: {
	eyebrow: string;
	title: string;
	lead: string;
	/** ISO date */
	updated: string;
	version: string;
	summary: string[];
	toc: LegalToc;
	related: { href: string; label: string };
	children: ReactNode;
}) {
	return (
		<>
			<LandingNav variant="auto" />
			<main
				className={`${s.page} landing-warp min-h-svh overflow-x-clip antialiased`}
				data-agenci-product-sections
			>
				<header
					className={`${s.articleHero} ${s.dotted}`}
					data-landing-nav-surface="light"
				>
					<div className={s.container}>
						<span className={s.eyebrow}>{eyebrow}</span>
						<h1 className={s.articleTitle}>{title}</h1>
						<p className={s.articleLead}>{lead}</p>
						<div className={s.articleMeta}>
							<dl className={l.facts}>
								<div>
									<dt>Sist oppdatert</dt>
									<dd>
										<time dateTime={updated}>
											{DATE.format(new Date(`${updated}T12:00:00Z`))}
										</time>
									</dd>
								</div>
								<div>
									<dt>Versjon</dt>
									<dd>{version}</dd>
								</div>
								<div>
									<dt>Gjelder for</dt>
									<dd>agenci.no, dashboard og chat-widget</dd>
								</div>
							</dl>
							<Link href={related.href} className={s.share}>
								{related.label}
							</Link>
						</div>
					</div>
				</header>

				<div className={s.container} data-landing-nav-surface="light">
					<div className={s.layout} style={{ paddingTop: 20 }}>
						<aside className={s.aside}>
							<div className={s.asideInner}>
								<ArticleToc items={toc} />
							</div>
						</aside>

						<div className={s.prose}>
							<section className={l.summary} aria-labelledby="kort-fortalt">
								<h2 id="kort-fortalt">Kort fortalt</h2>
								<ul>
									{summary.map((line) => (
										<li key={line}>{line}</li>
									))}
								</ul>
							</section>

							<details className={s.mobileToc}>
								<summary>Innhold</summary>
								<ol>
									{toc.map((i) => (
										<li key={i.id}>
											<a href={`#${i.id}`}>{i.label}</a>
										</li>
									))}
								</ol>
							</details>

							{children}
						</div>
					</div>
				</div>
			</main>
			<div className="bg-[#FAFAFA]">
				<LandingFooter />
			</div>
		</>
	);
}

/** A numbered legal section. */
export function Clause({
	id,
	n,
	title,
	children,
}: {
	id: string;
	n: number;
	title: string;
	children: ReactNode;
}) {
	return (
		<section id={id} className={s.section} aria-labelledby={`${id}-h`}>
			<h2 id={`${id}-h`}>
				<span className={l.num}>{n}.</span> {title}
			</h2>
			{children}
		</section>
	);
}

/** Label: text list (processors, rights, data categories …). */
export function Terms({
	items,
}: {
	items: { label: string; text: ReactNode }[];
}) {
	return (
		<dl className={l.terms}>
			{items.map((i) => (
				<div key={i.label}>
					<dt>{i.label}</dt>
					<dd>{i.text}</dd>
				</div>
			))}
		</dl>
	);
}
