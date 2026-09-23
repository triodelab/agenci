import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { SUPPORT_AGENT_PROMPT } from "../constants";


export type AgenciAgentInput = {
  id: string;
  name: string;
  description: string;
};


function buildInstructions(name: string, description: string) {
  return `${SUPPORT_AGENT_PROMPT}

## Denne bedriften
Du representerer «${name}».
${description}

Når instruksjonene viser til [bedriften], bruk «${name}».
`;
}

export function createAgenciAgent({ id, name, description }: AgenciAgentInput): Agent {
  return new Agent({
    id,
    name,
    instructions: buildInstructions(name, description),
    model: "openai/gpt-5-mini",
    tools: {},
    memory: new Memory(),
  });
}