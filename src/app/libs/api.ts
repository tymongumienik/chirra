import { treaty } from "@elysiajs/eden";
import { API } from "../api";

export const api = treaty<API>(
  typeof window === "undefined"
    ? `https://localhost:${process.env.PORT ?? 3000}`
    : window.location.origin,
).api;
