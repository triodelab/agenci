import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site-url";
import { allPosts, formatDate } from "@/modules/blog/posts";
import { blogLd, breadcrumbLd, JsonLd } from "@/modules/blog/seo";
import s from "@/modules/blog/ui/blog.module.css";
import { PostCover } from "@/modules/blog/ui/post-cover";
import { LandingFooter } from "@/modules/landing/ui/components/landing-footer";
import { LandingNav } from "@/modules/landing/ui/components/landing-nav";

export const metadata: Metadata = {
	title: "Blogg — AI, chatbot og kundeservice for norske bedrifter",
	description:
		"Artikler og guider om AI-chatbot, kundeservice og automatisering for norske bedrifter. Lær hvordan du får mer ut av teknologien.",
	alternates: {
		canonical: "/blogg",
		types: { "application/rss+xml": "/blogg/rss.xml" },
	},
	openGraph: {
		type: "website",
		url: "/blogg",
		title: "Agenci-bloggen",
		description:
			"Artikler og guider om AI-chatbot, kundeservice og automatisering for norske bedrifter.",
	},
	robots: { index: true, follow: true },
};

export default function BloggPage() {
	const posts = allPosts();
	const [featured, ...rest] = posts;
	const base = getSiteUrl();

	return (
		<>
			<JsonLd data={blogLd(posts)} />
			<JsonLd
				data={breadcrumbLd([
					{ name: "Agenci", url: `${base}/` },
					{ name: "Blogg", url: `${base}/blogg` },
				])}
			/>
			<LandingNav variant="auto" />
			<main
				className={`${s.page} landing-warp min-h-svh overflow-x-clip antialiased`}
				data-agenci-product-sections
			>
				<section
					className={`${s.indexHero} ${s.dotted}`}
					data-landing-nav-surface="light"
					aria-labelledby="blog-heading"
				>
					<div className={s.container}>
						<span className={s.eyebrow}>Blogg</span>
						<h1 id="blog-heading" className={s.title}>
							Bedre kundeservice.
							<br />
							<span>Forklart enkelt.</span>
						</h1>
						<p className={s.lead}>
							Artikler og guider om AI-chatbot, kundeservice og automatisering —
							skrevet for norske bedrifter.
						</p>
					</div>
				</section>

				<section
					className={s.container}
					style={{ paddingBottom: 96 }}
					data-landing-nav-surface="light"
					aria-label="Artikler"
				>
					{featured ? (
						<Link href={`/blogg/${featured.slug}`} className={s.featured}>
							<PostCover post={featured} />
							<div className={s.featuredCopy}>
								<span className={s.pill}>{featured.category}</span>
								<h2>{featured.title}</h2>
								<p>{featured.description}</p>
								<div className={s.meta}>
									<time dateTime={featured.publishedAt}>
										{formatDate(featured.publishedAt)}
									</time>
									<span>{featured.readingMinutes} min lesetid</span>
								</div>
								<span className={s.readMore}>
									Les artikkelen <ArrowRight size={17} aria-hidden="true" />
								</span>
							</div>
						</Link>
					) : null}

					{rest.length ? (
						<div className={s.grid}>
							{rest.map((post) => (
								<Link
									key={post.slug}
									href={`/blogg/${post.slug}`}
									className={s.postCard}
								>
									<PostCover post={post} />
									<h3>{post.title}</h3>
									<p>{post.description}</p>
									<div className={s.meta}>
										<time dateTime={post.publishedAt}>
											{formatDate(post.publishedAt)}
										</time>
										<span>{post.readingMinutes} min</span>
									</div>
								</Link>
							))}
						</div>
					) : (
						<p className={s.soon}>Flere artikler er på vei.</p>
					)}
				</section>
			</main>
			<div className="bg-[#FAFAFA]">
				<LandingFooter />
			</div>
		</>
	);
}
