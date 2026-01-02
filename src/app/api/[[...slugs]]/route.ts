import "server-only";
import cors, { type HTTPMethod } from "@elysiajs/cors";
import { Elysia } from "elysia";
import type { Session, User } from "lucia";
import superjson from "superjson";
import { lucia } from "@/app/libs/auth";
import { prismaClient } from "@/app/libs/db";
import { env } from "@/app/libs/env";
import { AppError, formatErrorResponse } from "@/app/libs/errors";
import { logger } from "@/app/libs/logger";
import { authMiddleware } from "./middleware";
import authRoutes from "./normal/auth";
import passwordResetRoutes from "./normal/password-reset";
import sessionRoutes from "./normal/sessions";
import userRoutes from "./normal/user";
import { acceptFriendRequestHandler } from "./ws/handlers/accept-friend-request";
import { deleteFriendEntryHandler } from "./ws/handlers/delete-friend-entry";
import { heartbeatHandler } from "./ws/handlers/heartbeat";
import { pingHandler } from "./ws/handlers/ping";
import { requestMessageHistoryHandler } from "./ws/handlers/request-message-history";
import { sendFriendRequestHandler } from "./ws/handlers/send-friend-request";
import { sendAnnounceStatusesLetter } from "./ws/letters/announce-statuses";
import { ReceivedMessageCompiler } from "./ws/shared-schema";
import { connectedClients } from "./ws/storage/connected-clients";
import { lastSeen } from "./ws/storage/last-seen";
import { channelSetSubscriptionStateHandler } from "./ws/handlers/channel-subscribe";
import {
  getUserSubscriptions,
  unsubscribeUserFromAllChannels,
} from "./ws/storage/channel-subscription-pairs";
import { typingUpdateStateHandler } from "./ws/handlers/typing-update-state";
import { sendTypingStateLetter } from "./ws/letters/typing-state";
import { tryRemoveTypingState } from "./ws/storage/typing-state";

const corsConfig = {
  origin: env.IS_PRODUCTION ? (env.ALLOWED_ORIGINS ?? []) : true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"] as HTTPMethod[],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  maxAge: 5,
  credentials: true,
};

const app = new Elysia({ prefix: "/api" })
  .error({ AppError })
  .onAfterHandle(({ responseValue, path }) => {
    // https://github.com/elysiajs/elysia/issues/262
    if (
      // biome-ignore lint/suspicious/noExplicitAny: type gimmick
      [Array, Object].includes(responseValue?.constructor as any) &&
      !path.match(/^\/api\/swagger(\/|$)/)
    ) {
      return new Response(superjson.stringify(responseValue));
    }
  })
  .onError(({ error }) => {
    return formatErrorResponse(error);
  })
  .use(cors(corsConfig))
  .use(authMiddleware)
  .use(authRoutes)
  .use(userRoutes)
  .use(passwordResetRoutes)
  .use(sessionRoutes);

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const PATCH = app.fetch;
export const DELETE = app.fetch;

const webSocketRouteHandlers = [
  pingHandler,
  sendFriendRequestHandler,
  deleteFriendEntryHandler,
  acceptFriendRequestHandler,
  heartbeatHandler,
  requestMessageHistoryHandler,
  channelSetSubscriptionStateHandler,
  typingUpdateStateHandler,
];

// WebSocket communication is bidirectional, and this codebase
// uses different names for requests sent either way.
// A request from client to server is called a "message" or "request",
// a response from the server is either a "reply" (if directly linked, used with sendMessageAndWaitForReply) to a
// message, or a "letter" (if a generic update, i.e. broadcasting pending invites)

// WebSocket transmissions are in the format of "prefix:dash-case", where prefix is either:
// "void" for void requests (ones that will not return a reply, a letter at most)
// "over" (as in radio comunication) for requests that will return a reply (i.e. a friend request will return a success or failure)
// "letter" for letters

export type WebSocketRoute = {
  message: string;
  execute: (args: {
    data: Record<string, unknown> | null;
    user: User;
    session: Session;
    connectionId: string;
    reply: <R extends Record<string, unknown> | null>(
      message: string,
      data?: R,
    ) => void;
  }) => Promise<void>;
};

export function isActive(userid: string) {
  const clients = connectedClients.get(userid);
  return !!clients && clients.size > 0;
}

export function updateLastSeen(userId: string) {
  lastSeen.set(userId, Date.now());
}

async function announceStatusToFriends(userId: string) {
  const friends = await prismaClient.friend.findMany({
    where: {
      OR: [
        {
          requesterId: userId,
        },
        {
          addresseeId: userId,
        },
      ],
      status: "ACCEPTED",
    },
    select: {
      requesterId: true,
      addresseeId: true,
    },
  });

  sendAnnounceStatusesLetter(
    friends.map((x) =>
      x.requesterId === userId ? x.addresseeId : x.requesterId,
    ),
    [userId],
  );
}

