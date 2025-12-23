import { create } from "zustand";
import { api } from "@/app/libs/api";

type User = NonNullable<
  Awaited<ReturnType<(typeof api)["who-am-i"]["get"]>>["data"]
>["user"];

type UserState = {
  user: User | null;
  fetchUser: () => Promise<void>;
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  fetchUser: async () => {
    const res = await api["who-am-i"].get();
    set({ user: res.error ? null : res.data.user });
  },
}));
