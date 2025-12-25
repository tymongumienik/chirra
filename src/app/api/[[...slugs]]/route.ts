import "server-only";
import cors, { type HTTPMethod } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { env } from "@/app/libs/env";
import { AppError, formatErrorResponse } from "@/app/libs/errors";
import authRoutes from "./normal/auth";
import { authMiddleware } from "./middleware";
import passwordResetRoutes from "./normal/password-reset";
import sessionRoutes from "./normal/sessions";
import userRoutes from "./normal/user";
import { getGeneralUserUpdateHandler } from "./ws/handlers/get-general-user-update";
import { ReceivedMessageCompiler } from "./ws/shared-schema";

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

export type WebSocketRoute = {
  message: string;
  execute: (data: Record<string, unknown> | null) => void;
};

export const UPGRADE = (
  client: import("ws").WebSocket,
  server: import("ws").WebSocketServer,
  request: import("next/server").NextRequest,
  context: import("next-ws/server").RouteContext<"/api/ws">,
) => {
  console.log("A client connected");

  client.on("message", (message) => {
    const messageParsed = JSON.parse(message.toString());

    if (!ReceivedMessageCompiler.Check(messageParsed)) {
      return;
    }

    const routeHandlers = [getGeneralUserUpdateHandler];
    const routes = new Map();
    for (const x of routeHandlers) {
      routes.set(x.message, x.execute);
    }

    const route = routes.get(messageParsed.message);
    if (route) {
      route(messageParsed.data);
    }
  });

  client.once("close", () => {
    console.log("A client disconnected");
  });
};

export type API = typeof app;
