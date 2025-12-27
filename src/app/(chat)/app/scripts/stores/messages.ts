import { create } from "zustand";
import type { Message } from "@/app/api/[[...slugs]]/ws/shared-schema";

type MessageLocation = { channel: string } | { user: string };

type MessagesStore = {
  messages: Record<string, (typeof Message)["static"][]>;
  overwriteMessages: (
    messages: Record<string, (typeof Message)["static"][]>,
  ) => void;
  setMessagesForLocation: (
    location: MessageLocation,
    messages: (typeof Message)["static"][],
  ) => void;
  addMessage: (
    location: MessageLocation,
    message: (typeof Message)["static"],
  ) => void;
  getMessages: (
    location: MessageLocation,
  ) => (typeof Message)["static"][] | undefined;
};

export const useMessagesStore = create<MessagesStore>()((set, get) => {
  const serializeLocation = (loc: MessageLocation) =>
    "channel" in loc ? `channel:${loc.channel}` : `user:${loc.user}`;

  return {
    messages: {},
    overwriteMessages: (messages) => set({ messages }),
    addMessage: (location, message) =>
      set((state) => {
        const key = serializeLocation(location);
        const oldMessages = state.messages[key] || [];
        return {
          messages: { ...state.messages, [key]: [...oldMessages, message] },
        };
      }),
    setMessagesForLocation: (location, messages) =>
      set((state) => {
        const key = serializeLocation(location);
        return {
          messages: { ...state.messages, [key]: messages },
        };
      }),
    getMessages: (location) => {
      const key = serializeLocation(location);
      return get().messages[key];
    },
  };
});
