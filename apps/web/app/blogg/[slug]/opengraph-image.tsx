import { blogOgImage, OG_SIZE } from "@/modules/blog/og";
import { allPosts, COVER_PHOTOS, getPost } from "@/modules/blog/posts";

export const alt = "Artikkel fra Agenci-bloggen";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
	return allPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getPost(slug);
	return blogOgImage({
		eyebrow: post?.category ?? "Blogg",
		title: post?.title ?? "Agenci-bloggen",
		footer: post
			? `${post.readingMinutes} min lesetid · agenci.no/blogg`
			: "agenci.no/blogg",
		photoPath: COVER_PHOTOS[post?.cover ?? "sky"].og,
	});
}
