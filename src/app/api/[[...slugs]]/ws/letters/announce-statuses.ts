import { isActive, sendWebSocketMessageToUser } from "../../route";

export async function announceStatusesLetter(
  targets: string[],
  userIds: string[],
  recurse: boolean = false,
) {
  const statuses: Record<string, boolean> = {};
  for (const id of userIds) {
    statuses[id] = isActive(id);
  }

  sendWebSocketMessageToUser(targets, "letter:announce-statuses", {
    statuses,
  });

  if (!recurse) {
    announceStatusesLetter(userIds, targets, true);
  }
}
