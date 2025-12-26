import "server-only";
import cors, { type HTTPMethod } from "@elysiajs/cors";
import { Elysia } from "elysia";
import superjson from "superjson";
import { env } from "@/app/libs/env";
import { AppError, formatErrorResponse } from "@/app/libs/errors";
import { lucia } from "@/app/libs/auth";
import type { Session, User } from "lucia";
import authRoutes from "./normal/auth";
import { authMiddleware } from "./middleware";
import passwordResetRoutes from "./normal/password-reset";
import sessionRoutes from "./normal/sessions";
import userRoutes from "./normal/user";
import { ReceivedMessageCompiler } from "./ws/shared-schema";
import { pingHandler } from "./ws/handlers/ping";
import { sendFriendRequestHandler } from "./ws/handlers/send-friend-request";
import { deleteFriendEntryHandler } from "./ws/handlers/delete-friend-entry";

const corsConfig = {
  origin: env.IS_PRODUCTION ? env.ALLOWED_ORIGINS?.split(",") : true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"] as HTTPMethod[],
  allowedHeaders: "*",
  exposedHeaders: "*",
  maxAge: 5,
  credentials: true,
};

const app = new Elysia({ prefix: "/api" })
  .error({ AppError })
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
];

export type WebSocketRoute = {
  message: string;
  execute: (args: {
    data: Record<string, unknown> | null;
    user: User;
    session: Session;
    reply: <R extends Record<string, unknown> | null>(
      message: string,
      data?: R,
    ) => void;
  }) => Promise<void>;
};

const connectedClients = new Map<string, Set<import("ws").WebSocket>>();

export const UPGRADE = (
  client: import("ws").WebSocket,
  server: import("ws").WebSocketServer,
  request: import("next/server").NextRequest,
  context: import("next-ws/server").RouteContext<"/api/ws">,
) => {
  console.log("A client connected");

  let authenticatedUserId: string | null = null;

  client.on("message", async (message) => {
    let messageParsed: Record<string, unknown> | null = null;
    try {
      const rawMessage = message.toString();
      messageParsed = superjson.parse(rawMessage);
    } catch {
      client.terminate();
      return;
    }

    if (!ReceivedMessageCompiler.Check(messageParsed)) {
      client.terminate();
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
        client.terminate();
        return;
      }

      // Add to connected clients if not already added this session
      if (user && !authenticatedUserId) {
        authenticatedUserId = user.id;
        if (!connectedClients.has(user.id)) {
          connectedClients.set(user.id, new Set());
        }
        connectedClients.get(user.id)?.add(client);
        console.log(`Client added to registry for user ${user.id}`);
      }

      route({
        data: messageParsed.data,
        user: user as User,
        session: session as Session,
        reply: <R extends Record<string, unknown> | null>(
          message: string,
          data?: R,
        ) => {
          client.send(superjson.stringify({ message, data }));
        },
      });
    }
  });

  client.once("close", () => {
    console.log("A client disconnected");
    if (authenticatedUserId) {
      const userSockets = connectedClients.get(authenticatedUserId);
      if (userSockets) {
        userSockets.delete(client);
        if (userSockets.size === 0) {
          connectedClients.delete(authenticatedUserId);
        }
        console.log(
          `Client removed from registry for user ${authenticatedUserId}`,
        );
      }
    }
  });
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
      for (const socket of sockets) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(payload);
        }
      }
    }
  }
};

export type API = typeof app;
