/**
 * Statisk månedsvisning (ingen klikk / navigasjon) — matcher timer-widget-stil.
 */
export function DashboardOverviewCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const monthLabel = new Intl.DateTimeFormat("nb-NO", {
    month: "long",
    year: "numeric",
  }).format(now);

  const firstDow = new Date(year, month, 1).getDay(); /* 0 = søn */
  /* ISO-aktig uke: mandag = 0 */
  const startPad = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const weekdayLabels = ["ma", "ti", "on", "to", "fr", "lø", "sø"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <section
      aria-label="Kalender"
      className="dash-card-surface w-full rounded-2xl"
    >
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Kalender
        </p>
        <p className="text-[15px] font-semibold capitalize leading-tight tracking-tight text-foreground">
          {monthLabel}
        </p>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {weekdayLabels.map((d) => (
            <div
              className="pb-1 text-[10px] font-medium text-muted-foreground uppercase"
              key={d}
            >
              {d}
            </div>
          ))}
          {cells.map((day, i) => (
            <div
              className="flex h-8 items-center justify-center text-[12px] tabular-nums text-muted-foreground"
              key={i}
            >
              {day === null ? (
                <span aria-hidden className="opacity-0">
                  ·
                </span>
              ) : (
                <span
                  className={
                    day === today
                      ? "flex size-8 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background"
                      : "text-foreground/90"
                  }
                >
                  {day}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
