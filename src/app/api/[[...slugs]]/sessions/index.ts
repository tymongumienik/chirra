import "server-only";
import Elysia from "elysia";
import prismaService from "@/app/db";
import { authMiddleware } from "../middleware";
import { listSessions, revokeAllSessions, revokeSession } from "./handlers";
import { sessionSchema } from "./schema";

const sessionRoutes = new Elysia()
  .model(sessionSchema)
  .use(prismaService)
  .use(authMiddleware)
  .get("/sessions", listSessions)
  .post("/sessions/revoke", revokeSession, { body: "session.revoke" })
  .post("/sessions/revoke-all", revokeAllSessions);

export default sessionRoutes;
