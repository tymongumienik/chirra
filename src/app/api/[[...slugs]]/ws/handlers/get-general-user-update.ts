import type { WebSocketRoute } from "@/app/api";

const getGeneralUserUpdateHandler: WebSocketRoute = {
  message: "fetch:get-general-user-update",
  execute: () => {
    console.log("get-general-user-update called WOO");
  },
};

export { getGeneralUserUpdateHandler };
