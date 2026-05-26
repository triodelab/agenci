import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Side ikke funnet",
  description: "Siden du leter etter finnes ikke.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
        Siden finnes ikke
      </h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Adressen du besøkte eksisterer ikke eller har blitt flyttet.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-80"
      >
        Tilbake til forsiden
      </Link>
    </div>
  );
}
