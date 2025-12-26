"use client";

import { useLuciaContext } from "@/app/libs/lucia-context";
import { useEffect } from "react";
import { useUserStore } from "./scripts/db/who-am-i";
import { WebSocketProvider } from "@/app/libs/ws";
import Page from "./components/parts/page";
import { LoadingScreen } from "@/app/libs/loading-screen";

export default () => {
  const lucia = useLuciaContext();

  const fetchUser = useUserStore((s) => s.fetchUser);
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    fetchUser();
    const t = setTimeout(fetchUser, 30000);
    return () => clearTimeout(t);
  }, [fetchUser]);

  useEffect(() => {
    if (!lucia.session) {
      window.location.href = "/login"; // hard redirect
    }
  }, [lucia.session]);

  if (!lucia.session) return null;
  if (!user) return <LoadingScreen />;

  return (
    <WebSocketProvider>
      <Page />
    </WebSocketProvider>
  );
};
