import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "../_generated/api";

export const workflow = new WorkflowManager((components as any).workflow, {
  workpoolOptions: {
    maxParallelism: 10,
    defaultRetryBehavior: {
      maxAttempts: 3,
      initialBackoffMs: 60_000,
      base: 2,
    },
  },
});
