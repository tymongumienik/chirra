"use client";

import { useLuciaContext } from "@/app/libs/lucia-context";
import { useRouter } from "next/navigation";

export default () => {
  const router = useRouter();
  const lucia = useLuciaContext();

  if (!lucia.session) {
    return router.replace("/login");
  }

  return <div>The actual app</div>;
};
