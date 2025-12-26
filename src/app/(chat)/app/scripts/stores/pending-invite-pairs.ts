import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PendingInvitesLetter } from "@/app/api/[[...slugs]]/ws/shared-schema";

export type PendingInvitePair =
  (typeof PendingInvitesLetter)["static"]["invites"][number];

type PendingInvitePairStore = {
  pendingInvitePairs: PendingInvitePair[];
  overwritePairs: (pairs: PendingInvitePair[]) => void;
  getPairs: () => PendingInvitePair[];
};

export const usePendingInvitePairStore = create<PendingInvitePairStore>()(
  persist(
    (set, get) => ({
      pendingInvitePairs: [],
      overwritePairs: (pairs: PendingInvitePair[]) =>
        set((state) => {
          return { pendingInvitePairs: pairs };
        }),
      getPairs: () => get().pendingInvitePairs,
    }),
    {
      name: "pending-invite-pairs",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
