export type ProductCardData = {
  title: string;
  price: string | null;
  image: string | null;
  url: string;
  inStock: boolean | null;
};

/**
 * Products the agent found, as a swipeable row under its reply: image,
 * name, price, stock and a link to the product page (new tab).
 */
export const ProductCards = ({ products }: { products: ProductCardData[] }) => {
  if (products.length === 0) return null;
  return (
    <div
      className="-mr-3 flex snap-x snap-mandatory scroll-pl-9 gap-2.5 overflow-x-auto pb-1 pl-9 pr-3 [scrollbar-width:none] sm:-mr-4 sm:pr-4 [&::-webkit-scrollbar]:hidden"
      aria-label="Produkter"
    >
      {products.map((p) => (
        <a
          key={p.url}
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/card flex w-[152px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border transition-shadow hover:shadow-md"
          style={{
            backgroundColor: "var(--widget-bg, #fff)",
            borderColor: "var(--widget-input-border, #e4e4e7)",
            color: "var(--widget-bubble-assistant-text, #18181b)",
          }}
        >
          <div className="aspect-square w-full overflow-hidden bg-black/[0.04]">
            {p.image ? (
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-1 p-2.5">
            <span className="line-clamp-2 text-[13px] font-semibold leading-snug">
              {p.title}
            </span>
            <div className="mt-auto flex items-baseline justify-between gap-2 pt-0.5">
              {p.price ? (
                <span className="text-[14px] font-bold">{p.price}</span>
              ) : (
                <span />
              )}
              {p.inStock !== null ? (
                <span
                  className="text-[11px] font-medium"
                  style={{ color: p.inStock ? "#2f7a4b" : "var(--widget-input-placeholder, #8a8f98)" }}
                >
                  {p.inStock ? "På lager" : "Utsolgt"}
                </span>
              ) : null}
            </div>
            <span
              className="mt-1.5 rounded-xl py-2 text-center text-[12.5px] font-semibold"
              style={{
                backgroundColor: "var(--widget-header-bg, #18181b)",
                color: "var(--widget-header-text, #fff)",
              }}
            >
              Se produkt
            </span>
          </div>
        </a>
      ))}
    </div>
  );
};
