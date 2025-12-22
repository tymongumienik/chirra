"use server";

export const luciaRequestData = async () => {
  const prefix =
    typeof window === "undefined"
      ? `https://localhost:${process.env.PORT ?? 3000}`
      : window.location.origin;

  const res = await fetch(`${prefix}/api/lucia`, {
    cache: "no-store",
  });
  const result = await res.json();

  return result;
};
