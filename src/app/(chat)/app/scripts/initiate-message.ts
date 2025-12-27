import { useActiveDmStore } from "./stores/active-dm";
import { useSideMessageStore } from "./stores/side-messages";
import { useViewStore } from "./stores/view";

export function initiateMessage(userId: string, prioritize: boolean = true) {
  if (prioritize) {
    const { prioritizeUser } = useSideMessageStore.getState();
    prioritizeUser(userId);
  }
  useActiveDmStore.getState().setActiveUserId(userId);
  useViewStore.getState().setView("dm");
}
