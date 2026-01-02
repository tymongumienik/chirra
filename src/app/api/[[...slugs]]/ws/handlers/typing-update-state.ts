import type { WebSocketRoute } from "@/app/api";
import { TypingUpdateStateDataCompiler } from "../shared-schema";
import {
  tryAddTypingState,
  tryRemoveTypingState,
} from "../storage/typing-state";
import { sendTypingStateLetter } from "../letters/typing-state";

const typingUpdateStateHandler: WebSocketRoute = {
  message: "void:typing-update-state",
  execute: async ({ data, user, connectionId }) => {
    if (!TypingUpdateStateDataCompiler.Check(data)) {
      return;
    }

    const { typing, location } = data;

    if (typing) {
      tryAddTypingState(user.id, connectionId);
    } else {
      tryRemoveTypingState(user.id, connectionId);
    }

    sendTypingStateLetter(user.id, location);
  },
};

export { typingUpdateStateHandler };
