import Firecrawl from "@mendable/firecrawl-js";

let _client: Firecrawl | null = null;

function getClient(): Firecrawl {
  if (!_client) {
    _client = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY ?? "" });
  }
  return _client;
}

export const firecrawlClient = {
  scrape: (...args: Parameters<Firecrawl["scrape"]>) =>
    getClient().scrape(...args),
};
