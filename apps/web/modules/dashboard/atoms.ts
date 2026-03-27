import { atomWithStorage } from "jotai/utils";
import { STATUS_FILTER_KEY } from "./constants";

/** inbox = åpne saker (uavklart + eskalert). Løst vises kun når du velger «Løst». */
export type ConversationListFilter =
  | "inbox"
  | "all"
  | "unresolved"
  | "escalated"
  | "resolved";

export const statusFilterAtom = atomWithStorage<ConversationListFilter>(
  STATUS_FILTER_KEY,
  "inbox",
);
