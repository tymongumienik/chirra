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
  .post("/sign-up", async ({ body, prisma }) => signUp({ body, prisma }), {
    body: "auth.sign-up",
  })
  .post("/sign-in", async ({ body, prisma }) => signIn({ body, prisma }), {
    body: "auth.sign-in",
  })
  .get("/sign-out", async ({ session }) => signOut({ session }))
  .get("/verify-email", async ({ query, prisma }) =>
    verifyEmail({ query, prisma }),
  );

export default authRoutes;
