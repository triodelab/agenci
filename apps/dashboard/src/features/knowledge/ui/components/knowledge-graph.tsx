/**
 * Knowledge graphs.
 *
 * - `KnowledgeGraph` ("Alle"): agent in the centre, sources on an inner ring,
 *   chunks radiating out. Compact at rest, spreads while the pointer is over
 *   it, and can be orbited 360° by dragging (with inertia).
 * - `KnowledgeGraph3D`: one source type in 3D. Webpages are laid out as the
 *   site they come from (home page → sub pages by URL path), documents/media
 *   as a sphere around the agent. Flies out on open, rotates slowly, drag to
 *   turn.
 *
 * Hover never moves anything (so nodes can't slip away from the pointer):
 * it highlights and shows a small info card by the cursor. Every dot has a
 * generous invisible hit area, and hover has a short enter/leave delay.
 * Click to inspect; click empty space or press Esc to put everything back.
 * All motion respects prefers-reduced-motion.
 */
import { cn } from "@workspace/ui/lib/utils";
import { Maximize2Icon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  KnowledgeChunk,
  KnowledgeSource,
} from "../../queries/knowledge-queries";
import { isSourceBusy } from "../../queries/knowledge-queries";

export const TYPE_META = {
  WEBPAGE: { label: "Nettside", plural: "Nettsider", color: "#243236" },
  DOCUMENT: { label: "Dokument", plural: "Dokumenter", color: "#D2A23C" },
  MEDIA: { label: "Lyd og video", plural: "Lyd og video", color: "#9C9A3E" },
} as const;

const SIZE = 1000;
const C = SIZE / 2;
const TAU = Math.PI * 2;
const CAMERA = 900;
const REST_PITCH = -0.35;

export type GraphSelection =
  | { kind: "source"; sourceId: string }
  | { kind: "chunk"; sourceId: string; index: number }
  | null;

export function chunkMatches(c: KnowledgeChunk, q: string) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    c.title.toLowerCase().includes(needle) ||
    c.excerpt.toLowerCase().includes(needle)
  );
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Eases a number towards `target` with requestAnimationFrame. */
function useAnimatedValue(target: number, speed = 7, from?: number) {
  const [value, setValue] = useState(from ?? target);
  const ref = useRef(from ?? target);
  useEffect(() => {
    if (prefersReducedMotion()) {
      ref.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next =
        ref.current + (target - ref.current) * (1 - Math.exp(-speed * dt));
      ref.current = Math.abs(target - next) < 0.0005 ? target : next;
      setValue(ref.current);
      if (ref.current !== target) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, speed]);
  return value;
}

// ─── Hover: intent delay + info card by the cursor ──────────────────────────

type HoverTarget =
  | { kind: "source"; source: KnowledgeSource }
  | { kind: "chunk"; source: KnowledgeSource; chunk: KnowledgeChunk };

const hoverKey = (t: HoverTarget | null) =>
  t ? `${t.source.id}:${t.kind === "chunk" ? t.chunk.index : "s"}` : "";

/**
 * Debounced hover so tiny pointer movements between/over dots don't flicker.
 * Enter is near-instant, leave waits a moment (moving to a neighbour cancels).
 */
function useHoverIntent() {
  const [target, setTarget] = useState<HoverTarget | null>(null);
  const leaveTimer = useRef<number | null>(null);
  const enter = (t: HoverTarget) => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = null;
    setTarget((cur) => (hoverKey(cur) === hoverKey(t) ? cur : t));
  };
  const leave = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setTarget(null), 140);
  };
  const clear = () => {
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    setTarget(null);
  };
  useEffect(
    () => () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    },
    [],
  );
  return { target, enter, leave, clear };
}

/**
 * Pointer position inside the graph box, in px. Lives in the hover card
 * itself (native listener) so moving the mouse never re-renders the graph.
 */
function usePointerIn(
  box: React.RefObject<HTMLDivElement | null>,
  active: boolean,
) {
  // Always remember the latest position (so a card appears right at the
  // pointer), but only re-render while a card is showing.
  const last = useRef({ x: 0, y: 0, w: 1, h: 1 });
  const activeRef = useRef(active);
  activeRef.current = active;
  const [, rerender] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      last.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        w: r.width,
        h: r.height,
      };
      if (activeRef.current) rerender((n) => n + 1);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [box]);
  return last.current;
}

const fmt = (n: number) => n.toLocaleString("nb-NO");

function statusLabel(s: KnowledgeSource) {
  if (s.status === "FAILED")
    return { text: "Feilet", cls: "bg-[#F9E2DF] text-[#B2463A]" };
  if (isSourceBusy(s))
    return { text: "Indekseres", cls: "bg-[#FBEBDD] text-[#B06A34]" };
  return { text: "Klar", cls: "bg-[#E2F2E5] text-[#2F7D46]" };
}

