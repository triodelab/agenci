import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { allPosts } from "@/modules/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
	const base = getSiteUrl();
	const now = new Date();
	const posts = allPosts();

	return [
		{
			url: `${base}/`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1.0,
		},
		{
			url: `${base}/hvordan-det-virker`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${base}/integrasjoner`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${base}/kontakt`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${base}/blogg`,
			lastModified: posts[0] ? new Date(posts[0].updatedAt) : now,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		// Each post with its real last-modified date (not "now").
		...posts.map((p) => ({
			url: `${base}/blogg/${p.slug}`,
			lastModified: new Date(p.updatedAt),
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		{
			url: `${base}/priser`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${base}/personvern`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${base}/vilkar`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];
}
