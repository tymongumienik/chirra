import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FriendsStore = {
  friends: string[];
  overwriteFriends: (friends: string[]) => void;
  addFriend: (id: string) => void;
  removeFriend: (id: string) => void;
};

export const useFriendsStore = create<FriendsStore>()(
  persist(
    (set, get) => ({
      friends: [],
      overwriteFriends: (friends: string[]) =>
        set(() => {
          return { friends };
        }),
      addFriend: (id: string) =>
        set(() => ({
          friends: [...get().friends, id],
        })),
      removeFriend: (id: string) =>
        set(() => ({
          friends: get().friends.filter((friend) => friend !== id),
        })),
    }),
    {
      name: "friends",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
