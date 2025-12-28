export const typingStateStorage = new Set<string>();

export function tryAddTypingState(userId: string) {
  typingStateStorage.add(userId);
}

export function tryRemoveTypingState(userId: string) {
  typingStateStorage.delete(userId);
}

export function getTypingState(userId: string) {
  return typingStateStorage.has(userId);
}
