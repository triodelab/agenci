import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeftIcon, PrinterIcon } from "lucide-react";
import { client } from "@/lib/api";

const kr = (ore: number) =>
  new Intl.NumberFormat("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(ore / 100);
const date = (iso: string) => new Date(iso).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
const short = (iso: string) => new Date(iso).toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
const orgNr = (n: string) => n.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

const STATUS: Record<string, string> = { paid: "Betalt", pending: "Venter på betaling", failed: "Betaling feilet" };

/** A single invoice (kvittering) — paper-like, prints cleanly to PDF. */
export default function InvoiceView({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const { data: inv, isPending, isError, error } = useQuery({
    queryKey: ["billing-invoice", invoiceId],
    queryFn: () => client.private.billing.invoice({ id: invoiceId }),
  });

  return (
    <div className="min-h-svh bg-[#eef0f2] px-4 py-8 print:bg-white print:p-0 md:py-12">
      <style>{"@page { size: A4; margin: 14mm; }"}</style>
      <div className="mx-auto mb-5 flex max-w-[800px] items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-[#3b4046] transition-colors hover:bg-black/5"
        >
          <ArrowLeftIcon className="size-4" strokeWidth={1.8} /> Tilbake
        </button>
        {inv ? (
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#111214] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#2a2d31]"
          >
            <PrinterIcon className="size-4" strokeWidth={1.8} /> Skriv ut / lagre PDF
          </button>
        ) : null}
      </div>

      <article className="mx-auto max-w-[800px] rounded-[18px] bg-white p-8 text-[#111214] shadow-[0_1px_3px_rgb(5_6_7/0.06),0_24px_60px_-28px_rgb(5_6_7/0.3)] print:max-w-none print:rounded-none print:p-0 print:shadow-none md:p-12">
        {isPending ? (
          <div className="space-y-4">
            {[40, 70, 55, 90, 65].map((w) => (
              <div key={w} className="h-4 animate-pulse rounded bg-[#eef0f2]" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : isError || !inv ? (
          <p className="py-10 text-center text-[14px] text-[#5b6168]">
            {error instanceof Error ? error.message : "Fant ikke fakturaen."}
          </p>
        ) : (
          <>
            <header className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="[font-family:var(--font-agenci-title)] text-[26px] font-medium tracking-[-0.04em]">{inv.seller.brand}</p>
                <p className="mt-1 text-[12.5px] text-[#5b6168]">levert av {inv.seller.name}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-medium tracking-[0.1em] text-[#8a9097] uppercase">
                  {inv.status === "paid" ? "Faktura · kvittering" : "Faktura"}
                </p>
                <p className="mt-1 text-[22px] font-medium tracking-[-0.02em] tabular-nums">{inv.number}</p>
              </div>
            </header>

            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              <div>
                <p className="text-[11.5px] font-medium tracking-[0.08em] text-[#8a9097] uppercase">Fra</p>
                <p className="mt-2 text-[13.5px] leading-relaxed">
                  <span className="font-medium">{inv.seller.name}</span>
                  <br />
                  {inv.seller.address.map((l) => (
                    <span key={l}>
                      {l}
                      <br />
                    </span>
                  ))}
                  {inv.seller.orgLine}
                  <br />
                  {inv.seller.email}
                </p>
              </div>
              <div>
                <p className="text-[11.5px] font-medium tracking-[0.08em] text-[#8a9097] uppercase">Til</p>
                <p className="mt-2 text-[13.5px] leading-relaxed">
                  <span className="font-medium">{inv.buyer.name}</span>
                  {inv.buyer.orgNumber ? (
                    <>
                      <br />
                      Org.nr. {orgNr(inv.buyer.orgNumber)}
                    </>
                  ) : null}
                </p>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px] sm:justify-self-end">
                <dt className="text-[#8a9097]">Fakturadato</dt>
                <dd className="text-right tabular-nums">{short(inv.issuedAt)}</dd>
                <dt className="text-[#8a9097]">Periode</dt>
                <dd className="text-right tabular-nums">
                  {short(inv.periodStart)} – {short(inv.periodEnd)}
                </dd>
                <dt className="text-[#8a9097]">Status</dt>
                <dd className="text-right font-medium">{STATUS[inv.status] ?? inv.status}</dd>
              </dl>
            </div>

            <table className="mt-10 w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-[#111214] text-left text-[12px] text-[#5b6168]">
                  <th className="pb-2.5 font-medium">Beskrivelse</th>
                  <th className="pb-2.5 text-right font-medium">Antall</th>
                  <th className="pb-2.5 text-right font-medium">Pris</th>
                  <th className="pb-2.5 text-right font-medium">Beløp</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e3e6e9] align-top">
                  <td className="py-4 pr-4">
                    <p className="font-medium">{inv.line.description}</p>
                    <p className="mt-0.5 text-[12.5px] text-[#5b6168]">
                      {date(inv.periodStart)} – {date(inv.periodEnd)}
                      {inv.line.conversations ? ` · inntil ${new Intl.NumberFormat("nb-NO").format(inv.line.conversations)} samtaler` : ""}
                    </p>
                  </td>
                  <td className="py-4 text-right tabular-nums">1</td>
                  <td className="py-4 text-right tabular-nums">{kr(inv.netAmount)}</td>
                  <td className="py-4 text-right tabular-nums">{kr(inv.netAmount)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 ml-auto w-full max-w-[300px] text-[13.5px]">
              <div className="flex justify-between py-1.5">
                <span className="text-[#5b6168]">Sum eks. mva.</span>
                <span className="tabular-nums">{kr(inv.netAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#5b6168]">{inv.seller.vatRegistered ? "Mva. 25 %" : "Mva."}</span>
                <span className="tabular-nums">{inv.seller.vatRegistered ? kr(inv.vatAmount) : "0,00"}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between border-t border-[#111214] pt-3">
                <span className="font-medium">Totalt</span>
                <span className="text-[20px] font-medium tracking-[-0.02em] tabular-nums">
                  {kr(inv.amount)} {inv.currency}
                </span>
              </div>
            </div>

            <footer className="mt-12 border-t border-[#e3e6e9] pt-5 text-[12px] leading-relaxed text-[#5b6168]">
              {inv.status === "paid" ? <p>Beløpet er trukket fra kortet som er registrert hos Nexi. Du trenger ikke betale noe mer.</p> : null}
              {inv.seller.vatRegistered ? null : <p>{inv.seller.name} er ikke registrert i Merverdiavgiftsregisteret. Det er ikke beregnet mva.</p>}
              <p className="mt-2">
                Spørsmål om fakturaen? Skriv til {inv.seller.email} · {inv.seller.web}
              </p>
            </footer>
          </>
        )}
      </article>
    </div>
  );
}
