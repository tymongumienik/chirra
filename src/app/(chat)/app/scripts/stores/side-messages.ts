import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SideMessageUser = string;

type SideMessageStore = {
  users: string[];
  setUsers: (users: SideMessageUser[]) => void;
  prioritizeUser: (user: SideMessageUser) => void;
};

export const useSideMessageStore = create<SideMessageStore>()(
  persist(
    (set, get) => ({
      users: [],
      setUsers: (users: SideMessageUser[]) => set(() => ({ users })),
      prioritizeUser: (user: SideMessageUser) =>
        set((state) => ({
          users: [user, ...state.users.filter((u) => u !== user)],
        })),
    }),
    {
      name: "side-message",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
