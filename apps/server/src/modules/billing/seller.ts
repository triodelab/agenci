/**
 * The seller on every invoice (Enhetsregisteret, 835 796 892). VAT may only
 * be charged once the company is in Merverdiavgiftsregisteret — then set
 * SELLER_VAT_REGISTERED=1 and invoices add 25 % MVA.
 */
import { env } from "@agenci/env/server";

export const SELLER = {
  name: "Hassan Triodelab DA",
  brand: "Agenci",
  orgNumber: "835796892",
  address: ["Sigurd Hoels vei 114", "0655 Oslo"],
  email: "post@triodelab.no",
  web: "agenci.no",
} as const;

export function sellerVatRegistered() {
  return env.SELLER_VAT_REGISTERED === "1";
}

/** "835796892" → "835 796 892" (+ " MVA" when VAT-registered). */
export function sellerOrgLine() {
  const n = SELLER.orgNumber.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  return `Org.nr. ${n}${sellerVatRegistered() ? " MVA" : ""}`;
}
