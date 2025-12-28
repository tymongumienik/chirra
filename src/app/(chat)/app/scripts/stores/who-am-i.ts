import { create } from "zustand";
import { api } from "@/app/libs/api";
import SuperJSON from "superjson";
import type { UserData } from "./user-data";

type UserState = {
  user: UserData | null;
  fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  fetchUser: async () => {
    const res = await api["who-am-i"].get();
    set({ user: res.error ? null : res.data.user });
  },
}));
