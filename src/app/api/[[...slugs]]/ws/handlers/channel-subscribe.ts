import type { WebSocketRoute } from "@/app/api";
import { ChannelSetSubscriptionStateDataCompiler } from "../shared-schema";
import { logger } from "@/app/libs/logger";
import {
  subscribeToChannel,
  unsubscribeFromChannel,
} from "../storage/channel-subscription-pairs";
import { tryRemoveTypingState } from "../storage/typing-state";

const channelSetSubscriptionStateHandler: WebSocketRoute = {
  message: "void:set-channel-subscription-state",
  execute: async ({ data, user }) => {
    if (!ChannelSetSubscriptionStateDataCompiler.Check(data)) {
      return;
    }

    const { subscribed, location } = data;

    if ("channel" in location) {
      // Channel
      if (subscribed) {
        subscribeToChannel(location.channel, user.id);
      } else {
        unsubscribeFromChannel(location.channel, user.id);
        tryRemoveTypingState(user.id);
      }
    } else {
      // DM
      if (location.user === user.id) {
        logger.error("User tried to subscribe to their own DM", { user });
        return;
      }

      if (subscribed) {
        subscribeToChannel([user.id, location.user], user.id);
      } else {
        unsubscribeFromChannel([user.id, location.user], user.id);
        tryRemoveTypingState(user.id);
      }
    }

    logger.info("Channel subscription state changed", {
      userId: user.id,
      location,
      subscribed,
    });
  },
};

export { channelSetSubscriptionStateHandler };
