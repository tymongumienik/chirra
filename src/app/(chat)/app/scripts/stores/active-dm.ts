import { create } from "zustand";

type ActiveDmState = {
  activeUserId: string;
  setActiveUserId: (userId: string) => void;
};

export const useActiveDmStore = create<ActiveDmState>((set) => ({
  activeUserId: "",
  setActiveUserId: (userId: string) => set({ activeUserId: userId }),
}));
