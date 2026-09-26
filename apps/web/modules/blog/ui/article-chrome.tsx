"use client";

import { Check, Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TocEntry } from "../posts";
import s from "./blog.module.css";

/** Thin progress bar under the nav while reading the article. */
export function ReadingProgress({ targetId }: { targetId: string }) {
	const bar = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = document.getElementById(targetId);
		if (!el || !bar.current) return;
		let raf = 0;
		const update = () => {
			const r = el.getBoundingClientRect();
			const total = r.height - window.innerHeight * 0.6;
			const k = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
			if (bar.current) bar.current.style.transform = `scaleX(${k})`;
			raf = 0;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll);
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
			cancelAnimationFrame(raf);
		};
	}, [targetId]);
	return (
		<div className={s.progress} aria-hidden="true">
			<div ref={bar} />
		</div>
	);
}

/** Table of contents that highlights the section being read. */
export function ArticleToc({ items }: { items: TocEntry[] }) {
	const [active, setActive] = useState(items[0]?.id ?? "");
	useEffect(() => {
		const els = items
			.map((i) => document.getElementById(i.id))
			.filter((e): e is HTMLElement => Boolean(e));
		const io = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActive(visible[0].target.id);
			},
			{ rootMargin: "-20% 0px -65% 0px" },
		);
		for (const el of els) io.observe(el);
		return () => io.disconnect();
	}, [items]);

	return (
		<nav className={s.toc} aria-label="Innhold i artikkelen">
			<p className={s.tocLabel}>Innhold</p>
			<ol>
				{items.map((i) => (
					<li key={i.id}>
						<a
							href={`#${i.id}`}
							aria-current={active === i.id ? "location" : undefined}
						>
							{i.label}
						</a>
					</li>
				))}
			</ol>
		</nav>
	);
}

/** Copies the article URL (native share sheet on phones). */
export function ShareButton({ title }: { title: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<button
			type="button"
			className={s.share}
			onClick={async () => {
				const url = window.location.href.split("#")[0] ?? "";
				if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
					await navigator.share({ title, url }).catch(() => undefined);
					return;
				}
				await navigator.clipboard.writeText(url).catch(() => undefined);
				setCopied(true);
				setTimeout(() => setCopied(false), 1800);
			}}
		>
			{copied ? (
				<Check size={15} aria-hidden="true" />
			) : (
				<Link2 size={15} aria-hidden="true" />
			)}
			{copied ? "Lenke kopiert" : "Del artikkelen"}
		</button>
	);
}
