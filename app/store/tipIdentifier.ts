import { create } from "zustand";

export interface TipIdentifierState {
  identifier: string | null;
  setIdentifier: (identifier: string) => void;
}

export const useTipIdentifierStore = create<TipIdentifierState>((set) => ({
  identifier: null,
  setIdentifier: (identifier) => set({ identifier }),
}));
