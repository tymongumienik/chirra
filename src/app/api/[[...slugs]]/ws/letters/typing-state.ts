import { sendWebSocketMessageToUser } from "../../route";
import { getTypingState } from "../storage/typing-state";
import { getUsersSubscribedToLocation } from "../storage/channel-subscription-pairs";

export async function sendTypingStateLetter(
  typerId: string,
  location: { channel: string } | { user: string } | string | [string, string],
) {
  const isTyping = getTypingState(typerId);
  const searchLocation: string | [string, string] =
    Array.isArray(location) || typeof location === "string"
      ? location
      : "channel" in location
        ? location.channel
        : [typerId, location.user];

  const subscribed = getUsersSubscribedToLocation(searchLocation);

  sendWebSocketMessageToUser(subscribed, "letter:typing-state", {
    typingState: isTyping,
    typerId: typerId,
  });
}
