import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserStatus } from "../../constants/status";

export type Friend = {
  id: string;
  status: UserStatus;
};

type FriendsStore = {
  friends: Friend[];
  overwriteFriends: (friends: Friend[]) => void;
  addFriend: (id: string, status?: UserStatus) => void;
  removeFriend: (id: string) => void;
  setStatus: (id: string, status: UserStatus) => void;
};

export const useFriendsStore = create<FriendsStore>()(
  persist(
    (set, get) => ({
      friends: [],

      overwriteFriends: (friends) => set({ friends }),

      addFriend: (id, status = "offline") =>
        set(() => ({
          friends: [...get().friends, { id, status }],
        })),

      removeFriend: (id) =>
        set(() => ({
          friends: get().friends.filter((f) => f.id !== id),
        })),

      setStatus: (id, status) =>
        set(() => ({
          friends: get().friends.map((f) =>
            f.id === id ? { ...f, status } : f,
          ),
        })),
    }),
    {
      name: "friends",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
