import { blogOgImage, OG_SIZE } from "@/modules/blog/og";

export const alt = "Agenci-bloggen — AI, chatbot og kundeservice";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
	return blogOgImage({
		eyebrow: "Blogg",
		title: "Bedre kundeservice. Forklart enkelt.",
		footer: "agenci.no/blogg",
		photoPath: "public/images/og/meet-forest.jpg",
	});
}
