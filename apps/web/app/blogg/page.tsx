import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";

export const metadata: Metadata = {
  title: "Blogg — AI, chatbot og kundeservice for norske bedrifter",
  description:
    "Artikler og guider om AI-chatbot, kundeservice og automatisering for norske bedrifter. Lær hvordan du får mer ut av teknologien.",
  alternates: { canonical: "/blogg" },
  robots: { index: true, follow: true },
};

const articles = [
  {
    slug: "chatbot",
    title: "Chatbot: forbedre kundeservice, reduser kostnader og frigjør tid",
    description:
      "Lær hvordan en AI-chatbot kan svare kunder 24/7, redusere driftskostnader og frigjøre tid for teamet ditt. Alt om chatbot-teknologi for norske bedrifter.",
    category: "Kundeservice & AI",
    date: "26. mai 2026",
    readTime: "8 min",
  },
];

export default function BloggPage() {
  return (
    <MarketingPageLayout>
      <div className="bg-[#1C1C1C]">

        {/* Header */}
        <header className="border-b border-[#2a2a2a]">
          <div className="mx-auto max-w-[900px] px-6 py-16 md:py-20 xl:px-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.5px] text-[#6b7280]">
              Blogg
            </p>
            <h1 className="mt-4 text-[36px] font-semibold leading-[1.15] tracking-[-1px] text-[#f2f3f5] md:text-[44px]">
              Artikler og guider
            </h1>
            <p className="mt-4 max-w-[500px] text-[16px] leading-[1.6] text-[#9ca3af]">
              Alt om AI-chatbot, kundeservice og automatisering — skrevet for norske bedrifter.
            </p>
          </div>
        </header>

        {/* Articles */}
        <div className="mx-auto max-w-[900px] px-6 py-12 xl:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blogg/${article.slug}`}
                className="group rounded-[14px] border border-[#2a2a2a] bg-[#161616] p-6 transition-colors hover:border-[#374151]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.4px] text-[#4b5563]">
                  {article.category}
                </p>
                <h2 className="mt-3 text-[16px] font-semibold leading-snug tracking-[-0.3px] text-[#c4c9d4] transition-colors group-hover:text-[#f2f3f5]">
                  {article.title}
                </h2>
                <p className="mt-2 text-[13px] leading-[1.6] text-[#4b5563]">
                  {article.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-[12px] text-[#374151]">
                  <span>{article.date}</span>
                  <span>{article.readTime} lesetid</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <MarketingSubpageCta />
      </div>
    </MarketingPageLayout>
  );
}
