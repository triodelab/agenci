/**
 * Live preview: a mock of the customer's website with the real launcher and
 * the real widget (iframe, `?preview=1`). Every draft change is posted to the
 * widget, which applies it instantly — nothing is saved until "Lagre".
 */
import { cn } from "@workspace/ui/lib/utils";
import type { WidgetAppearance } from "@workspace/ui/lib/widget-appearance";
import { getContrastTextColor } from "@workspace/ui/lib/widget-appearance";
import { MessageCircleIcon, XIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type Device = "desktop" | "mobile";

/** Desktop is a real 1440px-wide screen stretched to fill the preview box, so
 * the widget shows at its true size relative to the site. */
const DESKTOP_W = 1440;
const MOBILE = { w: 390, h: 800 } as const;
const EDGE = 24;

export function WidgetLivePreview({
  src,
  payload,
  appearance,
  agentName,
  siteUrl,
  site,
  siteLoading,
  device,
  open,
  onToggleOpen,
}: {
  src: string;
  /** Posted to the widget as the preview override. */
  payload: unknown;
  appearance: WidgetAppearance;
  agentName: string;
  siteUrl: string | null;
  /** The customer's real site: live iframe or screenshot (see server). */
  site: {
    url: string | null;
    frameable: boolean;
    screenshotUrl: string | null;
    /** Signed server path serving the live site when it blocks framing. */
    proxyUrl?: string | null;
  } | null;
  siteLoading: boolean;
  device: Device;
  open: boolean;
  onToggleOpen: () => void;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 720, h: 560 });
  const [ready, setReady] = useState(false);
  /** The real site has painted — the placeholder can go. */
  const [siteShown, setSiteShown] = useState(false);
  const mobile = device === "mobile";
  const scale = mobile
    ? Math.min(box.w / MOBILE.w, box.h / MOBILE.h, 1)
    : box.w / DESKTOP_W;
  const stage = mobile
    ? MOBILE
    : { w: DESKTOP_W, h: Math.round(box.h / scale) };
  const origin = new URL(src).origin;

  // Track the available box; the stage is fitted to it.
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setBox({ w: r.width, h: r.height });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // A new widget URL means a fresh widget that has to say "ready" again.
  useEffect(() => setReady(false), [src]);

  // Handshake: the widget says it's ready, we send the current draft.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin) return;
      if ((e.data as { type?: string })?.type === "agenci:widget-ready")
        setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  // Push every change (and the initial draft once ready).
  useEffect(() => {
    if (!ready) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: "agenci:widget-preview", settings: payload },
      origin,
    );
  }, [payload, ready, origin]);

  const left = appearance.position === "bottom-left";
  const btn = appearance.bubbleButtonSize;
  const panelW = mobile
    ? stage.w
    : Math.min(appearance.width, stage.w - EDGE * 2);
  const panelH = mobile
    ? stage.h
    : Math.min(appearance.height, stage.h - EDGE * 3 - btn);
  const accent = appearance.headerColor;
  const soft = `color-mix(in srgb, ${accent} 10%, white)`;
  const host =
    (site?.url ?? siteUrl)
      ?.replace(/^https?:\/\/(www\.)?/, "")
      .replace(/\/$/, "") || "dinbedrift.no";
  const chromeH = mobile ? 36 : 44;
  // Live site: framed directly when allowed, otherwise via the isolated
  // preview proxy origin (`<id>.localhost:3005`).
  const liveSrc = site?.url
    ? site.frameable
      ? site.url
      : (site.proxyUrl ?? null)
    : null;

  return (
    <div
      ref={boxRef}
      className="relative flex h-full w-full items-center justify-center"
    >
      {/* Layout box at the scaled size; the stage itself is scaled from its corner. */}
      <div
        className="relative shrink-0"
        style={{ width: stage.w * scale, height: stage.h * scale }}
      >
        <div
          className="absolute top-0 left-0 overflow-hidden bg-white shadow-[0_1px_3px_rgb(5_6_7/0.08),0_30px_60px_-30px_rgb(5_6_7/0.35)]"
          style={{
            width: stage.w,
            height: stage.h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            borderRadius: mobile ? 44 : 16,
            border: mobile ? "10px solid #16181b" : "1px solid #e4e8e5",
          }}
        >
          {/* Browser chrome (desktop) */}
          {!mobile ? (
            <div className="flex h-11 items-center gap-2 border-b border-[#eceeed] bg-[#f7f8f7] px-4">
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span
                  key={c}
                  className="size-3 rounded-full"
                  style={{ background: c }}
                />
              ))}
              <span className="mx-auto flex h-7 w-[420px] items-center justify-center rounded-full bg-white text-[13px] text-[#8a9096]">
                {host}
              </span>
            </div>
          ) : (
            <div className="flex h-9 items-center justify-between px-6 text-[13px] font-semibold text-[#16181b]">
              <span>09:41</span>
              <span className="h-5 w-24 rounded-full bg-[#16181b]" />
              <span>100 %</span>
            </div>
          )}

          {/* Mock website in the brand colour */}
          <div className="pointer-events-none select-none" aria-hidden>
            <div
              className={cn(
                "flex items-center gap-6",
                mobile ? "px-5 py-4" : "px-12 py-6",
              )}
            >
              <span
                className="h-7 w-24 rounded-[8px]"
                style={{ background: accent }}
              />
              {!mobile ? (
                <span className="ml-auto flex gap-6">
                  {[64, 72, 56, 80].map((w) => (
                    <span
                      key={w}
                      className="h-3 rounded-full bg-[#e7eae8]"
                      style={{ width: w }}
                    />
                  ))}
                </span>
              ) : null}
            </div>
            <div
              className={cn(
                mobile
                  ? "px-5 pt-6"
                  : "grid grid-cols-[1.1fr_1fr] gap-12 px-12 pt-10",
              )}
            >
              <div>
                <span
                  className="block h-4 w-28 rounded-full"
                  style={{ background: soft }}
                />
                <span
                  className={cn(
                    "mt-5 block rounded-[10px] bg-[#1f2528]",
                    mobile ? "h-7 w-[90%]" : "h-12 w-[92%]",
                  )}
                />
                <span
                  className={cn(
                    "mt-3 block rounded-[10px] bg-[#1f2528]",
                    mobile ? "h-7 w-[70%]" : "h-12 w-[70%]",
                  )}
                />
                {[100, 94, 80].map((w) => (
                  <span
                    key={w}
                    className="mt-3 block h-3 rounded-full bg-[#e7eae8]"
                    style={{ width: `${w}%` }}
                  />
                ))}
                <span
                  className="mt-7 inline-block h-11 w-40 rounded-full"
                  style={{ background: accent }}
                />
              </div>
              {!mobile ? (
                <div
                  className="h-[340px] rounded-[20px]"
                  style={{ background: soft }}
                />
              ) : null}
            </div>
            <div
              className={cn(
                "grid gap-5",
                mobile ? "mt-8 grid-cols-1 px-5" : "mt-12 grid-cols-3 px-12",
              )}
            >
              {[0, 1, 2].slice(0, mobile ? 2 : 3).map((i) => (
                <div
                  key={i}
                  className="rounded-[16px] border border-[#eceeed] p-5"
                >
                  <span
                    className="block size-9 rounded-[10px]"
                    style={{ background: soft }}
                  />
                  <span className="mt-4 block h-3.5 w-3/4 rounded-full bg-[#dfe3e1]" />
                  <span className="mt-2.5 block h-3 w-full rounded-full bg-[#eceeed]" />
                  <span className="mt-2 block h-3 w-2/3 rounded-full bg-[#eceeed]" />
                </div>
              ))}
            </div>
          </div>

          {/* The customer's real website on top of the placeholder: live when
              the site allows framing, otherwise a fresh screenshot. */}
          {liveSrc ? (
            // An iframe is a replaced element: top/bottom alone don't stretch
            // it (it stays 150px tall), so it needs an explicit height.
            <iframe
              src={liveSrc}
              title={`Nettsiden ${host}`}
              // Both the real site and the proxy run on origins separate from
              // the dashboard, so same-origin is safe (and needed for their JS).
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              referrerPolicy="no-referrer"
              onLoad={() => setSiteShown(true)}
              className="absolute inset-x-0 w-full border-0 bg-white transition-opacity duration-300"
              style={{
                top: chromeH,
                height: `calc(100% - ${chromeH}px)`,
                opacity: siteShown ? 1 : 0,
              }}
            />
          ) : site?.screenshotUrl ? (
            <div
              className="absolute inset-x-0 overflow-y-auto bg-white transition-opacity duration-300 [scrollbar-width:thin]"
              style={{
                top: chromeH,
                height: `calc(100% - ${chromeH}px)`,
                opacity: siteShown ? 1 : 0,
              }}
            >
              <img
                src={site.screenshotUrl}
                alt={`Skjermbilde av ${host}`}
                onLoad={() => setSiteShown(true)}
                className="block w-full"
                draggable={false}
              />
            </div>
          ) : null}
          {siteLoading ||
          (site && (liveSrc || site.screenshotUrl) && !siteShown) ? (
            <span
              className="absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-[14px] text-[#5a606a] shadow-[0_4px_16px_-6px_rgb(5_6_7/0.25)]"
              style={{ top: chromeH + 16 }}
            >
              <span className="size-2 animate-pulse rounded-full bg-[#243236]" />
              Henter {host}…
            </span>
          ) : null}

          {/* Widget panel (real widget) */}
          <div
            className={cn(
              "absolute overflow-hidden bg-white transition-[opacity,transform] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
              open
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-3 scale-[0.97] opacity-0",
            )}
            style={
              mobile
                ? {
                    inset: 0,
                    borderRadius: 34,
                    transformOrigin: "bottom center",
                  }
                : {
                    width: panelW,
                    height: panelH,
                    bottom: EDGE + btn + 16,
                    [left ? "left" : "right"]: EDGE,
                    borderRadius: appearance.borderRadius,
                    boxShadow:
                      "0 24px 60px -20px rgb(5 6 7 / 0.35), 0 2px 6px rgb(5 6 7 / 0.08)",
                    transformOrigin: left ? "bottom left" : "bottom right",
                  }
            }
          >
            <iframe
              ref={frameRef}
              src={src}
              title={`Forhåndsvisning av ${agentName}`}
              className="size-full border-0"
            />
            {mobile && open ? (
              <button
                type="button"
                onClick={onToggleOpen}
                aria-label="Lukk forhåndsvisning"
                className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
              >
                <XIcon className="size-4" strokeWidth={2} />
              </button>
            ) : null}
          </div>

          {/* Launcher */}
          {!(mobile && open) ? (
            <button
              type="button"
              onClick={onToggleOpen}
              aria-label={open ? "Lukk widgeten" : "Åpne widgeten"}
              className="absolute flex items-center justify-center rounded-full transition-[transform,background-color] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-105 active:scale-95"
              style={{
                width: btn,
                height: btn,
                bottom: EDGE,
                [left ? "left" : "right"]: EDGE,
                background: appearance.bubbleButtonColor,
                color:
                  appearance.bubbleButtonIconColor ||
                  getContrastTextColor(appearance.bubbleButtonColor),
                boxShadow: "0 12px 28px -10px rgb(5 6 7 / 0.45)",
              }}
            >
              {open ? (
                <XIcon
                  style={{ width: btn * 0.4, height: btn * 0.4 }}
                  strokeWidth={2}
                />
              ) : (
                <MessageCircleIcon
                  style={{ width: btn * 0.42, height: btn * 0.42 }}
                  strokeWidth={2}
                />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
