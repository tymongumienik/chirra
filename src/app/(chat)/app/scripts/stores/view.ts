import { create } from "zustand";

type View = "friends" | "channel" | "dm";

type ViewState = {
  view: View;
  setView: (view: View) => void;
};

export const useViewStore = create<ViewState>((set) => ({
  view: "friends",
  setView: (view: View) => set({ view }),
}));
