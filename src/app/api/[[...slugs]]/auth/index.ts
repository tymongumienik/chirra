import "server-only";
import Elysia from "elysia";
import prismaService from "@/app/db";
import { authMiddleware } from "../middleware";
import { signIn, signOut, signUp, verifyEmail } from "./handlers";
import { authSchema } from "./schema";

const authRoutes = new Elysia()
  .model(authSchema)
  .use(prismaService)
  .use(authMiddleware)
  .post("/sign-up", signUp, { body: "auth.sign-up" })
  .post("/sign-in", signIn, { body: "auth.sign-in" })
  .get("/sign-out", signOut)
  .get("/verify-email", verifyEmail);

export default authRoutes;
