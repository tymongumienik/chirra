import { treaty } from "@elysiajs/eden";
import type { API } from "../api";
import SuperJSON from "superjson";

export const api = treaty<API>(
  typeof window === "undefined"
    ? `https://localhost:${process.env.PORT ?? 3000}`
    : window.location.origin,
  {
    fetch: {
      credentials: "include",
    },
    async onResponse(response) {
      return SuperJSON.parse(await response.text());
    },
  },
).api;
