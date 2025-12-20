import Elysia from "elysia";
import prismaService from "@/app/db";
import { whoAmI } from "./handlers";
import { userSchema } from "./schema";
import { authMiddleware } from "../middleware";

const userRoutes = new Elysia()
  .model(userSchema)
  .use(prismaService)
  .use(authMiddleware)
  .get("/who-am-i", async ({ user }) => whoAmI({ user }));

export default userRoutes;
