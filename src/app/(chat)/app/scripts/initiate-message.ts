import { useActiveDmStore } from "./stores/active-dm";
import { useSideMessageStore } from "./stores/side-messages";
import { useViewStore } from "./stores/view";

export function initiateMessage(userId: string, prioritize: boolean = false) {
  if (prioritize) {
    const { prioritizeUser } = useSideMessageStore.getState();
    prioritizeUser(userId);
  } else {
    const { prioritizeIfNotPresent } = useSideMessageStore.getState();
    prioritizeIfNotPresent(userId);
  }
  useActiveDmStore.getState().setActiveUserId(userId);
  useViewStore.getState().setView("dm");
}
