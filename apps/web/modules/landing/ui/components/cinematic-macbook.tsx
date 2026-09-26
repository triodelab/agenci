"use client";

/**
 * A MacBook playing a real dashboard recording, filmed like a product video:
 * the laptop stands straight, and the camera glides in on each
 * click from the recording (the "track"), holds, then pulls back to show the
 * result. Drawn with CSS, so the screen stays sharp at any size.
 *
 * Reduced motion: no camera moves.
 */
import { useEffect, useRef } from "react";
import styles from "./cinematic-macbook.module.css";

export type VideoTrack = {
	duration: number;
	/** Pointer actions, in seconds and 0–1 screen coordinates. */
	marks: { t: number; x: number; y: number; kind: "click" | "drag" }[];
};

const smooth = (a: number, b: number, v: number) => {
	const k = Math.min(1, Math.max(0, (v - a) / (b - a)));
	return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** How strongly the camera is on mark `m` at time `t` (0–1). */
function focusWeight(m: VideoTrack["marks"][number], t: number) {
	return smooth(m.t - 1.9, m.t - 0.25, t) * (1 - smooth(m.t + 2.2, m.t + 4, t));
}

export function CinematicMacbook({
	video,
	image,
	poster,
	track,
	alt,
	priority = false,
	still = false,
}: {
	video?: string;
	image?: string;
	poster?: string;
	track?: VideoTrack;
	alt: string;
	priority?: boolean;
	/** Stand straight and still (a hero shot), a little larger. */
	still?: boolean;
}) {
	const camera = useRef<HTMLDivElement>(null);
	const device = useRef<HTMLDivElement>(null);
	const screen = useRef<HTMLDivElement>(null);
	const player = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const cam = camera.current;
		const dev = device.current;
		const scr = screen.current;
		if (!cam || !dev || !scr) return;

		// Straight on: the camera only glides and zooms, the laptop never tilts.
		const rest = { z: 1, fx: 0.5, fy: 0.5, rx: 0, ry: 0 };
		const apply = (s: typeof rest) => {
			cam.style.transform = `scale(${s.z}) translate(${(0.5 - s.fx) * scr.offsetWidth}px, ${(0.5 - s.fy) * scr.offsetHeight}px)`;
			dev.style.transform = `rotateX(${s.rx}deg) rotateY(${s.ry}deg)`;
		};
		if (still) {
			apply({ z: 1, fx: 0.5, fy: 0.5, rx: 0, ry: 0 });
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			apply(rest);
			return;
		}

		const cur = { ...rest };
		let raf = 0;
		let last = performance.now();
		let visible = true;
		const start = performance.now();

		const tick = (now: number) => {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			const v = player.current;
			const t = v && track ? v.currentTime : (now - start) / 1000;

			// Strongest current focus from the recording's clicks.
			let w = 0;
			let mark: VideoTrack["marks"][number] | null = null;
			for (const m of track?.marks ?? []) {
				const mw = focusWeight(m, t);
				if (mw > w) {
					w = mw;
					mark = m;
				}
			}
			const target = {
				z: 1 + (mark?.kind === "drag" ? 0.45 : 0.65) * w,
				fx: lerp(0.5, mark?.x ?? 0.5, w),
				fy: lerp(0.5, mark?.y ?? 0.5, w),
				rx: 0,
				ry: 0,
			};
			// Unhurried camera: eases toward the target rather than snapping.
			const k = 1 - Math.exp(-dt * 2.4);
			for (const key of Object.keys(cur) as (keyof typeof cur)[]) {
				cur[key] += (target[key] - cur[key]) * k;
			}
			apply(cur);
			if (visible) raf = requestAnimationFrame(tick);
		};

		// Only animate while on screen.
		const io = new IntersectionObserver(([entry]) => {
			visible = Boolean(entry?.isIntersecting);
			cancelAnimationFrame(raf);
			if (visible) {
				last = performance.now();
				raf = requestAnimationFrame(tick);
			}
		});
		io.observe(cam);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	}, [track, still]);

	return (
		<div className={`${styles.scene} ${still ? styles.sceneStill : ""}`}>
			<div ref={camera} className={styles.camera}>
				<div ref={device} className={styles.device}>
					<div className={styles.lid}>
						<span className={styles.notch} aria-hidden="true" />
						<div ref={screen} className={styles.screen}>
							{video ? (
								<video
									ref={player}
									src={video}
									poster={poster}
									autoPlay
									muted
									loop
									playsInline
									preload={priority ? "auto" : "metadata"}
									aria-label={alt}
								/>
							) : image ? (
								// biome-ignore lint/performance/noImgElement: inside a 3D-transformed device; next/image adds nothing here
								<img
									src={image}
									alt={alt}
									loading={priority ? "eager" : "lazy"}
								/>
							) : null}
							<span className={styles.glare} aria-hidden="true" />
						</div>
					</div>
					<div className={styles.base} aria-hidden="true" />
				</div>
				<div className={styles.shadow} aria-hidden="true" />
			</div>
		</div>
	);
}
