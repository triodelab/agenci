import { ArrowRight, ArrowUpRight, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { getSiteUrl } from "@/lib/site-url";
import {
	allPosts,
	formatDate,
	getPost,
	relatedPosts,
} from "@/modules/blog/posts";
import {
	blogPostingLd,
	breadcrumbLd,
	faqLd,
	JsonLd,
	postUrl,
} from "@/modules/blog/seo";
import {
	ArticleToc,
	ReadingProgress,
	ShareButton,
} from "@/modules/blog/ui/article-chrome";
import s from "@/modules/blog/ui/blog.module.css";
import { PostCover } from "@/modules/blog/ui/post-cover";
import {
	LANDING_AUTH_PATHS,
	LANDING_CONTACT_PAGE_PATH,
} from "@/modules/landing/constants";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";
import story from "@/modules/landing/ui/components/product-story.module.css";

type Props = { params: Promise<{ slug: string }> };

/** Every post is pre-rendered at build time (fast, fully crawlable HTML). */
export function generateStaticParams() {
	return allPosts().map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) return {};
	return {
		title: post.seoTitle,
		description: post.description,
		keywords: post.keywords,
		authors: [{ name: post.author, url: "https://agenci.no" }],
		alternates: {
			canonical: `/blogg/${post.slug}`,
			types: { "application/rss+xml": "/blogg/rss.xml" },
		},
		openGraph: {
			type: "article",
			url: `/blogg/${post.slug}`,
			title: post.seoTitle,
			description: post.description,
			publishedTime: `${post.publishedAt}T00:00:00.000Z`,
			modifiedTime: `${post.updatedAt}T00:00:00.000Z`,
			authors: [post.author],
			section: post.category,
			tags: post.keywords,
			locale: "nb_NO",
		},
		twitter: {
			card: "summary_large_image",
			title: post.seoTitle,
			description: post.description,
		},
		robots: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	};
}

export default async function BlogPostPage({ params }: Props) {
	const { slug } = await params;
	const post = getPost(slug);
	if (!post) notFound();

	const base = getSiteUrl();
	const related = relatedPosts(post);
	const { Body } = post;
	const updated = post.updatedAt !== post.publishedAt;

	return (
		<>
			<JsonLd data={blogPostingLd(post)} />
			<JsonLd
				data={breadcrumbLd([
					{ name: "Agenci", url: `${base}/` },
					{ name: "Blogg", url: `${base}/blogg` },
					{ name: post.title, url: postUrl(post.slug) },
				])}
			/>
			{post.faq.length ? <JsonLd data={faqLd(post)} /> : null}

			<LandingNav variant="auto" />
			<ReadingProgress targetId="article-body" />
			<main
				className={`${s.page} landing-warp min-h-svh overflow-x-clip antialiased`}
				data-agenci-product-sections
			>
				<article aria-labelledby="article-title">
					<header
						className={`${s.articleHero} ${s.dotted}`}
						data-landing-nav-surface="light"
					>
						<div className={s.container}>
							<nav className={s.crumbs} aria-label="Brødsmuler">
								<ol>
									<li>
										<Link href="/">Agenci</Link>
									</li>
									<li>
										<Link href="/blogg">Blogg</Link>
									</li>
									<li aria-current="page">{post.category}</li>
								</ol>
							</nav>
							<h1 id="article-title" className={s.articleTitle}>
								{post.title}
							</h1>
							<p className={s.articleLead}>{post.lead}</p>
							<div className={s.articleMeta}>
								<div className={s.meta}>
									<span>
										Av <strong>{post.author}</strong>
									</span>
									<time dateTime={post.publishedAt}>
										{formatDate(post.publishedAt)}
									</time>
									<span>{post.readingMinutes} min lesetid</span>
								</div>
								<ShareButton title={post.title} />
							</div>
							<PostCover post={post} className={s.heroCover} />
						</div>
					</header>

					<div className={s.container} data-landing-nav-surface="light">
						<div className={s.layout}>
							<aside className={s.aside}>
								<div className={s.asideInner}>
									<ArticleToc items={post.toc} />
									<div className={s.asideCta}>
										<p>
											<strong>Prøv Agenci gratis</strong>
											50 samtaler i måneden. Ingen bindingstid.
										</p>
										<AuthAwareLink
											href={LANDING_AUTH_PATHS.signUp}
											loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
										>
											Kom i gang <ArrowRight size={14} aria-hidden="true" />
										</AuthAwareLink>
									</div>
								</div>
							</aside>

							<div id="article-body" className={s.prose}>
								<details className={s.mobileToc}>
									<summary>Innhold i artikkelen</summary>
									<ol>
										{post.toc.map((i) => (
											<li key={i.id}>
												<a href={`#${i.id}`}>{i.label}</a>
											</li>
										))}
									</ol>
								</details>

								<Body />

								{post.faq.length ? (
									<section id="faq" className={s.faq} aria-labelledby="faq-h">
										<h2 id="faq-h">Ofte stilte spørsmål</h2>
										<div className={s.faqList}>
											{post.faq.map((f) => (
												<details key={f.question}>
													<summary>
														{f.question}
														<Plus size={20} aria-hidden="true" />
													</summary>
													<p>{f.answer}</p>
												</details>
											))}
										</div>
									</section>
								) : null}

								{updated ? (
									<p className={s.updated}>
										Sist oppdatert{" "}
										<time dateTime={post.updatedAt}>
											{formatDate(post.updatedAt)}
										</time>
									</p>
								) : null}
							</div>
						</div>
					</div>
				</article>

				{related.length ? (
					<section
						className={`${s.container} ${s.related}`}
						data-landing-nav-surface="light"
						aria-labelledby="related-h"
					>
						<h2 id="related-h">Les også</h2>
						<div className={s.grid}>
							{related.map((r) => (
								<Link
									key={r.slug}
									href={`/blogg/${r.slug}`}
									className={s.postCard}
								>
									<PostCover post={r} />
									<h3>{r.title}</h3>
									<p>{r.description}</p>
									<div className={s.meta}>
										<time dateTime={r.publishedAt}>
											{formatDate(r.publishedAt)}
										</time>
										<span>{r.readingMinutes} min</span>
									</div>
								</Link>
							))}
						</div>
					</section>
				) : null}

				<section
					className={s.container}
					style={{ padding: "40px 0 110px" }}
					data-landing-nav-surface="light"
					aria-labelledby="blog-cta-h"
				>
					<div className={story.startBar}>
						<div>
							<h3 id="blog-cta-h">Klar for den første samtalen?</h3>
							<p>Start gratis, eller finn riktig oppsett sammen med oss.</p>
						</div>
						<div className={story.actions}>
							<AuthAwareLink
								href={LANDING_AUTH_PATHS.signUp}
								loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
								className={story.primaryLink}
							>
								Kom i gang gratis <ArrowRight size={18} />
							</AuthAwareLink>
							<Link
								className={story.secondaryLink}
								href={LANDING_CONTACT_PAGE_PATH}
							>
								Snakk med oss <ArrowUpRight size={18} />
							</Link>
						</div>
					</div>
				</section>
			</main>
			<div className="bg-[#FAFAFA]">
				<LandingFooter />
			</div>
		</>
	);
}
