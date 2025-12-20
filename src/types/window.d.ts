import type { api } from "@/app/libs/api";

declare global {
  interface Window {
    api: typeof api | undefined;
  }
}
