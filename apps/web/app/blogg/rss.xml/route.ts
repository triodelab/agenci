import { getSiteUrl } from "@/lib/site-url";
import { allPosts } from "@/modules/blog/posts";

/** RSS 2.0 feed for the blog (readers, aggregators, faster discovery). */
export const dynamic = "force-static";

const esc = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

export function GET() {
	const base = getSiteUrl();
	const posts = allPosts();
	const items = posts
		.map((p) => {
			const url = `${base}/blogg/${p.slug}`;
			return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(p.description)}</description>
      <category>${esc(p.category)}</category>
      <pubDate>${new Date(`${p.publishedAt}T08:00:00Z`).toUTCString()}</pubDate>
    </item>`;
		})
		.join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Agenci-bloggen</title>
    <link>${base}/blogg</link>
    <description>Artikler og guider om AI-chatbot, kundeservice og automatisering for norske bedrifter.</description>
    <language>nb-no</language>
    <atom:link href="${base}/blogg/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date(`${posts[0]?.updatedAt ?? "2026-01-01"}T08:00:00Z`).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
	return new Response(xml, {
		headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
	});
}
