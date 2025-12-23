import { create } from "zustand";

export type FriendTab = "online" | "all" | "pending" | "blocked" | "add";

type FriendTabState = {
  friendTab: FriendTab;
  setFriendTab: (tab: FriendTab) => void;
};

export const useFriendTabStore = create<FriendTabState>((set) => ({
  friendTab: "online",
  setFriendTab: (friendTab: FriendTab) => set({ friendTab }),
}));
