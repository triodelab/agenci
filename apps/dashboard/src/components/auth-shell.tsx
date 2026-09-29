import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useState } from "react";

/** Public marketing site, for the terms / privacy links under the forms. */
const WEB_URL =
  (import.meta.env.VITE_WEB_URL as string | undefined)?.replace(/\/$/, "") ||
  "https://www.agenci.no";

/** Filled inputs, as in the auth design: quiet until focused. */
export const authInputCls =
  "h-11 w-full rounded-[10px] border border-transparent bg-(--dash-subtle) px-3.5 text-[14.5px] text-(--agenci-ink) outline-none transition-[border-color,box-shadow,background-color] placeholder:text-(--dash-placeholder) focus:border-[#243236] focus:bg-(--dash-surface) focus:shadow-[0_0_0_4px_rgb(36_50_54/0.08)] disabled:opacity-60";
export const authLabelCls = "text-[13px] font-medium text-(--agenci-ink-2)";
export const authButtonCls =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-(--agenci-ink) text-[14.5px] font-medium text-(--dash-on-ink) transition-[background-color,transform] hover:bg-(--agenci-accent-hover) active:scale-[0.99] disabled:opacity-60";

/** Password field with an eye button to show / hide what you type. */
export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${authInputCls} pr-11 ${props.className ?? ""}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Skjul passord" : "Vis passord"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-[8px] text-(--agenci-ink-3) transition-colors hover:text-(--agenci-ink)"
      >
        {visible ? (
          <EyeOffIcon className="size-[18px]" strokeWidth={1.6} />
        ) : (
          <EyeIcon className="size-[18px]" strokeWidth={1.6} />
        )}
      </button>
    </div>
  );
}

/**
 * Split auth layout: a photo panel with the Agenci mark on the left, the form
 * on the right. Used by sign in, sign up and creating an organization.
 */
export function AuthShell(props: {
  title: string;
  /** Line under the title (e.g. "Har du allerede konto? Logg inn"). */
  subtitle?: ReactNode;
  children: ReactNode;
  /** Small print under the form. */
  footer?: ReactNode;
  /** Show the terms / privacy line (sign up). */
  terms?: string;
}) {
  return (
    <div className="dashboard-app-shell min-h-svh bg-(--dash-surface) lg:h-svh lg:overflow-hidden">
      <div className="grid min-h-svh bg-(--dash-surface) lg:h-svh lg:grid-cols-2">
        {/* Photo panel: covers the whole left half, edge to edge */}
        <aside className="relative hidden overflow-hidden lg:block">
          <img
            src="/auth/agenci-auth.webp"
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(10_14_20/0.35)_0%,rgb(10_14_20/0)_30%,rgb(10_14_20/0)_55%,rgb(10_14_20/0.65)_100%)]" />
          <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
            <div className="flex items-end" role="img" aria-label="Agenci">
              <img src="/AgenciLogo.png" alt="" className="size-8 invert" />
              <span className="-ml-[3px] -translate-y-[2.5px] text-[20px] leading-none font-medium tracking-[-0.03em] text-white">
                genci
              </span>
            </div>
            <div className="max-w-[420px] text-white">
              <p className="[font-family:var(--font-agenci-title)] text-[34px] leading-[1.08] font-medium tracking-[-0.03em] xl:text-[40px]">
                Gode svar til kundene dine.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                En chat på nettsiden som kan bedriften din, og et dashbord der
                du ser alt kundene spør om.
              </p>
            </div>
          </div>
        </aside>

        {/* Form */}
        <main className="flex min-h-0 flex-col bg-(--dash-surface) px-6 py-8 sm:px-10 lg:overflow-y-auto">
          <div className="flex items-end lg:hidden" role="img" aria-label="Agenci">
            <img src="/AgenciLogo.png" alt="" className="size-8 dark:invert" />
            <span className="-ml-[3px] -translate-y-[2.5px] text-[20px] leading-none font-medium tracking-[-0.03em] text-(--agenci-ink)">
              genci
            </span>
          </div>
          <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col pt-14 pb-10 sm:justify-center sm:py-10">
            <h1 className="[font-family:var(--font-agenci-title)] text-[30px] leading-[1.1] font-medium tracking-[-0.03em] text-(--agenci-ink)">
              {props.title}
            </h1>
            {props.subtitle ? (
              <p className="mt-2 text-[14px] text-(--agenci-ink-2)">{props.subtitle}</p>
            ) : null}
            <div className="mt-8">{props.children}</div>
            {props.footer ? (
              <div className="mt-6 text-center text-[13px] text-(--agenci-ink-2)">{props.footer}</div>
            ) : null}
            {props.terms ? (
              <p className="mt-8 text-center text-[12.5px] leading-relaxed text-(--agenci-ink-3)">
                Ved å trykke «{props.terms}» godtar du{" "}
                <a href={`${WEB_URL}/vilkar`} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-(--agenci-ink)">
                  vilkårene
                </a>{" "}
                og{" "}
                <a href={`${WEB_URL}/personvern`} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-(--agenci-ink)">
                  personvernerklæringen
                </a>
                .
              </p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
