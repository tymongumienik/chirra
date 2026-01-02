export const typingStateStorage = new Map<string, Set<string>>();

export function tryAddTypingState(userId: string, connectionId: string) {
  if (!typingStateStorage.has(userId)) {
    typingStateStorage.set(userId, new Set());
  }
  typingStateStorage.get(userId)?.add(connectionId);
}

export function tryRemoveTypingState(userId: string, connectionId: string) {
  const userConnections = typingStateStorage.get(userId);
  if (userConnections) {
    userConnections.delete(connectionId);
    if (userConnections.size === 0) {
      typingStateStorage.delete(userId);
    }
  }
}

export function getTypingState(userId: string) {
  return typingStateStorage.has(userId);
}