function HoverCard({
  target,
  box,
}: {
  target: HoverTarget | null;
  box: React.RefObject<HTMLDivElement | null>;
}) {
  const pt = usePointerIn(box, target !== null);
  if (!target) return null;
  const { source } = target;
  const meta = TYPE_META[source.type];
  const status = statusLabel(source);
  const W = 264;
  const flipX = pt.x + 18 + W > pt.w;
  const flipY = pt.y > pt.h * 0.62;
  return (
    <div
      key={hoverKey(target)}
      className="kb-card-in pointer-events-none absolute z-30 w-[264px] rounded-[12px] border border-white/80 bg-white/97 p-3 shadow-[0_1px_2px_rgb(5_6_7/0.06),0_16px_36px_-12px_rgb(5_6_7/0.28)] backdrop-blur dark:bg-(--card)"
      style={{
        left: flipX ? pt.x - 18 - W : pt.x + 18,
        top: pt.y + (flipY ? -18 : 18),
        transform: flipY ? "translateY(-100%)" : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={{ background: meta.color }}
        />
        <span className="text-[12px] font-medium tracking-[0.06em] text-(--agenci-ink-3) uppercase [font-family:var(--font-agenci-data)]">
          {target.kind === "chunk" ? "Kunnskapsbit" : meta.label}
        </span>
        {target.kind === "source" ? (
          <span
            className={cn(
              "ml-auto rounded-full px-2 py-px text-[12px] font-medium",
              status.cls,
            )}
          >
            {status.text}
          </span>
        ) : null}
      </div>

      {target.kind === "chunk" ? (
        <>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug font-semibold text-(--agenci-ink)">
            {target.chunk.title}
          </p>
          <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-(--agenci-ink-2)">
            {target.chunk.excerpt}
          </p>
          <p className="mt-2 truncate text-[12px] text-(--agenci-ink-3)">
            Fra {source.name}
          </p>
        </>
      ) : (
        <>
          <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug font-semibold break-words text-(--agenci-ink)">
            {source.name}
          </p>
          <p className="mt-1 text-[12.5px] text-(--agenci-ink-2)">
            {fmt(source.chunkCount)} kunnskapsbiter · {fmt(source.words)} ord
          </p>
          {source.chunks.length ? (
            <ul className="mt-2 space-y-0.5">
              {source.chunks.slice(0, 3).map((c) => (
                <li
                  key={c.index}
                  className="truncate text-[12.5px] text-(--agenci-ink)"
                >
                  · {c.title}
                </li>
              ))}
              {source.chunks.length > 3 ? (
                <li className="text-[12px] text-(--agenci-ink-3)">
                  og {source.chunks.length - 3} til
                </li>
              ) : null}
            </ul>
          ) : null}
        </>
      )}
      <p className="mt-2.5 border-t border-(--agenci-line) pt-2 text-[12px] text-(--agenci-ink-3)">
        {target.kind === "chunk"
          ? "Klikk for å lese hele teksten"
          : "Klikk for å se alt agenten vet herfra"}
      </p>
    </div>
  );
}

/** Keyboard + click props for an SVG hit area that behaves like a button. */
function nodeButton(label: string, onActivate: () => void) {
  return {
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}

// ─── 3D math (shared) ───────────────────────────────────────────────────────

type V3 = { x: number; y: number; z: number };

function rotate(v: V3, yaw: number, pitch: number): V3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = v.x * cy - v.z * sy;
  const z1 = v.x * sy + v.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return { x: x1, y: v.y * cp - z1 * sp, z: v.y * sp + z1 * cp };
}

/**
 * Drag-to-orbit with inertia and an optional "home" pose to ease back to.
 * `autoSpin` keeps a slow yaw rotation going (paused while `paused`).
 */
function useOrbit({
  home,
  autoSpin,
  paused,
}: {
  home: { yaw: number; pitch: number };
  autoSpin: number;
  paused: boolean;
}) {
  const [angles, setAngles] = useState(home);
  const ref = useRef(home);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(0);
  const velocity = useRef({ yaw: 0, pitch: 0 });
  const homing = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const [dragging, setDragging] = useState(false);

  const set = (yaw: number, pitch: number) => {
    ref.current = { yaw, pitch };
    setAngles(ref.current);
  };
  const setRef = useRef(set);
  setRef.current = set;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag.current) {
        const cur = ref.current;
        const v = velocity.current;
        let yaw = cur.yaw;
        let pitch = cur.pitch;
        let changed = false;
        if (Math.abs(v.yaw) > 0.0004 || Math.abs(v.pitch) > 0.0004) {
          yaw += v.yaw;
          pitch += v.pitch;
          const decay = Math.exp(-3.2 * dt);
          velocity.current = { yaw: v.yaw * decay, pitch: v.pitch * decay };
          changed = true;
        } else if (homing.current) {
          const k = 1 - Math.exp(-5 * dt);
          const ty = home.yaw + Math.round((yaw - home.yaw) / TAU) * TAU;
          const tp = home.pitch + Math.round((pitch - home.pitch) / TAU) * TAU;
          yaw += (ty - yaw) * k;
          pitch += (tp - pitch) * k;
          if (Math.abs(ty - yaw) < 0.002 && Math.abs(tp - pitch) < 0.002) {
            homing.current = false;
            yaw = home.yaw + ((ty - home.yaw) % TAU);
            pitch = home.pitch;
          }
          changed = true;
        }
        if (autoSpin && !pausedRef.current) {
          yaw += dt * autoSpin;
          changed = true;
        }
        if (changed) setRef.current(yaw, pitch);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [home.yaw, home.pitch, autoSpin]);

  const goHome = () => {
    velocity.current = { yaw: 0, pitch: 0 };
    if (prefersReducedMotion()) set(home.yaw, home.pitch);
    else homing.current = true;
  };

  /** Pointer handlers for the SVG background. `onClick` = click w/o drag. */
  const handlers = (
    svg: React.RefObject<SVGSVGElement | null>,
    onClick: () => void,
  ) => ({
    onPointerDown: (e: React.PointerEvent) => {
      drag.current = { x: e.clientX, y: e.clientY };
      moved.current = 0;
      homing.current = false;
      velocity.current = { yaw: 0, pitch: 0 };
      setDragging(true);
      svg.current?.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.x;
      const dy = e.clientY - drag.current.y;
      moved.current += Math.abs(dx) + Math.abs(dy);
      drag.current = { x: e.clientX, y: e.clientY };
      const v = { yaw: dx * 0.008, pitch: -dy * 0.008 };
      velocity.current = v;
      set(ref.current.yaw + v.yaw, ref.current.pitch + v.pitch);
    },
    onPointerUp: (e: React.PointerEvent) => {
      // Node presses stop propagation, so `drag` is only set when the press
      // started on empty space.
      const startedOnBackground = drag.current !== null;
      drag.current = null;
      setDragging(false);
      svg.current?.releasePointerCapture(e.pointerId);
      if (startedOnBackground && moved.current < 4) onClick();
    },
  });

  return { ...angles, dragging, goHome, handlers };
}

// ─── Zoom: pinch / ⌘-scroll / double-click / buttons ────────────────────────

const MAX_ZOOM = 4;

type PointerHandlers = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
};

/**
 * Zooms the graph by shrinking the SVG viewBox, so small dots (and their hit
 * areas) get bigger on screen. Zooming keeps the point under the cursor in
 * place. While zoomed, dragging (or two-finger scrolling) pans the view;
 * Shift + drag still rotates. Selecting a node zooms in on it (`focusOn`),
 * and an automatic zoom is undone again when the selection is cleared.
 * Labels are HTML, so they use `pct()` to follow the view.
 */
