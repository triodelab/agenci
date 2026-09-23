import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createDemoState, demoReducer } from "./demo-state.ts";

test("replies are local, immutable, trimmed and bounded", () => {
  const seed = createDemoState();
  const next = demoReducer(seed, {
    type: "reply",
    id: "delivery",
    text: "  Jeg hjelper deg gjerne.  ",
  });
  assert.equal(seed.conversations[0]?.messages.length, 2);
  assert.equal(
    next.conversations[0]?.messages.at(-1)?.text,
    "Jeg hjelper deg gjerne.",
  );
  assert.equal(next.conversations[0]?.status, "team");
  assert.equal(
    demoReducer(seed, { type: "reply", id: "delivery", text: "  " }),
    seed,
  );
  assert.equal(
    demoReducer(seed, {
      type: "reply",
      id: "delivery",
      text: "x".repeat(700),
    }).conversations[0]?.messages.at(-1)?.text.length,
    600,
  );
});

test("handoff, resolve and reopen retain conversation history", () => {
  const seed = createDemoState();
  const resolved = demoReducer(seed, {
    type: "status",
    id: "return",
    status: "resolved",
  });
  const reopened = demoReducer(resolved, {
    type: "status",
    id: "return",
    status: "team",
  });
  assert.equal(resolved.conversations[1]?.status, "resolved");
  assert.equal(reopened.conversations[1]?.status, "team");
  assert.deepEqual(
    reopened.conversations[1]?.messages,
    seed.conversations[1]?.messages,
  );
});

test("booking updates only the mock conversation", () => {
  const next = demoReducer(createDemoState(), {
    type: "book",
    id: "booking",
    slot: "13.00",
  });
  const booking = next.conversations.find((c) => c.id === "booking");
  assert.equal(booking?.booking, "13.00");
  assert.equal(booking?.status, "resolved");
  assert.match(booking?.messages.at(-1)?.text ?? "", /Ingen ekte bestilling/);
});

test("knowledge can be toggled, updated and added without duplicate IDs", () => {
  let state = createDemoState();
  state = demoReducer(state, { type: "toggle-source", id: "website" });
  assert.equal(state.sources[0]?.enabled, false);
  const source = {
    id: "custom",
    title: "  Levering  ",
    kind: "faq",
    enabled: true,
    content: "  Vi sender på hverdager. ",
  };
  state = demoReducer(state, { type: "save-source", source });
  state = demoReducer(state, {
    type: "save-source",
    source: { ...source, content: "Oppdatert svar." },
  });
  assert.equal(state.sources.length, 4);
  assert.equal(state.sources.at(-1)?.title, "Levering");
  assert.equal(state.sources.at(-1)?.content, "Oppdatert svar.");
  assert.equal(
    demoReducer(state, {
      type: "save-source",
      source: { ...source, title: " " },
    }),
    state,
  );
});

test("settings and availability persist across demo views; reset restores everything", () => {
  let state = demoReducer(createDemoState(), {
    type: "settings",
    tone: "concise",
    automatic: false,
  });
  state = demoReducer(state, { type: "availability", available: false });
  state = demoReducer(state, { type: "widget", welcome: "Hei fra demoen!" });
  state = demoReducer(state, { type: "voice", connected: true });
  state = demoReducer(state, { type: "integration", name: "Shopify" });
  state = demoReducer(state, { type: "model", model: "GPT-4o" });
  state = demoReducer(state, { type: "instructions", text: "Hjelp kunden." });
  assert.equal(state.tone, "concise");
  assert.equal(state.automatic, false);
  assert.equal(state.available, false);
  assert.equal(state.welcome, "Hei fra demoen!");
  assert.equal(state.voiceConnected, true);
  assert.deepEqual(state.integrations, ["Shopify"]);
  assert.deepEqual(
    demoReducer(state, { type: "integration", name: "Shopify" }).integrations,
    [],
  );
  assert.equal(state.model, "GPT-4o");
  assert.equal(state.instructions, "Hjelp kunden.");
  assert.deepEqual(demoReducer(state, { type: "reset" }), createDemoState());
});
