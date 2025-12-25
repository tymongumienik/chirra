import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserData = {
  id: string;
  name: string;
  avatar: string;
};

type UserDataStore = {
  userData: Record<string, UserData>;
  setUser: (user: UserData) => void;
  getUser: (id: string) => UserData | undefined;
};

export const useUserDataStore = create<UserDataStore>()(
  persist(
    (set, get) => ({
      userData: {},
      setUser: (user) =>
        set((state) => ({
          userData: { ...state.userData, [user.id]: user },
        })),
      getUser: (id) => get().userData[id],
    }),
    {
      name: "user-data",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
