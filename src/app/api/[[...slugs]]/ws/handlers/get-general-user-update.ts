import type { WebSocketRoute } from "@/app/api";

const getGeneralUserUpdateHandler: WebSocketRoute = {
  message: "fetch:get-general-user-update",
  execute: (data, user, session) => {
    console.log("get-general-user-update called WOO", {
      user: user?.id,
      session: session?.id,
    });
  },
};

export { getGeneralUserUpdateHandler };
