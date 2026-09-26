
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { Observability, MastraStorageExporter, MastraPlatformExporter, SensitiveDataFilter } from '@mastra/observability';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { customerServiceAgent } from './agents/customer-service-agent';
import { pgVector } from './vector';
import { memoryStore } from './store';

/**
 * Static agents for Studio. Per-org customer agents are `addAgent`'d after
 * website ingest — see `register-customer-agent.ts`.
 */
export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { weatherAgent, customerServiceAgent },
  vectors: { pgVector },
  // Everything Mastra stores (conversations, workflow state, traces) lives
  // in the app's Postgres — no local mastra.db / mastra.duckdb files, which
  // don't survive deploys and could corrupt under concurrent access.
  storage: memoryStore,
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra',
        exporters: [
          new MastraStorageExporter(), // Persists observability events to Mastra Storage
          new MastraPlatformExporter(), // Sends observability events to Mastra Platform (if MASTRA_PLATFORM_ACCESS_TOKEN is set)
        ],
        spanOutputProcessors: [
          new SensitiveDataFilter(), // Redacts sensitive data like passwords, tokens, keys
        ],
      },
    },
  }),
});
