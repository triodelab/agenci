/**
 * Shared Open Graph card for the blog (1200×630), rendered by next/og.
 * Brand look: a homepage nature photo, soft shade, Circular type, wordmark.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

let font: Promise<Buffer> | null = null;
const circular = () => {
	font ??= readFile(
		join(
			process.cwd(),
			"public/fonts/Circular-Font-Family/lineto-circular-medium.ttf",
		),
	);
	return font;
};

const photos = new Map<string, Promise<string>>();
/** JPEG as a data URL (next/og cannot read WebP, so covers have JPEG twins). */
const photo = (path: string) => {
	if (!photos.has(path)) {
		photos.set(
			path,
			readFile(join(process.cwd(), path)).then(
				(b) => `data:image/jpeg;base64,${b.toString("base64")}`,
			),
		);
	}
	return photos.get(path) as Promise<string>;
};

export async function blogOgImage({
	eyebrow,
	title,
	footer,
	photoPath,
}: {
	eyebrow: string;
	title: string;
	footer: string;
	/** e.g. `public/images/og/nature-sky.jpg` */
	photoPath: string;
}) {
	const bg = await photo(photoPath);
	const size = title.length > 70 ? 58 : title.length > 45 ? 66 : 76;
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "64px 72px",
				color: "#fff",
				fontFamily: "Circular",
				position: "relative",
			}}
		>
			{/* biome-ignore lint/performance/noImgElement: next/og renders plain img */}
			<img
				src={bg}
				alt=""
				width={1200}
				height={630}
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 1200,
					height: 630,
					objectFit: "cover",
				}}
			/>
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: 1200,
					height: 630,
					display: "flex",
					background:
						"linear-gradient(180deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.5) 100%)",
				}}
			/>
			<div
				style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26 }}
			>
				<div
					style={{
						display: "flex",
						width: 12,
						height: 12,
						borderRadius: 999,
						background: "#fff",
					}}
				/>
				<span style={{ opacity: 0.8 }}>{eyebrow}</span>
			</div>
			<div
				style={{
					display: "flex",
					fontSize: size,
					lineHeight: 1.08,
					letterSpacing: "-0.035em",
					maxWidth: 1000,
				}}
			>
				{title}
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					fontSize: 26,
					opacity: 0.85,
				}}
			>
				<span style={{ fontSize: 40, letterSpacing: "-0.04em" }}>Agenci</span>
				<span>{footer}</span>
			</div>
		</div>,
		{
			...OG_SIZE,
			fonts: [
				{
					name: "Circular",
					data: await circular(),
					style: "normal",
					weight: 500,
				},
			],
		},
	);
}
