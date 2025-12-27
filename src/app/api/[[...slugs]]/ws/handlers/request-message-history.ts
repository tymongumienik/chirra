import { prismaClient } from "@/app/libs/db";
import type { WebSocketRoute } from "../../route";
import { RequestMessageHistoryDataCompiler } from "../shared-schema";

const requestMessageHistoryHandler: WebSocketRoute = {
  message: "over:request-message-history",
  execute: async ({ data, user, reply }) => {
    if (!RequestMessageHistoryDataCompiler.Check(data)) {
      return;
    }

    const { requestId, location, page } = data;

    if ("channel" in location) {
      // TODO: channel
    } else {
      const messages = await prismaClient.message.findMany({
        where: {
          OR: [
            {
              authorId: location.user,
              recipientId: user.id,
            },
            {
              authorId: user.id,
              recipientId: location.user,
            },
          ],
          channelId: null,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 50,
        skip: page * 50,
      });

      reply("response:request-message-history", {
        requestId,
        messages,
      });
    }
  },
};

export { requestMessageHistoryHandler };
