import type { WebSocketRoute } from "@/app/api";

const getGeneralUserUpdateHandler: WebSocketRoute = {
  message: "fetch:get-general-user-update",
  execute: ({ user, session, reply }) => {
    console.log("get-general-user-update called WOO", {
      user: user.id,
      session: session.id,
    });
    reply("response:get-general-user-update", {
      user: user.id,
      session: session.id,
    });
  },
};

export { getGeneralUserUpdateHandler };