function useZoom(svgRef: React.RefObject<SVGSVGElement | null>) {
  const [goal, setGoal] = useState({ k: 1, cx: C, cy: C });
  const goalRef = useRef(goal);
  goalRef.current = goal;
  /** True while the current zoom came from selecting a node. */
  const auto = useRef(false);
  const pan = useRef<{
    x: number;
    y: number;
    cx: number;
    cy: number;
    moved: number;
  } | null>(null);
  const [panning, setPanning] = useState(false);

  const k = useAnimatedValue(goal.k, 14);
  const cx = useAnimatedValue(goal.cx, 14);
  const cy = useAnimatedValue(goal.cy, 14);
  const half = SIZE / (2 * k);
  const vx = cx - half;
  const vy = cy - half;

  const fit = (nk: number, ncx: number, ncy: number) => {
    const kk = Math.min(MAX_ZOOM, Math.max(1, nk));
    const h = SIZE / (2 * kk);
    return {
      k: kk,
      cx: Math.min(SIZE - h, Math.max(h, ncx)),
      cy: Math.min(SIZE - h, Math.max(h, ncy)),
    };
  };

  /** Zoom by `factor`, keeping SVG point (px, py) under the same spot. */
  const zoomAt = (
    factor: number,
    px = goalRef.current.cx,
    py = goalRef.current.cy,
  ) => {
    auto.current = false;
    const cur = goalRef.current;
    const nk = Math.min(MAX_ZOOM, Math.max(1, cur.k * factor));
    const h0 = SIZE / (2 * cur.k);
    const h1 = SIZE / (2 * nk);
    const rx = (px - (cur.cx - h0)) / (2 * h0);
    const ry = (py - (cur.cy - h0)) / (2 * h0);
    setGoal(fit(nk, px - rx * 2 * h1 + h1, py - ry * 2 * h1 + h1));
  };

  /** Move the view by a screen-pixel delta. */
  const panBy = (dxPx: number, dyPx: number) => {
    const el = svgRef.current;
    if (!el) return;
    auto.current = false;
    const cur = goalRef.current;
    const scale = SIZE / (cur.k * el.getBoundingClientRect().width);
    setGoal(fit(cur.k, cur.cx + dxPx * scale, cur.cy + dyPx * scale));
  };

  const toSvg = (clientX: number, clientY: number) => {
    const el = svgRef.current;
    const cur = goalRef.current;
    if (!el) return { x: cur.cx, y: cur.cy };
    const r = el.getBoundingClientRect();
    const h = SIZE / (2 * cur.k);
    return {
      x: cur.cx - h + ((clientX - r.left) / r.width) * 2 * h,
      y: cur.cy - h + ((clientY - r.top) / r.height) * 2 * h,
    };
  };
  const toSvgRef = useRef(toSvg);
  toSvgRef.current = toSvg;
  const zoomAtRef = useRef(zoomAt);
  zoomAtRef.current = zoomAt;
  const panByRef = useRef(panBy);
  panByRef.current = panBy;

  // Pinch on a trackpad arrives as ctrl+wheel; ⌘/Ctrl+scroll works too.
  // While zoomed, plain scrolling pans. Non-passive so the page stays put.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const p = toSvgRef.current(e.clientX, e.clientY);
        zoomAtRef.current(Math.exp(-e.deltaY * 0.01), p.x, p.y);
      } else if (goalRef.current.k > 1.01) {
        e.preventDefault();
        panByRef.current(e.deltaX, e.deltaY);
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [svgRef]);

  return {
    k,
    zoomed: goal.k > 1.01,
    panning,
    viewBox: `${vx} ${vy} ${2 * half} ${2 * half}`,
    /** Screen position (in % of the box) of an SVG coordinate. */
    pct: (x: number, y: number) => ({
      left: `${((x - vx) / (2 * half)) * 100}%`,
      top: `${((y - vy) / (2 * half)) * 100}%`,
    }),
    zoomIn: () => zoomAt(1.6),
    zoomOut: () => zoomAt(1 / 1.6),
    reset: () => {
      auto.current = false;
      setGoal({ k: 1, cx: C, cy: C });
    },
    /** Centre on (x, y), zooming in to at least `minK` (auto zoom). */
    focusOn: (x: number, y: number, minK = 2) => {
      const cur = goalRef.current;
      if (cur.k <= 1.01) auto.current = true;
      setGoal(fit(Math.max(cur.k, minK), x, y));
    },
    /** Undo the zoom if it was only there because of a selection. */
    releaseAuto: () => {
      if (!auto.current) return;
      auto.current = false;
      setGoal({ k: 1, cx: C, cy: C });
    },
    onDoubleClick: (e: React.MouseEvent) => {
      const p = toSvg(e.clientX, e.clientY);
      zoomAt(1.8, p.x, p.y);
    },
    /**
     * Background pointer handling: pans while zoomed (Shift + drag rotates),
     * otherwise hands over to the orbit (rotate). A click without dragging
     * still means "click outside".
     */
    bind: (orbit: PointerHandlers, onClick: () => void): PointerHandlers => ({
      onPointerDown: (e) => {
        if (goalRef.current.k > 1.01 && !e.shiftKey) {
          const cur = goalRef.current;
          pan.current = {
            x: e.clientX,
            y: e.clientY,
            cx: cur.cx,
            cy: cur.cy,
            moved: 0,
          };
          setPanning(true);
          svgRef.current?.setPointerCapture(e.pointerId);
          return;
        }
        orbit.onPointerDown(e);
      },
      onPointerMove: (e) => {
        const p = pan.current;
        if (!p) return orbit.onPointerMove(e);
        const el = svgRef.current;
        if (!el) return;
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        p.moved = Math.abs(dx) + Math.abs(dy);
        auto.current = false;
        const scale =
          SIZE / (goalRef.current.k * el.getBoundingClientRect().width);
        setGoal(fit(goalRef.current.k, p.cx - dx * scale, p.cy - dy * scale));
      },
      onPointerUp: (e) => {
        const p = pan.current;
        if (!p) return orbit.onPointerUp(e);
        pan.current = null;
        setPanning(false);
        svgRef.current?.releasePointerCapture(e.pointerId);
        if (p.moved < 4) onClick();
      },
    }),
  };
}

/**
 * Zooms in on the selected node, following it while the layout settles
 * (the graph spreads out on select). Clearing the selection undoes a zoom
 * that only happened because of it.
 */
