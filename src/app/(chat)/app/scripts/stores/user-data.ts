import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserDetailsLetter } from "@/app/api/[[...slugs]]/ws/shared-schema";

export type UserData = (typeof UserDetailsLetter)["static"]["users"][number];

type UserDataStore = {
  userData: Record<string, UserData>;
  overlayUsers: (users: UserData[]) => void;
  setUser: (user: UserData) => void;
  getUser: (id: string) => UserData | undefined;
};

export const useUserDataStore = create<UserDataStore>()(
  persist(
    (set, get) => ({
      userData: {},
      overlayUsers: (users: UserData[]) =>
        set((state) => {
          const next = { ...state.userData };

          for (const user of users) {
            next[user.id] = user;
          }

          return { userData: next };
        }),
      setUser: (user) =>
        set(() => ({
          userData: { ...get().userData, [user.id]: user },
        })),
      getUser: (id) => get().userData[id],
    }),
    {
      name: "user-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
