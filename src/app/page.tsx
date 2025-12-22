"use server";

import { redirect } from "next/navigation";
import { luciaRequestData } from "@/app/libs/lucia";

export default async () => {
  const { user } = await luciaRequestData();

  if (!user) {
    redirect("/login");
  }

  redirect("/app");
};
