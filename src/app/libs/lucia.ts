import { validateRequest } from "./auth";

export const luciaRequestData = async () => {
  if (typeof window === "undefined") {
    return await validateRequest();
  }

  const res = await fetch(`${window.location.origin}/api/lucia`, {
    cache: "no-store",
  });
  const result = await res.json();

  return result;
};
