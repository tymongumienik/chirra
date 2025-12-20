import "server-only";
import Elysia from "elysia";
import prismaService from "@/app/db";
import { authMiddleware } from "../middleware";
import { whoAmI } from "./handlers";
import { userSchema } from "./schema";

const userRoutes = new Elysia()
  .model(userSchema)
  .use(prismaService)
  .use(authMiddleware)
  .get("/who-am-i", async ({ user }) => whoAmI({ user }));

export default userRoutes;