function useFocusSelection(
  zoom: ReturnType<typeof useZoom>,
  key: string | null,
  pos: React.RefObject<{ x: number; y: number } | null>,
) {
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  useEffect(() => {
    if (!key) {
      zoomRef.current.releaseAuto();
      return;
    }
    const focus = () => {
      const p = pos.current;
      if (p) zoomRef.current.focusOn(p.x, p.y);
    };
    focus();
    const t1 = window.setTimeout(focus, 350);
    const t2 = window.setTimeout(focus, 800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [key, pos]);
}

const selectionKey = (s: GraphSelection) =>
  s ? `${s.kind}:${s.sourceId}:${s.kind === "chunk" ? s.index : ""}` : null;

function ZoomControls({ zoom }: { zoom: ReturnType<typeof useZoom> }) {
  const btn =
    "flex size-8 items-center justify-center text-(--agenci-ink-2) transition-colors hover:bg-[#f1f3f2] hover:text-(--agenci-ink) disabled:opacity-35 disabled:hover:bg-transparent dark:hover:bg-white/5";
  return (
    <div className="absolute top-2 right-2 z-10 flex flex-col overflow-hidden rounded-[12px] border border-(--agenci-line) bg-white/90 shadow-[0_4px_14px_-8px_rgb(5_6_7/0.25)] backdrop-blur dark:bg-(--card)/90">
      <button
        type="button"
        onClick={zoom.zoomIn}
        disabled={zoom.k >= MAX_ZOOM - 0.01}
        aria-label="Zoom inn"
        title="Zoom inn (eller knip / ⌘ + rull)"
        className={btn}
      >
        <ZoomInIcon className="size-4" strokeWidth={1.5} absoluteStrokeWidth />
      </button>
      <button
        type="button"
        onClick={zoom.zoomOut}
        disabled={!zoom.zoomed}
        aria-label="Zoom ut"
        title="Zoom ut"
        className={cn(btn, "border-t border-(--agenci-line)")}
      >
        <ZoomOutIcon className="size-4" strokeWidth={1.5} absoluteStrokeWidth />
      </button>
      {zoom.zoomed ? (
        <button
          type="button"
          onClick={zoom.reset}
          aria-label="Tilbakestill zoom"
          title="Vis hele grafen"
          className={cn(btn, "border-t border-(--agenci-line)")}
        >
          <Maximize2Icon
            className="size-3.5"
            strokeWidth={1.5}
            absoluteStrokeWidth
          />
        </button>
      ) : null}
    </div>
  );
}

function useEscape(fn: () => void) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ref.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

const stop = (e: React.PointerEvent) => e.stopPropagation();

// ─── "Alle": orbitable starburst ────────────────────────────────────────────

type Layout2D = {
  source: KnowledgeSource;
  angle: number;
  dist: number;
  r: number;
  chunks: {
    chunk: KnowledgeChunk;
    angle: number;
    dist: number;
    r: number;
    depth: number;
  }[];
}[];

function layout2D(sources: KnowledgeSource[]): Layout2D {
  const n = sources.length;
  return sources.map((source, i) => {
    const angle = -Math.PI / 2 + (n ? (i / n) * TAU : 0);
    const wedge = n === 1 ? Math.PI * 1.8 : Math.min((TAU / n) * 0.92, 2.3);
    const m = source.chunks.length;
    return {
      source,
      angle,
      dist: n === 1 ? 150 : 170,
      r: 9 + Math.min(Math.sqrt(source.chunkCount) * 2.3, 15),
      chunks: source.chunks.map((chunk, j) => {
        const t = m === 1 ? 0.5 : j / (m - 1);
        return {
          chunk,
          angle:
            angle +
            (t - 0.5) * wedge +
            (hash(`${source.id}:${chunk.index}`) - 0.5) * 0.14,
          dist: 265 + hash(`${chunk.index}:${source.id}`) * 185,
          r: 3.5 + Math.min(chunk.length / 320, 6.5),
          depth: (hash(`${chunk.index}~${source.id}`) - 0.5) * 220,
        };
      }),
    };
  });
}

const HOME_2D = { yaw: 0, pitch: 0 };
/** How open the starburst is at rest (0 = tight cluster, 1 = fully spread). */
const REST_SPREAD = 0.5;
/** Pause before the resting graph opens halfway and starts to turn. */
const WAKE_DELAY_MS = 2000;

/**
 * Slow in-plane rotation (radians) while `running`. Pausing keeps the current
 * angle, so it stops exactly where it is and resumes from there.
 */
function useSpin(running: boolean, speed: number) {
  const [angle, setAngle] = useState(0);
  useEffect(() => {
    if (!running || prefersReducedMotion()) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setAngle((a) => (a + dt * speed) % TAU);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);
  return angle;
}

export function KnowledgeGraph({
  agentName,
  sources,
  query,
  selection,
  onSelect,
  highlight = null,
}: {
  agentName: string;
  sources: KnowledgeSource[];
  query: string;
  selection: GraphSelection;
  onSelect: (s: GraphSelection) => void;
  /** Source to highlight from outside (e.g. hovering its library card). */
  highlight?: string | null;
}) {
  const [inside, setInside] = useState(false);
  const [settled, setSettled] = useState(false);
  const hover = useHoverIntent();
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const q = query.trim();

  const orbit = useOrbit({ home: HOME_2D, autoSpin: 0, paused: false });
  const zoom = useZoom(svgRef);
  // At rest the starburst turns slowly in its own plane; it stops the moment
  // the pointer is over it (or something is selected / being dragged).
  // On entering the page the graph rests as a tight cluster; after a short
  // pause it opens halfway and starts turning on its own.
  const [awake, setAwake] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setAwake(true), WAKE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);
  const spin = useSpin(
    awake && !inside && !selection && !orbit.dragging && !q,
    0.1,
  );
  const nodes = useMemo(() => layout2D(sources), [sources]);

  // Highlight only — hover never moves nodes. Selection pushes chunks out.
  const hoverSourceId = hover.target?.source.id ?? highlight;
  const focusSource = selection?.sourceId ?? hoverSourceId;
  const selectedSource = selection?.sourceId ?? null;

  const intro = useAnimatedValue(1, 4, 0);
  const spread = useAnimatedValue(
    (inside && !settled) || selectedSource || q ? 1 : awake ? REST_SPREAD : 0,
    6,
  );
  const selectPush = useAnimatedValue(selectedSource ? 1 : 0, 6);
  const dimT = useAnimatedValue(focusSource ? 1 : 0, 10);

  const settle = () => {
    onSelect(null);
    hover.clear();
    setSettled(true);
    orbit.goHome();
  };
  useEscape(settle);

  const labelled = useMemo(
    () =>
      new Set(
        [...sources]
          .sort((a, b) => b.chunkCount - a.chunkCount)
          .slice(0, 8)
          .map((s) => s.id),
      ),
    [sources],
  );

  const sourceScale = intro * lerp(0.6, 1, spread);
  const chunkScale = intro * lerp(0.46, 1, spread);
  const project = (angle: number, dist: number, depth = 0) => {
    const p = rotate(
      {
        x: Math.cos(angle + spin) * dist,
        y: Math.sin(angle + spin) * dist,
        z: depth,
      },
      orbit.yaw,
      orbit.pitch,
    );
    const s = CAMERA / (CAMERA + p.z);
    return { x: C + p.x * s, y: C + p.y * s, s, z: p.z };
  };
  const tilted =
    Math.abs(Math.sin(orbit.yaw)) + Math.abs(Math.sin(orbit.pitch)) > 0.02;
  const depthFade = (z: number) =>
    tilted ? lerp(1, 0.4, clamp01((z + 300) / 600)) : 1;
  const center = project(0, 0);

  const selectedPos = (() => {
    if (!selection) return null;
    const s = nodes.find((n) => n.source.id === selection.sourceId);
    if (!s) return null;
    if (selection.kind === "chunk") {
      const c = s.chunks.find((c) => c.chunk.index === selection.index);
      if (c)
        return project(
          c.angle,
          c.dist * chunkScale * lerp(1, 1.12, selectPush),
          c.depth * spread,
        );
    }
    return project(s.angle, s.dist * sourceScale);
  })();
  const selectedPosRef = useRef(selectedPos);
  selectedPosRef.current = selectedPos;
  useFocusSelection(zoom, selectionKey(selection), selectedPosRef);

  const opacityFor = (id: string, hasMatch: boolean) => {
    if (focusSource) return focusSource === id ? 1 : lerp(1, 0.16, dimT);
    if (q) return hasMatch ? 1 : 0.16;
    return 1;
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pointer tracking only positions the info card and spreads the visual; everything is reachable by keyboard and in the sources list
    <div
      ref={box}
      className="relative mx-auto aspect-square w-full max-w-[640px] select-none"
      onMouseEnter={() => setInside(true)}
      onMouseLeave={() => {
        setInside(false);
        setSettled(false);
        hover.clear();
      }}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: an <svg> cannot be a <fieldset>; the group role just names the graph */}
      <svg
        ref={svgRef}
        role="group"
        aria-label="Kunnskapsgraf — dra for å rotere"
        viewBox={zoom.viewBox}
        onDoubleClick={zoom.onDoubleClick}
        className={cn(
          "absolute inset-0 size-full touch-none",
          orbit.dragging || zoom.panning ? "cursor-grabbing" : "cursor-grab",
        )}
        onKeyDown={(e) => {
          if (e.key === "Escape") settle();
        }}
        {...zoom.bind(orbit.handlers(svgRef, settle), settle)}
      >
        {!tilted ? (
          <>
            <circle
              cx={C}
              cy={C}
              r={170 * sourceScale}
              fill="none"
              stroke="#243236"
              strokeOpacity={0.05}
            />
            <circle
              cx={C}
              cy={C}
              r={360 * chunkScale}
              fill="none"
              stroke="#243236"
              strokeOpacity={0.04 * spread}
              strokeDasharray="2 6"
            />
          </>
        ) : null}

        {/* Edges */}
        {nodes.map((s) => {
          const sp = project(s.angle, s.dist * sourceScale);
          const hasMatch = s.chunks.some((c) => chunkMatches(c.chunk, q));
          const push =
            selectedSource === s.source.id ? lerp(1, 1.12, selectPush) : 1;
          return (
            <g
              key={s.source.id}
              className="pointer-events-none"
              style={{ opacity: opacityFor(s.source.id, hasMatch) }}
            >
              <line
                x1={center.x}
                y1={center.y}
                x2={sp.x}
                y2={sp.y}
                stroke="#243236"
                strokeOpacity={0.3}
                strokeWidth={1.2}
              />
              {s.chunks.map((c) => {
                const cp = project(
                  c.angle,
                  c.dist * chunkScale * push,
                  c.depth * spread,
                );
                return (
                  <line
                    key={c.chunk.index}
                    x1={sp.x}
                    y1={sp.y}
                    x2={cp.x}
                    y2={cp.y}
                    stroke="#243236"
                    strokeOpacity={
                      (q && !chunkMatches(c.chunk, q) ? 0.04 : 0.14) *
                      lerp(0.6, 1, spread) *
                      depthFade(cp.z)
                    }
                  />
                );
              })}
            </g>
          );
        })}

        {/* Nodes: a visual dot + a larger invisible hit area on top */}
        {nodes.map((s) => {
          const color = TYPE_META[s.source.type].color;
          const sp = project(s.angle, s.dist * sourceScale);
          const hasMatch = s.chunks.some((c) => chunkMatches(c.chunk, q));
          const push =
            selectedSource === s.source.id ? lerp(1, 1.12, selectPush) : 1;
          const failed = s.source.status === "FAILED";
          const sourceHovered =
            hover.target?.kind === "source" && hoverSourceId === s.source.id;
          const sr = s.r * lerp(0.8, 1, spread) * sp.s;
          return (
            <g
              key={`n${s.source.id}`}
              style={{ opacity: opacityFor(s.source.id, hasMatch) }}
            >
              {s.chunks.map((c) => {
                const cp = project(
                  c.angle,
                  c.dist * chunkScale * push,
                  c.depth * spread,
                );
                const match = chunkMatches(c.chunk, q);
                const selected =
                  selection?.kind === "chunk" &&
                  selection.sourceId === s.source.id &&
                  selection.index === c.chunk.index;
                const isHover =
                  hover.target?.kind === "chunk" &&
                  hoverSourceId === s.source.id &&
                  hover.target.chunk.index === c.chunk.index;
                const r = c.r * lerp(0.75, 1, spread) * cp.s;
                const target: HoverTarget = {
                  kind: "chunk",
                  source: s.source,
                  chunk: c.chunk,
                };
                return (
                  <g key={c.chunk.index} style={{ opacity: depthFade(cp.z) }}>
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r={selected || isHover ? r + 3 : r}
                      fill={color}
                      fillOpacity={q && !match ? 0.15 : 0.9}
                      stroke={
                        selected || isHover || (q && match) ? "#fff" : "none"
                      }
                      strokeWidth={selected ? 3 : 2}
                      className="pointer-events-none transition-[r] duration-150"
                    />
                    {/* biome-ignore lint/a11y/useSemanticElements: SVG shapes cannot be <button>; role + tabIndex + key handler make them accessible */}
                    <circle
                      role="button"
                      {...nodeButton(
                        `${c.chunk.title} (${s.source.name})`,
                        () =>
                          onSelect({
                            kind: "chunk",
                            sourceId: s.source.id,
                            index: c.chunk.index,
                          }),
                      )}
                      cx={cp.x}
                      cy={cp.y}
                      r={Math.max(r, 5) + 7}
                      fill="transparent"
                      className="cursor-pointer outline-none"
                      onPointerDown={stop}
                      onMouseEnter={() => hover.enter(target)}
                      onMouseLeave={hover.leave}
                      onFocus={() => hover.enter(target)}
                      onBlur={hover.leave}
                    />
                  </g>
                );
              })}
              <circle
                cx={sp.x}
                cy={sp.y}
                r={
                  sourceHovered || selectedSource === s.source.id
                    ? sr * 1.15
                    : sr
                }
                fill={failed ? "#fff" : color}
                stroke={
                  failed
                    ? "#B2463A"
                    : selectedSource === s.source.id || sourceHovered
                      ? "#fff"
                      : "none"
                }
                strokeWidth={3}
                strokeDasharray={failed ? "4 3" : undefined}
                className="pointer-events-none transition-[r] duration-150"
              />
              {isSourceBusy(s.source) ? (
                <circle
                  cx={sp.x}
                  cy={sp.y}
                  r={sr + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  className="kb-pulse pointer-events-none"
                />
              ) : null}
              {/* biome-ignore lint/a11y/useSemanticElements: SVG shapes cannot be <button>; role + tabIndex + key handler make them accessible */}
              <circle
                role="button"
                {...nodeButton(`Kilde: ${s.source.name}`, () =>
                  onSelect({ kind: "source", sourceId: s.source.id }),
                )}
                cx={sp.x}
                cy={sp.y}
                r={sr + 10}
                fill="transparent"
                className="cursor-pointer outline-none"
                onPointerDown={stop}
                onMouseEnter={() =>
                  hover.enter({ kind: "source", source: s.source })
                }
                onMouseLeave={hover.leave}
                onFocus={() =>
                  hover.enter({ kind: "source", source: s.source })
                }
                onBlur={hover.leave}
              />
            </g>
          );
        })}

        <circle
          cx={center.x}
          cy={center.y}
          r={30 * lerp(0.7, 1, intro)}
          fill="#243236"
          className="pointer-events-none"
        />
        <circle
          cx={center.x}
          cy={center.y}
          r={42}
          fill="none"
          stroke="#243236"
          strokeOpacity={0.12 * intro}
          strokeWidth={8}
          className="kb-breathe pointer-events-none"
        />
      </svg>

      {/* Labels */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="absolute rounded-full bg-white/90 px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap text-(--agenci-ink) shadow-[0_1px_2px_rgb(5_6_7/0.06)] backdrop-blur"
          style={{
            ...zoom.pct(center.x, center.y),
            transform: "translate(-50%, 46px)",
          }}
        >
          {agentName}
        </span>
        {nodes.map((s) => {
          const show =
            focusSource === s.source.id ||
            (labelled.has(s.source.id) && !focusSource);
          if (!show) return null;
          const p = project(s.angle, s.dist * sourceScale + s.r + 8);
          const dx = p.x - center.x;
          return (
            <span
              key={s.source.id}
              className="absolute max-w-[170px] truncate rounded-full bg-white/90 px-2 py-0.5 text-[12px] text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.06)] backdrop-blur"
              style={{
                ...zoom.pct(p.x, p.y),
                transform: `translate(${dx < -40 ? "-100%" : dx > 40 ? "0" : "-50%"}, -50%)`,
                opacity:
                  (focusSource === s.source.id ? 1 : spread) * depthFade(p.z),
              }}
            >
              {s.source.name}
            </span>
          );
        })}
      </div>

      <ZoomControls zoom={zoom} />
      <HoverCard target={hover.target} box={box} />

      <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[12px] text-(--agenci-ink-3)">
        {spread < 0.8
          ? "Hold over grafen for å utforske · dra for å rotere"
          : zoom.zoomed
            ? "Dra for å flytte · Shift + dra for å rotere · knip for å zoome"
            : "Dra for å rotere · knip eller ⌘ + rull for å zoome · klikk utenfor for å samle"}
      </p>
    </div>
  );
}

// ─── 3D (one source type) ───────────────────────────────────────────────────

type Node3D = {
  id: string;
  kind: "agent" | "host" | "source" | "chunk";
  label: string;
  pos: V3;
  r: number;
  color: string;
  sourceId?: string;
  chunk?: KnowledgeChunk;
  source?: KnowledgeSource;
};

type Edge3D = { a: string; b: string; strength: number };

/** Evenly spread directions on a sphere. */
function fibonacci(i: number, n: number): V3 {
  const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
  const rad = Math.sqrt(1 - y * y);
  const theta = Math.PI * (3 - Math.sqrt(5)) * i;
  return { x: Math.cos(theta) * rad, y, z: Math.sin(theta) * rad };
}

const scale3 = (v: V3, s: number): V3 => ({
  x: v.x * s,
  y: v.y * s,
  z: v.z * s,
});
const add3 = (a: V3, b: V3): V3 => ({
  x: a.x + b.x,
  y: a.y + b.y,
  z: a.z + b.z,
});
function norm3(v: V3): V3 {
  const l = Math.hypot(v.x, v.y, v.z) || 1;
  return scale3(v, 1 / l);
}
function randomDir(seed: string): V3 {
  const u = hash(seed) * 2 - 1;
  const t = hash(`${seed}#`) * TAU;
  const s = Math.sqrt(1 - u * u);
  return { x: s * Math.cos(t), y: u, z: s * Math.sin(t) };
}

function parseUrl(s: KnowledgeSource) {
  try {
    const u = new URL(s.url ?? `https://${s.name}`);
    const path = u.pathname.replace(/\/+$/, "");
    return { host: u.host.replace(/^www\./, ""), path };
  } catch {
    return { host: s.name, path: "" };
  }
}

/** Chunks orbit their source as small satellites. */
function addChunks(
  nodes: Node3D[],
  edges: Edge3D[],
  src: Node3D,
  s: KnowledgeSource,
  color: string,
) {
  for (const c of s.chunks) {
    const id = `${s.id}:${c.index}`;
    nodes.push({
      id,
      kind: "chunk",
      label: `${c.title} · ${s.name}`,
      pos: add3(src.pos, scale3(randomDir(id), 34 + hash(`${id}r`) * 34)),
      r: 2.6 + Math.min(c.length / 500, 2.6),
      color,
      sourceId: s.id,
      chunk: c,
      source: s,
    });
    edges.push({ a: src.id, b: id, strength: 0.18 });
  }
}

function agentNode(agentName: string): Node3D {
  return {
    id: "agent",
    kind: "agent",
    label: agentName,
    pos: { x: 0, y: 0, z: 0 },
    r: 16,
    color: "#243236",
  };
}

function buildWebsite(agentName: string, sources: KnowledgeSource[]) {
  const color = TYPE_META.WEBPAGE.color;
  const nodes: Node3D[] = [agentNode(agentName)];
  const edges: Edge3D[] = [];
  const parsed = sources.map((s) => ({ s, ...parseUrl(s) }));
  const hosts = [...new Set(parsed.map((p) => p.host))];

  hosts.forEach((host, hi) => {
    const hostDir =
      hosts.length === 1 ? { x: 0, y: -1, z: 0 } : fibonacci(hi, hosts.length);
    const home = parsed.find((p) => p.host === host && p.path === "");
    const hostNode: Node3D = {
      id: home ? home.s.id : `host:${host}`,
      kind: home ? "source" : "host",
      label: host,
      pos: scale3(hostDir, hosts.length === 1 ? 70 : 110),
      r: home ? 11 + Math.min(Math.sqrt(home.s.chunkCount) * 1.6, 8) : 9,
      color,
      sourceId: home?.s.id,
      source: home?.s,
    };
    nodes.push(hostNode);
    edges.push({ a: "agent", b: hostNode.id, strength: 0.5 });
    if (home) addChunks(nodes, edges, hostNode, home.s, color);

    const pages = parsed
      .filter((p) => p.host === host && p.path !== "")
      .sort((a, b) => a.path.length - b.path.length);
    const placed = new Map<string, Node3D>();
    pages.forEach((p, i) => {
      // Parent = nearest ancestor path we also know, else the host/home page.
      const segs = p.path.split("/").filter(Boolean);
      let parent: Node3D = hostNode;
      for (let k = segs.length - 1; k > 0; k--) {
        const anc = placed.get(`/${segs.slice(0, k).join("/")}`);
        if (anc) {
          parent = anc;
          break;
        }
      }
      const dir = norm3(
        add3(fibonacci(i, pages.length), scale3(hostDir, 0.35)),
      );
      const node: Node3D = {
        id: p.s.id,
        kind: "source",
        label: p.path,
        pos:
          parent === hostNode
            ? scale3(dir, 250)
            : add3(parent.pos, scale3(dir, 90)),
        r: 7 + Math.min(Math.sqrt(p.s.chunkCount) * 1.6, 8),
        color,
        sourceId: p.s.id,
        source: p.s,
      };
      placed.set(p.path, node);
      nodes.push(node);
      edges.push({ a: parent.id, b: node.id, strength: 0.42 });
      addChunks(nodes, edges, node, p.s, color);
    });
  });
  return { nodes, edges };
}

function buildSphere(
  agentName: string,
  sources: KnowledgeSource[],
  type: KnowledgeSource["type"],
) {
  const color = TYPE_META[type].color;
  const nodes: Node3D[] = [agentNode(agentName)];
  const edges: Edge3D[] = [];
  sources.forEach((s, i) => {
    const node: Node3D = {
      id: s.id,
      kind: "source",
      label: s.name,
      pos: scale3(fibonacci(i, sources.length), 230),
      r: 7 + Math.min(Math.sqrt(s.chunkCount) * 1.8, 9),
      color,
      sourceId: s.id,
      source: s,
    };
    nodes.push(node);
    edges.push({ a: "agent", b: s.id, strength: 0.45 });
    addChunks(nodes, edges, node, s, color);
  });
  return { nodes, edges };
}

const HOME_3D = { yaw: 0.4, pitch: REST_PITCH };

export function KnowledgeGraph3D({
  agentName,
  type,
  sources,
  query,
  selection,
  onSelect,
  highlight = null,
}: {
  agentName: string;
  type: KnowledgeSource["type"];
  sources: KnowledgeSource[];
  query: string;
  selection: GraphSelection;
  onSelect: (s: GraphSelection) => void;
  /** Source to highlight from outside (e.g. hovering its library card). */
  highlight?: string | null;
}) {
  const graph = useMemo(
    () =>
      type === "WEBPAGE"
        ? buildWebsite(agentName, sources)
        : buildSphere(agentName, sources, type),
    [agentName, sources, type],
  );
  const byId = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n])),
    [graph],
  );

  const hover = useHoverIntent();
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Rotation pauses while something is hovered, so it can't drift away.
  const orbit = useOrbit({
    home: HOME_3D,
    autoSpin: 0.22,
    paused: hover.target !== null || selection !== null,
  });
  const zoom = useZoom(svgRef);
  const intro = useAnimatedValue(1, 3.2, 0);
  const q = query.trim();
  const hoverSourceId = hover.target?.source.id ?? highlight ?? undefined;
  const focusSource = selection?.sourceId ?? hoverSourceId;

  const settle = () => {
    onSelect(null);
    hover.clear();
    orbit.goHome();
  };
  useEscape(settle);

  const projected = graph.nodes
    .map((n) => {
      const p = rotate(scale3(n.pos, intro), orbit.yaw, orbit.pitch);
      const s = CAMERA / (CAMERA + p.z);
      return { n, x: C + p.x * s * 1.25, y: C + p.y * s * 1.25, z: p.z, s };
    })
    .sort((a, b) => b.z - a.z);
  const at = new Map(projected.map((p) => [p.n.id, p]));

  const selectedNode = selection
    ? graph.nodes.find(
        (n) =>
          n.sourceId === selection.sourceId &&
          (selection.kind === "chunk"
            ? n.kind === "chunk" && n.chunk?.index === selection.index
            : n.kind === "source"),
      )
    : undefined;
  const selectedAt = selectedNode ? at.get(selectedNode.id) : undefined;
  const selectedPosRef = useRef<{ x: number; y: number } | null>(null);
  selectedPosRef.current = selectedAt
    ? { x: selectedAt.x, y: selectedAt.y }
    : null;
  useFocusSelection(zoom, selectionKey(selection), selectedPosRef);
  const depthFade = (z: number) => lerp(1, 0.35, clamp01((z + 260) / 520));

  const dim = (n: Node3D) => {
    if (focusSource && n.kind !== "agent" && n.sourceId !== focusSource)
      return 0.18;
    if (q && n.kind === "chunk" && n.chunk && !chunkMatches(n.chunk, q))
      return 0.12;
    return 1;
  };

  const pageCount = graph.nodes.filter((n) => n.kind === "source").length;
  const hostCount =
    type === "WEBPAGE" ? new Set(sources.map((s) => parseUrl(s).host)).size : 0;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pointer tracking only positions the info card; everything is reachable by keyboard and in the sources list
    <div
      ref={box}
      className="relative mx-auto aspect-square w-full max-w-[640px] select-none"
      onMouseLeave={hover.clear}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: an <svg> cannot be a <fieldset>; the group role just names the graph */}
      <svg
        ref={svgRef}
        role="group"
        aria-label={`${TYPE_META[type].plural} i 3D — dra for å rotere`}
        viewBox={zoom.viewBox}
        onDoubleClick={zoom.onDoubleClick}
        className={cn(
          "absolute inset-0 size-full touch-none",
          orbit.dragging || zoom.panning ? "cursor-grabbing" : "cursor-grab",
        )}
        {...zoom.bind(orbit.handlers(svgRef, settle), settle)}
      >
        {graph.edges.map((e) => {
          const a = at.get(e.a);
          const b = at.get(e.b);
          if (!a || !b) return null;
          const nb = byId.get(e.b);
          const o =
            e.strength *
            depthFade((a.z + b.z) / 2) *
            (nb ? dim(nb) : 1) *
            intro;
          return (
            <line
              key={`${e.a}-${e.b}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#243236"
              strokeOpacity={o}
              strokeWidth={e.strength > 0.3 ? 1.3 : 0.8}
              className="pointer-events-none"
            />
          );
        })}
        {projected.map(({ n, x, y, z, s }) => {
          if (n.kind === "agent") {
            return (
              <g key={n.id} className="pointer-events-none">
                <circle
                  cx={x}
                  cy={y}
                  r={n.r * s * 1.6}
                  fill="none"
                  stroke="#243236"
                  strokeOpacity={0.12}
                  strokeWidth={8}
                  className="kb-breathe"
                />
                <circle cx={x} cy={y} r={n.r * s} fill="#243236" />
              </g>
            );
          }
          const o = depthFade(z) * dim(n);
          const selected =
            (selection?.kind === "source" &&
              n.kind === "source" &&
              n.sourceId === selection.sourceId) ||
            (selection?.kind === "chunk" &&
              n.kind === "chunk" &&
              n.sourceId === selection.sourceId &&
              n.chunk?.index === selection.index);
          const isHover =
            hover.target !== null &&
            n.sourceId === hover.target.source.id &&
            (n.kind === "chunk"
              ? hover.target.kind === "chunk" &&
                hover.target.chunk.index === n.chunk?.index
              : hover.target.kind === "source");
          const target: HoverTarget | null =
            n.source && n.kind === "chunk" && n.chunk
              ? { kind: "chunk", source: n.source, chunk: n.chunk }
              : n.source
                ? { kind: "source", source: n.source }
                : null;
          const activate = () => {
            if (n.kind === "chunk" && n.sourceId && n.chunk)
              onSelect({
                kind: "chunk",
                sourceId: n.sourceId,
                index: n.chunk.index,
              });
            else if (n.sourceId)
              onSelect({ kind: "source", sourceId: n.sourceId });
          };
          const failed = n.source?.status === "FAILED";
          const r = n.r * s;
          return (
            <g key={n.id} style={{ opacity: o }}>
              <circle
                cx={x}
                cy={y}
                r={isHover || selected ? r * 1.35 : r}
                fill={failed ? "#fff" : n.color}
                fillOpacity={n.kind === "chunk" ? 0.85 : 1}
                stroke={
                  failed
                    ? "#B2463A"
                    : selected || isHover
                      ? "#fff"
                      : n.kind === "host"
                        ? n.color
                        : "none"
                }
                strokeWidth={selected ? 3 : 2}
                strokeDasharray={
                  n.kind === "host" || failed ? "3 3" : undefined
                }
                className="pointer-events-none transition-[r] duration-150"
              />
              {target || n.kind === "host" ? (
                <>
                  {/* biome-ignore lint/a11y/useSemanticElements: SVG shapes cannot be <button>; role + tabIndex + key handler make them accessible */}
                  <circle
                    role="button"
                    {...nodeButton(n.label, activate)}
                    cx={x}
                    cy={y}
                    r={Math.max(r, 5) + (n.kind === "chunk" ? 6 : 9)}
                    fill="transparent"
                    className="cursor-pointer outline-none"
                    onPointerDown={stop}
                    onMouseEnter={() =>
                      target ? hover.enter(target) : undefined
                    }
                    onMouseLeave={hover.leave}
                    onFocus={() => (target ? hover.enter(target) : undefined)}
                    onBlur={hover.leave}
                  />
                </>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Front-facing page labels */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {projected
          .filter(
            ({ n, z }) =>
              (n.kind === "source" || n.kind === "host") &&
              z < 40 &&
              (!focusSource || n.sourceId === focusSource),
          )
          .map(({ n, x, y, z }) => (
            <span
              key={n.id}
              className="absolute max-w-[180px] truncate rounded-full bg-white/90 px-2 py-0.5 text-[12px] text-(--agenci-ink-2) shadow-[0_1px_2px_rgb(5_6_7/0.06)] backdrop-blur"
              style={{
                ...zoom.pct(x, y),
                transform: "translate(12px, -50%)",
                opacity: lerp(1, 0.2, clamp01((z + 200) / 240)) * intro,
              }}
            >
              {n.label}
            </span>
          ))}
      </div>

      <ZoomControls zoom={zoom} />
      <HoverCard target={hover.target} box={box} />

      <p className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[12px] text-(--agenci-ink-3)">
        {zoom.zoomed
          ? "Dra for å flytte · Shift + dra for å rotere · knip for å zoome"
          : type === "WEBPAGE"
            ? `${pageCount} ${pageCount === 1 ? "side" : "sider"}${hostCount > 1 ? ` fra ${hostCount} nettsteder` : ""} · dra for å rotere · knip for å zoome`
            : `${pageCount} ${type === "DOCUMENT" ? "dokumenter" : "filer"} rundt agenten · dra for å rotere · knip for å zoome`}
      </p>
    </div>
  );
}
