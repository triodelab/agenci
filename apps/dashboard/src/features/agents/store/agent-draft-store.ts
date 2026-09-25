import { create } from "zustand";

export type AgentDraft = {
  name: string;
  description: string;
  url?: string;
};

type AgentDraftStore = {
  draft: AgentDraft | null;
  setDraft: (draft: AgentDraft) => void;
  clearDraft: () => void;
  updateDraft: (patch: Partial<AgentDraft>) => void;
};

export const useAgentDraftStore = create<AgentDraftStore>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
  updateDraft: (patch) =>
    set((state) =>
      state.draft ? { draft: { ...state.draft, ...patch } } : state,
    ),
}));