async function removeClientConnection(userId: string, connectionId: string) {
  const userConnections = connectedClients.get(userId);
  if (userConnections) {
    userConnections.delete(connectionId);
    if (userConnections.size === 0) {
      connectedClients.delete(userId);
      await announceStatusToFriends(userId);
      unsubscribeUserFromAllChannels(userId);
      logger.info(`All clients disconnected for user ${userId}`);
    }

    tryRemoveTypingState(userId, connectionId);

    const subscriptions = getUserSubscriptions(userId);
    for (const location of subscriptions) {
      sendTypingStateLetter(userId, location);
    }
  }
}

export const UPGRADE = (
  client: import("ws").WebSocket,
  server: import("ws").WebSocketServer,
  request: import("next/server").NextRequest,
  context: import("next-ws/server").RouteContext<"/api/ws">,
) => {
  const disconnect = ({ force }: { force?: boolean }) => {
    if (force) {
      client.terminate();
    } else {
      client.close();
    }
  };

  const origin = request.headers.get("Origin");
  if (
    !origin ||
    (env.IS_PRODUCTION && !(env.ALLOWED_ORIGINS ?? []).includes(origin))
  ) {
    disconnect({ force: true });
    return;
  }

  logger.info("A client connected to WebSocket");

  let authenticatedUserId: string | null = null;
  const connectionId = crypto.randomUUID();

  const firstMessageTimeout = setTimeout(() => {
    disconnect({ force: true });
    logger.info(
      "Client terminated for not sending any message in first 10 seconds",
    );
  }, 10000);

  client.on("message", async (message) => {
    clearTimeout(firstMessageTimeout);
    let messageParsed: Record<string, unknown> | null = null;
    try {
      const rawMessage = message.toString();
      messageParsed = superjson.parse(rawMessage);
    } catch {
      disconnect({ force: true });
      return;
    }

    if (!ReceivedMessageCompiler.Check(messageParsed)) {
      disconnect({ force: true });
      return;
    }

    const routes: Map<string, WebSocketRoute["execute"]> = new Map();
    for (const x of webSocketRouteHandlers) {
      routes.set(x.message, x.execute);
    }

    const route = routes.get(messageParsed.message);
    if (route) {
      // Auth check
      const cookieHeader = request.headers.get("Cookie") ?? "";
      const sessionId = lucia.readSessionCookie(cookieHeader);

      let user: User | null = null;
      let session: Session | null = null;

      let success = false;

      if (sessionId) {
        const result = await lucia.validateSession(sessionId);
        user = result.user;
        session = result.session;
        if (user !== null && session !== null) {
          success = true;
        }
      }

      if (!success) {
        // bye bye have a great time
        disconnect({ force: true });
        return;
      }

      if (user) {
        lastSeen.set(user.id, Date.now());
      }

      // Add to connected clients if not already added this session
      if (user && !authenticatedUserId) {
        if (client.readyState !== WebSocket.OPEN) {
          disconnect({ force: true });
          return;
        }

        authenticatedUserId = user.id;
        if (!connectedClients.has(user.id)) {
          connectedClients.set(user.id, new Map());
        }
        connectedClients.get(user.id)?.set(connectionId, client);
        logger.info(
          `Client ${connectionId} added to WebSocket registry for user ${user.id}`,
        );

        await announceStatusToFriends(user.id);
      }

      route({
        data: messageParsed.data,
        user: user as User,
        session: session as Session,
        connectionId,
        reply: <R extends Record<string, unknown> | null>(
          message: string,
          data?: R,
        ) => {
          client.send(superjson.stringify({ message, data }));
        },
      });
    }
  });

  client.once("close", async () => {
    if (authenticatedUserId) {
      await removeClientConnection(authenticatedUserId, connectionId);
    }
    logger.info("A client disconnected from WebSocket");
  });

  const interval = setInterval(() => {
    if (
      authenticatedUserId &&
      lastSeen.has(authenticatedUserId) &&
      isActive(authenticatedUserId)
    ) {
      const lastSeenTime = lastSeen.get(authenticatedUserId);
      if (lastSeenTime && (Date.now() - lastSeenTime) / 1000 > 15) {
        disconnect({ force: true });
        logger.info(
          `Client ${connectionId} timed out for user ${authenticatedUserId}`,
        );
      }
    }
  }, 10000); // every 10 seconds

  return () => clearInterval(interval);
};

export const sendWebSocketMessageToUser = (
  userIds: string[],
  message: string,
  data?: Record<string, unknown>,
) => {
  for (const userId of userIds) {
    const sockets = connectedClients.get(userId);
    if (sockets) {
      const payload = superjson.stringify({ message, data });
      for (const socket of sockets.values()) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
        }
      }
    }
  }
};

export type API = typeof app;
