"use server";

import { redirect } from "next/navigation";
import { luciaRequestData } from "@/app/libs/auth";

export default async () => {
  const { user } = await luciaRequestData();

  if (!user) {
    redirect("/login");
  }

  redirect("/app");
};
