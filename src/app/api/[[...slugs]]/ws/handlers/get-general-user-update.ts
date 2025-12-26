import type { WebSocketRoute } from "@/app/api";

const getGeneralUserUpdateHandler: WebSocketRoute = {
  message: "fetch:get-general-user-update",
  execute: ({ user, session, reply }) => {
    reply("response:get-general-user-update", {
      user: user.id,
      session: session.id,
    });
  },
};

export { getGeneralUserUpdateHandler };
