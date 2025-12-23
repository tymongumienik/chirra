import { create } from "zustand";

type ActiveServerIdState = {
  activeServerId: string;
  setActiveServerId: (serverId: string) => void;
};

export const useActiveServerIdStore = create<ActiveServerIdState>((set) => ({
  activeServerId: "",
  setActiveServerId: (serverId: string) => set({ activeServerId: serverId }),
}));
