"use client";

import { useEffect } from "react";
import { useLuciaContext } from "@/app/libs/lucia-context";

export default () => {
  const lucia = useLuciaContext();

  useEffect(() => {
    if (!lucia.session) {
      window.location.href = "/login"; // hard redirect
    }
  }, [lucia.session]);

  if (!lucia.session) return null;

  return <div>The actual app</div>;
};
