// DM: sorted <user_id, user_id2>
// Channel: <channel_id>
export const channelSubscriptionPairs = new Map<
  [string, string] | string,
  Set<string>
>();
const userSubscriptions = new Map<string, Set<[string, string] | string>>();

const canonicalPairs = new Map<string, [string, string]>();
const getCanonicalPair = (pair: [string, string]): [string, string] => {
  const sorted = [...pair].sort() as [string, string];
  const key = sorted.join("|");
  if (!canonicalPairs.has(key)) canonicalPairs.set(key, sorted);
  return canonicalPairs.get(key)!;
};

export const getLocationOfUser = (
  who: string,
): string | [string, string] | undefined => {
  return userSubscriptions.get(who)?.values().next().value;
};

export const getUserSubscriptions = (who: string) => {
  return Array.from(userSubscriptions.get(who)?.values() || []);
};

export const getUsersSubscribedToLocation = (
  where: string | [string, string],
): string[] => {
  const key = Array.isArray(where) ? getCanonicalPair(where) : where;
  return Array.from(channelSubscriptionPairs.get(key)?.values() || []);
};

export const subscribeToChannel = (
  where: string | [string, string],
  who: string,
) => {
  const key = Array.isArray(where) ? getCanonicalPair(where) : where;

  if (!channelSubscriptionPairs.has(key))
    channelSubscriptionPairs.set(key, new Set());
  channelSubscriptionPairs.get(key)!.add(who);

  if (!userSubscriptions.has(who)) userSubscriptions.set(who, new Set());
  userSubscriptions.get(who)!.add(key);
};

export const unsubscribeFromChannel = (
  where: string | [string, string],
  who: string,
) => {
  const key = Array.isArray(where) ? getCanonicalPair(where) : where;

  channelSubscriptionPairs.get(key)?.delete(who);
  if (channelSubscriptionPairs.get(key)?.size === 0)
    channelSubscriptionPairs.delete(key);

  userSubscriptions.get(who)?.delete(key);
  if (userSubscriptions.get(who)?.size === 0) userSubscriptions.delete(who);
};

export const unsubscribeUserFromAllChannels = (who: string) => {
  const subs = userSubscriptions.get(who);
  if (!subs) return;
  for (const where of subs) {
    channelSubscriptionPairs.get(where)?.delete(who);
    if (channelSubscriptionPairs.get(where)?.size === 0)
      channelSubscriptionPairs.delete(where);
  }
  userSubscriptions.delete(who);
};
