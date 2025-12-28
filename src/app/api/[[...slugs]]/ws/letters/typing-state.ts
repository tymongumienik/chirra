import { sendWebSocketMessageToUser } from "../../route";
import { getTypingState } from "../storage/typing-state";
import {
  getLocationOfUser,
  getUsersSubscribedToLocation,
} from "../storage/channel-subscription-pairs";

export async function sendTypingStateLetter(typerId: string) {
  const isTyping = getTypingState(typerId);
  const location = getLocationOfUser(typerId);

  if (!location) return;

  const subscribed = getUsersSubscribedToLocation(location);

  sendWebSocketMessageToUser(subscribed, "letter:typing-state", {
    typingState: isTyping,
    typerId: typerId,
  });
}
